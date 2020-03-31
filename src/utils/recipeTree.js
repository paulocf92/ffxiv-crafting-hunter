import api from '~/services/api';
import RecipeColumns from '~/config/RecipeQueryColumns';

const MAX_INGREDIENTS = 9;
const INGREDIENTS_ARRAY = [...Array(MAX_INGREDIENTS).keys()];
const CRYSTALS = [
  /^Earth Shard$/,
  /^Earth Crystal$/,
  /^Earth Cluster$/,
  /^Fire Shard$/,
  /^Fire Crystal$/,
  /^Fire Cluster$/,
  /^Ice Shard$/,
  /^Ice Crystal$/,
  /^Ice Cluster$/,
  /^Lightning Shard$/,
  /^Lightning Crystal$/,
  /^Lightning Cluster$/,
  /^Water Shard$/,
  /^Water Crystal$/,
  /^Water Cluster$/,
  /^Wind Shard$/,
  /^Wind Crystal$/,
  /^Wind Cluster$/,
];

function checkSmallestMilestone(item) {
  const smallest = Math.min(
    ...item.ingredientIds.map(id =>
      Math.floor(
        item.ingredients[id].progress / item.ingredients[id].perRecipe,
      ),
    ),
  );

  return smallest;
}

export function updateRecipeProgress(
  item,
  baseItems,
  path,
  amount,
  updateCrystal,
) {
  // Path reaches 0 when we're at an actual item
  if (path.length > 0) {
    const idx = path.splice(0, 1)[0];

    const modified = updateRecipeProgress(
      item.ingredients[idx],
      baseItems,
      path,
      amount,
      updateCrystal,
    );

    let { progress } = item;

    const ingredients = { ...item.ingredients, [idx]: modified };

    // Check if either crystals milestone or sub-ingredients is the smallest
    // Crystals milestone is either full or zero, and can be derived from first
    const crystal = item.crystals[item.crystalIds[0]];
    const crystalMilestone = crystal.progress / crystal.perRecipe;

    const smallest = Math.min(
      checkSmallestMilestone({
        ingredientIds: item.ingredientIds,
        ingredients, // Evaluate modified ingredients
      }),
      crystalMilestone,
    );

    progress = Math.min(smallest * item.recipeYield, item.totalRequired);

    const newItem = { ...item, progress, ingredients };

    // Root level, therefore return item and its base items
    if (item.depth === 0) {
      return [newItem, baseItems];
    }

    return newItem;
  }

  // We reached a raw item/crystal, update accordingly
  if (updateCrystal) {
    // Recreate crystals either completing them entirely or resetting them
    const crystals = item.crystalIds.reduce((acc, id) => {
      const required = item.crystals[id].totalRequired;

      const crystal = {
        ...item.crystals[id],
        progress: amount > 0 ? required : 0,
      };

      // Update base crystal
      const increase = amount > 0 ? required : -required;

      baseItems.data = {
        ...baseItems.data,
        [id]: {
          ...baseItems.data[id],
          progress: baseItems.data[id].progress + increase,
        },
      };

      return { ...acc, [id]: crystal };
    }, {});

    const smallest = amount > 0 ? checkSmallestMilestone(item) : 0;
    const progress = Math.min(smallest * item.recipeYield, item.totalRequired);

    const newItem = { ...item, crystals, progress };

    // Root level, therefore return item and its base items
    if (item.depth === 0) {
      return [newItem, baseItems];
    }

    return newItem;
  }

  const progress = item.progress + amount;

  // Update base materials
  baseItems.data = {
    ...baseItems.data,
    [item.id]: {
      ...baseItems.data[item.id],
      progress,
    },
  };

  return { ...item, progress };
}

