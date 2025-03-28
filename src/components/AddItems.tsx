'use client';

import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { CameraIcon, DocumentTextIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useUploadThing } from '@/lib/uploadthing';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

type ManualItemForm = {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expiryDate?: string;
};

const CATEGORIES = [
  'vegetables',
  'fruits',
  'meat',
  'dairy',
  'grains',
  'spices',
  'beverages',
  'other'
];

const UNITS = [
  'pieces',
  'grams',
  'kilograms',
  'milliliters',
  'liters',
  'cups',
  'tablespoons',
  'teaspoons'
];

export default function AddItems() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [manualForm, setManualForm] = useState<ManualItemForm>({
    name: '',
    quantity: 1,
    unit: 'pieces',
    category: 'other'
  });

  const { startUpload } = useUploadThing("imageUploader");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const [res] = await startUpload([file]);
      if (!res?.url) throw new Error('Failed to upload image');

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: res.url }),
      });

      const items = await response.json();
      if (!response.ok) throw new Error(items.error);

      await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(items),
      });

      e.target.value = '';
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(manualForm),
      });

      if (!response.ok) throw new Error('Failed to add item');

      // Reset form
      setManualForm({
        name: '',
        quantity: 1,
        unit: 'pieces',
        category: 'other'
      });
      
      alert('Item added successfully!');
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5 flex items-center justify-center',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
              )
            }
          >
            <CameraIcon className="w-5 h-5 mr-2" />
            Take Photo
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5 flex items-center justify-center',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
              )
            }
          >
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            Receipt
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5 flex items-center justify-center',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
              )
            }
          >
            <PencilIcon className="w-5 h-5 mr-2" />
            Manual
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-4">
          <Tab.Panel>
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
                id="camera"
                disabled={loading}
              />
              <label
                htmlFor="camera"
                className="flex flex-col items-center cursor-pointer"
              >
                <CameraIcon className="w-12 h-12 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">
                  {loading ? 'Processing...' : 'Take a photo of your items'}
                </span>
              </label>
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="receipt"
                disabled={loading}
              />
              <label
                htmlFor="receipt"
                className="flex flex-col items-center cursor-pointer"
              >
                <DocumentTextIcon className="w-12 h-12 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">
                  {loading ? 'Processing...' : 'Upload a receipt'}
                </span>
              </label>
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Item Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={manualForm.name}
                  onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    required
                    min="0"
                    step="0.01"
                    value={manualForm.quantity}
                    onChange={(e) => setManualForm({ ...manualForm, quantity: parseFloat(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                    Unit
                  </label>
                  <select
                    id="unit"
                    required
                    value={manualForm.unit}
                    onChange={(e) => setManualForm({ ...manualForm, unit: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  required
                  value={manualForm.category}
                  onChange={(e) => setManualForm({ ...manualForm, category: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                  Expiry Date (optional)
                </label>
                <input
                  type="date"
                  id="expiryDate"
                  value={manualForm.expiryDate || ''}
                  onChange={(e) => setManualForm({ ...manualForm, expiryDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Item'}
              </button>
            </form>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
} 