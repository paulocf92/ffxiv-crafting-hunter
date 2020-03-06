import React, { useMemo } from 'react';
import { Alert } from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

import {
  Container,
  Delete,
  ItemContainer,
  ProgressBar,
  Item,
  Title,
  Image,
} from './styles';

export default function HuntItem({ data, onDelete }) {
  const navigation = useNavigation();

  // Progress bar
  const progressBar = useMemo(() => {
    const prog = +(data.uniqueProgress / data.uniqueLeaves).toFixed(2);
    const locations = [+Math.min(prog > 0 ? prog + 0.02 : 0.01, 1).toFixed(2)];
    const colors = ['#fff'];

    if (prog < 0.97) {
      colors.push('#ccc', '#ccc');
      locations.push(+Math.min(prog + 0.04, 1).toFixed(2), 1);
    }

    if (prog > 0) {
      colors.unshift('#51ecb1', '#51ecb1');
      locations.unshift(0, prog);
    }

    return {
      locations,
      colors,
    };
  }, [data]);

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
          navigation.navigate('RecipeDetail', {
            screen: 'Recipe',
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
        <ProgressBar
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          locations={progressBar.locations}
          colors={progressBar.colors}
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