export function resetRecipeProgress(recipeItem, recipeBaseItems) {
  const resetItem = { ...recipeItem, progress: 0, totalProgress: 0 };
  let ingredients = null;
  let crystals = null;

  // Reset progress on ingredients and crystals by constructing a new object
  if (resetItem.ingredients) {
    ingredients = resetItem.ingredientIds.reduce((acc, id) => {
      const ingredient = resetRecipeProgress(resetItem.ingredients[id]);

      return { ...acc, [id]: ingredient };
    }, {});
  }

  if (resetItem.crystals) {
    crystals = resetItem.crystalIds.reduce((acc, id) => {
      const crystal = {
        ...resetItem.crystals[id],
        progress: 0,
        totalProgress: 0,
      };

      return { ...acc, [id]: crystal };
    }, {});
  }

  if (resetItem.depth === 0) {
    // For root item, attach new ingredients/crystals
    const item = {
      ...resetItem,
      ingredients,
      crystals,
      uniqueProgress: 0,
    };

    // Construct new recipe items' data with reset progress (ids are unchanged)
    const data = recipeBaseItems.ids.reduce((acc, id) => {
      const baseItem = {
        ...recipeBaseItems.data[id],
        progress: 0,
        totalProgress: 0,
      };

      return { ...acc, [id]: baseItem };
    }, {});

    return { item, baseItems: { ...recipeBaseItems, data } };
  }

  // Leaf items have no ingredients/crystals
  return recipeItem.leaf
    ? { ...resetItem }
    : {
        ...resetItem,
        ingredients,
        crystals,
      };
}

// Many thanks to karashiiro#1000 for the catch
async function verifyRecipeExistence(ids) {
  // Verify if any of these items has a recipe
  const response = await api.get(
    `/Item?ids=${ids.join(',')}&columns=Recipes,ID`,
  );

  // Look up for recipes for every craftable item
  const recipes = await Promise.all(
    response.data.Results.map(async item => {
      const { ID: id } = item;
      const recipeId = item.Recipes?.[0]?.ID ?? null;

      if (recipeId) {
        const resp = await api.get(`/recipe/${recipeId}`, {
          params: {
            columns: RecipeColumns,
          },
        });

        return { id, data: resp.data };
      }

      return { id, data: null };
    }),
  );

  return recipes;
}

function composeItemData(
  ingredient,
  recipe,
  amount = {},
  depth,
  isRecipe = false,
) {
  // * Raw item data
  // Extract data from ingredient
  const { Name: name, Icon, ClassJob = {} } = ingredient;
  // For recipes, id is contained in itemResult, otherwise it's in ingredient
  const { ID: id } = ingredient.ItemResult || ingredient;

  // * Recipe data
  // Extract crafting data from ingredient if existent, otherwise fall back to
  // recipe or return  null
  const {
    Icon: craftIcon = recipe?.ClassJob?.Icon ?? null,
    NameEnglish: craftName = recipe?.ClassJob?.NameEnglish ?? null,
  } = ClassJob;
  // Extract yield from recipe if existent
  const { AmountResult: output = 1 } = recipe || {};
  const { perRecipe = 1, recipeYield = output, totalRequired = 1 } = amount;

  const crystal = !isRecipe ? CRYSTALS.some(rx => rx.test(name)) : false;

  const composed = {
    depth: depth + 1 + Number(!isRecipe),
    id,
    name,
    icon: `https://xivapi.com${Icon}`,
    perRecipe,
    totalRequired,
    ...(isRecipe
      ? {
          recipeYield,
          discipline: {
            icon: `https://xivapi.com${craftIcon}`,
            name: craftName,
          },
          crystals: {},
          ingredients: {},
        }
      : {}),
    progress: 0,
    totalProgress: 0,
    crystal,
  };

  return composed;
}

