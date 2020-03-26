import React, { useMemo, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';

import CrystalCluster from './CrystalCluster';

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

export default function Ingredient({ item, crystals, treePath }) {
  const busy = useSelector(state => state.recipe.busy);
  const [crystalPath, setCrystalPath] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    // Crystals are updated all at once, hence it requires walking up the tree
    setCrystalPath(treePath.slice(0, -1));
  }, [treePath]);

  const incrementDisabled = useMemo(
    () => item.progress === item.totalRequired,
    [item.progress, item.totalRequired],
  );

  const decrementDisabled = useMemo(() => item.progress === 0, [item.progress]);

  const statusColors = useMemo(() => {
    const colors = ['#c4c4c4'];

    colors.push(item.progress === item.totalRequired ? '#beff33' : '#c4c4c4');

    return colors;
  }, [item.progress, item.totalRequired]);

  function handleIncrement(complete = false) {
    const amount = complete ? item.totalRequired - item.progress : 1;
    // Only increase if this amount will equal to total required afterwards
    const uniqueIncrease = Number(
      item.progress + amount === item.totalRequired,
    );

    dispatch(editRecipeItemRequest(treePath, amount, uniqueIncrease));
  }

  function handleDecrement(complete = false) {
    const amount = complete ? -item.progress : -1;
    // Only decrease if we had total required previously
    const uniqueDecrease = (item.progress === item.totalRequired) * -1;

    dispatch(editRecipeItemRequest(treePath, amount, uniqueDecrease));
  }

  function handleCrystalCompletion(amount) {
    dispatch(editRecipeItemRequest(crystalPath, amount, amount, true));
  }

  return (
    item && (
      <Container>
        {item.leaf && (
          <Actions>
            <Action
              disabled={incrementDisabled || busy}
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
              disabled={decrementDisabled || busy}
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
                  {`${item.name}\n${item.progress}/${item.totalRequired}`}
                </ItemText>
              </Progress>
            </ItemData>
          </Item>
        </Data>
      </Container>
    )
  );
}

Ingredient.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number,
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
};

Ingredient.defaultProps = {
  crystals: null,
};
