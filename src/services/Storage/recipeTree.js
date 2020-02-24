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

export async function traverseRecipeTree(
  recipe,
  leaves = [],
  depth = -1,
  amount,
  ingredient,
) {
  const perRecipe = amount?.perRecipe ?? 1;
  const recipeYield = amount?.recipeYield ?? 1;
  const totalRequired = amount?.totalRequired ?? 1;

  console.tron.log(
    `Entering recipe for ${
      ingredient ? ingredient.name : recipe.Name
    }, yield is ${recipeYield}`,
  );

  let node = {
    depth: depth + 1,
    id: ingredient ? ingredient.id : recipe.ID,
    name: ingredient ? ingredient.name : recipe.Name,
    icon: ingredient ? ingredient.icon : `https://xivapi.com${recipe.Icon}`,
    perRecipe,
    recipeYield,
    totalRequired,
    discipline: {
      icon: `https://xivapi.com${recipe.ClassJob.Icon}`,
      name: recipe.ClassJob.NameEnglish,
    },
    progress: 0,
    totalProgress: 0,
    children: [],
    crystal: false,
  };

  const leafItems = leaves;

  const recipeIngredients = [];

  /**
   * Loop through this recipe's ingredients and add them to an array based on
   * whether it's a recipe or not
   */
  for (let i = 0; i <= MAX_INGREDIENTS; i += 1) {
    if (recipe[`ItemIngredient${i}`] !== null) {
      if (recipe[`ItemIngredientRecipe${i}`]) {
        const ingredientRecipeYield =
          recipe[`ItemIngredientRecipe${i}`]?.[0]?.AmountResult ?? 1;

        recipeIngredients.push({
          isRecipe: true,
          data: {
            recipe: recipe[`ItemIngredientRecipe${i}`][0],
            itemInfo: {
              id: recipe[`ItemIngredient${i}`].ID,
              name: recipe[`ItemIngredient${i}`].Name,
              icon: `https://xivapi.com${recipe[`ItemIngredient${i}`].Icon}`,
            },
            amount: {
              perRecipe: recipe[`AmountIngredient${i}`],
              recipeYield: ingredientRecipeYield,
              totalRequired: recipe[`AmountIngredient${i}`] * totalRequired,
            },
          },
        });
      } else {
        recipeIngredients.push({
          data: {
            recipe: recipe[`ItemIngredient${i}`],
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
                totalRequired % recipeYield === 0 && recipeYield > 1
                  ? recipe[`AmountIngredient${i}`] *
                    (totalRequired / recipeYield)
                  : recipe[`AmountIngredient${i}`] * totalRequired,
            },
          },
        });
      }
    }
  }

  // Anonymous async function to recursively check (sub-)ingredients
  await (async function() {
    for (const ingredient of recipeIngredients) {
      const { data } = ingredient;
      const { recipe, itemInfo, amount } = data;
      const { id, name, icon } = itemInfo;

      let child = null;

      if (ingredient.isRecipe) {
        /**
         * Case #1: This recipe is contained within the first request, traverse
         * it further down.
         */
        child = await traverseRecipeTree(
          recipe,
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
        const subRecipe = await verifySubRecipe(name);

        if (subRecipe) {
          const subRecipeYield = subRecipe.AmountResult ?? 1;

          child = await traverseRecipeTree(
            subRecipe,
            leafItems, // Pass down to look for more base ingredients
            depth + 1,
            { ...amount, recipeYield: subRecipeYield },
            itemInfo,
          );
        } else {
          /**
           * Case #3: This is a raw item (i.e. not composed of anything)
           */
          const crystal = CRYSTALS.some(rx => rx.test(name));

          child = {
            depth: depth + 2,
            id,
            name,
            icon,
            perRecipe: amount.perRecipe,
            totalRequired: amount.totalRequired,
            progress: 0,
            totalProgress: 0,
            crystal,
            leaf: true,
          };

          const idx = leafItems.findIndex(leaf => leaf.id === child.id);

          /**
           * Add item to base items array
           */
          // Leaf already exists, increase it by totalRequired
          if (idx >= 0) {
            leafItems[idx].totalRequired += child.totalRequired;
          } else {
            // Otherwise append this child data
            leafItems.push({
              id: child.id,
              name: child.name,
              icon: child.icon,
              crystal,
              totalRequired: child.totalRequired,
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
    let crystals = [];

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

    console.tron.log('[node, leafItems]');
    console.tron.log([node, leafItems]);

    return [node, leafItems];
  }

  return node;
}
