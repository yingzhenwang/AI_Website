import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const excludeCategory = searchParams.get('excludeCategory');

    let whereClause = {};
    
    if (category) {
      whereClause = { category };
    } else if (excludeCategory) {
      whereClause = {
        NOT: {
          category: excludeCategory
        }
      };
    }

    const items = await prisma.item.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = Array.isArray(body) ? body : [body];
    
    const processedItems = await Promise.all(
      items.map(async (item) => {
        // Check if item with same name and category exists
        const existingItems = await prisma.item.findMany({
          where: {
            category: item.category
          }
        });
        
        // Manually filter for case-insensitive name match
        const existingItem = existingItems.find(
          existing => existing.name.toLowerCase() === item.name.toLowerCase()
        );

        if (existingItem) {
          // Update existing item with basic fields
          return prisma.item.update({
            where: { id: existingItem.id },
            data: {
              quantity: item.quantity + existingItem.quantity, // Add quantities
              unit: item.unit // Use new unit if provided
            }
          });
        } else {
          // Create new item with only the fields in the schema
          return prisma.item.create({
            data: {
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              category: item.category,
              expiryDate: item.expiryDate ? new Date(item.expiryDate) : null
            }
          });
        }
      })
    );

    return NextResponse.json(processedItems);
  } catch (error) {
    console.error('Error processing items:', error);
    return NextResponse.json({ error: 'Failed to process items' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, notes, ...rest } = body;
    const updateData = { ...rest };

    // Handle date conversion
    if (updateData.expiryDate) {
      updateData.expiryDate = new Date(updateData.expiryDate);
    }

    const updatedItem = await prisma.item.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, action, amount } = body;

    const item = await prisma.item.findUnique({
      where: { id }
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    let newQuantity = item.quantity;
    if (action === 'add') {
      newQuantity += amount;
    } else if (action === 'subtract') {
      newQuantity -= amount;
      if (newQuantity < 0) {
        return NextResponse.json({ error: 'Cannot have negative quantity' }, { status: 400 });
      }
    }

    const updatedItem = await prisma.item.update({
      where: { id },
      data: { quantity: newQuantity }
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating item quantity:', error);
    return NextResponse.json({ error: 'Failed to update item quantity' }, { status: 500 });
  }
} 