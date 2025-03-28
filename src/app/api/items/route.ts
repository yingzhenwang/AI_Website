import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const items = await prisma.item.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = Array.isArray(body) ? body : [body];
    
    const createdItems = await Promise.all(
      items.map(item => 
        prisma.item.create({
          data: {
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            category: item.category,
            expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
          }
        })
      )
    );

    return NextResponse.json(createdItems);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create items' }, { status: 500 });
  }
} 