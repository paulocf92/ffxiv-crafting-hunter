import React from 'react';
import PropTypes from 'prop-types';

import CrystalCluster from './CrystalCluster';

import { Container, Item, ItemData, ItemQty, ItemIcon } from './styles';

export default function Ingredient({ item, crystals }) {
  return (
    item && (
      <Container>
        {crystals && <CrystalCluster cluster={crystals} />}
        <Item key={item.id}>
          <ItemData>
            <ItemQty>{item.totalRequired}</ItemQty>
            <ItemIcon source={{ uri: item.icon }} />
          </ItemData>
        </Item>
      </Container>
    )
  );
}

Ingredient.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number,
    totalRequired: PropTypes.number,
    icon: PropTypes.string,
  }).isRequired,
  crystals: PropTypes.arrayOf(PropTypes.shape()),
};

Ingredient.defaultProps = {
  crystals: null,
};
