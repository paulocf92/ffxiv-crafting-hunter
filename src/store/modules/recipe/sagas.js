import { call, select, put, all, takeLatest } from 'redux-saga/effects';
import { Alert } from 'react-native';

import RecipeColumns from '~/config/RecipeQueryColumns';
import { traverseRecipeTree, resetRecipeProgress } from '~/utils/recipeTree';

import api from '~/services/api';
import storage from '~/services/storage';

import {
  loadRecipesSuccess,
  loadRecipesFailure,
  storeRecipeSuccess,
  storeRecipeFailure,
  deleteRecipeSuccess,
  deleteRecipeFailure,
  updateRecipeSuccess,
  updateRecipeFailure,
  clearRecipesSuccess,
  clearRecipesFailure,
  resetRecipeProgressSuccess,
  resetRecipeProgressFailure,
} from './actions';

function* loadRecipes() {
  try {
    const recipeIds = yield call(storage.getItem, '@craftinghunter_recipes');
    const count = recipeIds.length;

    let recipes = [];

    if (count) {
      const recipeKeys = recipeIds.map(id => `@craftinghunter_recipe_${id}`);

      recipes = (yield call(storage.multiGet, recipeKeys)).map(recipe => {
        const { item } = JSON.parse(recipe[1]);
        const { id, name, icon, uniqueProgress, uniqueLeaves } = item;

        return {
          id,
          name,
          icon,
          uniqueProgress,
          uniqueLeaves,
        };
      });
    } else {
      yield call(storage.setItem, '@craftinghunter_recipes', []);
    }

    yield put(loadRecipesSuccess(count, recipes, recipeIds));
  } catch (err) {
    yield put(loadRecipesFailure());
  }
}

function* storeRecipe({ payload }) {
  try {
    const { id } = payload;

    const response = yield call(api.get, `/recipe/${id}`, {
      params: {
        columns: RecipeColumns,
      },
    });

    if (response.data) {
      const [item, baseItems] = yield call(traverseRecipeTree, response.data);

      // Store new recipe
      yield call(storage.setItem, `@craftinghunter_recipe_${id}`, {
        item,
        baseItems,
      });

      // Sort recipes (old + new) by name, then retrieve only their ids
      // This keeps ids sorted by recipe names before saving them
      const recipes = yield select(state => state.recipe.recipes);
      const sortedIds = [...recipes, item]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(recipe => recipe.id);

      yield call(storage.setItem, '@craftinghunter_recipes', sortedIds);

      // Only get properties relevant to main hunt list
      const { name, icon, uniqueProgress, uniqueLeaves } = item;

      yield put(
        storeRecipeSuccess({
          id,
          name,
          icon,
          uniqueProgress,
          uniqueLeaves,
        }),
      );
    }
  } catch (err) {
    Alert.alert('Error', 'Error retrieving data from remote server!');
    yield put(storeRecipeFailure());
  }
}

function* deleteRecipe({ payload }) {
  try {
    const { id } = payload;

    const ids = yield call(storage.getItem, '@craftinghunter_recipes');
    const newIds = ids.filter(recipeId => recipeId !== id);

    yield call(storage.setItem, '@craftinghunter_recipes', newIds);

    yield call(storage.removeItem, `@craftinghunter_recipe_${id}`);

    yield put(deleteRecipeSuccess(id));
  } catch (err) {
    yield put(deleteRecipeFailure());
  }
}

function* updateRecipe() {
  try {
    const editingRecipe = yield select(state => state.recipe.editing);
    const { id } = editingRecipe.item;

    yield call(storage.setItem, `@craftinghunter_recipe_${id}`, editingRecipe);

    yield put(updateRecipeSuccess());
  } catch (err) {
    yield put(updateRecipeFailure());
  }
}

function* clearRecipes() {
  try {
    const ids = yield call(storage.getItem, '@craftinghunter_recipes');

    yield all(
      ids.map(id => call(storage.removeItem, `@craftinghunter_recipe_${id}`)),
    );
    yield call(storage.setItem, '@craftinghunter_recipes', []);

    yield put(clearRecipesSuccess());
  } catch (err) {
    yield put(clearRecipesFailure());
  }
}

function* resetProgress({ payload }) {
  try {
    const { id } = payload;
    const { item, baseItems } = yield call(
      storage.getItem,
      `@craftinghunter_recipe_${id}`,
    );

    const resetItem = resetRecipeProgress(item, baseItems);
    yield call(storage.setItem, `@craftinghunter_recipe_${id}`, resetItem);

    yield put(resetRecipeProgressSuccess(id));
  } catch (err) {
    yield put(resetRecipeProgressFailure());
  }
}

export default all([
  takeLatest('@recipe/LOAD_RECIPES_REQUEST', loadRecipes),
  takeLatest('@recipe/STORE_RECIPE_REQUEST', storeRecipe),
  takeLatest('@recipe/DELETE_RECIPE_REQUEST', deleteRecipe),
  takeLatest('@recipe/UPDATE_RECIPE_REQUEST', updateRecipe),
  takeLatest('@recipe/CLEAR_RECIPES_REQUEST', clearRecipes),
  takeLatest('@recipe/RESET_RECIPE_PROGRESS_REQUEST', resetProgress),
]);