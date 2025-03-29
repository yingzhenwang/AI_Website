import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const saved = searchParams.get('saved') === 'true';
    
    // Query options
    const where = saved ? { saved: true } : {};
    
    // Get recipes from database
    const recipes = await prisma.recipe.findMany({
      where,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
} 