import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import Svg, { Path } from 'react-native-svg';

import Storage from '~/services/Storage';
import Loader from '~/components/Loader';

import computeSvgGraph from '~/utils/computeSvgGraph';

import Ingredient from './Ingredient';
import CrystalCluster from './Ingredient/CrystalCluster';

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

  function renderIngredient(ingredient, depth, parentCrystals) {
    return (
      <View>
        {ingredient.children.map((item, idx) => (
          <RecipeTreeRow key={item.id}>
            <Ingredient
              item={item}
              crystals={idx === 0 ? parentCrystals : null}
            />

            {item.children && (
              <>
                <Svg
                  width="50"
                  height={item.svgHeight}
                  viewBox={`0 0 50 ${item.svgHeight}`}
                >
                  <Path
                    d={item.svgGraph}
                    fill="none"
                    stroke="#888"
                    strokeWidth="2"
                  />
                </Svg>
                {renderIngredient(item, item.depth, item.crystals)}
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
                <CrystalCluster cluster={recipeTree.item.crystals} />
                {renderIngredient(recipeTree.item, 0)}
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
