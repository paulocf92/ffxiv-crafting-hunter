const INGREDIENT_CRYSTAL_HEIGHT = 56;
const INGREDIENT_HEIGHT = 34;

export default function computeSvgGraph(item) {
  if (item.leaf) {
    return item;
  }

  let svgHeight = 0;
  let svgGraph = '';

  const children = item.children?.map((child, idx, arr) => {
    if (!child.leaf) {
      const newChild = computeSvgGraph(child);

      svgHeight += newChild.svgHeight;

      // SVG Graph drawing
      if (item.depth > 0) {
        // For first index, set up initial drawing, v-line only for children>1
        if (idx === 0) {
          svgGraph = `M50 28 h-30${arr.length > 1 ? ' v24' : ''}`;
        } else {
          // Walk down some units, draw a 30px h-line
          const firstHalf = Math.ceil(newChild.svgHeight / 1.8);
          svgGraph += ` v${firstHalf} h30`;

          if (idx < arr.length - 1) {
            // Not the last element, so move back and walk down a few units
            const secondHalf = Math.ceil(INGREDIENT_HEIGHT / 1.4);
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
        svgGraph = `M50 28 h-30${arr.length > 1 ? ' v24' : ''}`;
      } else {
        // Walk down some units, draw a 30px h-line
        const firstHalf = Math.ceil(INGREDIENT_HEIGHT / 1.6);
        svgGraph += ` v${firstHalf} h30`;

        if (idx < arr.length - 1) {
          // Not the last element, so move back and walk down a few units
          const secondHalf = Math.ceil(INGREDIENT_HEIGHT / 2.5);
          svgGraph += ` m-30,0 v${secondHalf}`;
        }
      }
    }

    return child;
  });

  // Connect parent line to tree
  svgGraph = `M0,${Math.floor(svgHeight / 2)} h20 ${svgGraph}`;

  const newItem = {
    ...item,
    children,
    svgHeight,
    svgGraph,
  };

  return newItem;
}
