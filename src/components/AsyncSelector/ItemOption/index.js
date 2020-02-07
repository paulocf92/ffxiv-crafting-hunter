import React from 'react';
import { Text } from 'react-native';
import PropTypes from 'prop-types';

import { Container, Option } from './styles';

export default function ItemOption({ data, last, onSelect, opacity }) {
  return (
    <Container last={last} opacity={opacity}>
      <Option onPress={() => onSelect(data)}>
        <Text>{data.name}</Text>
      </Option>
    </Container>
  );
}

ItemOption.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
  }).isRequired,
  last: PropTypes.bool,
  onSelect: PropTypes.func,
  opacity: PropTypes.number.isRequired,
};

ItemOption.defaultProps = {
  last: false,
  onSelect: undefined,
};
