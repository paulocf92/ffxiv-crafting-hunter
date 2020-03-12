import produce from 'immer';

const INITIAL_STATE = {
  count: 0,
  recipes: [],
  loading: false,
  editing: {
    item: null,
    baseItems: [],
  },
  refresh: true,
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
        const recipes = [...draft.recipes, action.payload.recipe].sort((a, b) =>
          a.name.localeCompare(b.name),
        );

        draft.recipes = recipes;
        draft.count += 1;
        draft.loading = false;
        break;
      }
      case '@recipe/DELETE_RECIPE_REQUEST': {
        draft.loading = true;

        break;
      }
      case '@recipe/DELETE_RECIPE_SUCCESS': {
        const idx = draft.recipes.findIndex(
          recipe => recipe.id === action.payload.id,
        );

        if (idx >= 0) {
          draft.recipes.splice(idx, 1);
          draft.count -= 1;
        }

        draft.loading = false;
        break;
      }
      case '@recipe/EDIT_RECIPE_ITEM': {
        // const deepCopy = JSON.parse(JSON.stringify(action.payload.item));
        draft.editing.item = action.payload.item;
        break;
      }
      case '@recipe/EDIT_RECIPE_BASE_ITEMS': {
        const deepCopy = JSON.parse(JSON.stringify(action.payload.baseItems));
        draft.editing.baseItems = deepCopy;
        break;
      }
      case '@recipe/UPDATE_RECIPE_REQUEST': {
        draft.loading = true;
        break;
      }
      case '@recipe/UPDATE_RECIPE_SUCCESS': {
        const recipe = draft.editing.item;
        const idx = draft.recipes.findIndex(r => r.id === recipe.id);

        // Update this recipe's unique leaves' progress
        const { uniqueProgress } = recipe;
        draft.recipes[idx].uniqueProgress = uniqueProgress;

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
        draft.recipes = [];
        draft.loading = false;
        break;
      }
      case '@recipe/RESET_RECIPE_PROGRESS_REQUEST': {
        draft.loading = true;
        break;
      }
      case '@recipe/RESET_RECIPE_PROGRESS_SUCCESS': {
        const idx = draft.recipes.findIndex(
          recipe => recipe.id === action.payload.id,
        );

        // Reset this recipe's unique leaves' progress
        draft.recipes[idx].uniqueProgress = 0;

        draft.loading = false;
        break;
      }
      default:
    }
  });
}
