import React, { useState, useEffect, useRef } from 'react';
import { Alert, ActivityIndicator } from 'react-native';
import { debounce } from 'lodash';
import axios from 'axios';
import PropTypes from 'prop-types';

import ItemOption from './ItemOption';

import { Container, InputContainer, SearchInput, List } from './styles';

export default function AsyncSelector({
  url,
  delay,
  onCallEnded,
  onChangeSelected,
}) {
  const textInputRef = useRef();

  const [loading, setLoading] = useState(false);
  const [customUrl, setCustomUrl] = useState([]);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState();

  const api = axios.create();

  useEffect(() => {
    if (url && url.includes('@INPUT')) {
      setCustomUrl(url.split('@INPUT'));
    }
  }, [url]);

  async function handleChangeText(text) {
    if (text) {
      if (customUrl.length === 2) {
        try {
          setLoading(true);
          const response = await api.get(customUrl[0] + text + customUrl[1]);

          const data = onCallEnded(response.data);

          setResults(data);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          Alert.alert(
            'Error',
            'There was an error retrieving data from remote server!',
          );
        }
      }
    } else {
      setResults([]);
    }
  }

  function handleSelect(newValue) {
    const oldValue = selected;

    setSelected(newValue);
    setResults([]);

    textInputRef.current.clear();

    if (onChangeSelected) {
      onChangeSelected({
        previous: oldValue,
        current: newValue,
      });
    }
  }

  return (
    <Container>
      <InputContainer>
        <SearchInput
          ref={textInputRef}
          onChangeText={debounce(handleChangeText, delay)}
        />
        {loading && <ActivityIndicator size="small" color="#ddd" />}
      </InputContainer>
      <List
        data={results}
        keyExtractor={item => String(item.id)}
        renderItem={({ item, index }) => (
          <ItemOption
            data={item}
            last={index === results.length - 1}
            onSelect={handleSelect}
          />
        )}
      />
    </Container>
  );
}

AsyncSelector.propTypes = {
  onChangeSelected: PropTypes.func,
  onCallEnded: PropTypes.func,
  delay: PropTypes.number,
  url: PropTypes.string.isRequired,
};

AsyncSelector.defaultProps = {
  onChangeSelected: undefined,
  onCallEnded: data => data,
  delay: 300,
};
