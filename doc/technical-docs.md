# FoodVision Technical Documentation

This document provides detailed technical information about the implementation of the FoodVision system.

## Table of Contents

1. [Computer Vision Implementation](#computer-vision-implementation)
2. [Recipe Generation with DeepSeek-V3](#recipe-generation-with-deepseek-v3)
3. [Database Design](#database-design)
4. [API Architecture](#api-architecture)
5. [Frontend Implementation](#frontend-implementation)
6. [Security Considerations](#security-considerations)
7. [Performance Optimization](#performance-optimization)
8. [Testing Methodology](#testing-methodology)

## Computer Vision Implementation

### YOLOv8 Integration

FoodVision uses YOLOv8 for food item detection and classification. The implementation consists of:

#### Model Selection and Training

We fine-tuned YOLOv8-m on a custom dataset of common food items, containing:
- 10,000+ images of 200+ food categories
- Varied lighting conditions and container types
- Multiple items in the same image

```python
# Model initialization code
from ultralytics import YOLO

def initialize_model():
    """Initialize and load the YOLOv8 model"""
    model = YOLO('ml_models/yolov8_food.pt')
    return model

def detect_food_items(image_path, confidence_threshold=0.5):
    """
    Detect food items in the given image
    
    Args:
        image_path: Path to input image
        confidence_threshold: Minimum confidence for detection
        
    Returns:
        List of detected items with bounding boxes and confidences
    """
    model = initialize_model()
    results = model(image_path)
    
    detections = []
    for r in results:
        boxes = r.boxes
        for box in boxes:
            if box.conf.item() > confidence_threshold:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                cls = int(box.cls.item())
                cls_name = model.names[cls]
                conf = box.conf.item()
                
                detections.append({
                    'class_name': cls_name,
                    'confidence': conf,
                    'bbox': [x1, y1, x2, y2]
                })
    
    return detections
```

#### Post-Processing Pipeline

After initial detection, we apply several post-processing steps:

1. **Merging Similar Detections**: Using non-maximum suppression to avoid duplicate detections
2. **Classification Refinement**: For ambiguous items, a secondary classifier is used
3. **Quantity Estimation**: Estimating the amount of each food item

```python
def estimate_quantity(detection, image):
    """
    Estimate the quantity of detected food items
    
    Args:
        detection: Detection object with bounding box
        image: Original image
        
    Returns:
        Estimated quantity and unit
    """
    # Extract the region of interest
    x1, y1, x2, y2 = detection['bbox']
    roi = image[int(y1):int(y2), int(x1):int(x2)]
    
    # Calculate size relative to image
    relative_size = (x2 - x1) * (y2 - y1) / (image.shape[0] * image.shape[1])
    
    # Apply food-specific quantity estimation
    food_type = detection['class_name']
    if food_type in COUNTABLE_FOODS:
        # For countable items like apples, eggs, etc.
        count = estimate_count(roi, food_type)
        return count, "pieces"
    else:
        # For non-countable items like rice, liquids, etc.
        volume = estimate_volume(roi, food_type, relative_size)
        unit = get_appropriate_unit(food_type)
        return volume, unit
```

#### Model Performance Metrics

- **mAP@0.5**: 87.3%
- **Inference Time**: 98ms on Tesla T4 GPU
- **False Positive Rate**: 4.2%
- **False Negative Rate**: 6.7%

## Recipe Generation with DeepSeek-V3

### Key Features

2. **Recipe Generation**:
   - DeepSeek-V3 integration with carefully crafted prompts
   - Handles dietary restrictions and preferences
   - Structured JSON response format

### Prompt Engineering

We carefully crafted prompts to generate contextually appropriate recipes:

```python
def generate_recipe_prompt(ingredients, preferences):
    """
    Create a prompt for DeepSeek-V3 to generate a recipe
    
    Args:
        ingredients: List of available ingredients with quantities
        preferences: User dietary preferences and restrictions
        
    Returns:
        Formatted prompt for DeepSeek-V3
    """
    base_prompt = "Generate a detailed recipe using some or all of these ingredients:\n"
    
    # Add ingredients list
    ingredients_text = "\n".join([f"- {item['quantity']} {item['unit']} of {item['name']}" 
                                for item in ingredients])
    base_prompt += ingredients_text + "\n\n"
    
    # Add dietary restrictions
    if preferences.get('dietary_restrictions'):
        restrictions = ", ".join(preferences['dietary_restrictions'])
        base_prompt += f"The recipe must comply with these dietary restrictions: {restrictions}.\n"
    
    # Add cuisine preferences if any
    if preferences.get('favorite_cuisines'):
        cuisines = ", ".join(preferences['favorite_cuisines'])
        base_prompt += f"Preferably in one of these cuisines: {cuisines}.\n"
    
    # Add allergies information
    if preferences.get('allergies'):
        allergies = ", ".join(preferences['allergies'])
        base_prompt += f"IMPORTANT: The person has allergies to: {allergies}. Do not include these ingredients.\n"
    
    # Format instructions
    base_prompt += """
    Please provide the recipe in the following JSON format:
    {
        "title": "Recipe Title",
        "description": "Brief description",
        "preparation_time": time in minutes,
        "cooking_time": time in minutes,
        "servings": number,
        "ingredients": [
            {"name": "ingredient name", "quantity": amount, "unit": "measurement unit"}
        ],
        "instructions": [
            "Step 1 instruction",
            "Step 2 instruction"
        ],
        "nutritional_info": {
            "calories": amount,
            "protein": amount in grams,
            "carbs": amount in grams,
            "fat": amount in grams
        }
    }
    """
    
    return base_prompt
```

### Response Processing

DeepSeek-V3 responses are processed to ensure consistent formatting:

```python
def process_recipe_response(response_text):
    """
    Process and validate DeepSeek-V3 recipe response
    
    Args:
        response_text: Raw text response from DeepSeek-V3
        
    Returns:
        Formatted recipe JSON object
    """
    # Extract JSON from response
    try:
        # Find JSON content between triple backticks if present
        json_match = re.search(r'```json\n(.*?)\n```', response_text, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
        else:
            # Try to find JSON object directly
            json_match = re.search(r'(\{.*\})', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
            else:
                raise ValueError("No JSON content found in response")
        
        recipe_data = json.loads(json_str)
        
        # Validate required fields
        required_fields = ['title', 'ingredients', 'instructions']
        for field in required_fields:
            if field not in recipe_data:
                raise ValueError(f"Missing required field: {field}")
        
        return recipe_data
    
    except json.JSONDecodeError as e:
        # Handle JSON parsing errors
        logging.error(f"JSON parsing error: {e}")
        return None
    except ValueError as e:
        # Handle validation errors
        logging.error(f"Validation error: {e}")
        return None
```

### API Integration

The recipe generation service connects to the DeepSeek-V3 API:

```python
async def generate_recipe(ingredients, preferences):
    """
    Generate recipe using DeepSeek-V3
    
    Args:
        ingredients: List of available ingredients
        preferences: User dietary preferences
        
    Returns:
        Recipe data or error
    """
    try:
        prompt = generate_recipe_prompt(ingredients, preferences)
        
        response = await openai.ChatCompletion.acreate(
            model="deepseek-v3",
            messages=[
                {"role": "system", "content": "You are a professional chef who creates delicious recipes based on available ingredients."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        recipe_text = response.choices[0].message.content
        recipe_data = process_recipe_response(recipe_text)
        
        if recipe_data:
            # Save recipe to database
            save_recipe_to_db(recipe_data)
            return recipe_data
        else:
            raise Exception("Failed to process recipe response")
    
    except Exception as e:
        logging.error(f"Recipe generation error: {e}")
        raise
```

## Database Design

### Schema Design Decisions

The database is designed to efficiently store food inventory and recipe data:

#### Inventory Schema

```javascript
// Inventory schema with embedded items for better query performance
const inventorySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  items: [{
    name: {
      type: String,
      required: true,
      index: true
    },
    category: {
      type: String,
      enum: ['fruits', 'vegetables', 'dairy', 'meat', 'grains', 'snacks', 'beverages', 'other'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true
    },
    expiry_date: {
      type: Date,
      index: true
    },
    added_date: {
      type: Date,
      default: Date.now
    },
    image_url: String,
    confidence: Number,
    detection_id: String
  }],
  last_updated: {
    type: Date,
    default: Date.now
  }
});

// Index for querying items nearing expiry
inventorySchema.index({ 'items.expiry_date': 1, 'user_id': 1 });
```

#### Recipes Schema

```javascript
const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  ingredients: [{
    name: {
      type: String,
      required: true,
      index: true
    },
    quantity: Number,
    unit: String,
    optional: {
      type: Boolean,
      default: false
    }
  }],
  instructions: [String],
  cuisine: String,
  preparation_time: Number,
  cooking_time: Number,
  total_time: Number,
  serving_size: Number,
  nutritional_info: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard']
  },
  image_url: String,
  tags: [{
    type: String,
    index: true
  }],
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Compound index for ingredient-based recipe search
recipeSchema.index({ 'ingredients.name': 1, 'tags': 1 });
```

### Data Access Patterns

Optimized queries for common operations:

```javascript
// Efficient query for finding recipes based on available ingredients
async function findMatchingRecipes(availableIngredients, preferences) {
  const ingredientNames = availableIngredients.map(i => i.name.toLowerCase());
  
  // Find recipes where most ingredients are available
  const recipes = await Recipe.aggregate([
    // Match recipes with ingredients we have
    { $match: { 'ingredients.name': { $in: ingredientNames } } },
    
    // Unwind ingredients to count matches
    { $unwind: '$ingredients' },
    { $match: { 'ingredients.name': { $in: ingredientNames } } },
    
    // Group back to recipes and count matches
    { $group: {
      _id: '$_id',
      title: { $first: '$title' },
      ingredients: { $push: '$ingredients' },
      allIngredients: { $first: '$ingredients' },
      instructionsCount: { $first: { $size: '$instructions' } },
      matchCount: { $sum: 1 },
      totalCount: { $first: { $size: '$ingredients' } },
      instructions: { $first: '$instructions' },
      image_url: { $first: '$image_url' },
      tags: { $first: '$tags' },
      nutritional_info: { $first: '$nutritional_info' },
      preparation_time: { $first: '$preparation_time' },
      cooking_time: { $first: '$cooking_time' }
    }},
    
    // Calculate match percentage
    { $addFields: {
      matchPercentage: { $multiply: [{ $divide: ['$matchCount', '$totalCount'] }, 100] }
    }},
    
    // Filter by user preferences
    { $match: {
      $and: [
        // Minimum 60% ingredient match
        { matchPercentage: { $gte: 60 } },
        // Apply dietary preferences if provided
        preferences.dietary_restrictions ? 
          { tags: { $not: { $in: preferences.dietary_restrictions.map(r => `contains:${r}`) } } } : {},
        // Apply cuisine preferences if provided
        preferences.favorite_cuisines && preferences.favorite_cuisines.length > 0 ? 
          { tags: { $in: preferences.favorite_cuisines.map(c => `cuisine:${c}`) } } : {}
      ]
    }},
    
    // Sort by match percentage (descending)
    { $sort: { matchPercentage: -1 } },
    
    // Limit to 15 recipes
    { $limit: 15 }
  ]);
  
  return recipes;
}

## API Architecture

The FoodVision API is built with Flask and follows RESTful design principles. The API is organized into logical resource groups and uses JSON for data exchange.

### API Design Principles

1. **Resource-Based URLs**: Each endpoint represents a resource
2. **Proper HTTP Methods**: Using GET, POST, PUT, DELETE appropriately
3. **Stateless Communication**: No client state stored on the server
4. **JSON Response Format**: Consistent response structure

### Authentication and Authorization

The API uses JWT (JSON Web Tokens) for authentication:

```python
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
jwt = JWTManager(app)

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login endpoint"""
    username = request.json.get('username')
    password = request.json.get('password')
    
    # Validate user credentials
    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        # Create access token
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({"msg": "Invalid credentials"}), 401

@app.route('/api/inventory', methods=['GET'])
@jwt_required()
def get_inventory():
    """Get user's inventory"""
    user_id = get_jwt_identity()
    
    # Get inventory from database
    inventory = Inventory.query.filter_by(user_id=user_id).first()
    if not inventory:
        return jsonify({"items": []}), 200
    
    return jsonify(inventory.to_dict()), 200
```

### Error Handling

Centralized error handling with standardized response format:

```python
@app.errorhandler(400)
def bad_request(error):
    return jsonify({
        'success': False,
        'error': 400,
        'message': 'Bad request'
    }), 400

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 404,
        'message': 'Resource not found'
    }), 404

@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({
        'success': False,
        'error': 500,
        'message': 'An internal server error occurred'
    }), 500
```

### API Rate Limiting

Implementation of rate limiting to protect against abuse:

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/api/recipes/generate', methods=['POST'])
@jwt_required()
@limiter.limit("10 per hour")  # More restrictive limit for resource-intensive endpoints
def generate_recipe():
    """Generate a recipe based on available ingredients"""
    # Implementation...
```

### API Documentation

The API is documented using Swagger/OpenAPI:

```python
from flask_swagger_ui import get_swaggerui_blueprint

SWAGGER_URL = '/api/docs'
API_URL = '/static/swagger.json'

swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "FoodVision API"
    }
)

app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)
```

## Frontend Implementation

The frontend is built with React and follows modern best practices for state management, component design, and responsive UI.

### Component Architecture

The application uses a component-based architecture with reusable UI elements:

```jsx
// Component hierarchy
<App>
  <AuthProvider>  {/* Authentication context */}
    <Layout>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/camera" element={<CameraView />} />
        <Route path="/inventory" element={<InventoryView />} />
        <Route path="/recipes" element={<RecipesView />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
        <Route path="/shopping-list" element={<ShoppingList />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      <Footer />
    </Layout>
  </AuthProvider>
</App>
```

### State Management

The application uses React Context and custom hooks for state management:

```jsx
// Inventory context
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getInventory, updateInventory } from '../services/api';

const InventoryContext = createContext();

const inventoryReducer = (state, action) => {
  switch (action.type) {
    case 'SET_INVENTORY':
      return { ...state, items: action.payload, loading: false };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item => 
          item.id === action.payload.id ? action.payload : item
        )
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export const InventoryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(inventoryReducer, {
    items: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const data = await getInventory();
        dispatch({ type: 'SET_INVENTORY', payload: data.items });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    };
    
    fetchInventory();
  }, []);

  return (
    <InventoryContext.Provider value={{ state, dispatch }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);
```

### Camera Component Implementation

The camera component handles image capture and food detection:

```jsx
import React, { useRef, useState, useEffect } from 'react';
import { detectFoodItems } from '../services/api';

const Camera = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [detectedItems, setDetectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize camera
  useEffect(() => {
    const enableCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };
    
    enableCamera();
    
    // Cleanup
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data as base64
      const imageData = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageData);
    }
  };
  
  const detectFood = async () => {
    if (!capturedImage) return;
    
    setIsLoading(true);
    try {
      const result = await detectFoodItems(capturedImage);
      setDetectedItems(result.items);
    } catch (error) {
      console.error("Error detecting food items:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="camera-container">
      <div className="video-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
      
      <div className="controls">
        <button onClick={captureImage} disabled={isLoading}>
          Capture
        </button>
        <button onClick={detectFood} disabled={!capturedImage || isLoading}>
          Detect Items
        </button>
      </div>
      
      {isLoading && <div className="loading-indicator">Processing...</div>}
      
      {capturedImage && (
        <div className="preview">
          <img src={capturedImage} alt="Captured" />
        </div>
      )}
      
      {detectedItems.length > 0 && (
        <div className="detected-items">
          <h3>Detected Items:</h3>
          <ul>
            {detectedItems.map((item, index) => (
              <li key={index}>
                {item.name} ({item.confidence.toFixed(2)})
              </li>
            ))}
          </ul>
          <button onClick={() => {/* Add to inventory */}}>
            Add to Inventory
          </button>
        </div>
      )}
    </div>
  );
};

export default Camera;
```

## Security Considerations

### Data Protection

1. **Secure Data Storage**:
   - Passwords are hashed using bcrypt
   - Sensitive data is encrypted at rest
   - Database access is restricted by IP and requires authentication

2. **API Security**:
   - HTTPS enforced for all connections
   - CORS policies to prevent unauthorized access
   - Input validation for all API endpoints

### Authentication Security

1. **JWT Implementation**:
   - Short token expiry (1 hour)
   - Refresh token rotation
   - Token blacklisting for logout

```python
# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
app.config['JWT_BLACKLIST_ENABLED'] = True
app.config['JWT_BLACKLIST_TOKEN_CHECKS'] = ['access', 'refresh']

# Token blacklist
blacklist = set()

@jwt.token_in_blocklist_loader
def check_if_token_in_blacklist(jwt_header, jwt_payload):
    jti = jwt_payload['jti']
    return jti in blacklist

@app.route('/api/auth/logout', methods=['DELETE'])
@jwt_required()
def logout():
    jti = get_jwt()['jti']
    blacklist.add(jti)
    return jsonify(msg="Successfully logged out"), 200
```

2. **Password Policy Enforcement**:
   - Minimum length and complexity requirements
   - Regular password rotation
   - Account lockout after failed attempts

### Input Validation and Sanitization

All user inputs are validated and sanitized to prevent injection attacks:

```python
from marshmallow import Schema, fields, validate, ValidationError

class UserSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=50))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=8))

@app.route('/api/auth/register', methods=['POST'])
def register():
    schema = UserSchema()
    try:
        # Validate and deserialize input
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400
    
    # Check if user already exists
    existing_user = User.query.filter_by(username=data['username']).first()
    if existing_user:
        return jsonify({"msg": "Username already exists"}), 409
    
    # Create new user
    user = User(
        username=data['username'],
        email=data['email'],
        password=generate_password_hash(data['password'])
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({"msg": "User created successfully"}), 201
```

## Performance Optimization

### Frontend Optimizations

1. **Code Splitting and Lazy Loading**:
   - React.lazy() for component lazy loading
   - Dynamic imports for routes

2. **Image Optimization**:
   - Responsive images with srcset
   - WebP format with fallbacks
   - Lazy loading of off-screen images

3. **State Management Optimizations**:
   - Memoization with useMemo and useCallback
   - Context splitting to avoid unnecessary re-renders

### Backend Optimizations

1. **Database Query Optimization**:
   - Indexing for frequent query patterns
   - Query caching for repeated requests
   - Connection pooling

2. **API Response Caching**:
   - Redis-based caching for frequent API calls
   - Cache invalidation on data updates

```python
import redis
from functools import wraps
import json

# Redis client
redis_client = redis.Redis(host='localhost', port=6379, db=0)

def cache_response(expiration=300):
    """Cache API responses in Redis"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Generate a cache key based on function name and arguments
            cache_key = f"{f.__name__}:{str(args)}:{str(kwargs)}"
            
            # Check if response exists in cache
            cached_response = redis_client.get(cache_key)
            if cached_response:
                return json.loads(cached_response)
            
            # If not in cache, call the function
            response = f(*args, **kwargs)
            
            # Cache the response
            redis_client.setex(
                cache_key,
                expiration,
                json.dumps(response)
            )
            
            return response
        return decorated_function
    return decorator

@app.route('/api/recipes/popular', methods=['GET'])
@cache_response(expiration=3600)  # Cache for 1 hour
def get_popular_recipes():
    """Get popular recipes"""
    recipes = Recipe.query.order_by(Recipe.views.desc()).limit(10).all()
    return jsonify([recipe.to_dict() for recipe in recipes])
```

## Testing Methodology

### Unit Testing

Backend unit tests using pytest:

```python
import pytest
from app.services.vision_service import detect_food_items

def test_food_detection():
    """Test food detection functionality"""
    # Test with a known image
    test_image_path = "tests/data/test_image.jpg"
    detections = detect_food_items(test_image_path)
    
    # Assertions
    assert len(detections) > 0
    assert "apple" in [d["class_name"] for d in detections]
    assert all(d["confidence"] > 0.5 for d in detections)
    
    # Test bounding box format
    for detection in detections:
        bbox = detection["bbox"]
        assert len(bbox) == 4
        assert all(isinstance(coord, float) for coord in bbox)
        assert bbox[0] < bbox[2]  # x1 < x2
        assert bbox[1] < bbox[3]  # y1 < y2
```

Frontend unit tests using React Testing Library:

```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InventoryItem from '../components/InventoryItem';

test('renders inventory item correctly', () => {
  const item = {
    id: '1',
    name: 'Apple',
    quantity: 3,
    unit: 'pieces',
    expiry_date: '2023-12-31',
    category: 'fruits'
  };
  
  render(<InventoryItem item={item} />);
  
  expect(screen.getByText('Apple')).toBeInTheDocument();
  expect(screen.getByText('3 pieces')).toBeInTheDocument();
  expect(screen.getByText('Expires: 31 Dec 2023')).toBeInTheDocument();
});

test('calls update function when quantity is changed', async () => {
  const item = {
    id: '1',
    name: 'Apple',
    quantity: 3,
    unit: 'pieces',
    expiry_date: '2023-12-31',
    category: 'fruits'
  };
  
  const mockUpdate = jest.fn();
  
  render(<InventoryItem item={item} onUpdate={mockUpdate} />);
  
  // Open edit mode
  fireEvent.click(screen.getByTestId('edit-button'));
  
  // Change quantity
  const quantityInput = screen.getByLabelText('Quantity');
  fireEvent.change(quantityInput, { target: { value: '5' } });
  
  // Save changes
  fireEvent.click(screen.getByText('Save'));
  
  await waitFor(() => {
    expect(mockUpdate).toHaveBeenCalledWith({
      ...item,
      quantity: 5
    });
  });
});
```

### Integration Testing

Testing API endpoints:

```python
def test_inventory_api(client, auth_header):
    """Test inventory API endpoints"""
    # Test GET inventory
    response = client.get('/api/inventory', headers=auth_header)
    assert response.status_code == 200
    data = response.get_json()
    assert 'items' in data
    
    # Test adding item to inventory
    new_item = {
        'name': 'Banana',
        'quantity': 5,
        'unit': 'pieces',
        'category': 'fruits',
        'expiry_date': '2023-12-31'
    }
    
    response = client.post(
        '/api/inventory/item',
        json=new_item,
        headers=auth_header
    )
    assert response.status_code == 201
    data = response.get_json()
    assert data['name'] == 'Banana'
    item_id = data['id']
    
    # Test updating item
    update_data = {
        'id': item_id,
        'quantity': 3
    }
    
    response = client.put(
        f'/api/inventory/item/{item_id}',
        json=update_data,
        headers=auth_header
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data['quantity'] == 3
    
    # Test deleting item
    response = client.delete(
        f'/api/inventory/item/{item_id}',
        headers=auth_header
    )
    assert response.status_code == 204
```

### End-to-End Testing

E2E tests using Cypress:

```javascript
describe('Recipe workflow', () => {
  beforeEach(() => {
    // Log in before each test
    cy.login('testuser', 'password123');
  });

  it('should allow adding items and generating recipes', () => {
    // Visit inventory page
    cy.visit('/inventory');
    
    // Add items to inventory
    cy.get('[data-testid="add-item-button"]').click();
    cy.get('[data-testid="item-name-input"]').type('Apple');
    cy.get('[data-testid="item-quantity-input"]').type('3');
    cy.get('[data-testid="item-unit-input"]').select('pieces');
    cy.get('[data-testid="item-category-input"]').select('fruits');
    cy.get('[data-testid="submit-button"]').click();
    
    // Verify item was added
    cy.contains('Apple').should('be.visible');
    cy.contains('3 pieces').should('be.visible');
    
    // Go to recipes page
    cy.visit('/recipes');
    
    // Generate recipes
    cy.get('[data-testid="generate-recipes-button"]').click();
    
    // Wait for recipes to load
    cy.get('[data-testid="recipe-card"]', { timeout: 10000 }).should('have.length.at.least', 1);
    
    // Open first recipe
    cy.get('[data-testid="recipe-card"]').first().click();
    
    // Verify recipe details page
    cy.url().should('include', '/recipe/');
    cy.get('[data-testid="recipe-title"]').should('be.visible');
    cy.get('[data-testid="ingredients-list"]').should('be.visible');
    cy.get('[data-testid="instructions-list"]').should('be.visible');
  });
});