import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Alert, BackHandler } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import PropTypes from 'prop-types';
import Svg, { Path } from 'react-native-svg';

import storage from '~/services/storage';
import Loader from '~/components/Loader';

import { updateRecipeProgress } from '~/utils/recipeTree';

import {
  editRecipeItem,
  updateRecipeRequest,
} from '~/store/modules/recipe/actions';

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

export default function Recipe({ route }) {
  const { data: recipe } = route.params;

  const isLoading = useSelector(state => state.recipe.loading);
  const needsRefresh = useSelector(state => state.recipe.refresh);
  const dispatch = useDispatch();

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
  }, [dispatch, navigation, treeUpdated]);

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

  // Load recipe when component was mounted, and update redux state
  useEffect(() => {
    async function loadRecipe() {
      const loaded = await storage.getItem(
        `@craftinghunter_recipe_${recipe.id}`,
      );

      setRecipeTree(loaded);
      dispatch(editRecipeItem(loaded.item));
      setLoading(false);
    }

    loadRecipe();
  }, [recipe, dispatch]);

  /**
   * Play loading animation either based on the component state (initial
   * loading) or redux state (updating recipe in AsyncStorage).
   */
  useEffect(() => {
    setLoading(isLoading || loading);
  }, [isLoading, loading]);

  /**
   * Go back only when state requires a refresh, i.e. it's done updating recipe
   * in AsyncStorage.
   */
  useEffect(() => {
    if (needsRefresh) {
      navigation.goBack();
    }
  }, [needsRefresh, navigation]);

  function handleUpdateProgress(path, amount, increase, isCrystal) {
    const traversalPath = path.slice();

    // Crystals, unlike ingredients, are located one level above
    if (isCrystal) {
      traversalPath.pop();
    }

    const item = updateRecipeProgress(
      recipeTree.item,
      traversalPath,
      amount,
      isCrystal,
    );

    /**
     * Evaluate recipe's unique leaves progress based on whether they're
     * crystals or raw ingredients.
     * => Ingredients will pass amount to be increased in $increase.
     * => Crystals require falling back to parent to get crystals length and
     * multiplying by amount which will be 1 or -1.
     */
    if (isCrystal) {
      // Successively reduce path until we achieve parent item containing
      // amount of crystals
      const parent = traversalPath.reduce(
        (acc, i) => acc.children[i],
        recipeTree.item,
      );

      item.uniqueProgress += parent.crystals.length * amount;
    } else {
      item.uniqueProgress += increase;
    }

    // Save modified item and update redux state, tree has now been updated
    setRecipeTree({ ...recipeTree, item });
    dispatch(editRecipeItem(item));
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
      <Container>
        <OutputItem>
          <Image
            source={{
              uri: recipe.icon,
            }}
          />
          <OutputItemText>{recipe.name}</OutputItemText>
        </OutputItem>
        {recipeTree?.item && (
          <RecipeTreeContainer>
            <RecipeTree>
              {renderIngredient(recipeTree.item, recipeTree.item.crystals)}
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
