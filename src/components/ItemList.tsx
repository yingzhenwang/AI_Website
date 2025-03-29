'use client';

import { useEffect, useState } from 'react';
import { Item } from '@prisma/client';
import { PlusIcon, MinusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface EditModalProps {
  item: Item;
  onClose: () => void;
  onSave: (updatedItem: Partial<Item>) => void;
}

function EditModal({ item, onClose, onSave }: EditModalProps) {
  const [formData, setFormData] = useState({
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    category: item.category,
    expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null
    });
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden animate-slide-up">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-neutral-800">Edit Item</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Quantity</label>
              <input
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Unit</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Expiry Date</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="input w-full"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4 py-2"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ItemList() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [categorizing, setCategorizing] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/items?excludeCategory=Cooking Equipment');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete item');
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleAutoCategorize = async () => {
    try {
      setCategorizing(true);
      const response = await fetch('/api/categorize-items', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to categorize items');
      await fetchItems(); // Refresh items after categorization
    } catch (error) {
      console.error('Error categorizing items:', error);
      alert('Failed to categorize items');
    } finally {
      setCategorizing(false);
    }
  };

  // Group items by category
  const itemsByCategory = items.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, Item[]>);

  // Sort categories with "Cooking Equipment" at the end
  const sortedCategories = Object.keys(itemsByCategory).sort((a, b) => {
    if (a === 'Cooking Equipment') return 1;
    if (b === 'Cooking Equipment') return -1;
    if (a === 'Uncategorized') return 1;
    if (b === 'Uncategorized') return -1;
    return a.localeCompare(b);
  });

  const handleQuantityChange = async (itemId: number, action: 'add' | 'subtract') => {
    try {
      const response = await fetch('/api/items', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: itemId,
          action,
          amount: 1
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const updatedItem = await response.json();
      setItems(items.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert(error instanceof Error ? error.message : 'Failed to update quantity');
    }
  };

  const handleEditSave = async (updatedData: Partial<Item>) => {
    if (!editingItem) return;

    try {
      const response = await fetch('/api/items', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingItem.id,
          ...updatedData
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const updatedItem = await response.json();
      setItems(items.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      ));
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
      alert(error instanceof Error ? error.message : 'Failed to update item');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-neutral-800">Your Inventory</h2>
        <button
          onClick={handleAutoCategorize}
          disabled={categorizing || items.length === 0}
          className="btn btn-secondary px-4 py-2"
        >
          {categorizing ? 'Categorizing...' : 'Auto-Categorize Items'}
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-8 text-center text-neutral-600">
          <p className="mb-4">Your inventory is empty.</p>
          <p>Add items using the "Add Items" tab or try out the image recognition feature.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedCategories.map(category => (
            <div key={category} className="card p-6">
              <h3 className="text-lg font-medium text-neutral-800 mb-4 flex items-center">
                <span 
                  className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    category === 'Produce' ? 'bg-success-500' :
                    category === 'Meat & Seafood' ? 'bg-error-500' :
                    category === 'Dairy & Eggs' ? 'bg-warning-500' :
                    category === 'Pantry' ? 'bg-secondary-500' :
                    category === 'Spices & Seasonings' ? 'bg-primary-500' :
                    'bg-neutral-500'
                  }`}
                ></span>
                {category}
              </h3>
              <div className="divide-y divide-neutral-100">
                {itemsByCategory[category].map(item => (
                  <div key={item.id} className="py-3 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-medium text-neutral-800">{item.name}</span>
                        {item.expiryDate && (
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                            new Date(item.expiryDate) < new Date() ? 
                              'bg-error-100 text-error-700' : 
                              new Date(item.expiryDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) ?
                                'bg-warning-100 text-warning-700' :
                                'bg-neutral-100 text-neutral-700'
                          }`}>
                            Expires: {new Date(item.expiryDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-neutral-500">
                        {item.quantity} {item.unit}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => handleQuantityChange(item.id, 'subtract')}
                          className="p-1.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-700"
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <div className="px-2 text-sm">
                          {item.quantity}
                        </div>
                        <button
                          onClick={() => handleQuantityChange(item.id, 'add')}
                          className="p-1.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-700"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-1.5 text-neutral-500 hover:text-primary-600 rounded-md hover:bg-neutral-50"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-neutral-500 hover:text-error-600 rounded-md hover:bg-neutral-50"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {editingItem && (
        <EditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
} 