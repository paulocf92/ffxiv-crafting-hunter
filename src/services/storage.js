import AsyncStorage from '@react-native-community/async-storage';

import traverseTree from '~/util/traverseTree';

const Storage = {
  async getItem(key) {
    const item = await AsyncStorage.getItem(key);
    return JSON.parse(item);
  },
  async getAll() {
    const recipeList = await Storage.getItem('@craftinghunter_recipes');
    if (recipeList) {
      const recipeKeys = recipeList.map(id => `@craftinghunter_recipe_${id}`);

      const recipes = (await AsyncStorage.multiGet(recipeKeys)).map(recipe => {
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
  },
  async setItem(key, value) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  async storeTree(key, value) {
    const [item, baseItems] = traverseTree(value);
    await AsyncStorage.setItem(key, JSON.stringify({ item, baseItems }));
  },
  async removeItem(key) {
    await AsyncStorage.removeItem(key);
  },
  async clear() {
    const recipes = await Storage.getItem('@craftinghunter_recipes');
    for (let i = 0; i < recipes.length; i += 1) {
      AsyncStorage.removeItem(`@craftinghunter_recipe_${recipes[i]}`);
    }

    Storage.removeItem('@craftinghunter_recipes');
  },
};

export default Storage;
