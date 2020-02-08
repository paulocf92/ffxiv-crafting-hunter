import React from 'react';
import { Alert } from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { Container, Delete, ItemContainer, Item, Title, Image } from './styles';

export default function HuntItem({ data, onDelete }) {
  function handleDelete() {
    Alert.alert('Delete', `Delete recipe for '${data.name}'?`, [
      {
        text: 'No',
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: () => {
          onDelete(data);
        },
      },
    ]);
  }

  return (
    <Container>
      <Delete onPress={handleDelete}>
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
  onDelete: PropTypes.func.isRequired,
};
