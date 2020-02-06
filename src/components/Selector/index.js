import React, { useState } from 'react';
import { TextInput, Alert } from 'react-native';
import { debounce } from 'lodash';

import api from '~/services/api';

import ItemOption from './ItemOption';

import { Container, InputContainer, List } from './styles';

export default function Selector() {
  const [results, setResults] = useState([]);

  async function handleChangeText(text) {
    if (text) {
      try {
        const response = await api.get(
          `/search?string=${text}&string_algo=prefix&indexes=Recipe&columns=ID,Name&limit=8`,
        );

        setResults(response.data.Results);
      } catch (err) {
        Alert.alert(
          'Error',
          'There was an error retrieving data from the api!',
        );
      }
    } else {
      setResults([]);
    }
  }

  return (
    <Container>
      <InputContainer>
        <TextInput onChangeText={debounce(handleChangeText, 500)} />
      </InputContainer>
      <List
        data={results}
        keyExtractor={item => String(item.ID)}
        renderItem={({ item }) => <ItemOption data={item} />}
      />
    </Container>
  );
}
