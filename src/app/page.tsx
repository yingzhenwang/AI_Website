import { Suspense } from 'react';
import Inventory from '@/components/Inventory';

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Smart Kitchen Inventory</h1>
        <Suspense fallback={<div>Loading...</div>}>
          <Inventory />
        </Suspense>
      </div>
    </main>
  );
} 