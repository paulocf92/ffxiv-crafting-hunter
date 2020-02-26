/* eslint-disable func-names */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import api from '~/services/api';
import RecipeColumns from '~/config/RecipeQueryColumns';

const MAX_INGREDIENTS = 9;
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

export function resetRecipeProgress(recipeItem, baseItems) {
  const item = { ...recipeItem, progress: 0, totalProgress: 0 };

  if (item.children) {
    for (let i = 0; i < item.children.length; i += 1) {
      item.children[i] = resetRecipeProgress(item.children[i]);
    }
  }

  if (item.depth === 0) {
    for (let i = 0; i < baseItems.length; i += 1) {
      baseItems[i] = { ...baseItems[i], progress: 0, totalProgress: 0 };
    }

    return { item, baseItems };
  }

  return item;
}

async function verifySubRecipe(name) {
  // Skip checking crystals
  if (CRYSTALS.some(rx => rx.test(name))) {
    return null;
  }

  const response = await api.get(
    `/search?string=${name}&indexes=Recipe&string_algo=match`,
  );

  const recipeId = response?.data?.Results?.[0]?.ID ?? null;

  let recipe = null;

  // It has a recipe
  if (recipeId) {
    recipe = await api.get(`/recipe/${recipeId}`, {
      params: {
        columns: RecipeColumns,
      },
    });
  }

  return recipe?.data ?? null;
}

function composeItemData(data, amount, depth, itemData, isRecipe = false) {
  if (isRecipe) {
    const perRecipe = amount?.perRecipe ?? 1;
    const recipeYield = amount?.recipeYield ?? 1;
    const totalRequired = amount?.totalRequired ?? 1;

    return {
      depth: depth + 1,
      id: itemData ? itemData.id : data.ID,
      name: itemData ? itemData.name : data.Name,
      icon: itemData ? itemData.icon : `https://xivapi.com${data.Icon}`,
      perRecipe,
      recipeYield,
      totalRequired,
      discipline: {
        icon: `https://xivapi.com${data.ClassJob.Icon}`,
        name: data.ClassJob.NameEnglish,
      },
      progress: 0,
      totalProgress: 0,
      children: [],
      crystal: false,
    };
  }

  const { id, name, icon } = data;
  const { perRecipe, totalRequired } = amount;
  const crystal = CRYSTALS.some(rx => rx.test(name));

  return {
    depth: depth + 2,
    id,
    name,
    icon,
    perRecipe,
    totalRequired,
    progress: 0,
    totalProgress: 0,
    crystal,
    leaf: true,
  };
}

export async function traverseRecipeTree(
  recipe,
  leaves = [],
  depth = -1,
  parentAmount,
  itemData,
) {
  const parentYield = parentAmount?.recipeYield ?? 1;
  const parentTotalRequired = parentAmount?.totalRequired ?? 1;

  const node = composeItemData(recipe, parentAmount, depth, itemData, true);

  const leafItems = leaves;

  const recipeIngredients = [];

  /**
   * Loop through this recipe's ingredients and add them to an array based on
   * whether it's a recipe or not
   */
  for (let i = 0; i <= MAX_INGREDIENTS; i += 1) {
    if (recipe[`ItemIngredient${i}`] !== null) {
      if (recipe[`ItemIngredientRecipe${i}`]) {
        const recipeYield =
          recipe[`ItemIngredientRecipe${i}`]?.[0]?.AmountResult ?? 1;

        recipeIngredients.push({
          isRecipe: true,
          data: {
            item: recipe[`ItemIngredientRecipe${i}`][0],
            itemInfo: {
              id: recipe[`ItemIngredient${i}`].ID,
              name: recipe[`ItemIngredient${i}`].Name,
              icon: `https://xivapi.com${recipe[`ItemIngredient${i}`].Icon}`,
            },
            amount: {
              perRecipe: recipe[`AmountIngredient${i}`],
              recipeYield,
              totalRequired:
                recipe[`AmountIngredient${i}`] * parentTotalRequired,
            },
          },
        });
      } else {
        recipeIngredients.push({
          data: {
            item: recipe[`ItemIngredient${i}`],
            itemInfo: {
              id: recipe[`ItemIngredient${i}`].ID,
              name: recipe[`ItemIngredient${i}`].Name,
              icon: `https://xivapi.com${recipe[`ItemIngredient${i}`].Icon}`,
            },
            amount: {
              perRecipe: recipe[`AmountIngredient${i}`],
              /**
               * Modular math to prevent attributing wrong amount to recipes
               * whose yield is greater than 1 (eg. 2, 3) but only a subset is
               * required (i.e. amount required not divisible by its yield).
               */
              totalRequired:
                parentTotalRequired % parentYield === 0 && parentYield > 1
                  ? recipe[`AmountIngredient${i}`] *
                    (parentTotalRequired / parentYield)
                  : recipe[`AmountIngredient${i}`] * parentTotalRequired,
            },
          },
        });
      }
    }
  }

  // Anonymous async function to recursively check (sub-)ingredients
  await (async function() {
    for (const recipeIngredient of recipeIngredients) {
      const { data } = recipeIngredient;
      const { itemInfo, amount } = data;

      let child = null;

      if (recipeIngredient.isRecipe) {
        /**
         * Case #1: This recipe is contained within the first request, traverse
         * it further down.
         */
        child = await traverseRecipeTree(
          data.item,
          leafItems, // Pass down to look for more base ingredients
          depth + 1,
          amount,
          itemInfo,
        );
      } else {
        /**
         * Case #2: Verify if this item is a recipe by requesting once again.
         * This async function prevents looking for crystals.
         *
         * To-Do: Find a better way to prevent additional requests, besides
         * regex'ing for shards/crystals/clusters names.
         */
        const subRecipe = await verifySubRecipe(itemInfo.name);

        if (subRecipe) {
          const recipeYield = subRecipe.AmountResult ?? 1;

          child = await traverseRecipeTree(
            subRecipe,
            leafItems, // Pass down to look for more base ingredients
            depth + 1,
            { ...amount, recipeYield },
            itemInfo,
          );
        } else {
          /**
           * Case #3: This is a raw item (i.e. not composed of anything)
           */
          child = composeItemData(itemInfo, amount, depth);

          const idx = leafItems.findIndex(leaf => leaf.id === child.id);

          /**
           * Add item to base items array
           */
          // Leaf already exists, increase it by totalRequired
          if (idx >= 0) {
            leafItems[idx].totalRequired += child.totalRequired;
          } else {
            // Otherwise append this child data
            const { id, name, icon, crystal, totalRequired } = child;
            leafItems.push({
              id,
              name,
              icon,
              crystal,
              totalRequired,
              progress: 0,
              totalProgress: 0,
            });

            // Crystals to the bottom
            leafItems.sort((a, b) => Number(a.crystal) - Number(b.crystal));
          }
        }
      }

      if (child) {
        node.children.push(child);
      }
    }
  })();

  // Compose crystals property based on available crystals required by recipe
  if (node.children.length) {
    const crystals = [];

    // Create new prop crystals and remove them from children
    node.crystals = node.children.filter(item => !!item.crystal);
    node.children = node.children.filter(item => !item.crystal);

    if (crystals.length) {
      node.crystals = crystals;
    }
  }

  // If node is root, return it with leaves, otherwise just return node
  if (depth + 1 === 0) {
    node.root = true;

    // console.tron.log('[node, leafItems]');
    // console.tron.log([node, leafItems]);

    return [node, leafItems];
  }

  return node;
}
