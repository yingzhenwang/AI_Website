import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const recipeId = parseInt(params.id);
    
    if (isNaN(recipeId)) {
      return NextResponse.json(
        { error: 'Invalid recipe ID' },
        { status: 400 }
      );
    }
    
    // Update the recipe to mark it as saved
    const updatedRecipe = await prisma.recipe.update({
      where: { id: recipeId },
      data: { saved: true },
      include: {
        ingredients: {
          include: {
            item: true
          }
        },
        equipment: {
          include: {
            item: true
          }
        }
      }
    });
    
    return NextResponse.json(updatedRecipe);
  } catch (error) {
    console.error('Error saving recipe:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save recipe' },
      { status: 500 }
    );
  }
} 