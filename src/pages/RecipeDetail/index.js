import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { View, Alert } from 'react-native';

import Svg, { Path } from 'react-native-svg';

import Storage from '~/services/Storage';
import Loader from '~/components/Loader';

import computeSvgGraph from '~/utils/computeSvgGraph';

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

  const [recipeTree, setRecipeTree] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecipe() {
      const loaded = await Storage.getRecipe(recipe.id);
      const renderableTree = {
        item: computeSvgGraph(loaded.item),
        baseItems: loaded.baseItems,
      };

      setRecipeTree(renderableTree);
      setLoading(false);
    }

    loadRecipe();
  }, [recipe]);

  function handleClickIngredient(ingredient, isCrystal) {
    const name = isCrystal ? 'Bunch of crystals' : ingredient.name;
    Alert.alert('Update progress', `Update progress for item '${name}'?`);
  }

  function renderIngredient(ingredient, parentCrystals) {
    return (
      <View>
        {ingredient.children.map((item, idx) => (
          <RecipeTreeRow key={item.id} spacing={ingredient.depth === 0}>
            <Ingredient
              item={item}
              crystals={idx === 0 ? parentCrystals : null}
              onClickItem={handleClickIngredient}
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

                {renderIngredient(item, item.crystals)}
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
    params: PropTypes.shape({
      data: PropTypes.shape(),
    }),
  }).isRequired,
};
