# Kitchen Inventory System - API Documentation

This document provides detailed information about the API endpoints available in the Kitchen Inventory System.

## Base URL

For local development: `http://localhost:3000/api`

## Authentication

Currently, the API does not require authentication as it's designed for personal use.

## API Endpoints

### Items API

#### Get All Items

```
GET /items
```

Retrieves all items in the inventory.

**Query Parameters:**
- `category` (optional): Filter items by category
- `excludeCategory` (optional): Exclude items with a specific category

**Response:**
```json
[
  {
    "id": 1,
    "name": "Apple",
    "quantity": 5,
    "unit": "pieces",
    "category": "Produce",
    "notes": null,
    "expiryDate": "2023-12-31T00:00:00.000Z",
    "createdAt": "2023-06-15T10:30:00.000Z",
    "updatedAt": "2023-06-15T10:30:00.000Z"
  },
  ...
]
```

#### Create Item

```
POST /items
```

Creates a new item or items in the inventory.

**Request Body:**
```json
{
  "name": "Milk",
  "quantity": 1,
  "unit": "liter",
  "category": "Dairy & Eggs",
  "expiryDate": "2023-07-15T00:00:00.000Z"
}
```

OR (batch creation):

```json
[
  {
    "name": "Milk",
    "quantity": 1,
    "unit": "liter",
    "category": "Dairy & Eggs",
    "expiryDate": "2023-07-15T00:00:00.000Z"
  },
  {
    "name": "Eggs",
    "quantity": 12,
    "unit": "pieces",
    "category": "Dairy & Eggs",
    "expiryDate": "2023-07-20T00:00:00.000Z"
  }
]
```

**Response:**
```json
{
  "id": 15,
  "name": "Milk",
  "quantity": 1,
  "unit": "liter",
  "category": "Dairy & Eggs",
  "notes": null,
  "expiryDate": "2023-07-15T00:00:00.000Z",
  "createdAt": "2023-06-15T14:30:00.000Z",
  "updatedAt": "2023-06-15T14:30:00.000Z"
}
```

#### Update Item

```
PUT /items
```

Updates an existing item in the inventory.

**Request Body:**
```json
{
  "id": 15,
  "quantity": 2,
  "expiryDate": "2023-07-20T00:00:00.000Z"
}
```

**Response:**
```json
{
  "id": 15,
  "name": "Milk",
  "quantity": 2,
  "unit": "liter",
  "category": "Dairy & Eggs",
  "notes": null,
  "expiryDate": "2023-07-20T00:00:00.000Z",
  "createdAt": "2023-06-15T14:30:00.000Z",
  "updatedAt": "2023-06-15T15:00:00.000Z"
}
```

#### Delete Item

```
DELETE /items/{id}
```

Deletes an item from the inventory.

**Parameters:**
- `id`: The ID of the item to delete

**Response:**
```json
{
  "success": true
}
```

### Categorize Items API

```
POST /categorize-items
```

Uses OpenAI to automatically categorize items in the inventory.

**Request Body:**
No body required

**Response:**
```json
{
  "success": true,
  "categorizedItems": [
    {
      "id": 1,
      "category": "Produce"
    },
    {
      "id": 2,
      "category": "Meat & Seafood"
    },
    ...
  ]
}
```

### Initialize Equipment API

```
POST /initialize-equipment
```

Generates a list of kitchen equipment based on the specified level and additional information.

**Request Body:**
```json
{
  "level": "basic", // Options: "basic", "average", "fancy"
  "additionalInfo": "I love baking and Italian cuisine"
}
```

**Response:**
```json
{
  "success": true,
  "count": 15
}
```

### Generate Recipe API

```
POST /generate-recipe
```

Generates a recipe based on available ingredients and user preferences.

**Request Body:**
```json
{
  "servings": 2,
  "preferredItems": [
    {
      "id": 1,
      "name": "Chicken Breast",
      "quantity": 0.5,
      "unit": "kg",
      "category": "Meat & Seafood"
    },
    ...
  ],
  "specialRequests": "Italian cuisine, quick to prepare",
  "includeEquipment": true,
  "equipment": [
    {
      "id": 10,
      "name": "Frying Pan"
    },
    ...
  ]
}
```

**Response:**
```json
{
  "id": 5,
  "name": "Quick Italian Chicken Pasta",
  "description": "A delicious and quick Italian-inspired chicken pasta dish.",
  "instructions": "1. Season chicken with salt and pepper...",
  "cookingTime": 30,
  "servings": 2,
  "createdAt": "2023-06-15T16:00:00.000Z",
  "ingredients": [
    {
      "id": 10,
      "recipeId": 5,
      "itemId": 1,
      "quantity": 0.3,
      "unit": "kg",
      "item": {
        "id": 1,
        "name": "Chicken Breast",
        "quantity": 0.5,
        "unit": "kg",
        "category": "Meat & Seafood",
        "notes": null,
        "expiryDate": null,
        "createdAt": "2023-06-15T10:30:00.000Z",
        "updatedAt": "2023-06-15T10:30:00.000Z"
      }
    },
    ...
  ],
  "equipment": [
    {
      "id": 5,
      "recipeId": 5,
      "itemId": 10,
      "item": {
        "id": 10,
        "name": "Frying Pan",
        "quantity": 1,
        "unit": "piece",
        "category": "Cooking Equipment",
        "notes": null,
        "expiryDate": null,
        "createdAt": "2023-06-15T10:30:00.000Z",
        "updatedAt": "2023-06-15T10:30:00.000Z"
      }
    },
    ...
  ]
}
```

### Cook Recipe API

```
POST /cook-recipe
```

Processes a recipe by deducting the used ingredients from inventory.

**Request Body:**
```json
{
  "recipeId": 5
}
```

**Response:**
```json
{
  "success": true
}
```

### UploadThing API

```
POST /uploadthing
```

Handles file uploads using the UploadThing service.

This endpoint is internally used by the UploadThing client and should not be directly called from your application code.

## Error Handling

All API endpoints return appropriate HTTP status codes:

- `200 OK`: Request successful
- `400 Bad Request`: Invalid input
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses include a JSON body with an error message:

```json
{
  "error": "Description of the error"
}
```

## Rate Limiting

Currently, there are no rate limits implemented on the API endpoints.

## Notes

- All date/time values are in ISO 8601 format.
- The API uses JSON for request and response bodies.
- When updating an item, only include the fields you want to change. 