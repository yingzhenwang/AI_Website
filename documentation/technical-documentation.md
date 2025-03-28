# Kitchen Inventory System - Technical Documentation

## System Overview

The Kitchen Inventory System is a Next.js web application that helps users manage their kitchen inventory, track ingredients, maintain cooking equipment, and generate recipes based on available items. The application uses AI-powered features to enhance the user experience.

## Architecture

### Technology Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **AI Integration**: OpenAI GPT-4 API
- **Image Upload**: UploadThing

### Component Structure

```
src/
├── app/               # Next.js app directory
│   ├── api/           # API routes
│   └── page.tsx       # Main application page
├── components/        # React components
├── lib/               # Utility functions and shared code
└── prisma/            # Database schema and migrations
```

## Database Schema

### Models

#### Item
- `id`: Integer (Primary Key)
- `name`: String
- `quantity`: Float
- `unit`: String
- `category`: String (nullable)
- `notes`: String (nullable)
- `expiryDate`: DateTime (nullable)
- `createdAt`: DateTime
- `updatedAt`: DateTime
- Relations: `ingredients`, `equipment`

#### Recipe
- `id`: Integer (Primary Key)
- `name`: String
- `description`: String
- `instructions`: String
- `cookingTime`: Integer (minutes)
- `servings`: Integer
- `createdAt`: DateTime
- Relations: `ingredients`, `equipment`

#### RecipeIngredient
- `id`: Integer (Primary Key)
- `recipeId`: Integer (Foreign Key)
- `itemId`: Integer (Foreign Key)
- `quantity`: Float
- `unit`: String
- Relations: `recipe`, `item`

#### RecipeEquipment
- `id`: Integer (Primary Key)
- `recipeId`: Integer (Foreign Key)
- `itemId`: Integer (Foreign Key)
- Relations: `recipe`, `item`

## Core Components

### ItemList
Displays inventory items grouped by category, with functionality to add, edit, and delete items. Includes an auto-categorize feature using AI.

### Equipment
Manages kitchen equipment with features to add, edit, and delete equipment items. Includes AI-powered initialization of equipment lists based on user preferences.

### AddItems
Provides options to add items manually or via image upload and recognition.

### Recipes
Handles recipe generation, viewing, saving, and cooking. Includes functionality to:
- Generate recipes based on available ingredients
- Filter by preferred ingredients
- Include equipment instructions
- Save recipes for later use
- "Cook" recipes (deduct ingredients from inventory)

## API Endpoints

### `/api/items`
- `GET`: Fetches all items, optionally filtered by category
- `POST`: Creates a new item or batch of items
- `PUT`: Updates an existing item

### `/api/items/:id`
- `DELETE`: Deletes an item by ID

### `/api/categorize-items`
- `POST`: Uses AI to automatically categorize items

### `/api/initialize-equipment`
- `POST`: Uses AI to generate a list of common equipment based on preferences (basic, average, fancy)

### `/api/generate-recipe`
- `POST`: Generates a recipe based on available ingredients and preferences

### `/api/cook-recipe`
- `POST`: Processes a recipe by deducting ingredients from inventory

### `/api/uploadthing`
- Handles image upload functionality

## AI Integration

The system leverages OpenAI's GPT-4 for several key features:

1. **Recipe Generation**: Creates recipes based on available ingredients, with the ability to specify servings, preferred ingredients, and special requests.

2. **Ingredient Categorization**: Automatically categorizes inventory items into appropriate food categories.

3. **Equipment Recommendation**: Suggests kitchen equipment based on the user's cooking level and preferences.

## User Workflows

### Inventory Management
1. Add items manually or via image upload
2. Group items by category
3. Track quantities and expiry dates
4. Auto-categorize items using AI

### Equipment Management
1. View all kitchen equipment
2. Add, edit, or delete equipment
3. Initialize equipment list based on cooking expertise level
4. Customize equipment based on cooking preferences

### Recipe Generation
1. Generate recipes based on available ingredients
2. Specify servings and preferred ingredients
3. Add special requests (dietary restrictions, cuisine preferences)
4. Include or exclude equipment instructions
5. View, save, or cook recipes

## Deployment

The application uses SQLite for development, which stores data in a local file. For production deployment, consider:

1. Migrating to a more robust database (PostgreSQL, MySQL)
2. Setting up proper authentication
3. Implementing rate limiting for AI API calls
4. Adding backup functionality for user data

## Future Enhancements

1. Multi-user support with personalized inventories
2. Meal planning functionality
3. Shopping list generation based on preferred recipes
4. Recipe sharing capabilities
5. Advanced filtering and search for recipes and ingredients
6. Nutrition tracking
7. Integration with smart kitchen devices
8. Mobile application 