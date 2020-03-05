const INGREDIENT_CRYSTAL_HEIGHT = 88;
const INGREDIENT_HEIGHT = 62;

export function computeSvgGraph(item) {
  if (item.leaf) {
    return item;
  }

  let svgHeight = 0;
  let svgGraph = '';
  let firstChildHeight = INGREDIENT_CRYSTAL_HEIGHT / 2;

  const children = item.children?.map((child, idx, arr) => {
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
            newChild.children.length > 1
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

      return newChild;
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

    return child;
  });

  // Connect parent line to tree
  const horizontalLine =
    children.length > 1 ? Math.floor(svgHeight / 2) : firstChildHeight;
  svgGraph = `M0,${horizontalLine} h30 ${svgGraph}`;

  const newItem = {
    ...item,
    children,
    svgHeight,
    svgGraph,
  };

  return newItem;
}

function checkSmallestMilestone(children) {
  const smallest = Math.min(
    ...children.map(item => Math.floor(item.progress / item.perRecipe)),
  );

  return smallest;
}

export function updateRecipeProgress(item, path, amount, updateCrystal) {
  if (path.length > 0) {
    const furtherPath = path.slice();
    const idx = furtherPath.splice(0, 1)[0];
    const children = item.children.filter((_, i) => i !== idx);

    const modified = updateRecipeProgress(
      item.children[idx],
      furtherPath,
      amount,
      updateCrystal,
    );

    // Insert modified child back into array at previous index
    children.splice(idx, 0, modified);

    // Skip nodes verification if we're updating crystals (already done)
    if (!updateCrystal) {
      // Crystals milestone
      const crystals = checkSmallestMilestone(item.crystals);

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
          const smallest = Math.min(checkSmallestMilestone(children), crystals);
          const nextProgress = Math.min(
            smallest * item.recipeYield,
            item.totalRequired,
          );

          item.progress = nextProgress;
        }
      } else {
        // For decrements (negative value)
        item.progress = Math.min(checkSmallestMilestone(children), crystals);
      }
    }

    return { ...item, children };
  }

  if (updateCrystal) {
    const crystals = item.crystals.map(crystal => ({
      ...crystal,
      progress: amount > 0 ? crystal.totalRequired : 0,
    }));

    /**
     * Since updating crystals will increase/decrease *all* of the necessary
     * crystals at once:
     * => A positive amount means all of them are being completed then it's
     * required to check children smallest milestone.
     * => A negative means no required crystals have been collected, thus the
     * entire recipe progress is at 0.
     */
    const smallest = amount > 0 ? checkSmallestMilestone(item.children) : 0;
    const nextProgress = Math.min(
      smallest * item.recipeYield,
      item.totalRequired,
    );

    item.crystals = crystals;
    item.progress = nextProgress;

    return item;
  }

  item.progress += amount;
  return item;
}
