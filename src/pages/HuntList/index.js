import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Alert } from 'react-native';

import AsyncSelector from '~/components/AsyncSelector';
import Loader from '~/components/Loader';
import HuntItem from './HuntItem';

import { Container, List, ClearButton } from './styles';

import {
  loadRecipesRequest,
  storeRecipeRequest,
  deleteRecipeRequest,
  clearRecipesRequest,
  resetRecipeProgressRequest,
} from '~/store/modules/recipe/actions';

export default function HuntList() {
  const recipes = useSelector(state => state.recipe.recipes);
  const recipeIds = useSelector(state => state.recipe.recipeIds);
  const loading = useSelector(state => state.recipe.loading);
  const dispatch = useDispatch();

  // Load recipes from AsyncStorage when screen is focused
  useFocusEffect(
    useCallback(() => {
      dispatch(loadRecipesRequest());
    }, [dispatch]),
  );

  function handleClear() {
    if (recipeIds.length) {
      Alert.alert('Clear recipes', 'Clear all recipes stored in the device?', [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            dispatch(clearRecipesRequest());
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
    const recipeExists = !!recipes[current.id];

    if (recipeExists) {
      Alert.alert(
        'Recipe overwrite',
        `Recipe for '${current.name}' has already been added to the list, overwrite progress?`,
        [
          {
            text: 'No',
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: () => {
              dispatch(resetRecipeProgressRequest(current.id));
            },
          },
        ],
      );
    } else {
      dispatch(storeRecipeRequest(current.id));
    }
  }

  async function handleDeleteRecipe(id) {
    dispatch(deleteRecipeRequest(id));
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
          data={recipeIds}
          keyExtractor={(_, idx) => String(idx)}
          renderItem={({ item }) => (
            <HuntItem data={recipes[item]} onDelete={handleDeleteRecipe} />
          )}
        />

        <ClearButton
          onPress={handleClear}
          enabled={!!recipeIds.length}
          lightText
        >
          Clear all
        </ClearButton>
      </Container>
      {loading && <Loader />}
    </>
  );
}
