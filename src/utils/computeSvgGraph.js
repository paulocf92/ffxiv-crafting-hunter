const INGREDIENT_CRYSTAL_HEIGHT = 88;
const INGREDIENT_HEIGHT = 62;

export default function computeSvgGraph(item) {
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
