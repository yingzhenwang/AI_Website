'use client';

import { useState } from 'react';
import { 
  HomeIcon, 
  BeakerIcon, 
  PlusCircleIcon, 
  BookOpenIcon 
} from '@heroicons/react/24/outline';
import ItemList from '@/components/ItemList';
import AddItems from '@/components/AddItems';
import Recipes from '@/components/Recipes';
import Equipment from '@/components/Equipment';

export default function Home() {
  const [activeTab, setActiveTab] = useState('inventory');

  const tabs = [
    { id: 'inventory', name: 'Inventory', icon: HomeIcon },
    { id: 'equipment', name: 'Equipment', icon: BeakerIcon },
    { id: 'add', name: 'Add Items', icon: PlusCircleIcon },
    { id: 'recipes', name: 'Recipes', icon: BookOpenIcon },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-primary-600">Kitchen Inventory System</h1>
            <div className="hidden sm:block">
              <span className="bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full border border-primary-200">
                AI-Powered
              </span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-1 flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-neutral-600 hover:text-primary-600 hover:bg-neutral-50'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Panel content */}
        <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
          {activeTab === 'inventory' && <ItemList />}
          {activeTab === 'equipment' && <Equipment />}
          {activeTab === 'add' && <AddItems />}
          {activeTab === 'recipes' && <Recipes />}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-neutral-500 text-sm">
          <p>Kitchen Inventory System • AI-powered inventory and recipe management</p>
        </div>
      </footer>
    </main>
  );
} 