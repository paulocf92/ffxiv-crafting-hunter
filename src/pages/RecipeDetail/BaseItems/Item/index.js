import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PropTypes from 'prop-types';

import { Container, Image, Name, ItemData } from './styles';

const ProgressText = ({ totalRequired, progress }) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: 2,
    }}
  >
    <Text
      style={{
        fontSize: 13,
        width: 16,
        textAlign: 'center',
        color: progress < totalRequired ? '#ccc' : '#222',
      }}
    >
      {progress}
    </Text>
    <Text style={{ color: '#222' }}>/</Text>
    <Text
      style={{
        fontSize: 13,
        width: 16,
        textAlign: 'center',
        color: '#222',
      }}
    >
      {totalRequired}
    </Text>
  </View>
);

ProgressText.propTypes = {
  progress: PropTypes.number.isRequired,
  totalRequired: PropTypes.number.isRequired,
};

export default function Item({ data }) {
  function handleCompletion() {}

  return (
    <Container onPress={() => handleCompletion()}>
      {data && (
        <>
          <ItemData onPress={() => handleCompletion()}>
            <ProgressText
              totalRequired={data.totalRequired}
              progress={data.progress}
            />
            <Image source={{ uri: data.icon }} />
            <Name>{data.name}</Name>

            <Icon
              name="done"
              size={25}
              color={data.progress === data.totalRequired ? '#28d77d' : '#ddd'}
              style={{ paddingLeft: 4 }}
            />
          </ItemData>
        </>
      )}
    </Container>
  );
}

Item.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
    icon: PropTypes.string,
    progress: PropTypes.number,
    totalRequired: PropTypes.number,
  }).isRequired,
};
