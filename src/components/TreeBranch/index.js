import React from 'react';
import PropTypes from 'prop-types';

import { Container, Fill, Vertical, Horizontal } from './styles';

export const Line = ({ length, thickness, color }) => (
  <Horizontal length={length} thickness={thickness} color={color} />
);

Line.propTypes = {
  length: PropTypes.number,
  thickness: PropTypes.number,
  color: PropTypes.string,
};

Line.defaultProps = {
  length: 20,
  thickness: 2,
  color: '#dadada',
};

export default function TreeBranch({ type, length, thickness, color }) {
  return (
    <Container>
      {type === 'd' && <Fill />}
      <Vertical type={type} thickness={thickness} color={color}>
        <Horizontal length={length} thickness={thickness} color={color} />
      </Vertical>
      {type === 'u' && <Fill />}
    </Container>
  );
}

TreeBranch.propTypes = {
  type: PropTypes.string,
  length: PropTypes.number,
  thickness: PropTypes.number,
  color: PropTypes.string,
};

TreeBranch.defaultProps = {
  type: 't',
  length: 20,
  thickness: 2,
  color: '#dadada',
};
