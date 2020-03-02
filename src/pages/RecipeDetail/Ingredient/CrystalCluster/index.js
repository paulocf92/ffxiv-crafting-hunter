import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'react-native';

import {
  Container,
  Crystal,
  CrystalData,
  CrystalQty,
  CrystalIcon,
} from './styles';

export default function CrystalCluster({ cluster, onClickItem }) {
  function handleUpdateProgress() {
    if (onClickItem) {
      onClickItem(cluster, true);
    }
    Alert.alert('Update progress on crystal hunting!');
  }

  function handleResetProgress() {
    Alert.alert('Reset progress on crystal hunting!');
  }

  return (
    cluster && (
      <Container>
        <Crystal
          onPress={() => handleUpdateProgress()}
          onLongPress={() => handleResetProgress()}
          delayLongPress={800}
        >
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
  onClickItem: PropTypes.func,
};

CrystalCluster.defaultProps = {
  onClickItem: undefined,
};
