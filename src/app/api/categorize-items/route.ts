import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { openai } from '@/lib/openai';

export async function POST() {
  try {
    // Get all items without categories
    const items = await prisma.item.findMany();
    
    // Create a prompt for the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that categorizes kitchen items. 
          Categories should be one of: 
          - Produce
          - Meat & Seafood
          - Dairy & Eggs
          - Pantry
          - Spices & Seasonings
          - Beverages
          - Cooking Equipment
          - Other`
        },
        {
          role: "user",
          content: `Please categorize these kitchen items. Return the response as a JSON array where each object has 'id' and 'category' properties.
          Items: ${JSON.stringify(items.map(item => ({ id: item.id, name: item.name })))}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const categorizedItems = JSON.parse(response.choices[0].message.content || '[]');

    // Update items with their categories
    await Promise.all(
      categorizedItems.map(async (item: { id: number; category: string }) => {
        await prisma.item.update({
          where: { id: item.id },
          data: { category: item.category }
        });
      })
    );

    return NextResponse.json({ success: true, categorizedItems });
  } catch (error) {
    console.error('Error categorizing items:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to categorize items' },
      { status: 500 }
    );
  }
} 