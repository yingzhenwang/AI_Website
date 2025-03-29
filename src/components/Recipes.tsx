'use client';

import { useState, useEffect } from 'react';
import { Recipe, Item } from '@prisma/client';
import { ChevronUpIcon, ChevronDownIcon, XMarkIcon, BookmarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface RecipeGenerationForm {
  servings: number;
  selectedItems: number[];
  specialRequests: string;
  includeEquipment: boolean;
  selectedEquipment: number[];
  showEquipmentSelection: boolean;
  numberOfRecipes: number;
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
  saved: boolean;
}

export default function Recipes() {
  const [recipes, setRecipes] = useState<RecipeWithIngredients[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<RecipeWithIngredients[]>([]);
  const [availableRecipes, setAvailableRecipes] = useState<{ id: number; name: string; servings: number; cookingTime: number }[]>([]);
  const [selectedAvailableRecipe, setSelectedAvailableRecipe] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [cookingId, setCookingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'saved'>('new');
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [form, setForm] = useState<RecipeGenerationForm>({
    servings: 2,
    selectedItems: [],
    specialRequests: '',
    includeEquipment: false,
    selectedEquipment: [],
    showEquipmentSelection: false,
    numberOfRecipes: 2  // Default to 2 recipes
  });
  const [inventory, setInventory] = useState<Item[]>([]);
  const [equipment, setEquipment] = useState<Item[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showIngredientSelection, setShowIngredientSelection] = useState(false);

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

  // Function to refresh available recipes
  const refreshAvailableRecipes = async () => {
    try {
      const response = await fetch('/api/recipes/available');
      if (response.ok) {
        const data = await response.json();
        setAvailableRecipes(data);
        
        // If the currently selected recipe is no longer available, deselect it
        if (selectedAvailableRecipe !== null && !data.some((r: { id: number }) => r.id === selectedAvailableRecipe)) {
          setSelectedAvailableRecipe(null);
        }
      }
    } catch (error) {
      console.error('Error refreshing available recipes:', error);
    }
  };

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
        
        // Fetch saved recipes
        const savedRecipesResponse = await fetch('/api/recipes?saved=true');
        if (savedRecipesResponse.ok) {
          const savedRecipesData = await savedRecipesResponse.json();
          setSavedRecipes(savedRecipesData);
        }
        
        // Fetch available recipes (saved recipes that can be cooked with current ingredients)
        refreshAvailableRecipes();
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleIngredientSelection = () => {
    setShowIngredientSelection(!showIngredientSelection);
  };

  const toggleIngredient = (itemId: number) => {
    setForm(prev => {
      if (prev.selectedItems.includes(itemId)) {
        return {
          ...prev,
          selectedItems: prev.selectedItems.filter(id => id !== itemId)
        };
      } else {
        return {
          ...prev,
          selectedItems: [...prev.selectedItems, itemId]
        };
      }
    });
  };

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

  const generateRecipes = async () => {
    if (form.servings <= 0) {
      alert('Number of servings must be greater than 0');
      return;
    }

    if (form.numberOfRecipes <= 0 || form.numberOfRecipes > 5) {
      alert('Number of recipes must be between 1 and 5');
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationProgress(0);
      
      // Prepare preferred items
      const preferredItems = form.selectedItems.length > 0
        ? inventory.filter(item => form.selectedItems.includes(item.id))
        : null;
      
      // Prepare equipment if included
      const selectedEquipment = form.includeEquipment && form.selectedEquipment.length > 0
        ? equipment.filter(eq => form.selectedEquipment.includes(eq.id))
        : null;

      // Make a single API call to generate multiple recipes
      const response = await fetch('/api/generate-recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          servings: form.servings,
          preferredItems,
          specialRequests: form.specialRequests,
          includeEquipment: form.includeEquipment,
          equipment: selectedEquipment,
          numberOfRecipes: form.numberOfRecipes
        }),
      });

      setGenerationProgress(50); // Show progress after API call is made

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate recipes');
      }
      
      const newRecipes = await response.json();
      setGenerationProgress(100); // Complete the progress

      if (Array.isArray(newRecipes) && newRecipes.length > 0) {
        setRecipes([...recipes, ...newRecipes]);
        setShowForm(false);
        setForm({
          servings: 2,
          selectedItems: [],
          specialRequests: '',
          includeEquipment: false,
          selectedEquipment: [],
          showEquipmentSelection: false,
          numberOfRecipes: 2
        });
      } else {
        throw new Error('No recipes were generated');
      }
      
    } catch (error) {
      console.error('Error generating recipes:', error);
      alert(error instanceof Error ? error.message : 'Error generating recipes');
    } finally {
      setIsGenerating(false);
      setLoading(false);
    }
  };

  const handleCookRecipe = async (recipeId: number) => {
    if (!window.confirm('Are you sure you want to cook this recipe? This will update your inventory.')) {
      return;
    }

    try {
      setCookingId(recipeId);
      
      // First, ensure the recipe is saved
      const recipeToSave = recipes.find(r => r.id === recipeId);
      if (recipeToSave && !recipeToSave.saved) {
        try {
          // Call API to mark the recipe as saved
          await fetch(`/api/recipes/${recipeId}/save`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          // Update local state for saved recipes (will be removed in next step)
          setSavedRecipes([...savedRecipes, {...recipeToSave, saved: true}]);
        } catch (error) {
          console.error('Error auto-saving recipe before cooking:', error);
          // Continue with cooking even if saving fails
        }
      }
      
      // Now cook the recipe
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
      
      // Refresh inventory
      const invResponse = await fetch('/api/items?excludeCategory=Cooking Equipment');
      const invData = await invResponse.json();
      setInventory(invData);
      
      // Refresh available recipes
      refreshAvailableRecipes();
      
      alert('Recipe cooked! Inventory has been updated.');
    } catch (error) {
      console.error('Error cooking recipe:', error);
      alert(error instanceof Error ? error.message : 'Failed to cook recipe');
    } finally {
      setCookingId(null);
    }
  };

  const handleSaveRecipe = async (recipe: RecipeWithIngredients) => {
    try {
      // Call API to mark the recipe as saved
      const response = await fetch(`/api/recipes/${recipe.id}/save`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save recipe');
      }
      
      // Update local state
      const updatedRecipe = { ...recipe, saved: true };
      setSavedRecipes([...savedRecipes, updatedRecipe]);
      setRecipes(recipes.filter(r => r.id !== recipe.id));
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert(error instanceof Error ? error.message : 'Failed to save recipe');
    }
  };

  const handleDiscardRecipe = (recipeId: number) => {
    if (window.confirm('Are you sure you want to discard this recipe?')) {
      setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
      
      // Call API to delete the recipe
      fetch(`/api/recipes/${recipeId}`, {
        method: 'DELETE',
      }).catch(error => {
        console.error('Error deleting recipe:', error);
      });
    }
  };

  const handleDeleteSavedRecipe = async (recipeId: number) => {
    if (window.confirm('Are you sure you want to delete this saved recipe?')) {
      try {
        // Call API to delete the recipe and unmark as saved
        const response = await fetch(`/api/recipes/${recipeId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete recipe');
        }
        
        // Update local state
        setSavedRecipes(savedRecipes.filter(recipe => recipe.id !== recipeId));
      } catch (error) {
        console.error('Error deleting saved recipe:', error);
        alert(error instanceof Error ? error.message : 'Failed to delete saved recipe');
      }
    }
  };

  const RecipeCard = ({ recipe, isSaved }: { recipe: RecipeWithIngredients; isSaved: boolean }) => (
    <div className="card overflow-hidden">
      <div className="p-5 pb-3">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-neutral-800">{recipe.name}</h3>
          <div className="flex space-x-1">
            {!isSaved ? (
              <>
                <button
                  onClick={() => handleSaveRecipe(recipe)}
                  className="p-1.5 text-neutral-500 hover:text-primary-600 rounded-md hover:bg-neutral-50"
                  title="Save recipe"
                >
                  <BookmarkIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDiscardRecipe(recipe.id)}
                  className="p-1.5 text-neutral-500 hover:text-error-600 rounded-md hover:bg-neutral-50"
                  title="Discard recipe"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => handleDeleteSavedRecipe(recipe.id)}
                className="p-1.5 text-neutral-500 hover:text-error-600 rounded-md hover:bg-neutral-50"
                title="Delete saved recipe"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        
        <div className="text-sm text-neutral-600 mb-4">
          <p>{recipe.description}</p>
          <div className="mt-2 flex gap-3">
            <span className="badge badge-primary">Serves: {recipe.servings}</span>
            <span className="badge badge-secondary">Time: {recipe.cookingTime} mins</span>
          </div>
        </div>
        
        <div className="space-y-5 mb-5">
          <div>
            <h4 className="font-medium text-sm text-neutral-700 uppercase tracking-wide mb-2">Ingredients</h4>
            <ul className="space-y-1.5 text-sm">
              {recipe.ingredients.map((ingredient, idx) => (
                <li key={idx} className="flex items-baseline gap-2">
                  <span className="text-primary-600 text-xs">•</span>
                  <span className="text-neutral-800">
                    {ingredient.quantity} {ingredient.unit} {ingredient.item.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          
          {recipe.equipment && recipe.equipment.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-neutral-700 uppercase tracking-wide mb-2">Equipment</h4>
              <ul className="space-y-1.5 text-sm">
                {recipe.equipment.map((eq, idx) => (
                  <li key={idx} className="flex items-baseline gap-2">
                    <span className="text-secondary-600 text-xs">•</span>
                    <span className="text-neutral-800">{eq.item.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div>
            <h4 className="font-medium text-sm text-neutral-700 uppercase tracking-wide mb-2">Instructions</h4>
            <div className="text-sm text-neutral-700 whitespace-pre-line">
              {recipe.instructions}
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-neutral-200 px-5 py-3 bg-neutral-50">
        <button
          onClick={() => handleCookRecipe(recipe.id)}
          disabled={cookingId === recipe.id}
          className="w-full btn btn-primary py-2 px-4 flex items-center justify-center gap-2"
        >
          {cookingId === recipe.id ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Cooking...</span>
            </>
          ) : (
            <>
              <span>Cook Recipe</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Replace the ingredient selection grid with toggle buttons
  const renderIngredientSelection = () => (
    <div className="bg-slate-50 p-3 rounded-md border border-slate-200 mb-2">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {inventory.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => toggleIngredient(item.id)}
            className={`p-2 text-left text-sm rounded-md flex justify-between items-center transition-colors ${
              form.selectedItems.includes(item.id)
                ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
            }`}
            title={`${item.name} (${item.quantity} ${item.unit})`}
          >
            <span className="truncate mr-2">{item.name}</span>
            <span className="text-xs whitespace-nowrap">
              {item.quantity} {item.unit}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  // Get the selected available recipe details
  const getSelectedRecipeDetails = () => {
    if (selectedAvailableRecipe === null) return null;
    return savedRecipes.find(recipe => recipe.id === selectedAvailableRecipe);
  };

  // Handle clicking on a recipe tag
  const handleRecipeTagClick = (recipeId: number) => {
    setSelectedAvailableRecipe(recipeId === selectedAvailableRecipe ? null : recipeId);
    setActiveTab('saved');
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-900">Recipes</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) setActiveTab('new');
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : 'Generate New Recipe'}
        </button>
      </div>
      
      {/* Display available recipe tags if any, or an empty state */}
      {!showForm && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <h3 className="text-lg font-semibold text-primary-700">Ready to Cook</h3>
              <span className="ml-2 text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                Recipes you can make with your current ingredients
              </span>
            </div>
            <button 
              onClick={refreshAvailableRecipes} 
              className="p-1.5 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-full transition-colors"
              title="Refresh available recipes"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
          </div>
          
          {availableRecipes.length > 0 ? (
            <div className="flex flex-wrap gap-2 animate-fade-in">
              {availableRecipes.map(recipe => (
                <button 
                  key={recipe.id}
                  onClick={() => handleRecipeTagClick(recipe.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedAvailableRecipe === recipe.id
                      ? 'bg-primary-600 text-white shadow-sm' 
                      : 'bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100'
                  }`}
                >
                  {recipe.name} 
                  <span className="ml-1 opacity-75">({recipe.cookingTime} min)</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-neutral-50 py-4 px-5 rounded-xl border border-neutral-200 text-neutral-600 text-sm">
              <p className="mb-1 font-medium">No recipes available to cook right now</p>
              <p>
                {savedRecipes.length > 0 ? (
                  <span>Try adding more ingredients to your inventory to unlock recipes.</span>
                ) : (
                  <span>Save some recipes first, then add ingredients to your inventory.</span>
                )}
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Show the selected recipe if one is selected */}
      {selectedAvailableRecipe !== null && !showForm && (
        <div className="mb-8 bg-primary-50 p-6 rounded-xl border border-primary-200 animate-fade-in">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-primary-800">Selected Recipe</h3>
            <button 
              onClick={() => setSelectedAvailableRecipe(null)}
              className="p-1.5 text-primary-600 hover:text-primary-800 hover:bg-primary-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          {getSelectedRecipeDetails() && (
            <div className="mt-3">
              <RecipeCard 
                recipe={getSelectedRecipeDetails()!} 
                isSaved={true} 
              />
            </div>
          )}
        </div>
      )}
      
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Generate Recipe</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Number of Servings
              </label>
              <input
                type="number"
                min="1"
                value={form.servings}
                onChange={(e) => setForm({ ...form, servings: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Number of Recipes to Generate (1-5)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={form.numberOfRecipes}
                onChange={(e) => setForm({ ...form, numberOfRecipes: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Preferred Ingredients (Optional)
                </label>
                <button
                  type="button"
                  onClick={toggleIngredientSelection}
                  className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                >
                  {showIngredientSelection ? (
                    <>
                      <ChevronUpIcon className="h-4 w-4 mr-1" />
                      Hide ingredients
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon className="h-4 w-4 mr-1" />
                      Select ingredients
                    </>
                  )}
                </button>
              </div>
              
              {/* Selected ingredients display */}
              {form.selectedItems.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {inventory
                    .filter(item => form.selectedItems.includes(item.id))
                    .map(item => (
                      <span 
                        key={item.id}
                        className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs flex items-center"
                      >
                        {item.name}
                        <button 
                          onClick={() => toggleIngredient(item.id)}
                          className="ml-1 text-indigo-600 hover:text-indigo-800"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  }
                </div>
              )}
              
              {/* Ingredient selection toggle buttons */}
              {showIngredientSelection && renderIngredientSelection()}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Special Requests (Optional)
              </label>
              <textarea
                value={form.specialRequests}
                onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="E.g., quick meal, vegetarian, low-carb..."
                rows={2}
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeEquipment"
                checked={form.includeEquipment}
                onChange={toggleEquipmentInclusion}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
              />
              <label htmlFor="includeEquipment" className="ml-2 block text-sm text-slate-700">
                Include equipment instructions
              </label>
              {form.includeEquipment && (
                <button
                  type="button"
                  onClick={toggleEquipmentSelection}
                  className="ml-2 text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                >
                  {form.showEquipmentSelection ? (
                    <>
                      <ChevronUpIcon className="h-4 w-4 mr-1" />
                      Hide equipment
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon className="h-4 w-4 mr-1" />
                      Select equipment
                    </>
                  )}
                </button>
              )}
            </div>
            
            {form.includeEquipment && form.showEquipmentSelection && (
              <div className="pl-6">
                <div className="text-sm font-medium text-slate-700 mb-1">
                  Available Equipment
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {equipment.map(item => (
                    <div key={item.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`equipment-${item.id}`}
                        checked={form.selectedEquipment.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm({
                              ...form,
                              selectedEquipment: [...form.selectedEquipment, item.id]
                            });
                          } else {
                            setForm({
                              ...form,
                              selectedEquipment: form.selectedEquipment.filter(id => id !== item.id)
                            });
                          }
                        }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                      />
                      <label htmlFor={`equipment-${item.id}`} className="ml-2 block text-sm text-slate-700">
                        {item.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <button
              onClick={generateRecipes}
              disabled={loading || isGenerating}
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating 
                ? `Generating... ${generationProgress}%` 
                : loading 
                  ? 'Loading...' 
                  : `Generate ${form.numberOfRecipes} Recipe${form.numberOfRecipes > 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}
      
      {/* Tabs for new and saved recipes */}
      <div className="mb-6">
        <div className="border-b border-slate-200">
          <div className="-mb-px flex">
            <button
              className={`px-4 py-2 border-b-2 font-medium text-sm ${
                activeTab === 'new' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
              onClick={() => {
                setActiveTab('new');
                setShowForm(false);
                setSelectedAvailableRecipe(null);
              }}
            >
              {recipes.length > 0 ? `New Recipes (${recipes.length})` : 'New Recipes'}
            </button>
            <button
              className={`px-4 py-2 border-b-2 font-medium text-sm ${
                activeTab === 'saved' 
                  ? 'ml-8 border-indigo-600 text-indigo-600'
                  : 'ml-8 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
              onClick={() => {
                if (savedRecipes.length > 0) {
                  setActiveTab('saved');
                  setShowForm(false);
                }
              }}
              disabled={savedRecipes.length === 0}
            >
              {savedRecipes.length > 0 
                ? `Saved Recipes (${savedRecipes.length})` 
                : 'No Saved Recipes'}
            </button>
          </div>
        </div>
      </div>
      
      {loading && !isGenerating ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading recipes...</p>
        </div>
      ) : (
        <>
          {recipes.length === 0 && savedRecipes.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-600">No recipes yet. Generate your first recipe!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {!showForm && activeTab === 'new' && recipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} isSaved={false} />
              ))}
              
              {!showForm && activeTab === 'saved' && savedRecipes.length > 0 && (
                savedRecipes.map(recipe => (
                  <RecipeCard key={recipe.id} recipe={recipe} isSaved={true} />
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
} 