import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { openai } from '@/lib/openai';

interface Item {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  category?: string;
}

export async function POST(request: Request) {
  try {
    // Get request body
    const body = await request.json();
    const { servings, preferredItems, specialRequests, includeEquipment, equipment } = body;

    // Validate servings
    if (!servings || servings <= 0) {
      return NextResponse.json(
        { error: 'Number of servings must be greater than 0' },
        { status: 400 }
      );
    }

    // Get current inventory, prioritizing preferred items if specified
    const items = await prisma.item.findMany({
      where: {
        NOT: {
          category: 'Cooking Equipment'
        }
      }
    });
    const availableIngredients = preferredItems 
      ? [
          ...preferredItems,
          ...items.filter(item => !preferredItems.some((p: { id: number }) => p.id === item.id))
        ]
      : items;
    
    // Get cooking equipment if requested
    const cookingEquipment = includeEquipment 
      ? equipment || await prisma.item.findMany({ where: { category: 'Cooking Equipment' } })
      : [];

    // Get cooking equipment for instructions if requested
    let equipmentPrompt = '';
    if (includeEquipment && cookingEquipment.length > 0) {
      const equipmentData = cookingEquipment.map((item: any) => ({
        id: item.id,
        name: item.name
      }));
      equipmentPrompt = `3. Available cooking equipment: ${JSON.stringify(equipmentData)}`;
    }

    // Generate recipe using GPT-4
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a helpful cooking assistant that generates recipes based on available ingredients.
          You must ensure that:
          1. The recipe uses ingredients that are available in sufficient quantities
          2. Each ingredient specifies exact quantities needed
          3. The recipe is practical and feasible
          4. All measurements are precise and use the same units as the inventory
          5. The recipe serves exactly the requested number of people
          6. When preferred ingredients are specified, prioritize using those ingredients
          7. When cooking equipment is provided, include specific equipment instructions`
        },
        {
          role: "user",
          content: `Generate a recipe with the following requirements:
          
          1. Number of servings: ${servings}
          
          2. Available ingredients: ${JSON.stringify(
            availableIngredients.map(item => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              category: item.category,
              preferred: preferredItems?.some((p: { id: number }) => p.id === item.id) || false
            }))
          )}
          
          ${preferredItems ? `Note: Some ingredients are marked as preferred. The recipe MUST use at least some preferred ingredients if possible.` : ''}
          
          ${equipmentPrompt}
          
          ${specialRequests ? `${includeEquipment ? '4' : '3'}. Special requests: ${specialRequests}` : ''}
          
          Important rules:
          1. Only use ingredients that have sufficient quantity in the inventory
          2. Specify exact quantities for each ingredient that will be deducted from inventory
          3. Use the same units as specified in the inventory
          4. Do not substitute or assume ingredients that aren't listed
          5. Ensure the recipe serves exactly ${servings} people
          ${specialRequests ? `6. Follow these special requests: ${specialRequests}` : ''}
          ${preferredItems ? '7. Prioritize using preferred ingredients in the recipe' : ''}
          ${includeEquipment ? '8. Include specific instructions for using the available cooking equipment' : ''}
          
          Return the response in JSON format with the following structure:
          {
            name: string,
            description: string,
            instructions: string,
            cookingTime: number (in minutes),
            servings: number (must be ${servings}),
            ingredients: Array<{
              itemId: number,
              quantity: number,
              unit: string
            }>${includeEquipment ? `,
            equipment: Array<{
              itemId: number
            }>` : ''}
          }`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const recipeData = JSON.parse(response.choices[0].message.content || '{}');

    // Check if recipe has at least one ingredient
    if (!recipeData.ingredients || recipeData.ingredients.length === 0) {
      return NextResponse.json(
        { error: 'Could not generate a recipe with the given constraints' },
        { status: 400 }
      );
    }

    // Validate servings
    if (recipeData.servings !== servings) {
      return NextResponse.json(
        { error: `Generated recipe serves ${recipeData.servings} people, but ${servings} was requested` },
        { status: 400 }
      );
    }

    // Check if preferred ingredients were used (if provided)
    if (preferredItems && preferredItems.length > 0) {
      const usedPreferredItems = recipeData.ingredients.filter((ingredient: { itemId: number }) => 
        preferredItems.some((p: { id: number }) => p.id === ingredient.itemId)
      );
      
      if (usedPreferredItems.length === 0) {
        return NextResponse.json(
          { error: 'Could not generate a recipe using any of the preferred ingredients' },
          { status: 400 }
        );
      }
    }

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
        },
        ...(includeEquipment && recipeData.equipment ? {
          equipment: {
            create: recipeData.equipment
          }
        } : {})
      },
      include: {
        ingredients: {
          include: {
            item: true
          }
        },
        ...(includeEquipment ? {
          equipment: {
            include: {
              item: true
            }
          }
        } : {})
      }
    });

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error generating recipe:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate recipe' },
      { status: 500 }
    );
  }
} 