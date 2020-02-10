import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';

import RecipeColumns from '~/config/RecipeQueryColumns';
import api from '~/services/api';
import Storage from '~/services/storage';

import AsyncSelector from '~/components/AsyncSelector';
import HuntItem from '~/components/HuntItem';

import { Container, List, ClearButton } from './styles';

export default function HuntList() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const loadRecipes = await Storage.getAll();

      setRecipes(loadRecipes.sort((a, b) => a.name.localeCompare(b.name)));
    }

    load();
  }, []);

  async function storeRecipe(id) {
    setLoading(true);

    const response = await api.get(`/recipe/${id}`, {
      params: {
        columns: RecipeColumns,
      },
    });

    Storage.storeTree(`@craftinghunter_recipe_${id}`, response.data);

    const recipeStorage = await Storage.getItem('@craftinghunter_recipes');

    if (!recipeStorage) {
      Storage.setItem('@craftinghunter_recipes', [id]);
    } else {
      recipeStorage.push(id);
      Storage.setItem('@craftinghunter_recipes', recipeStorage);
    }

    setLoading(false);
  }

  function handleClear() {
    if (recipes.length) {
      Alert.alert('Clear recipes', 'Clear all recipes stored in the device?', [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            await Storage.clear();
            setRecipes([]);
          },
        },
      ]);
    }
  }

  function handleCallEnded(data) {
    if (data && data.Results.length) {
      return data.Results.map(item => ({
        id: item.ID,
        name: item.Name,
        icon: `https://xivapi.com${item.Icon}`,
      }));
    }

    return data;
  }

  function handleSelected({ current }) {
    const recipeExists = recipes.filter(recipe => recipe.id === current.id);

    if (recipeExists.length) {
      Alert.alert(
        'Recipe exists',
        `Recipe for '${current.name}' has already been added to the list, overwrite progress?`,
        [
          {
            text: 'No',
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: () => {
              storeRecipe(current.id);
            },
          },
        ],
      );
    } else {
      setRecipes(
        [...recipes, current].sort((a, b) => a.name.localeCompare(b.name)),
      );

      storeRecipe(current.id);
    }
  }

  async function handleDeleteRecipe({ id }) {
    const activeRecipes = recipes.filter(recipe => recipe.id !== id);

    const stored = (await Storage.getItem('@craftinghunter_recipes')).filter(
      recipeId => recipeId !== id,
    );

    if (stored.length > 0) {
      await Storage.setItem('@craftinghunter_recipes', stored);
    } else {
      await Storage.removeItem('@craftinghunter_recipes');
    }

    await Storage.removeItem(`@craftinghunter_recipe_${id}`);

    setRecipes(activeRecipes);
  }

  return (
    <Container>
      <View>
        <Text style={{ paddingBottom: 10 }}>
          Enter an item name, then choose from the dropdown.
        </Text>
      </View>
      <AsyncSelector
        url="https://xivapi.com/search?string=@INPUT&string_algo=prefix&indexes=Recipe&columns=ID,Name,Icon&limit=8"
        onCallEnded={handleCallEnded}
        onChangeSelected={handleSelected}
      />
      <List
        key={recipes.length}
        data={recipes}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <HuntItem data={item} onDelete={handleDeleteRecipe} />
        )}
      />

      <ClearButton onPress={handleClear} enabled={!!recipes.length} lightText>
        Clear all
      </ClearButton>
    </Container>
  );
}
