# FoodVision Project Structure

This document outlines the organization of the FoodVision codebase for ease of navigation and understanding.

## Directory Structure

```
foodvision/
├── README.md                 # Project overview and documentation
├── LICENSE                   # MIT License
├── .gitignore                # Git ignore file
├── docker-compose.yml        # Docker composition for deployment
├── assets/                   # Images and diagrams for documentation
│
├── frontend/                 # React frontend application
│   ├── public/               # Static files
│   ├── src/                  # Source files
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Application pages
│   │   ├── services/         # API service connectors
│   │   ├── context/          # React context providers
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Utility functions
│   │   ├── styles/           # CSS and styling
│   │   ├── assets/           # Images and static resources
│   │   ├── App.js            # Main React component
│   │   └── index.js          # React entry point
│   ├── package.json          # Node.js dependencies
│   └── README.md             # Frontend-specific documentation
│
└── backend/                  # Flask backend application
    ├── app/                  # Application package
    │   ├── __init__.py       # Flask application factory
    │   ├── api/              # API routes and resources
    │   │   ├── __init__.py
    │   │   ├── routes.py     # API endpoints
    │   │   └── utils.py      # API utility functions
    │   ├── models/           # Database models
    │   │   ├── __init__.py
    │   │   └── user.py       # User model
    │   ├── services/         # Business logic services
    │   │   ├── __init__.py
    │   │   ├── vision_service.py    # YOLOv8 integration
    │   │   └── recipe_service.py    # DeepSeek-V3 integration
    │   └── config.py         # Application configuration
    ├── tests/                # Unit and integration tests
    │   ├── __init__.py
    │   ├── test_api.py
    │   ├── test_vision.py
    │   └── test_recipes.py
    ├── ml_models/            # Trained ML models
    │   └── yolov8_food.pt    # YOLOv8 model for food detection
    ├── scripts/              # Utility scripts
    │   ├── train_model.py    # Script for training custom YOLOv8 model
    │   └── generate_data.py  # Data generation utilities
    ├── requirements.txt      # Python dependencies
    ├── .env.example          # Example environment variables
    └── README.md             # Backend-specific documentation
```

## Key Components

### Frontend Components

1. **Camera Component**: Handles image capture from webcam or file upload
   - Located at: `frontend/src/components/Camera.jsx`
   - Responsible for capturing images and sending them to the backend

2. **Inventory Dashboard**: Displays current food inventory
   - Located at: `frontend/src/components/InventoryDashboard.jsx`
   - Shows food items with expiry dates and quantities

3. **Recipe Browser**: Browse and filter recipe recommendations
   - Located at: `frontend/src/components/RecipeBrowser.jsx`
   - Displays recipes based on available ingredients

4. **Shopping List**: Generates shopping lists
   - Located at: `frontend/src/components/ShoppingList.jsx`
   - Creates lists based on selected recipes and current inventory

### Backend Services

1. **Vision Service**: Food detection and classification
   - Located at: `backend/app/services/vision_service.py`
   - Uses YOLOv8 for object detection in images

2. **Recipe Service**: Recipe generation and recommendations
   - Located at: `backend/app/services/recipe_service.py`
   - Integrates with DeepSeek-V3 for personalized recipe generation

3. **Inventory Service**: Manages food inventory database
   - Located at: `backend/app/services/inventory_service.py`
   - Handles CRUD operations for inventory management

## Database Schema

### Users Collection
```
{
  "_id": ObjectId,
  "username": String,
  "email": String,
  "password": String (hashed),
  "preferences": {
    "dietary_restrictions": Array,
    "favorite_cuisines": Array,
    "allergies": Array
  },
  "created_at": DateTime,
  "last_login": DateTime
}
```

### Inventory Collection
```
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "items": [
    {
      "name": String,
      "category": String,
      "quantity": Number,
      "unit": String,
      "expiry_date": DateTime,
      "added_date": DateTime,
      "image_url": String
    }
  ]
}
```

### Recipes Collection
```
{
  "_id": ObjectId,
  "title": String,
  "ingredients": [
    {
      "name": String,
      "quantity": Number,
      "unit": String,
      "optional": Boolean
    }
  ],
  "instructions": Array,
  "cuisine": String,
  "preparation_time": Number,
  "serving_size": Number,
  "nutritional_info": Object,
  "image_url": String,
  "tags": Array
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Inventory Management
- `GET /api/inventory` - Get user's inventory
- `POST /api/inventory/detect` - Detect food items from image
- `PUT /api/inventory/item` - Add/update item in inventory
- `DELETE /api/inventory/item/:id` - Remove item from inventory

### Recipe Recommendations
- `GET /api/recipes` - Get recipe recommendations
- `GET /api/recipes/:id` - Get specific recipe details
- `POST /api/recipes/generate` - Generate custom recipe
- `GET /api/recipes/shopping-list/:id` - Generate shopping list for recipe

## Testing Strategy

1. **Unit Tests**
   - Test individual functions and components in isolation
   - Located in `backend/tests/` and `frontend/src/__tests__/`

2. **Integration Tests**
   - Test API endpoints and service interactions
   - Located in `backend/tests/integration/`

3. **End-to-End Tests**
   - Test complete user flows
   - Uses Cypress for frontend testing
   - Located in `frontend/cypress/`

## Deployment Architecture

1. **Development Environment**
   - Local development with hot reloading
   - MongoDB running in Docker

2. **Staging Environment**
   - AWS EC2 instance
   - CI/CD with GitHub Actions

3. **Production Environment**
   - AWS ECS for containerized deployment
   - MongoDB Atlas for database
   - AWS S3 for image storage
   - CloudFront for content delivery
