'use client';

import { useEffect, useState } from 'react';
import { Item } from '@prisma/client';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface ExtendedItem extends Item {
  notes?: string;
}

interface EditModalProps {
  item: ExtendedItem;
  onClose: () => void;
  onSave: (updatedItem: Partial<ExtendedItem>) => void;
}

const commonEquipment = [
  { name: 'Chef\'s Knife', unit: 'piece' },
  { name: 'Cutting Board', unit: 'piece' },
  { name: 'Large Pot', unit: 'piece' },
  { name: 'Frying Pan', unit: 'piece' },
  { name: 'Mixing Bowls', unit: 'set' },
  { name: 'Measuring Cups', unit: 'set' },
  { name: 'Measuring Spoons', unit: 'set' },
  { name: 'Colander', unit: 'piece' },
  { name: 'Baking Sheet', unit: 'piece' },
  { name: 'Food Processor', unit: 'piece' },
  { name: 'Stand Mixer', unit: 'piece' },
  { name: 'Blender', unit: 'piece' },
  { name: 'Whisk', unit: 'piece' },
  { name: 'Spatula', unit: 'piece' },
  { name: 'Tongs', unit: 'piece' }
];

function EditModal({ item, onClose, onSave }: EditModalProps) {
  const [formData, setFormData] = useState({
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    notes: item.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      category: 'Cooking Equipment'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">Edit Equipment</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Quantity</label>
            <input
              type="number"
              step="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Unit</label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Notes</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddEquipmentModal({ onClose, onAdd }: { 
  onClose: () => void; 
  onAdd: (equipment: Omit<ExtendedItem, 'id' | 'createdAt' | 'updatedAt'>) => void 
}) {
  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    unit: 'piece',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      category: 'Cooking Equipment',
      expiryDate: null
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">Add New Equipment</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Quantity</label>
            <input
              type="number"
              step="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Unit</label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Add Equipment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Equipment() {
  const [equipment, setEquipment] = useState<ExtendedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<ExtendedItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [initializeLoading, setInitializeLoading] = useState(false);
  const [showInitOptions, setShowInitOptions] = useState(false);
  const [initLevel, setInitLevel] = useState<'basic' | 'average' | 'fancy'>('average');
  const [additionalInfo, setAdditionalInfo] = useState('');

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/items?category=Cooking Equipment');
      const data = await response.json();
      setEquipment(data);

      // If no equipment exists and not initialized, add common equipment
      if (data.length === 0 && !initialized) {
        await initializeCommonEquipment();
        setInitialized(true);
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeCommonEquipment = async () => {
    try {
      // Check for existing equipment names to avoid duplicates
      const existingNames = equipment.map(item => item.name.toLowerCase());
      
      const newEquipment = commonEquipment.filter(
        item => !existingNames.includes(item.name.toLowerCase())
      );
      
      // Only add equipment that doesn't already exist
      for (const item of newEquipment) {
        await fetch('/api/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...item,
            quantity: 1,
            category: 'Cooking Equipment',
            notes: '',
            expiryDate: null
          }),
        });
      }
      await fetchEquipment();
    } catch (error) {
      console.error('Error initializing common equipment:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete equipment');
      setEquipment(equipment.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting equipment:', error);
    }
  };

  const handleEditSave = async (updatedData: Partial<ExtendedItem>) => {
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
      setEquipment(equipment.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      ));
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating equipment:', error);
      alert(error instanceof Error ? error.message : 'Failed to update equipment');
    }
  };

  const handleAdd = async (newEquipment: Omit<ExtendedItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEquipment),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const addedItem = await response.json();
      setEquipment([...equipment, addedItem]);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding equipment:', error);
      alert(error instanceof Error ? error.message : 'Failed to add equipment');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL equipment? This cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      for (const item of equipment) {
        await fetch(`/api/items/${item.id}`, {
          method: 'DELETE',
        });
      }
      setEquipment([]);
    } catch (error) {
      console.error('Error deleting all equipment:', error);
      alert('Error deleting all equipment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeWithLLM = async () => {
    try {
      setInitializeLoading(true);
      const response = await fetch('/api/initialize-equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level: initLevel,
          additionalInfo: additionalInfo
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initialize equipment');
      }

      await fetchEquipment();
      setShowInitOptions(false);
      setAdditionalInfo('');
    } catch (error) {
      console.error('Error initializing equipment:', error);
      alert('Failed to initialize equipment. Please try again.');
    } finally {
      setInitializeLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Kitchen Equipment</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowInitOptions(!showInitOptions)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Initialize Equipment
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Add Equipment
          </button>
          {equipment.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete All
            </button>
          )}
        </div>
      </div>

      {showInitOptions && (
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-4">
          <h3 className="text-lg font-medium text-slate-800">Initialize Kitchen Equipment</h3>
          <p className="text-slate-600">Select a kitchen equipment level to populate your inventory:</p>
          
          <div className="space-y-4">
            <div className="flex space-x-4">
              <div 
                onClick={() => setInitLevel('basic')}
                className={`p-4 border rounded-lg cursor-pointer flex-1 ${
                  initLevel === 'basic' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <h4 className="font-medium text-slate-800 mb-1">Basic</h4>
                <p className="text-sm text-slate-600">Essential equipment for a starter kitchen</p>
              </div>
              
              <div 
                onClick={() => setInitLevel('average')}
                className={`p-4 border rounded-lg cursor-pointer flex-1 ${
                  initLevel === 'average' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <h4 className="font-medium text-slate-800 mb-1">Average</h4>
                <p className="text-sm text-slate-600">Well-equipped kitchen for regular cooking</p>
              </div>
              
              <div 
                onClick={() => setInitLevel('fancy')}
                className={`p-4 border rounded-lg cursor-pointer flex-1 ${
                  initLevel === 'fancy' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <h4 className="font-medium text-slate-800 mb-1">Fancy</h4>
                <p className="text-sm text-slate-600">Comprehensive setup for enthusiastic home chefs</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Additional Information (Optional)
              </label>
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="e.g., I like baking, I'm from Italy, I have limited storage space..."
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
              <p className="mt-1 text-xs text-slate-500">
                This helps tailor the equipment list to your specific needs or regional cuisine.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowInitOptions(false)}
                className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleInitializeWithLLM}
                disabled={initializeLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {initializeLoading ? 'Initializing...' : 'Initialize'}
              </button>
            </div>
          </div>
        </div>
      )}

      {equipment.length === 0 ? (
        <p className="text-center text-gray-500">No equipment added yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipment.map(item => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <p className="text-gray-600">
                    {item.quantity} {item.unit}
                  </p>
                  {item.notes && (
                    <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="p-1 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-gray-100"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
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

      {showAddModal && (
        <AddEquipmentModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
} 