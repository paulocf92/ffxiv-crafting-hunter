/* eslint-disable no-await-in-loop */
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

function checkSmallestMilestone(item) {
  const { componentIds, components } = item;
  const smallest = Math.min(
    ...componentIds.map(id =>
      Math.floor(components[id].progress / components[id].perRecipe),
    ),
  );

  return smallest;
}

export function updateRecipeProgress(item, path, amount, updateCrystal) {
  if (path.length > 0) {
    // const itemPath = path.slice();
    // Get item id to map
    const idx = path.splice(0, 1)[0];
    // const children = item.children.filter((_, i) => i !== idx);

    const modified = updateRecipeProgress(
      item.ingredients[idx],
      path,
      amount,
      updateCrystal,
    );

    // Insert modified ingredient back into ingredients map
    const ingredients = { ...item.ingredients, [idx]: modified };
    // children.splice(idx, 0, modified);

    let progress = 0;

    // Skip nodes verification if we're updating crystals (already done)
    if (!updateCrystal) {
      // Crystals milestone
      const crystals = checkSmallestMilestone({
        components: item.crystals,
        componentIds: item.crystalIds,
      });

      // Aliases
      const { ingredients: components, ingredientIds: componentIds } = item;

      // For increments (positive value)
      if (amount > 0) {
        /**
         * Only update this item progress if modified child's progress is
         * divisible by its perRecipe operand, and its progress is > 0.
         */
        if (
          modified.progress > 0 &&
          modified.progress % modified.perRecipe === 0
        ) {
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
            checkSmallestMilestone({ components, componentIds }),
            crystals,
          );
          progress = Math.min(smallest * item.recipeYield, item.totalRequired);
        }
      } else {
        // For decrements (negative value)
        progress = Math.min(
          checkSmallestMilestone({ components, componentIds }),
          crystals,
        );
      }
    }

    return { ...item, progress, ingredients };
  }

  if (updateCrystal) {
    const crystals = item.crystalIds.reduce((acc, id) => {
      const crystal = {
        ...item.crystals[id],
        progress: amount > 0 ? item.crystals[id].totalRequired : 0,
      };

      return { ...acc, [id]: crystal };
    }, {});
    // const crystals = item.crystalIds.map(id => ({
    //   ...item.crystals[id],
    //   progress: amount > 0 ? crystal.totalRequired : 0,
    // }));

    /**
     * Since updating crystals will increase/decrease *all* of the necessary
     * crystals at once:
     * => A positive amount means all of them are being completed then it's
     * required to check children smallest milestone.
     * => A negative means no required crystals have been collected, thus the
     * entire recipe progress is at 0.
     */
    const { ingredients: components, ingredientIds: componentIds } = item;
    const smallest =
      amount > 0 ? checkSmallestMilestone({ components, componentIds }) : 0;
    const progress = Math.min(smallest * item.recipeYield, item.totalRequired);

    return { ...item, crystals, progress };
  }

  const progress = item.progress + amount;
  return { ...item, progress };
}

