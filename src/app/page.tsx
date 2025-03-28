'use client';

import { useState } from 'react';
import ItemList from '@/components/ItemList';
import AddItems from '@/components/AddItems';
import Recipes from '@/components/Recipes';
import Equipment from '@/components/Equipment';

export default function Home() {
  const [activeTab, setActiveTab] = useState('inventory');

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Kitchen Inventory System</h1>
      
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`${
                activeTab === 'inventory'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap border-b-2 py-4 px-1 font-medium`}
            >
              Inventory
            </button>
            <button
              onClick={() => setActiveTab('equipment')}
              className={`${
                activeTab === 'equipment'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap border-b-2 py-4 px-1 font-medium`}
            >
              Equipment
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`${
                activeTab === 'add'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap border-b-2 py-4 px-1 font-medium`}
            >
              Add Items
            </button>
            <button
              onClick={() => setActiveTab('recipes')}
              className={`${
                activeTab === 'recipes'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap border-b-2 py-4 px-1 font-medium`}
            >
              Recipes
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'inventory' && <ItemList />}
      {activeTab === 'equipment' && <Equipment />}
      {activeTab === 'add' && <AddItems />}
      {activeTab === 'recipes' && <Recipes />}
    </main>
  );
} 