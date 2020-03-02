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

export function updateRecipeProgress(item, path, amount) {
  if (path.length > 0) {
    const idx = path.splice(0, 1)[0];
    const children = item.children.filter((_, i) => i !== idx);

    const modified = updateRecipeProgress(item.children[idx], path, amount);

    // Insert modified child back into array at previous index
    children.splice(idx, 0, modified);

    // Check progress for items other than root
    if (!item.root) {
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
           * Item progress is set to be the smallest milestone among this
           * item's children.
           * Child milestone = child progress / child perRecipe value
           */
          item.progress = checkSmallestMilestone(children);
        }
      } else {
        // For decrements (negative value)
        item.progress = checkSmallestMilestone(children);
      }

      return { ...item, children };
    }
  }

  item.progress += amount;
  return item;
}
