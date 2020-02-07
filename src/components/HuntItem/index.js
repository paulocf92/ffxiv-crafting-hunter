import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { Container, Delete, ItemContainer, Item, Title, Image } from './styles';

export default function HuntItem({ data }) {
  return (
    <Container>
      <Delete onPress={() => {}}>
        <Icon name="delete" size={35} color="#F64c75" />
      </Delete>
      <ItemContainer onPress={() => {}}>
        <Item>
          <Image
            source={{
              uri: data.icon,
            }}
          />
          <Title>{data.name}</Title>
        </Item>
      </ItemContainer>
    </Container>
  );
}

HuntItem.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
    icon: PropTypes.string,
  }).isRequired,
};
