import React, { useMemo, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';

import CrystalCluster from './CrystalCluster';
import TreeBranch, { Line } from '~/components/TreeBranch';

import { editRecipeItemRequest } from '~/store/modules/recipe/actions';

import {
  Container,
  Actions,
  Action,
  Data,
  Item,
  ItemData,
  ItemQty,
  ItemIcon,
  Progress,
  ItemText,
} from './styles';

const progressSelector = createSelector(
  state => state.recipe.update.item,
  (_, path) => path,
  (item, path) => {
    if (path) {
      return [...path].reduce((acc, id) => acc.ingredients[id], item).progress;
    }

    return 0;
  },
);

export default function Ingredient({
  item,
  crystals,
  treePath,
  branchType,
  single,
}) {
  const itemProgress = useSelector(state => progressSelector(state, treePath));
  const [crystalPath, setCrystalPath] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    // Crystals are updated from parent all at once, hence it requires walking
    // up the tree
    setCrystalPath(treePath.slice(0, -1));
  }, [treePath]);

  const incrementDisabled = useMemo(() => itemProgress === item.totalRequired, [
    itemProgress,
    item.totalRequired,
  ]);

  const decrementDisabled = useMemo(() => itemProgress === 0, [itemProgress]);

  const statusColors = useMemo(() => {
    const colors = ['#c4c4c4'];

    colors.push(itemProgress === item.totalRequired ? '#beff33' : '#c4c4c4');

    return colors;
  }, [itemProgress, item.totalRequired]);

  function handleIncrement(complete = false) {
    const amount = complete ? item.totalRequired - itemProgress : 1;
    // Only increase if this amount will equal to total required afterwards
    const updateUnique = Number(itemProgress + amount === item.totalRequired);

    dispatch(editRecipeItemRequest([...treePath], amount, updateUnique));
  }

  function handleDecrement(complete = false) {
    const amount = complete ? -itemProgress : -1;
    // Only decrease if we had total required previously
    const updateUnique = (itemProgress === item.totalRequired) * -1;

    dispatch(editRecipeItemRequest([...treePath], amount, updateUnique));
  }

  function handleCrystalCompletion(amount) {
    dispatch(editRecipeItemRequest([...crystalPath], amount, amount, true));
  }

  return (
    item && (
      <>
        {item.depth > 1 &&
          (single ? <Line /> : <TreeBranch type={branchType} />)}
        <Container>
          {item.leaf && (
            <Actions>
              <Action
                disabled={incrementDisabled}
                onPress={() => handleIncrement()}
                onLongPress={() => handleIncrement(true)}
                delayLongPress={800}
              >
                <Icon
                  name="add-circle"
                  size={32}
                  color={incrementDisabled ? '#ddd' : '#28d77d'}
                />
              </Action>
              <Action
                disabled={decrementDisabled}
                onPress={() => handleDecrement()}
                onLongPress={() => handleDecrement(true)}
                delayLongPress={800}
              >
                <Icon
                  name="remove-circle"
                  size={32}
                  color={decrementDisabled ? '#ddd' : '#F64c75'}
                />
              </Action>
            </Actions>
          )}
          <Data withCrystals={!!crystals}>
            {crystals && (
              <CrystalCluster
                cluster={crystals}
                crystalPath={[...crystalPath]}
                onUpdateCrystal={handleCrystalCompletion}
              />
            )}
            <Item
              key={item.id}
              useAngle
              angle={178}
              angleCenter={{ x: 0.5, y: 0.5 }}
              locations={[0, 0.8]}
              colors={statusColors}
            >
              <ItemData>
                <ItemQty>{item.totalRequired}</ItemQty>
                <ItemIcon source={{ uri: item.icon }} />
                <Progress>
                  <ItemText>
                    {`${item.name}\n${itemProgress}/${item.totalRequired}`}
                  </ItemText>
                </Progress>
              </ItemData>
            </Item>
          </Data>
        </Container>
        {!item.leaf && <Line />}
      </>
    )
  );
}

Ingredient.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number,
    depth: PropTypes.number,
    name: PropTypes.string,
    totalRequired: PropTypes.number,
    progress: PropTypes.number,
    icon: PropTypes.string,
    leaf: PropTypes.bool,
  }).isRequired,
  crystals: PropTypes.shape({
    crystals: PropTypes.shape({
      id: PropTypes.number,
      totalAmount: PropTypes.number,
      icon: PropTypes.string,
    }),
    ids: PropTypes.arrayOf(PropTypes.number),
  }),
  treePath: PropTypes.arrayOf(PropTypes.number).isRequired,
  branchType: PropTypes.string,
  single: PropTypes.bool.isRequired,
};

Ingredient.defaultProps = {
  crystals: null,
  branchType: 't',
};
