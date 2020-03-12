export function loadRecipesRequest() {
  return {
    type: '@recipe/LOAD_RECIPES_REQUEST',
  };
}

export function loadRecipesSuccess(count, recipes, recipeIds) {
  return {
    type: '@recipe/LOAD_RECIPES_SUCCESS',
    payload: { count, recipes, recipeIds },
  };
}

export function loadRecipesFailure() {
  return {
    type: '@recipe/LOAD_RECIPES_FAILURE',
  };
}

export function storeRecipeRequest(id) {
  return {
    type: '@recipe/STORE_RECIPE_REQUEST',
    payload: { id },
  };
}

export function storeRecipeSuccess(recipe) {
  return {
    type: '@recipe/STORE_RECIPE_SUCCESS',
    payload: { recipe },
  };
}

export function storeRecipeFailure() {
  return {
    type: '@recipe/STORE_RECIPE_FAILURE',
  };
}

export function deleteRecipeRequest(id) {
  return {
    type: '@recipe/DELETE_RECIPE_REQUEST',
    payload: { id },
  };
}

export function deleteRecipeSuccess(id) {
  return {
    type: '@recipe/DELETE_RECIPE_SUCCESS',
    payload: { id },
  };
}

export function deleteRecipeFailure() {
  return {
    type: '@recipe/DELETE_RECIPE_FAILURE',
  };
}

export function loadSingleRecipeRequest(id) {
  return {
    type: '@recipe/LOAD_SINGLE_RECIPE_REQUEST',
    payload: { id },
  };
}

export function loadSingleRecipeSuccess(recipe) {
  return {
    type: '@recipe/LOAD_SINGLE_RECIPE_SUCCESS',
    payload: { recipe },
  };
}

export function loadSingleRecipeFailure() {
  return {
    type: '@recipe/LOAD_SINGLE_RECIPE_FAILURE',
  };
}

export function editRecipeItem(item) {
  return {
    type: '@recipe/EDIT_RECIPE_ITEM',
    payload: { item },
  };
}

export function editRecipeBaseItems(baseItems) {
  return {
    type: '@recipe/EDIT_RECIPE_BASE_ITEMS',
    payload: { baseItems },
  };
}

export function updateRecipeRequest() {
  return {
    type: '@recipe/UPDATE_RECIPE_REQUEST',
  };
}

export function updateRecipeSuccess() {
  return {
    type: '@recipe/UPDATE_RECIPE_SUCCESS',
  };
}

export function updateRecipeFailure() {
  return {
    type: '@recipe/UPDATE_RECIPE_FAILURE',
  };
}

export function clearRecipesRequest() {
  return {
    type: '@recipe/CLEAR_RECIPES_REQUEST',
  };
}

export function clearRecipesSuccess() {
  return {
    type: '@recipe/CLEAR_RECIPES_SUCCESS',
  };
}

export function clearRecipesFailure() {
  return {
    type: '@recipe/CLEAR_RECIPES_FAILURE',
  };
}

export function resetRecipeProgressRequest(id) {
  return {
    type: '@recipe/RESET_RECIPE_PROGRESS_REQUEST',
    payload: { id },
  };
}

export function resetRecipeProgressSuccess(id) {
  return {
    type: '@recipe/RESET_RECIPE_PROGRESS_SUCCESS',
    payload: { id },
  };
}

export function resetRecipeProgressFailure() {
  return {
    type: '@recipe/RESET_RECIPE_PROGRESS_FAILURE',
  };
}
