import React from 'react';
import PropTypes from 'prop-types';

import { Container, Text } from './styles';

export default function Button({ lightText, children, ...rest }) {
  return (
    <Container {...rest}>
      <Text style={{ color: lightText ? '#fff' : '#222' }}>{children}</Text>
    </Container>
  );
}

Button.propTypes = {
  children: PropTypes.string.isRequired,
  lightText: PropTypes.bool,
};

Button.defaultProps = {
  lightText: false,
};
