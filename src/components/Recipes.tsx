'use client';

import { useState } from 'react';
import { Recipe } from '@prisma/client';

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [cookingId, setCookingId] = useState<number | null>(null);

  const generateRecipe = async () => {
    try {
      setLoading(true);
      // TODO: Implement recipe generation based on current inventory
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
      });
      
      const recipe = await response.json();
      if (!response.ok) throw new Error(recipe.error);
      
      setRecipes([...recipes, recipe]);
    } catch (error) {
      console.error('Error generating recipe:', error);
      alert('Failed to generate recipe');
    } finally {
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

      // Remove the cooked recipe from the list
      setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
      alert('Recipe cooked! Inventory has been updated.');
    } catch (error) {
      console.error('Error cooking recipe:', error);
      alert(error instanceof Error ? error.message : 'Failed to cook recipe');
    } finally {
      setCookingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Available Recipes</h2>
        <button
          onClick={generateRecipe}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Recipe'}
        </button>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No recipes generated yet. Click the button above to generate a recipe based on your inventory!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold mb-2">{recipe.name}</h3>
              <p className="text-gray-600 mb-4">{recipe.description}</p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Cooking Time: {recipe.cookingTime} minutes
                </p>
                <p className="text-sm text-gray-500">
                  Servings: {recipe.servings}
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Instructions:</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {recipe.instructions}
                  </p>
                </div>
                <button
                  className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  onClick={() => handleCookRecipe(recipe.id)}
                  disabled={cookingId === recipe.id}
                >
                  {cookingId === recipe.id ? 'Cooking...' : 'Cook This Recipe'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 