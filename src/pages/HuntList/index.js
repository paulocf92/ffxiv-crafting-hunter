import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Alert } from 'react-native';

import RecipeColumns from '~/config/RecipeQueryColumns';
import api from '~/services/api';
import Storage from '~/services/Storage';

import AsyncSelector from '~/components/AsyncSelector';
import Loader from '~/components/Loader';
import HuntItem from './HuntItem';

import { Container, List, ClearButton } from './styles';

Storage.init();

export default function HuntList() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load recipes from AsyncStorage when screen is focused
  useFocusEffect(
    useCallback(() => {
      async function load() {
        const loadRecipes = await Storage.getRecipes();

        setRecipes(loadRecipes.sort((a, b) => a.name.localeCompare(b.name)));
        setLoading(false);
      }

      load();
    }, []), // eslint-disable-line-no
  );

  async function storeRecipe(id) {
    const response = await api.get(`/recipe/${id}`, {
      params: {
        columns: RecipeColumns,
      },
    });

    const stored = await Storage.storeRecipe(id, response.data);
    return stored;
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

      // Catch relevant properties
      const {
        id,
        name,
        icon,
        uniqueProgress,
        uniqueLeaves,
      } = await storeRecipe(current.id);

      setRecipes(
        [
          ...recipes,
          { id, name, icon, uniqueProgress, uniqueLeaves },
        ].sort((a, b) => a.name.localeCompare(b.name)),
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
