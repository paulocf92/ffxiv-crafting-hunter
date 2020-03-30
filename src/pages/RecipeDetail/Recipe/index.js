import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Alert, BackHandler } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import PropTypes from 'prop-types';
import Svg, { Path } from 'react-native-svg';

import Loader from '~/components/Loader';

import {
  loadSingleRecipeRequest,
  updateRecipeRequest,
} from '~/store/modules/recipe/actions';

import Ingredient from './Ingredient';

import { OutputItem, OutputItemText, OutputItemImage } from '../shared_styles';
import {
  Container,
  RecipeTreeContainer,
  RecipeTree,
  RecipeTreeRow,
} from './styles';

export default function Recipe({ route }) {
  const { data: recipe } = route.params;

  const recipeTree = useSelector(state => state.recipe.editing.item);
  const loading = useSelector(state => state.recipe.loading);
  const updated = useSelector(state => state.recipe.updated);
  const performNavigation = useSelector(
    state => state.recipe.performNavigation,
  );
  const dispatch = useDispatch();

  const navigation = useNavigation();

  const handleBackPress = useCallback(() => {
    if (updated) {
      Alert.alert(
        'Unsaved Progress',
        'You have updated your hunting progress, would you like to save it?',
        [
          {
            text: 'Yes',
            onPress: async () => {
              // Yes => silently update recipe, go back based on needsRefresh
              dispatch(updateRecipeRequest());
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
  }, [dispatch, navigation, updated]);

  // Upon focusing this screen
  useFocusEffect(
    useCallback(() => {
      // Add event listener to handle back press
      BackHandler.addEventListener('hardwareBackPress', handleBackPress);

      // Screen blur cleanup: remove handler so it affects only this screen
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    }, [handleBackPress]),
  );

  // Load single recipe upon mounting
  useEffect(() => {
    dispatch(loadSingleRecipeRequest(recipe.key));
  }, [dispatch, recipe.key]);

  /**
   * Perform navigation back only when state requires it, i.e. it's done
   * updating recipe in AsyncStorage.
   */
  useEffect(() => {
    if (performNavigation) {
      navigation.goBack();
    }
  }, [performNavigation, navigation]);

  function renderIngredient(ingredient, parentCrystals, treePath = []) {
    const { ingredients, ingredientIds } = ingredient;

    return (
      <View>
        {ingredientIds.map((id, idx) => {
          const item = ingredients[id];

          return (
            <RecipeTreeRow key={item.id} spacing={ingredient.depth === 0}>
              <Ingredient
                item={item}
                crystals={idx === 0 ? parentCrystals : null}
                treePath={[...treePath, item.id]}
              />

              {item.ingredients && (
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

                  {renderIngredient(
                    item,
                    {
                      ids: item.crystalIds,
                      crystals: item.crystals,
                    },
                    [...treePath, item.id],
                  )}
                </>
              )}
            </RecipeTreeRow>
          );
        })}
      </View>
    );
  }

  return (
    <>
      <Container>
        <OutputItem>
          <OutputItemImage
            source={{
              uri: recipe.icon,
            }}
          />
          <OutputItemText>{recipe.name}</OutputItemText>
        </OutputItem>
        {recipeTree && (
          <RecipeTreeContainer>
            <RecipeTree>
              {renderIngredient(recipeTree, {
                ids: recipeTree.crystalIds,
                crystals: recipeTree.crystals,
              })}
            </RecipeTree>
          </RecipeTreeContainer>
        )}
      </Container>
      {loading && <Loader />}
    </>
  );
}

Recipe.propTypes = {
  route: PropTypes.shape({
    name: PropTypes.string,
    params: PropTypes.shape({
      data: PropTypes.shape(),
    }),
  }).isRequired,
};
