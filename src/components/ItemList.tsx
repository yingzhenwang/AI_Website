'use client';

import { useEffect, useState } from 'react';
import { Item } from '@prisma/client';

export default function ItemList() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('/api/items');
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  if (loading) {
    return <div>Loading items...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No items in inventory</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold text-lg">{item.name}</h3>
          <div className="mt-2 text-gray-600">
            <p>
              Quantity: {item.quantity} {item.unit}
            </p>
            <p>Category: {item.category}</p>
            {item.expiryDate && (
              <p>
                Expires:{' '}
                {new Date(item.expiryDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 