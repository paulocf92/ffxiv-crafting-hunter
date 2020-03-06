import React, { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  Container,
  Crystal,
  CrystalData,
  CrystalQty,
  CrystalIcon,
} from './styles';

export default function CrystalCluster({ cluster, onUpdateCrystal }) {
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const completion = !!cluster.filter(
      crystal => crystal.progress === crystal.totalRequired,
    ).length;

    setComplete(completion);
  }, [cluster]);

  const statusColors = useMemo(() => {
    const colors = ['#c4c4c4'];
    colors.push(complete ? '#beff33' : '#c4c4c4');

    return colors;
  }, [complete]);

  function handleUpdateCrystal() {
    const toggled = !complete;
    setComplete(toggled);

    onUpdateCrystal(toggled ? 1 : -1);
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
  onUpdateCrystal: PropTypes.func.isRequired,
};