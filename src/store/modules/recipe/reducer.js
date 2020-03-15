import produce from 'immer';

const INITIAL_STATE = {
  count: 0,
  recipes: {},
  recipeIds: [],
  loading: false,
  editing: {
    item: null,
    baseItems: [],
  },
  refresh: false,
};

export default function user(state = INITIAL_STATE, action) {
  return produce(state, draft => {
    switch (action.type) {
      case '@recipe/LOAD_RECIPES_REQUEST': {
        draft.loading = true;
        break;
      }
      case '@recipe/LOAD_RECIPES_SUCCESS': {
        draft.recipes = action.payload.recipes;
        draft.count = action.payload.count;
        draft.recipeIds = action.payload.recipeIds;
        draft.editing = { item: null, baseItems: [] };
        draft.loading = false;
        draft.refresh = false;
        break;
      }
      case '@recipe/LOAD_SINGLE_RECIPE_REQUEST': {
        draft.loading = true;
        break;
      }
      case '@recipe/LOAD_SINGLE_RECIPE_SUCCESS': {
        draft.editing = action.payload.recipe;
        draft.loading = false;
        break;
      }
      case '@recipe/STORE_RECIPE_REQUEST': {
        draft.loading = true;
        break;
      }
      case '@recipe/STORE_RECIPE_SUCCESS': {
        const recipes = {
          ...draft.recipes,
          [action.payload.recipe.id]: action.payload.recipe,
        };

        draft.recipes = recipes;
        draft.recipeIds = action.payload.sortedIds;
        draft.count += 1;
        draft.loading = false;
        break;
      }
      case '@recipe/DELETE_RECIPE_REQUEST': {
        draft.loading = true;

        break;
      }
      case '@recipe/DELETE_RECIPE_SUCCESS': {
        delete draft.recipes[action.payload.id];
        draft.recipeIds = action.payload.newIds;
        draft.count -= 1;
        draft.loading = false;
        break;
      }
      case '@recipe/EDIT_RECIPE_ITEM': {
        draft.editing.item = action.payload.item;
        break;
      }
      case '@recipe/EDIT_RECIPE_BASE_ITEMS': {
        draft.editing.baseItems = action.payload.baseItems;
        break;
      }
      case '@recipe/UPDATE_RECIPE_REQUEST': {
        draft.loading = true;
        break;
      }
      case '@recipe/UPDATE_RECIPE_SUCCESS': {
        const { id, uniqueProgress } = draft.editing.item;

        // Update this recipe's unique leaves' progress
        draft.recipes[id].uniqueProgress = uniqueProgress;

        draft.loading = false;
        draft.refresh = true;
        break;
      }
      case '@recipe/CLEAR_RECIPES_REQUEST': {
        draft.loading = true;
        break;
      }
      case '@recipe/CLEAR_RECIPES_SUCCESS': {
        draft.count = 0;
        draft.recipes = {};
        draft.recipeIds = [];
        draft.loading = false;
        break;
      }
      case '@recipe/RESET_RECIPE_PROGRESS_REQUEST': {
        draft.loading = true;
        break;
      }
      case '@recipe/RESET_RECIPE_PROGRESS_SUCCESS': {
        // Reset this recipe's unique leaves' progress
        draft.recipes[action.payload.id].uniqueProgress = 0;

        draft.loading = false;
        break;
      }
      default:
    }
  });
}
