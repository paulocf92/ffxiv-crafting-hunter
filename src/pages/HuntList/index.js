import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';

import RecipeColumns from '~/config/RecipeQueryColumns';
import api from '~/services/api';
import Storage from '~/services/Storage';

import AsyncSelector from '~/components/AsyncSelector';
import Loader from '~/components/Loader';
import HuntItem from '~/components/HuntItem';

import { Container, List, ClearButton } from './styles';

Storage.init();

export default function HuntList() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const loadRecipes = await Storage.getRecipes();

      setRecipes(loadRecipes.sort((a, b) => a.name.localeCompare(b.name)));
      setLoading(false);
    }

    load();
  }, []);

  async function storeRecipe(id) {
    const response = await api.get(`/recipe/${id}`, {
      params: {
        columns: RecipeColumns,
      },
    });

    await Storage.storeRecipe(id, response.data);
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
            setLoading(true);
            await Storage.clearRecipes();
            setRecipes([]);
            setLoading(false);
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

  async function handleSelected({ current }) {
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
            onPress: async () => {
              setLoading(true);
              await Storage.resetProgress(current.id);
              setLoading(false);
            },
          },
        ],
      );
    } else {
      setLoading(true);

      await storeRecipe(current.id);
      setRecipes(
        [...recipes, current].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setLoading(false);
    }
  }

  async function handleDeleteRecipe({ id }) {
    const activeRecipes = recipes.filter(recipe => recipe.id !== id);

    await Storage.deleteRecipe(id);

    setRecipes(activeRecipes);
  }

  return (
    <>
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
      {loading && <Loader />}
    </>
  );
}
