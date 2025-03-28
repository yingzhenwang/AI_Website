import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { recipeId } = await request.json();

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    // Find recipe with ingredients
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        ingredients: {
          include: {
            item: true
          }
        }
      }
    });

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Check if any equipment exists for this recipe
    const equipmentCount = await prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*) as count FROM RecipeEquipment WHERE recipeId = ${recipeId}
    `;
    const hasEquipment = equipmentCount[0]?.count > 0;

    // Use a transaction to ensure all updates are performed together
    const result = await prisma.$transaction(async (tx) => {
      // Update inventory for each ingredient
      for (const ingredient of recipe.ingredients) {
        const item = ingredient.item;
        const newQuantity = item.quantity - ingredient.quantity;

        if (newQuantity < 0) {
          throw new Error(`Not enough ${item.name} available. Recipe requires ${ingredient.quantity} ${ingredient.unit}, but you only have ${item.quantity} ${item.unit}.`);
        }

        // Update item quantity
        await tx.item.update({
          where: { id: item.id },
          data: { quantity: newQuantity }
        });
      }

      // Use raw queries to delete related records
      if (hasEquipment) {
        await tx.$executeRaw`DELETE FROM RecipeEquipment WHERE recipeId = ${recipeId}`;
      }
      await tx.$executeRaw`DELETE FROM RecipeIngredient WHERE recipeId = ${recipeId}`;
      
      // Finally delete the recipe
      await tx.recipe.delete({
        where: { id: recipeId }
      });

      return { success: true };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error cooking recipe:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cook recipe' },
      { status: 500 }
    );
  }
} 