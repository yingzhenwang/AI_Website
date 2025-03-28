# Kitchen Inventory System - User Guide

Welcome to the Kitchen Inventory System! This guide will help you make the most of the application's features to manage your kitchen inventory and discover new recipes.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Managing Your Inventory](#managing-your-inventory)
3. [Working with Equipment](#working-with-equipment)
4. [Adding Items](#adding-items)
5. [Generating Recipes](#generating-recipes)
6. [Troubleshooting](#troubleshooting)

## Getting Started

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Internet connection for AI-powered features

### Accessing the Application

1. Open the application in your web browser
2. The main page displays the Kitchen Inventory System with four main tabs:
   - Inventory
   - Equipment
   - Add Items
   - Recipes

## Managing Your Inventory

The Inventory tab shows all your food items grouped by category.

### Viewing Inventory

- Items are grouped by categories (Produce, Meat & Seafood, Dairy & Eggs, etc.)
- Each item shows:
  - Name
  - Quantity and unit
  - Expiry date (if set)

### Managing Items

- **Editing**: Click the pencil icon to edit an item's details
- **Deleting**: Click the trash icon to remove an item from inventory
- **Adjusting Quantity**: Use the "+" and "-" buttons to quickly adjust quantities

### Auto-Categorizing Items

If your items don't have categories or you want to reorganize them:

1. Click the "Auto-Categorize Items" button
2. The system will use AI to assign appropriate categories to all items
3. Categories include: Produce, Meat & Seafood, Dairy & Eggs, Pantry, Spices & Seasonings, Beverages, and Other

## Working with Equipment

The Equipment tab helps you manage your kitchen equipment separately from food items.

### Viewing Equipment

- All cooking equipment is listed in a grid view
- Each equipment item shows:
  - Name
  - Quantity
  - Unit (typically "piece" or "set")
  - Notes (if any)

### Managing Equipment

- **Adding**: Click "Add Equipment" to add a new piece of equipment
- **Editing**: Click the pencil icon to edit details
- **Deleting**: Click the trash icon to remove equipment

### Initializing Equipment

To quickly populate your equipment list:

1. Click "Initialize Equipment"
2. Choose a level:
   - **Basic**: Essential items for a minimal kitchen
   - **Average**: Standard equipment for regular home cooking
   - **Fancy**: Comprehensive set for an enthusiastic home chef
3. Add optional details about your cooking style, cuisine preferences, or space constraints
4. Click "Initialize"

### Delete All Equipment

To start fresh:

1. Click "Delete All" (only visible when you have equipment)
2. Confirm the deletion

## Adding Items

The Add Items tab provides multiple ways to add items to your inventory.

### Manual Entry

1. Fill in the item details:
   - Name
   - Quantity
   - Unit
   - Category (optional)
   - Expiry Date (optional)
2. Click "Add Item"

### Batch Import

1. Enter multiple items in the text area using the specified format
2. Click "Add Items"

### Image Upload

To add items using image recognition:

1. Click the "Upload Image" tab
2. Upload an image of your grocery items or receipt
3. The system will attempt to recognize items
4. Review and edit the recognized items
5. Click "Add to Inventory"

## Generating Recipes

The Recipes tab helps you create recipes based on what you have in your inventory.

### Available Recipes

- View all your saved recipes
- See newly generated recipes before deciding to save them

### Generating a New Recipe

1. Click "Generate Recipe"
2. Enter the number of servings
3. Select ingredients you'd like to use (optional)
4. Choose whether to include cooking equipment instructions
   - If enabled, you can click "Customize equipment" to select specific equipment
5. Add any special requests (e.g., "vegetarian", "quick meal", "Italian cuisine")
6. Click "Generate Recipe"

### Working with Recipes

For each generated recipe, you can:

- View the recipe details, including ingredients with quantities and cooking instructions
- See equipment requirements (if enabled)
- **Save**: Keep the recipe for future use
- **Discard**: Remove the recipe if you're not interested
- **Cook**: Mark the recipe as cooked, which will automatically:
  - Deduct used ingredients from your inventory
  - Remove the recipe from your list

### Saved Recipes

- Saved recipes remain available until cooked or deleted
- You can delete saved recipes by clicking the trash icon

## Troubleshooting

### Common Issues

1. **Recipe generation fails**:
   - Ensure you have sufficient ingredients in your inventory
   - Check that you've specified a valid number of servings
   - Try with fewer constraints or different ingredients

2. **Item quantities don't update**:
   - Refresh the page to see the latest data
   - Check that the units match between recipe and inventory

3. **Cannot cook a recipe**:
   - Ensure you have sufficient quantities of all ingredients
   - Check for any error messages

### Getting Help

If you encounter persistent issues:

1. Check the error messages for specific information
2. Restart the application
3. Contact support with details about the problem 