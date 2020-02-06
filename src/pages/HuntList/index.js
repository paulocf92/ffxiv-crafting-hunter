import React from 'react';
import { View, Text } from 'react-native';

import Selector from '~/components/Selector';

import { Container } from './styles';

export default function HuntList() {
  return (
    <Container>
      <View>
        <Text style={{ paddingBottom: 10 }}>
          Enter an item name, then choose from the list below.
        </Text>
      </View>
      <Selector />
    </Container>
  );
}
