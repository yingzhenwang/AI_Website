import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { recipeId } = await request.json();

    // Get recipe with ingredients
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: { ingredients: { include: { item: true } } },
    });

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Update inventory quantities
    await Promise.all(
      recipe.ingredients.map(async (ingredient) => {
        const newQuantity = ingredient.item.quantity - ingredient.quantity;
        
        if (newQuantity < 0) {
          throw new Error(`Not enough ${ingredient.item.name} in inventory`);
        }

        return prisma.item.update({
          where: { id: ingredient.itemId },
          data: { quantity: newQuantity },
        });
      })
    );

    // Delete recipe after cooking
    await prisma.recipe.delete({
      where: { id: recipeId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cooking recipe:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cook recipe' },
      { status: 500 }
    );
  }
} 