export function resetRecipeProgress(recipeItem, baseItems) {
  const item = { ...recipeItem, progress: 0, totalProgress: 0 };

  if (item.children) {
    for (let i = 0; i < item.children.length; i += 1) {
      item.children[i] = resetRecipeProgress(item.children[i]);
    }
  }

  if (item.crystals) {
    for (let i = 0; i < item.crystals.length; i += 1) {
      item.crystals[i] = { ...item.crystals[i], progress: 0, totalProgress: 0 };
    }
  }

  if (item.depth === 0) {
    const resetItem = { ...item, uniqueProgress: 0 };

    for (let i = 0; i < baseItems.length; i += 1) {
      baseItems[i] = { ...baseItems[i], progress: 0, totalProgress: 0 };
    }

    return { item: resetItem, baseItems };
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
      id: itemData?.id ?? data.ID, // ? itemData.id : data.ID,
      name: itemData?.name ?? data.Name, // ? itemData.name : data.Name,
      icon: itemData?.icon ?? `https://xivapi.com${data.Icon}`, // ? itemData.icon : `https://xivapi.com${data.Icon}`,
      perRecipe,
      recipeYield,
      totalRequired,
      discipline: {
        icon: `https://xivapi.com${data.ClassJob.Icon}`,
        name: data.ClassJob.NameEnglish,
      },
      progress: 0,
      totalProgress: 0,
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
  leaves = null,
  depth = -1,
  parentAmount,
  itemData,
) {
  const parentYield = parentAmount?.recipeYield ?? 1;
  const parentTotalRequired = parentAmount?.totalRequired ?? 1;

  const node = composeItemData(recipe, parentAmount, depth, itemData, true);

  const leafItems = leaves === null ? { data: null, ids: [] } : leaves;

  /**
   * Loop through this recipe's ingredients and add them to an array based on
   * whether it's a recipe or not
   */
  for (let i = 0; i <= MAX_INGREDIENTS; i += 1) {
    if (recipe[`ItemIngredient${i}`] !== null) {
      let child = null;
      const data = {
        id: recipe[`ItemIngredient${i}`].ID,
        name: recipe[`ItemIngredient${i}`].Name,
        icon: `https://xivapi.com${recipe[`ItemIngredient${i}`].Icon}`,
      };

      const { id } = data;

      if (recipe[`ItemIngredientRecipe${i}`]) {
        /**
         * Case #1: This recipe is contained within the first request, traverse
         * it further down.
         */
        const recipeYield =
          recipe[`ItemIngredientRecipe${i}`]?.[0]?.AmountResult ?? 1;

        child = await traverseRecipeTree(
          recipe[`ItemIngredientRecipe${i}`][0],
          leafItems, // Pass down to look for more base ingredients
          depth + 1,
          {
            perRecipe: recipe[`AmountIngredient${i}`],
            recipeYield,
            totalRequired: recipe[`AmountIngredient${i}`] * parentTotalRequired,
          },
          data,
        );
      } else {
        // If it's not a recipe received from initial request...
        const amount = {
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
        };

        const subRecipe = await verifySubRecipe(data.name);

        /**
         * Case #2: Verify if this item is a recipe by requesting once again.
         * This async function prevents looking for crystals.
         *
         * To-Do: Find a better way to prevent additional requests, besides
         * regex'ing for shards/crystals/clusters names.
         */
        if (subRecipe) {
          const recipeYield = subRecipe.AmountResult ?? 1;

          child = await traverseRecipeTree(
            subRecipe,
            leafItems, // Pass down to look for more base ingredients
            depth + 1,
            { ...amount, recipeYield },
            data,
          );
        } else {
          /**
           * Case #3: This is a raw item (i.e. not composed of anything)
           */
          child = composeItemData(data, amount, depth);

          /**
           * Add item to base items array
           */
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

            // Crystals to the bottom
            leafItems.ids = leafItems.ids
              .concat(id)
              .sort(
                (a, b) =>
                  Number(leafItems.data[a].crystal) -
                  Number(leafItems.data[b].crystal),
              );
          }
        }
      }

      if (child) {
        if (child.crystal) {
          // Compose crystals property based on available crystals required by recipe
          node.crystalIds = node.crystalIds || [];
          node.crystalIds.push(id);
          node.crystals = {
            ...node.crystals,
            [id]: child,
          };
        } else {
          node.ingredientIds = node.ingredientIds || [];
          node.ingredientIds.push(id);
          node.ingredients = {
            ...node.ingredients,
            [id]: child,
          };
        }
      }
    }
  }

  // If node is root, return it with leaves, otherwise just return node
  if (depth + 1 === 0) {
    node.root = true;

    const unique = leafItems.ids.reduce(
      (acc, id) => acc + leafItems.data[id].unique,
      0,
    );
    node.uniqueLeaves = unique; // Unique leaves for this recipe
    node.uniqueProgress = 0; // How many unique leaves have been done?

    // Computed and add svg graph to node
    console.tron.log('Going to compute svg graph');
    const computedNode = computeSvgGraph(node);
    console.tron.log({ computedNode });
    console.tron.log('Computed svg graph');

    return [computedNode, leafItems];
  }

  return node;
}
