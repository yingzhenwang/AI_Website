import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

// Define the type for a recipe with ingredients and items included
type RecipeWithIngredients = Prisma.RecipeGetPayload<{
  include: {
    ingredients: {
      include: {
        item: true;
      };
    };
  };
}>;

export async function GET() {
  try {
    // Get all saved recipes where saved is true
    const savedRecipes = await prisma.$queryRaw`
      SELECT * FROM Recipe WHERE saved = 1
    `;

    // Then fetch the full recipe data with ingredients for those recipes
    const savedRecipesWithIngredients = await prisma.recipe.findMany({
      where: {
        id: {
          in: (savedRecipes as { id: number }[]).map(r => r.id)
        }
      },
      include: {
        ingredients: {
          include: {
            item: true
          }
        }
      }
    }) as RecipeWithIngredients[];

    // Get current inventory
    const inventory = await prisma.item.findMany({
      where: {
        // Exclude cooking equipment
        NOT: {
          category: 'Cooking Equipment'
        }
      }
    });

    // Check which recipes can be made with current inventory
    const availableRecipes = savedRecipesWithIngredients.filter(recipe => {
      // Check if all ingredients in the recipe are available in sufficient quantity
      return recipe.ingredients.every(ingredient => {
        const inventoryItem = inventory.find(item => item.id === ingredient.itemId);
        
        // If item exists in inventory and has sufficient quantity
        return inventoryItem && inventoryItem.quantity >= ingredient.quantity;
      });
    });

    // Map to simpler response format
    const response = availableRecipes.map(recipe => ({
      id: recipe.id,
      name: recipe.name,
      servings: recipe.servings,
      cookingTime: recipe.cookingTime
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error finding available recipes:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to find available recipes' },
      { status: 500 }
    );
  }
} 