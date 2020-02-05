import React from 'react';
import PropTypes from 'prop-types';

import logo from '~/assets/logo.png';

import Button from '~/components/Button';

import { Background, Instructions, Logo } from './styles';

export default function Home({ navigation }) {
  return (
    <Background>
      <Logo source={logo} />
      <Instructions>
        Welcome to Final Fantasy XIV Crafting Hunt! To get started, look for
        items to hunt their crafting schema and begin hunting for matts!
      </Instructions>

      <Button onPress={() => navigation.navigate('HuntList')}>Hunt!</Button>
    </Background>
  );
}

Home.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
  }).isRequired,
};
