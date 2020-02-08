import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';

import AsyncSelector from '~/components/AsyncSelector';
import HuntItem from '~/components/HuntItem';

import { Container, List } from './styles';

export default function HuntList() {
  const [recipes, setRecipes] = useState([]);

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
              const newRecipes = recipes.filter(
                recipe => recipe.id !== current.id,
              );

              setRecipes(
                [...newRecipes, current].sort((a, b) =>
                  a.name.localeCompare(b.name),
                ),
              );
            },
          },
        ],
      );
    } else {
      setRecipes(
        [...recipes, current].sort((a, b) => a.name.localeCompare(b.name)),
      );
    }
  }

  function handleDeleteRecipe({ id }) {
    const activeRecipes = recipes.filter(recipe => recipe.id !== id);

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
    </Container>
  );
}
