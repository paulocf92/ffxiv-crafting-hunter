import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import PropTypes from 'prop-types';

import {
  Container,
  Crystal,
  CrystalData,
  CrystalQty,
  CrystalIcon,
} from './styles';

const progressSelector = createSelector(
  state => state.recipe.update.item,
  (_, path) => path,
  (item, path) => {
    if (path) {
      const parent = [...path].reduce((acc, id) => acc.ingredients[id], item);
      const id = parent.crystalIds[0];
      return parent.crystals[id].progress;
    }

    return 0;
  },
);

export default function CrystalCluster({
  cluster,
  crystalPath,
  onUpdateCrystal,
}) {
  const crystalProgress = useSelector(state =>
    progressSelector(state, crystalPath),
  );

  const complete = useMemo(() => {
    const { crystals, ids } = cluster;
    return crystalProgress === crystals[ids[0]].totalRequired;
  }, [crystalProgress, cluster]);

  const statusColors = useMemo(() => {
    const colors = ['#c4c4c4'];
    colors.push(complete ? '#beff33' : '#c4c4c4');

    return colors;
  }, [complete]);

  function handleUpdateCrystal() {
    const flipped = !complete;

    onUpdateCrystal(flipped ? 1 : -1);
  }

  return (
    cluster && (
      <Container onPress={() => handleUpdateCrystal()}>
        <Crystal
          useAngle
          angle={178}
          angleCenter={{ x: 0.5, y: 0.5 }}
          locations={[0, 0.8]}
          colors={statusColors}
        >
          {cluster.ids.map(id => (
            <CrystalData key={cluster.crystals[id].id}>
              <CrystalQty>{cluster.crystals[id].totalRequired}</CrystalQty>
              <CrystalIcon source={{ uri: cluster.crystals[id].icon }} />
            </CrystalData>
          ))}
        </Crystal>
      </Container>
    )
  );
}

CrystalCluster.propTypes = {
  cluster: PropTypes.shape({
    crystals: PropTypes.shape({
      id: PropTypes.number,
      totalAmount: PropTypes.number,
      icon: PropTypes.string,
    }),
    ids: PropTypes.arrayOf(PropTypes.number),
  }).isRequired,
  crystalPath: PropTypes.arrayOf(PropTypes.number).isRequired,
  onUpdateCrystal: PropTypes.func.isRequired,
};
