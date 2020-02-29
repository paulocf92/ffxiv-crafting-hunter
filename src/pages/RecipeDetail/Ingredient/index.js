import React from 'react';
import PropTypes from 'prop-types';

import CrystalCluster from './CrystalCluster';

import {
  Container,
  Item,
  ItemData,
  ItemQty,
  ItemIcon,
  Progress,
  ItemText,
} from './styles';

export default function Ingredient({ item, crystals, onClickItem }) {
  function handleClickItem() {
    onClickItem(item);
  }

  return (
    item && (
      <Container withCrystals={!!crystals}>
        {crystals && (
          <CrystalCluster cluster={crystals} onClickItem={onClickItem} />
        )}
        <Item key={item.id} onPress={handleClickItem}>
          <ItemData>
            <ItemQty>{item.totalRequired}</ItemQty>
            <ItemIcon source={{ uri: item.icon }} />
            <Progress>
              <ItemText>
                {item.name}
                {'\n'}
                10/99
              </ItemText>
            </Progress>
          </ItemData>
        </Item>
      </Container>
    )
  );
}

Ingredient.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    totalRequired: PropTypes.number,
    icon: PropTypes.string,
  }).isRequired,
  crystals: PropTypes.arrayOf(PropTypes.shape()),
  onClickItem: PropTypes.func.isRequired,
};

Ingredient.defaultProps = {
  crystals: null,
};
