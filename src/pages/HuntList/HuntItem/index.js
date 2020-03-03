import React, { useMemo } from 'react';
import { Alert } from 'react-native';
import PropTypes from 'prop-types';
import { hsl, opacify } from 'polished';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

import {
  Container,
  Delete,
  ItemContainer,
  Progress,
  Item,
  Title,
  Image,
} from './styles';

export default function HuntItem({ data, onDelete }) {
  const navigation = useNavigation();

  // Notify progress with varying hues based on recipe unique leaves progress
  const hue = useMemo(
    () => Math.floor((data.uniqueProgress / data.uniqueLeaves) * 240),
    [data],
  );

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
      <ItemContainer
        onPress={() =>
          navigation.navigate('App', {
            screen: 'RecipeDetail',
            params: { data },
          })
        }
      >
        <Item>
          <Image
            source={{
              uri: data.icon,
            }}
          />
          <Title>{data.name}</Title>
        </Item>
        <Progress
          colors={['rgba(0, 0, 0, 0)', opacify(-0.2, hsl(hue, 0.8, 0.62))]}
          hue={hue}
        />
      </ItemContainer>
    </Container>
  );
}

HuntItem.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
    icon: PropTypes.string,
    uniqueProgress: PropTypes.number,
    uniqueLeaves: PropTypes.number,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};
