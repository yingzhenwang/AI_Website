import React, { useState, useEffect } from 'react';
import { Clipboard, ThumbsUp, Clock, AlertCircle } from 'lucide-react';

const RecipeSuggestion = () => {
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Apple', quantity: 3, unit: 'pieces', category: 'fruits', expiry: '2025-04-15' },
    { id: 2, name: 'Milk', quantity: 1, unit: 'liter', category: 'dairy', expiry: '2025-04-05' },
    { id: 3, name: 'Eggs', quantity: 6, unit: 'pieces', category: 'dairy', expiry: '2025-04-12' },
    { id: 4, name: 'Bread', quantity: 1, unit: 'loaf', category: 'grains', expiry: '2025-04-02' },
    { id: 5, name: 'Spinach', quantity: 1, unit: 'bunch', category: 'vegetables', expiry: '2025-03-31' },
    { id: 6, name: 'Chicken', quantity: 500, unit: 'g', category: 'meat', expiry: '2025-04-10' },
    { id: 7, name: 'Rice', quantity: 2, unit: 'kg', category: 'grains', expiry: '2025-06-30' },
    { id: 8, name: 'Tomatoes', quantity: 4, unit: 'pieces', category: 'vegetables', expiry: '2025-04-04' }
  ]);
  
  const [expiringItems, setExpiringItems] = useState([]);
  const [recipes, setRecipes] = useState([
    {
      id: 1,
      title: 'Apple Cinnamon French Toast',
      ingredients: [
        { name: 'Bread', quantity: 4, unit: 'slices' },
        { name: 'Eggs', quantity: 2, unit: 'pieces' },
        { name: 'Milk', quantity: 0.25, unit: 'cup' },
        { name: 'Apple', quantity: 1, unit: 'piece' },
        { name: 'Cinnamon', quantity: 1, unit: 'tsp' },
      ],
      preparationTime: 15,
      matchPercentage: 95,
      imageUrl: 'https://via.placeholder.com/150',
      tags: ['breakfast', 'quick']
    },
    {
      id: 2,
      title: 'Spinach and Egg Breakfast Bowl',
      ingredients: [
        { name: 'Spinach', quantity: 0.5, unit: 'bunch' },
        { name: 'Eggs', quantity: 2, unit: 'pieces' },
        { name: 'Tomatoes', quantity: 1, unit: 'piece' },
        { name: 'Bread', quantity: 1, unit: 'slice' },
      ],
      preparationTime: 10,
      matchPercentage: 100,
      imageUrl: 'https://via.placeholder.com/150',
      tags: ['breakfast', 'healthy']
    },
    {
      id: 3,
      title: 'Chicken and Rice Stir Fry',
      ingredients: [
        { name: 'Chicken', quantity: 300, unit: 'g' },
        { name: 'Rice', quantity: 1, unit: 'cup' },
        { name: 'Spinach', quantity: 0.5, unit: 'bunch' },
        { name: 'Tomatoes', quantity: 2, unit: 'pieces' },
      ],
      preparationTime: 25,
      matchPercentage: 90,
      imageUrl: 'https://via.placeholder.com/150',
      tags: ['dinner', 'main course']
    }
  ]);
  
  // Calculate expiring items
  useEffect(() => {
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);
    
    const expiring = inventory.filter(item => {
      const expiryDate = new Date(item.expiry);
      return expiryDate <= threeDaysLater && expiryDate >= today;
    });
    
    setExpiringItems(expiring);
  }, [inventory]);
  
  const getMatchColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 75) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">FoodVision Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-2 flex items-center">
              <Clipboard className="w-5 h-5 mr-2" />
              Inventory Items
            </h2>
            <p className="text-3xl font-bold">{inventory.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-2 flex items-center">
              <ThumbsUp className="w-5 h-5 mr-2" />
              Recipe Matches
            </h2>
            <p className="text-3xl font-bold">{recipes.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-2 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Expiring Soon
            </h2>
            <p className="text-3xl font-bold">{expiringItems.length}</p>
          </div>
        </div>
      </div>
      
      {expiringItems.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Items Expiring Soon</h2>
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
            <ul className="divide-y divide-yellow-200">
              {expiringItems.map(item => (
                <li key={item.id} className="py-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                    <div className="text-sm text-orange-600">
                      Expires: {new Date(item.expiry).toLocaleDateString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      <div>
        <h2 className="text-xl font-semibold mb-3">Recipe Suggestions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recipes.map(recipe => (
            <div key={recipe.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg mb-2">{recipe.title}</h3>
                  <span 
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${getMatchColor(recipe.matchPercentage)}`}
                  >
                    {recipe.matchPercentage}% match
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{recipe.preparationTime} min</span>
                  <span className="mx-2">•</span>
                  <span>{recipe.tags.join(', ')}</span>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium text-sm mb-1">Ingredients:</h4>
                  <ul className="text-sm text-gray-600 grid grid-cols-2 gap-1">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-1">•</span>
                        <span>
                          {ingredient.quantity} {ingredient.unit} {ingredient.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex-1">
                    View Recipe
                  </button>
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium">
                    Save
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecipeSuggestion;