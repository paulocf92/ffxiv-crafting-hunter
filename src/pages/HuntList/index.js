import React, { useState } from 'react';
import { View, Text } from 'react-native';

import AsyncSelector from '~/components/AsyncSelector';
import HuntItem from '~/components/HuntItem';

import { Container, List } from './styles';

export default function HuntList() {
  const [recipes, setRecipes] = useState([]);

  function handleCallEnded(data) {
    if (data && data.Results.length) {
      return data.Results.map(item => ({
        id: item.ID,
        name: item.Name,
        icon: `https://xivapi.com${item.Icon}`,
      }));
    }

    return data;
  }

  function handleSelected({ current }) {
    const newRecipes = [...recipes, current];
    setRecipes(newRecipes);
  }

  return (
    <Container>
      <View>
        <Text style={{ paddingBottom: 10 }}>
          Enter an item name, then choose from the dropdown.
        </Text>
      </View>
      <AsyncSelector
        url="https://xivapi.com/search?string=@INPUT&string_algo=prefix&indexes=Recipe&columns=ID,Name,Icon&limit=8"
        onCallEnded={handleCallEnded}
        onChangeSelected={handleSelected}
      />
      <List
        data={recipes}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => <HuntItem data={item} />}
      />
    </Container>
  );
}
