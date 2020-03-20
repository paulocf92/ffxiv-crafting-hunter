/* eslint-disable no-await-in-loop */
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
const INGREDIENT_CRYSTAL_HEIGHT = 88;
const INGREDIENT_HEIGHT = 62;

export function computeSvgGraph(item) {
  if (item.leaf) {
    return item;
  }

  let svgHeight = 0;
  let svgGraph = '';
  let firstChildHeight = INGREDIENT_CRYSTAL_HEIGHT / 2;

  const ingredients = item.ingredientIds.reduce((acc, id, idx, arr) => {
    const child = item.ingredients[id];

    if (!child.leaf) {
      const newChild = computeSvgGraph(child);

      svgHeight += newChild.svgHeight;

      // SVG Graph drawing
      if (item.depth > 0) {
        // For first index, set up initial drawing, v-line only for children>1
        if (idx === 0) {
          firstChildHeight = Math.floor(newChild.svgHeight / 2);

          svgGraph = `M60 48 h-30${arr.length > 1 ? ' v24' : ''}`;
        } else {
          // Walk down some units, draw a 30px h-line
          const firstHalf =
            newChild.ingredientIds.length > 1
              ? Math.ceil(newChild.svgHeight / 1.7)
              : INGREDIENT_CRYSTAL_HEIGHT / 2 + 16;
          svgGraph += ` v${firstHalf} h30`;

          if (idx < arr.length - 1) {
            // Not the last element, so move back and walk down a few units
            const secondHalf = Math.ceil(INGREDIENT_HEIGHT / 1.6);
            svgGraph += ` m-30,0 v${secondHalf}`;
          }
        }
      }

      return { ...acc, [id]: newChild };
    }

    svgHeight += idx === 0 ? INGREDIENT_CRYSTAL_HEIGHT : INGREDIENT_HEIGHT;

    // SVG Graph drawing
    if (item.depth > 0) {
      // For first index, set up initial drawing, v-line only for children>1
      if (idx === 0) {
        svgGraph = `M60 ${INGREDIENT_CRYSTAL_HEIGHT / 2} h-30${
          arr.length > 1 ? ' v24' : ''
        }`;
      } else {
        // Walk down some units, draw a 30px h-line
        const firstHalf = Math.ceil(INGREDIENT_HEIGHT / 1.15);
        svgGraph += ` v${firstHalf} h30`;

        if (idx < arr.length - 1) {
          // Not the last element, so move back and walk down a few units
          const secondHalf = Math.ceil(INGREDIENT_HEIGHT / 4.5);
          svgGraph += ` m-30,0 v${secondHalf}`;
        }
      }
    }

    return { ...acc, [id]: child };
  }, {});

  // Connect parent line to tree
  const horizontalLine =
    item.ingredientIds.length > 1
      ? Math.floor(svgHeight / 2)
      : firstChildHeight;
  svgGraph = `M0,${horizontalLine} h30 ${svgGraph}`;

  const newItem = {
    ...item,
    ingredients,
    svgHeight,
    svgGraph,
  };

  return newItem;
}

function checkSmallestMilestone(item, crystal = false) {
  const [components, componentIds] = crystal
    ? [item.crystals, item.crystalIds]
    : [item.ingredients, item.ingredientIds];

  const smallest = Math.min(
    ...componentIds.map(id =>
      Math.floor(components[id].progress / components[id].perRecipe),
    ),
  );

  return smallest;
}

export function updateRecipeProgress(item, path, amount, updateCrystal) {
  // Visit all nodes while we're descending path
  if (path.length > 0) {
    // Get item id to map
    const idx = path.splice(0, 1)[0];

    const modified = updateRecipeProgress(
      item.ingredients[idx],
      path,
      amount,
      updateCrystal,
    );

    // Progress starts off as current
    let { progress } = item;

    // Insert modified ingredient back into ingredients map
    const ingredients = { ...item.ingredients, [idx]: modified };

    // Skip nodes verification if we're updating crystals (already done)
    if (!updateCrystal) {
      // Crystals milestone
      const crystals = checkSmallestMilestone(item, true);

      /**
       * 1) Check whether we have smallest number of raw materials OR
       * crystals which are necessary to complete a recipe.
       * 2) Factor in items yielded by this recipe x smallest number.
       * 3) Either this factored-in amount or total required by recipe will
       * be picked, favoring the smallest (totalRequired).
       * Eg.: Worsted Yarn recipe yields 3 (recipeYield), but some recipes
       * may only need 1 (totalRequired).
       */
      const smallest = Math.min(
        checkSmallestMilestone({
          ingredientIds: item.ingredientIds,
          ingredients,
        }),
        crystals,
      );
      progress = Math.min(smallest * item.recipeYield, item.totalRequired);
    }

    return { ...item, progress, ingredients };
  }

  if (updateCrystal) {
    // Update all crystals, either by resetting or completing progress
    const crystals = item.crystalIds.reduce((acc, id) => {
      const crystal = {
        ...item.crystals[id],
        progress: amount > 0 ? item.crystals[id].totalRequired : 0,
      };

      return { ...acc, [id]: crystal };
    }, {});

    /**
     * Since updating crystals will increase/decrease *all* of the necessary
     * crystals at once:
     * => A positive amount means all of them are being completed then it's
     * required to check raw materials smallest milestone.
     * => A negative means no required crystals have been collected, thus the
     * entire recipe progress is at 0.
     */
    const smallest = amount > 0 ? checkSmallestMilestone(item) : 0;
    const progress = Math.min(smallest * item.recipeYield, item.totalRequired);

    return { ...item, crystals, progress };
  }

  // Raw material progress update, simply update it preserving immutability
  const progress = item.progress + amount;
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
  // For recipes id is contained in itemResult, otherwise it's in ingredient
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

    // Crystals to the end of list
    leafItems.ids = leafItems.ids.sort(
      (a, b) =>
        Number(leafItems.data[a].crystal) - Number(leafItems.data[b].crystal),
    );

    // Unique leaves for this recipe
    const unique = leafItems.ids.reduce(
      (acc, id) => acc + leafItems.data[id].unique,
      0,
    );
    node.uniqueLeaves = unique;
    node.uniqueProgress = 0;

    // Compute and add svg graph to node
    const computedNode = computeSvgGraph(node);

    return [computedNode, leafItems];
  }

  return node;
}
