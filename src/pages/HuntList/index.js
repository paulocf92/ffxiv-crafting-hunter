import React from 'react';
import { View, Text, Alert } from 'react-native';

import AsyncSelector from '~/components/AsyncSelector';

import { Container } from './styles';

export default function HuntList() {
  function handleCallEnded(data) {
    if (data && data.Results.length) {
      return data.Results.map(item => ({
        id: item.ID,
        name: item.Name,
      }));
    }

    return data;
  }

  function handleSelected({ current }) {
    const { name } = current;
    Alert.alert(`Current Name is ${name}`);
  }

  return (
    <Container>
      <View>
        <Text style={{ paddingBottom: 10 }}>
          Enter an item name, then choose from the dropdown.
        </Text>
      </View>
      <AsyncSelector
        url="https://xivapi.com/search?string=@INPUT&string_algo=prefix&indexes=Recipe&columns=ID,Name&limit=8"
        onCallEnded={handleCallEnded}
        onChangeSelected={handleSelected}
      />
      <View>
        <Text style={{ paddingBottom: 10, fontWeight: 'bold' }}>
          Block of text
        </Text>
      </View>
    </Container>
  );
}
