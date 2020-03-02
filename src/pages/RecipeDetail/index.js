import React, { useEffect, useState, useCallback } from 'react';
import { View, Alert, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PropTypes from 'prop-types';

import Svg, { Path } from 'react-native-svg';

import Storage from '~/services/Storage';
import Loader from '~/components/Loader';

import { updateRecipeProgress } from '~/utils/recipeTree';

import Ingredient from './Ingredient';

import {
  Container,
  OutputItem,
  OutputItemText,
  Image,
  RecipeTreeContainer,
  RecipeTree,
  RecipeTreeRow,
} from './styles';

export default function RecipeDetail({ route }) {
  const { data: recipe } = route.params;

  const navigation = useNavigation();

  const [recipeTree, setRecipeTree] = useState({});
  const [loading, setLoading] = useState(true);
  const [treeUpdated, setTreeUpdated] = useState(false);

  const handleBackPress = useCallback(() => {
    if (treeUpdated) {
      Alert.alert(
        'Unsaved Progress',
        'You have updated your hunting progress, would you like to save it?',
        [
          {
            text: 'Yes',
            onPress: async () => {
              // Yes => silently update recipe and go back
              const { id } = recipeTree.item;
              await Storage.updateRecipe(id, recipeTree);

              navigation.goBack();
            },
          },
          {
            text: 'No',
            style: 'cancel',
            onPress: () => {
              // No => discard changes and go back
              navigation.goBack();
            },
          },
        ],
        { cancelable: false },
      );

      // Put navigation on hold for prompt
      return true;
    }

    // No change has been made, do not block navigation
    return false;
  }, [navigation, treeUpdated, recipeTree]);

  // Add handler upon mounting
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
  }, [handleBackPress]);

  // Remove handler upon unmounting
  useEffect(() => {
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [handleBackPress]);

  useEffect(() => {
    async function loadRecipe() {
      const loaded = await Storage.getRecipe(recipe.id);

      setRecipeTree(loaded);
      setLoading(false);
    }

    loadRecipe();
  }, [recipe]);

  function handleUpdateProgress(path, amount) {
    const item = updateRecipeProgress(recipeTree.item, path, amount);

    setRecipeTree({ ...recipeTree, item });
    setTreeUpdated(true);
  }

  function renderIngredient(ingredient, parentCrystals, treePath = []) {
    return (
      <View>
        {ingredient.children.map((item, idx) => (
          <RecipeTreeRow key={item.id} spacing={ingredient.depth === 0}>
            <Ingredient
              item={item}
              crystals={idx === 0 ? parentCrystals : null}
              onUpdateProgress={handleUpdateProgress}
              treePath={[...treePath, idx]}
            />

            {item.children && (
              <>
                <Svg
                  width="56"
                  height={item.svgHeight}
                  viewBox={`0 0 60 ${item.svgHeight}`}
                >
                  <Path
                    d={item.svgGraph}
                    fill="none"
                    stroke="#888"
                    strokeWidth="2"
                  />
                </Svg>

                {renderIngredient(item, item.crystals, [...treePath, idx])}
              </>
            )}
          </RecipeTreeRow>
        ))}
      </View>
    );
  }

  return (
    <>
      {!loading && (
        <Container>
          <OutputItem>
            <Image
              source={{
                uri: recipe.icon,
              }}
            />
            <OutputItemText>{recipe.name}</OutputItemText>
          </OutputItem>
          {recipeTree.item && (
            <RecipeTreeContainer>
              <RecipeTree>
                {renderIngredient(recipeTree.item, recipeTree.item.crystals)}
              </RecipeTree>
            </RecipeTreeContainer>
          )}
        </Container>
      )}
      {loading && <Loader />}
    </>
  );
}

RecipeDetail.propTypes = {
  route: PropTypes.shape({
    name: PropTypes.string,
    params: PropTypes.shape({
      data: PropTypes.shape(),
    }),
  }).isRequired,
};
