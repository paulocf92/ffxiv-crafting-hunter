import React from 'react';
import { Text } from 'react-native';
import PropTypes from 'prop-types';

import { Container, Option } from './styles';

export default function ItemOption({ data }) {
  return (
    <Container>
      <Option>
        <Text>{data.Name}</Text>
      </Option>
    </Container>
  );
}

ItemOption.propTypes = {
  data: PropTypes.shape({
    Name: PropTypes.string,
  }).isRequired,
};
