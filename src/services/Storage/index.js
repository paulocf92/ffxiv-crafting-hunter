import Storage from './storage';
import { traverseRecipeTree, resetRecipeProgress } from './recipeTree';

class FFXIVStorage extends Storage {
  constructor() {
    super();
    this.recipeStorage = [];
  }

  async init() {
    const recipes = await FFXIVStorage.getItem('@craftinghunter_recipes');

    if (recipes) {
      this.recipeStorage = recipes;
    } else {
      await FFXIVStorage.setItem('@craftinghunter_recipes', []);
    }
  }

  async storeRecipe(id, recipe) {
    const [item, baseItems] = await traverseRecipeTree(recipe);

    await FFXIVStorage.setItem(`@craftinghunter_recipe_${id}`, {
      item,
      baseItems,
    });

    this.recipeStorage.push(id);

    await FFXIVStorage.setItem('@craftinghunter_recipes', this.recipeStorage);
  }

  async deleteRecipe(id) {
    this.recipeStorage = this.recipeStorage.filter(recipeId => recipeId !== id);

    await FFXIVStorage.setItem('@craftinghunter_recipes', this.recipeStorage);
    await FFXIVStorage.removeItem(`@craftinghunter_recipe_${id}`);
  }

  // eslint-disable-next-line
  async getRecipe(id) {
    const recipe = await FFXIVStorage.getItem(`@craftinghunter_recipe_${id}`);

    return recipe;
  }

  async getRecipes() {
    if (this.recipeStorage.length) {
      const recipeKeys = this.recipeStorage.map(
        id => `@craftinghunter_recipe_${id}`,
      );

      const recipes = (await FFXIVStorage.multiGet(recipeKeys)).map(recipe => {
        const parsed = JSON.parse(recipe[1]);

        return {
          id: parsed.item.id,
          name: parsed.item.name,
          icon: parsed.item.icon,
        };
      });

      return recipes;
    }

    return [];
  }

  async clearRecipes() {
    const removeAll = [];
    for (let i = 0; i < this.recipeStorage.length; i += 1) {
      removeAll.push(
        FFXIVStorage.removeItem(
          `@craftinghunter_recipe_${this.recipeStorage[i]}`,
        ),
      );
    }

    this.recipeStorage.splice(0, this.recipeStorage.length);
    await Promise.all(removeAll);
    await FFXIVStorage.setItem('@craftinghunter_recipes', []);
  }

  // eslint-disable-next-line
  async resetProgress(id) {
    const { item: recipeItem, baseItems } = await FFXIVStorage.getItem(
      `@craftinghunter_recipe_${id}`,
    );

    const item = resetRecipeProgress(recipeItem, baseItems);
    await FFXIVStorage.setItem(`@craftinghunter_recipe_${id}`, item);
  }
}

export default new FFXIVStorage();
