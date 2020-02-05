import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import Home from './pages/Home';
import Header from './components/Header';
import HuntList from './pages/HuntList';

const Routes = createAppContainer(
  createStackNavigator(
    {
      Home,
      App: createStackNavigator(
        {
          HuntList,
        },
        {
          defaultNavigationOptions: navigation => ({
            header: () => <Header {...navigation} />,
          }),
        },
      ),
    },
    {
      defaultNavigationOptions: {
        headerShown: false,
      },
    },
  ),
);

export default Routes;
