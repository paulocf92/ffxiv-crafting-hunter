import React from 'react';
import PropTypes from 'prop-types';

import {
  Container,
  Crystal,
  CrystalData,
  CrystalQty,
  CrystalIcon,
} from './styles';

export default function CrystalCluster({ cluster, onClickItem }) {
  function handleClickItem() {
    onClickItem(cluster, true);
  }

  return (
    cluster && (
      <Container>
        <Crystal onPress={handleClickItem}>
          {cluster.map(crystal => (
            <CrystalData key={crystal.id}>
              <CrystalQty>{crystal.totalRequired}</CrystalQty>
              <CrystalIcon source={{ uri: crystal.icon }} />
            </CrystalData>
          ))}
        </Crystal>
      </Container>
    )
  );
}

CrystalCluster.propTypes = {
  cluster: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      totalAmount: PropTypes.number,
      icon: PropTypes.string,
    }),
  ).isRequired,
  onClickItem: PropTypes.func.isRequired,
};
