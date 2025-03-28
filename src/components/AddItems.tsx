'use client';

import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { CameraIcon, DocumentTextIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useUploadThing } from '@/lib/uploadthing';
import { Item } from '@prisma/client';

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
  const [manualForm, setManualForm] = useState({
    name: '',
    quantity: 1,
    unit: '',
    category: '',
    expiryDate: ''
  });
  const [existingItems, setExistingItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { startUpload } = useUploadThing("imageUploader");

  useEffect(() => {
    // Fetch existing items when component mounts
    const fetchExistingItems = async () => {
      try {
        const response = await fetch('/api/items');
        const data = await response.json();
        setExistingItems(data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };
    fetchExistingItems();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const uploadedFiles = await startUpload(Array.from(files));
      if (!uploadedFiles) return;

      const response = await fetch('/api/process-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: uploadedFiles[0].url
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      const data = await response.json();
      if (selectedIndex === 0) {
        setSelectedIndex(2); // Switch to manual tab
        setManualForm({
          ...manualForm,
          ...data
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (value: string) => {
    setManualForm({ ...manualForm, name: value });
    if (value.length > 0) {
      const filtered = existingItems.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredItems(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredItems([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectItem = (item: Item) => {
    setManualForm({
      ...manualForm,
      name: item.name,
      unit: item.unit,
      category: item.category
    });
    setShowSuggestions(false);
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

      setManualForm({
        name: '',
        quantity: 1,
        unit: '',
        category: '',
        expiryDate: ''
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
        <Tab.List className="flex space-x-1 rounded-xl bg-slate-100 p-1">
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-slate-200 ring-opacity-60 ring-offset-2 ring-offset-slate-300 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:bg-white/[0.12] hover:text-indigo-500'
              )
            }
          >
            <CameraIcon className="w-5 h-5 mr-2 inline-block" />
            Take Photo
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-slate-200 ring-opacity-60 ring-offset-2 ring-offset-slate-300 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:bg-white/[0.12] hover:text-indigo-500'
              )
            }
          >
            <DocumentTextIcon className="w-5 h-5 mr-2 inline-block" />
            Receipt
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-slate-200 ring-opacity-60 ring-offset-2 ring-offset-slate-300 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:bg-white/[0.12] hover:text-indigo-500'
              )
            }
          >
            <PencilIcon className="w-5 h-5 mr-2 inline-block" />
            Manual
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-4">
          <Tab.Panel>
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg border-slate-200 bg-slate-50">
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
                <CameraIcon className="w-12 h-12 text-slate-400" />
                <span className="mt-2 text-sm text-slate-600">
                  {loading ? 'Processing...' : 'Take a photo of your items'}
                </span>
              </label>
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg border-slate-200 bg-slate-50">
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
                <DocumentTextIcon className="w-12 h-12 text-slate-400" />
                <span className="mt-2 text-sm text-slate-600">
                  {loading ? 'Processing...' : 'Upload a receipt'}
                </span>
              </label>
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                  Item Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    required
                    value={manualForm.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    onFocus={() => manualForm.name && setShowSuggestions(true)}
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Start typing to search existing items..."
                  />
                  {showSuggestions && filteredItems.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-slate-200">
                      <ul className="max-h-60 overflow-auto py-1">
                        {filteredItems.map((item) => (
                          <li
                            key={item.id}
                            className="px-4 py-2 hover:bg-slate-100 cursor-pointer text-slate-700"
                            onClick={() => handleSelectItem(item)}
                          >
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-slate-500">
                              {item.category} • {item.unit}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-slate-700">
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
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white text-slate-900"
                  />
                </div>
                
                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-slate-700">
                    Unit
                  </label>
                  <select
                    id="unit"
                    required
                    value={manualForm.unit}
                    onChange={(e) => setManualForm({ ...manualForm, unit: e.target.value })}
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white text-slate-900"
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
                <label htmlFor="category" className="block text-sm font-medium text-slate-700">
                  Category
                </label>
                <select
                  id="category"
                  required
                  value={manualForm.category}
                  onChange={(e) => setManualForm({ ...manualForm, category: e.target.value })}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white text-slate-900"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-slate-700">
                  Expiry Date (optional)
                </label>
                <input
                  type="date"
                  id="expiryDate"
                  value={manualForm.expiryDate || ''}
                  onChange={(e) => setManualForm({ ...manualForm, expiryDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
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