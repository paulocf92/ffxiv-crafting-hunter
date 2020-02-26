import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Storage from '~/services/Storage';
import Loader from '~/components/Loader';
import Ingredient from './Ingredient';
import CrystalCluster from './Ingredient/CrystalCluster';

import {
  Container,
  OutputItem,
  OutputItemText,
  Image,
  Line,
  RecipeTreeContainer,
  RecipeTree,
  RecipeTreeRow,
  RecipeTreeNode,
} from './styles';

export default function RecipeDetail({ route }) {
  const { data: recipe } = route.params;

  const [recipeTree, setRecipeTree] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecipe() {
      const loaded = await Storage.getRecipe(recipe.id);
      setRecipeTree(loaded);
      setLoading(false);
    }

    loadRecipe();
  }, [recipe]);

  function renderIngredient(ingredient, parentCrystals) {
    return ingredient.children.map((item, idx) => (
      <RecipeTreeRow key={item.id}>
        <Ingredient item={item} crystals={idx === 0 ? parentCrystals : null} />
        {item.children && (
          <RecipeTreeNode>
            {renderIngredient(item, item.crystals)}
          </RecipeTreeNode>
        )}
      </RecipeTreeRow>
    ));
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
                <RecipeTreeNode>
                  <CrystalCluster cluster={recipeTree.item.crystals} />
                </RecipeTreeNode>
                {renderIngredient(recipeTree.item)}
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
