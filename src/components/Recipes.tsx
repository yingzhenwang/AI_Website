'use client';

import { useState, useEffect } from 'react';
import { Recipe, Item } from '@prisma/client';
import { ChevronUpIcon, ChevronDownIcon, XMarkIcon, BookmarkIcon } from '@heroicons/react/24/outline';

interface RecipeGenerationForm {
  servings: number;
  selectedItems: number[];
  specialRequests: string;
  includeEquipment: boolean;
  selectedEquipment: number[];
  showEquipmentSelection: boolean;
}

interface RecipeEquipment {
  id: number;
  recipeId: number;
  itemId: number;
  item: Item;
}

interface RecipeWithIngredients extends Recipe {
  ingredients: {
    quantity: number;
    unit: string;
    item: Item;
  }[];
  equipment?: RecipeEquipment[];
}

export default function Recipes() {
  const [recipes, setRecipes] = useState<RecipeWithIngredients[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<RecipeWithIngredients[]>([]);
  const [loading, setLoading] = useState(false);
  const [cookingId, setCookingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [form, setForm] = useState<RecipeGenerationForm>({
    servings: 2,
    selectedItems: [],
    specialRequests: '',
    includeEquipment: false,
    selectedEquipment: [],
    showEquipmentSelection: false
  });
  const [inventory, setInventory] = useState<Item[]>([]);
  const [equipment, setEquipment] = useState<Item[]>([]);

  useEffect(() => {
    // Fetch available items when component mounts
    const fetchItems = async () => {
      try {
        const response = await fetch('/api/items');
        const data = await response.json();
        setAvailableItems(data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch food items (exclude cooking equipment)
        const invResponse = await fetch('/api/items?excludeCategory=Cooking Equipment');
        const invData = await invResponse.json();
        setInventory(invData);
        
        // Fetch equipment separately
        const equipResponse = await fetch('/api/items?category=Cooking Equipment');
        const equipData = await equipResponse.json();
        setEquipment(equipData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleEquipmentSelection = () => {
    if (form.includeEquipment) {
      setForm(prev => ({ 
        ...prev, 
        showEquipmentSelection: !prev.showEquipmentSelection,
        selectedEquipment: prev.showEquipmentSelection ? 
          prev.selectedEquipment : 
          equipment.map(eq => eq.id)
      }));
    } else {
      setForm(prev => ({ 
        ...prev, 
        showEquipmentSelection: false,
        selectedEquipment: []
      }));
    }
  };

  const toggleEquipmentInclusion = (e: React.ChangeEvent<HTMLInputElement>) => {
    const include = e.target.checked;
    setForm(prev => ({ 
      ...prev, 
      includeEquipment: include,
      showEquipmentSelection: include && prev.showEquipmentSelection,
      selectedEquipment: include ? equipment.map(eq => eq.id) : []
    }));
  };

  const generateRecipe = async () => {
    if (form.servings <= 0) {
      alert('Number of servings must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare preferred items
      const preferredItems = form.selectedItems.length > 0
        ? inventory.filter(item => form.selectedItems.includes(item.id))
        : null;
      
      // Prepare equipment if included
      const selectedEquipment = form.includeEquipment && form.selectedEquipment.length > 0
        ? equipment.filter(eq => form.selectedEquipment.includes(eq.id))
        : null;

      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          servings: form.servings,
          preferredItems,
          specialRequests: form.specialRequests,
          includeEquipment: form.includeEquipment,
          equipment: selectedEquipment
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate recipe');
      }

      const recipe = await response.json();
      setRecipes([...recipes, recipe]);
      setShowForm(false);
      setForm({
        servings: 2,
        selectedItems: [],
        specialRequests: '',
        includeEquipment: false,
        selectedEquipment: [],
        showEquipmentSelection: false
      });
      
    } catch (error) {
      console.error('Error generating recipe:', error);
      alert(error instanceof Error ? error.message : 'Error generating recipe');
      setLoading(false);
    }
  };

  const handleCookRecipe = async (recipeId: number) => {
    if (!window.confirm('Are you sure you want to cook this recipe? This will update your inventory.')) {
      return;
    }

    try {
      setCookingId(recipeId);
      const response = await fetch('/api/cook-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipeId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Remove from both recipes and savedRecipes
      setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
      setSavedRecipes(savedRecipes.filter(recipe => recipe.id !== recipeId));
      alert('Recipe cooked! Inventory has been updated.');
    } catch (error) {
      console.error('Error cooking recipe:', error);
      alert(error instanceof Error ? error.message : 'Failed to cook recipe');
    } finally {
      setCookingId(null);
    }
  };

  const handleSaveRecipe = (recipe: RecipeWithIngredients) => {
    setSavedRecipes([...savedRecipes, recipe]);
    setRecipes(recipes.filter(r => r.id !== recipe.id));
  };

  const handleDiscardRecipe = (recipeId: number) => {
    if (window.confirm('Are you sure you want to discard this recipe?')) {
      setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
    }
  };

  const handleDeleteSavedRecipe = (recipeId: number) => {
    if (window.confirm('Are you sure you want to delete this saved recipe?')) {
      setSavedRecipes(savedRecipes.filter(recipe => recipe.id !== recipeId));
    }
  };

  const RecipeCard = ({ recipe, isSaved }: { recipe: RecipeWithIngredients; isSaved: boolean }) => (
    <div className="bg-slate-50 p-6 rounded-lg shadow-sm hover:shadow transition-shadow border border-slate-200">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-slate-800">{recipe.name}</h3>
        <div className="flex space-x-2">
          {!isSaved ? (
            <>
              <button
                onClick={() => handleSaveRecipe(recipe)}
                className="p-1 text-slate-600 hover:text-indigo-600 rounded-full hover:bg-slate-100"
                title="Save recipe"
              >
                <BookmarkIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDiscardRecipe(recipe.id)}
                className="p-1 text-slate-600 hover:text-red-600 rounded-full hover:bg-slate-100"
                title="Discard recipe"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => handleDeleteSavedRecipe(recipe.id)}
              className="p-1 text-slate-600 hover:text-red-600 rounded-full hover:bg-slate-100"
              title="Delete saved recipe"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      <p className="text-slate-600 mb-4">{recipe.description}</p>
      <div className="space-y-2">
        <p className="text-sm text-slate-600">
          Cooking Time: {recipe.cookingTime} minutes
        </p>
        <p className="text-sm text-slate-600">
          Servings: {recipe.servings}
        </p>
        <div className="mt-4 p-4 bg-slate-100 rounded-lg">
          <h4 className="font-medium mb-2 text-slate-800">Ingredients:</h4>
          <ul className="text-sm text-slate-600 space-y-1 mb-4">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex justify-between">
                <span>{ingredient.item.name}</span>
                <span className="font-medium">
                  {ingredient.quantity} {ingredient.unit}
                </span>
              </li>
            ))}
          </ul>

          {recipe.equipment && recipe.equipment.length > 0 && (
            <>
              <h4 className="font-medium mb-2 text-slate-800">Required Equipment:</h4>
              <ul className="text-sm text-slate-600 space-y-1 mb-4">
                {recipe.equipment.map((eq, index) => (
                  <li key={index}>{eq.item.name}</li>
                ))}
              </ul>
            </>
          )}

          <h4 className="font-medium mb-2 text-slate-800">Instructions:</h4>
          <p className="text-sm text-slate-600 whitespace-pre-line">
            {recipe.instructions}
          </p>
        </div>
        <button
          className="w-full mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          onClick={() => handleCookRecipe(recipe.id)}
          disabled={cookingId === recipe.id}
        >
          {cookingId === recipe.id ? 'Cooking...' : 'Cook This Recipe'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800">Available Recipes</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
        >
          {loading ? 'Generating...' : 'Generate Recipe'}
          {!loading && (showForm ? 
            <ChevronUpIcon className="w-5 h-5 ml-1" /> : 
            <ChevronDownIcon className="w-5 h-5 ml-1" />
          )}
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-4">
          <div>
            <label htmlFor="servings" className="block text-sm font-medium text-slate-700">
              How many people are you cooking for? *
            </label>
            <input
              type="number"
              id="servings"
              min="1"
              value={form.servings}
              onChange={(e) => setForm(prev => ({ ...prev, servings: parseInt(e.target.value) || 0 }))}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Select ingredients you'd like to use (optional)
            </label>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {inventory.map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    setForm(prev => ({
                      ...prev,
                      selectedItems: prev.selectedItems.includes(item.id)
                        ? prev.selectedItems.filter(id => id !== item.id)
                        : [...prev.selectedItems, item.id]
                    }));
                  }}
                  className={`p-2 border ${
                    form.selectedItems.includes(item.id)
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-indigo-300'
                  } rounded-md cursor-pointer`}
                >
                  <div className="font-medium text-slate-800">{item.name}</div>
                  <div className="text-sm text-slate-600">
                    {item.quantity} {item.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeEquipment"
                checked={form.includeEquipment}
                onChange={toggleEquipmentInclusion}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="includeEquipment" className="text-sm font-medium text-slate-700 flex items-center">
                Include cooking equipment instructions
                {form.includeEquipment && (
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      toggleEquipmentSelection();
                    }}
                    className="ml-2 text-indigo-600 hover:text-indigo-800 text-sm underline"
                  >
                    {form.showEquipmentSelection ? "Hide equipment selection" : "Customize equipment"}
                  </button>
                )}
              </label>
            </div>
            
            {form.includeEquipment && form.showEquipmentSelection && (
              <div className="pl-6 mt-2 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-slate-700">
                    Select equipment to use
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setForm(prev => ({ 
                          ...prev, 
                          selectedEquipment: equipment.map(eq => eq.id)
                        }));
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      Select All
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setForm(prev => ({ ...prev, selectedEquipment: [] }));
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded">
                  {equipment.map(item => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setForm(prev => ({
                          ...prev,
                          selectedEquipment: prev.selectedEquipment.includes(item.id)
                            ? prev.selectedEquipment.filter(id => id !== item.id)
                            : [...prev.selectedEquipment, item.id]
                        }));
                      }}
                      className={`p-2 border ${
                        form.selectedEquipment.includes(item.id)
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 hover:border-indigo-300'
                      } rounded-md cursor-pointer`}
                    >
                      <div className="font-medium text-slate-800">{item.name}</div>
                    </div>
                  ))}
                </div>
                {equipment.length === 0 && (
                  <p className="text-sm text-slate-500">
                    No equipment found. Add equipment in the Equipment tab.
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="specialRequests" className="block text-sm font-medium text-slate-700">
              Special requests (optional)
            </label>
            <textarea
              id="specialRequests"
              value={form.specialRequests}
              onChange={(e) => setForm(prev => ({ ...prev, specialRequests: e.target.value }))}
              placeholder="E.g., vegetarian, low-carb, quick meal, etc."
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={generateRecipe}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Recipe'}
            </button>
          </div>
        </div>
      )}

      {recipes.length === 0 && savedRecipes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-600">
            No recipes generated yet. Click the button above to generate a recipe based on your inventory!
          </p>
        </div>
      ) : (
        <>
          {recipes.length > 0 && (
            <>
              <h3 className="text-lg font-medium text-slate-800 mt-6 mb-4">New Recipes</h3>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {recipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} isSaved={false} />
                ))}
              </div>
            </>
          )}

          {savedRecipes.length > 0 && (
            <>
              <h3 className="text-lg font-medium text-slate-800 mt-6 mb-4">Saved Recipes</h3>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {savedRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} isSaved={true} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
} 