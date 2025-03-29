import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function DELETE(
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
    
    // First delete related records to prevent foreign key constraints
    await prisma.$transaction([
      // Delete recipe ingredients
      prisma.recipeIngredient.deleteMany({
        where: { recipeId }
      }),
      // Delete recipe equipment
      prisma.recipeEquipment.deleteMany({
        where: { recipeId }
      }),
      // Delete the recipe
      prisma.recipe.delete({
        where: { id: recipeId }
      })
    ]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete recipe' },
      { status: 500 }
    );
  }
} 