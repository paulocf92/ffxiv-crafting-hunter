export default function traverseTree(
  item,
  leaves,
  depth = -1,
  parentAmount = 1,
) {
  const node = {
    depth: depth + 1,
    id: item.ID,
    name: item.Name,
    icon: `https://xivapi.com${item.Icon}`,
    recipeAmount: parentAmount,
    discipline: {
      icon: `https://xivapi.com${item.ClassJob.Icon}`,
      name: item.ClassJob.NameEnglish,
    },
    progress: 0,
    children: [],
  };

  // This array keeps track of base items
  const leafItems = leaves || [];

  // All recipes in FFXIV have at maximum 9 (sub-)ingredients
  for (let i = 0; i <= 9; i += 1) {
    if (item[`ItemIngredient${i}`] && item[`ItemIngredient${i}`].ID) {
      let addNode = null;
      // Has recipe?
      if (item[`ItemIngredientRecipe${i}`]) {
        // Traverse the tree further down until there's only a base ingredient
        addNode = traverseTree(
          item[`ItemIngredientRecipe${i}`][0], // [0,1,etc] Who can craft it
          leafItems, // Pass down to look for more base ingredients
          depth + 1,
          item[`AmountIngredient${i}`],
        );
      } else {
        // This ingredient doesn't have a recipe, so it's a base item (leaf)
        // Add node to parent recipe ingredient, and also to base items array
        addNode = {
          depth: depth + 2,
          id: item[`ItemIngredient${i}`].ID,
          name: item[`ItemIngredient${i}`].Name,
          icon: `https://xivapi.com${item[`ItemIngredient${i}`].Icon}`,
          recipeAmount: item[`AmountIngredient${i}`],
          totalAmount: item[`AmountIngredient${i}`] * parentAmount,
          progress: 0,
          leaf: true,
        };

        const idx = leafItems.findIndex(leaf => leaf.id === addNode.id);

        /**
         * Add it to base items array
         */
        // Leaf already exists, increase it by totalAmount
        if (idx >= 0) {
          leafItems[idx].totalAmount += addNode.totalAmount;
        } else {
          // Otherwise append it (id, name, icon, totalAmount)
          leafItems.push({
            id: addNode.id,
            name: addNode.name,
            icon: addNode.icon,
            totalAmount: addNode.totalAmount,
            progress: 0,
          });
        }
      }

      /**
       * Add this "leaf" to our node
       */
      node.children.push(addNode);
    }
  }

  // If node is root, return it with leaves, otherwise just return node
  if (depth + 1 === 0) {
    node.root = true;
    return [node, leafItems];
  }
  return node;
}