export async function traverseRecipeTree(
  ingredient,
  recipe,
  leaves = null,
  depth = -1,
  parentAmount,
) {
  const node = composeItemData(ingredient, recipe, parentAmount, depth, true);
  const { recipeYield: parentYield, totalRequired: parentTotalRequired } = node;

  const leafItems = leaves === null ? { data: null, ids: [] } : leaves;

  // * Keep track of nodes whose depth is >= 3
  const verifyLeaves = [];

  const recipeTree = recipe || ingredient;

  // * Keep ingredients in recipe order
  const crystalIds = [];
  const ingredientIds = [];
  INGREDIENTS_ARRAY.forEach(idx => {
    const item = recipeTree[`ItemIngredient${idx}`];

    if (item !== null) {
      if (idx <= MAX_INGREDIENTS - 2) {
        ingredientIds.push(item.ID);
      } else {
        crystalIds.push(item.ID);
      }
    }
  });
  node.ingredientIds = ingredientIds;
  node.crystalIds = crystalIds;

  // * Recursively traverse down the tree until there are no items to check
  await Promise.all(
    INGREDIENTS_ARRAY.slice().map(async idx => {
      if (recipeTree[`ItemIngredient${idx}`] !== null) {
        let child = null;
        const id = recipeTree[`ItemIngredient${idx}`].ID;
        const amount = {
          perRecipe: recipeTree[`AmountIngredient${idx}`],
          /**
           * Modular math to prevent attributing wrong amount to recipes
           * whose yield is greater than 1 (eg. 2, 3) but only a subset is
           * required (i.e. amount required not divisible by its yield).
           */
          totalRequired:
            parentYield > 1
              ? recipeTree[`AmountIngredient${idx}`] *
                Math.ceil(parentTotalRequired / parentYield)
              : recipeTree[`AmountIngredient${idx}`] * parentTotalRequired,
        };

        // It's a recipe
        if (recipeTree[`ItemIngredientRecipe${idx}`]) {
          child = await traverseRecipeTree(
            recipeTree[`ItemIngredient${idx}`],
            recipeTree[`ItemIngredientRecipe${idx}`][0],
            leafItems, // Pass down to look for more base ingredients
            depth + 1,
            amount,
          );
        } else {
          // It looks like a raw item
          child = composeItemData(
            recipeTree[`ItemIngredient${idx}`],
            null,
            amount,
            depth,
          );

          // Children deeper than or equal to 3 that aren't crystal must be
          // checked against api
          if (child.depth >= 3 && !child.crystal) {
            verifyLeaves.push(id);
          } else {
            child = { ...child, leaf: true };
          }

          // * Add item to base items array
          // Leaf already exists, increase it by totalRequired
          if (leafItems.data?.[id]) {
            leafItems.data[id].totalRequired += child.totalRequired;
            leafItems.data[id].unique += 1;
          } else {
            // Otherwise append this child data
            const { name, icon, crystal, totalRequired } = child;
            leafItems.data = {
              ...leafItems.data,
              [id]: {
                id,
                name,
                icon,
                crystal,
                totalRequired,
                progress: 0,
                totalProgress: 0,
                unique: 1,
              },
            };

            leafItems.ids = [...leafItems.ids, id];
          }
        }

        if (child) {
          if (child.crystal) {
            node.crystals[id] = child;
          } else {
            node.ingredients[id] = child;
          }
        }
      }
    }),
  );

  // * Last verification to check if raw items are actually sub-recipes or not
  if (verifyLeaves.length) {
    const recipes = await verifyRecipeExistence(verifyLeaves);

    // Await all possible tree traversals to resolve
    await Promise.all(
      recipes.map(async item => {
        const { id, data } = item;
        const {
          perRecipe,
          totalRequired,
          depth: ingredientDepth,
        } = node.ingredients[id];

        // When data exists this child is a recipe, then look further down
        if (data) {
          node.ingredients[id] = await traverseRecipeTree(
            { ...data },
            null,
            leafItems,
            ingredientDepth - 1,
            {
              perRecipe,
              totalRequired,
            },
            true,
          );
        } else {
          node.ingredients[id].leaf = true;
        }
      }),
    );
  }

  // If node is root, return it with leaves, otherwise just return node
  if (depth + 1 === 0) {
    node.root = true;
    node.key = ingredient.ID;

    // Sort all base items and attach crystals to the end of list
    const rawItems = leafItems.ids
      .filter(id => !leafItems.data[id].crystal)
      .sort((a, b) => a - b);
    const crystals = leafItems.ids
      .filter(id => leafItems.data[id].crystal)
      .sort((a, b) => a - b);
    leafItems.ids = [...rawItems, ...crystals];
    leafItems.rawItemCount = rawItems.length;

    // Unique leaves for this recipe
    const unique = leafItems.ids.reduce(
      (acc, id) => acc + leafItems.data[id].unique,
      0,
    );
    node.uniqueLeaves = unique;
    node.uniqueProgress = 0;

    return [node, leafItems];
  }

  return node;
}
