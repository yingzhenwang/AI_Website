import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { openai } from '@/lib/openai';

export async function POST() {
  try {
    // Get current inventory
    const items = await prisma.item.findMany();
    
    // Generate recipe using GPT-4
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful cooking assistant that generates recipes based on available ingredients."
        },
        {
          role: "user",
          content: `Generate a recipe using some of these ingredients: ${JSON.stringify(
            items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              unit: item.unit
            }))
          )}. Return the response in JSON format with the following structure: {
            name: string,
            description: string,
            instructions: string,
            cookingTime: number (in minutes),
            servings: number,
            ingredients: Array<{
              itemId: number,
              quantity: number,
              unit: string
            }>
          }`
        }
      ]
    });

    const recipeData = JSON.parse(response.choices[0].message.content || '{}');

    // Create recipe in database
    const recipe = await prisma.recipe.create({
      data: {
        name: recipeData.name,
        description: recipeData.description,
        instructions: recipeData.instructions,
        cookingTime: recipeData.cookingTime,
        servings: recipeData.servings,
        ingredients: {
          create: recipeData.ingredients
        }
      },
      include: {
        ingredients: true
      }
    });

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error generating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to generate recipe' },
      { status: 500 }
    );
  }
} 