/* eslint-disable react/prop-types */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import Header from './components/Header';
import Home from './pages/Home';
import HuntList from './pages/HuntList';
import Recipe from './pages/RecipeDetail/Recipe';
import BaseItems from './pages/RecipeDetail/BaseItems';

const RecipeDetailTabs = createBottomTabNavigator();
const AppStack = createStackNavigator();

const RecipeDetailTabsScreen = () => (
  <RecipeDetailTabs.Navigator
    initialRouteName="Recipe"
    backBehavior="initialRoute"
    tabBarOptions={{
      keyboardHidesTabBar: true,
      activeTintColor: '#fff',
      inactiveTintColor: 'rgba(255, 255, 255, 0.6)',
      labelPosition: 'beside-icon',
      style: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#92d600',
        height: 40,
      },
    }}
  >
    <RecipeDetailTabs.Screen
      name="Recipe"
      component={Recipe}
      options={{
        tabBarLabel: 'Recipe',
        tabBarIcon: ({ color }) => (
          <Icon name="file-tree" size={20} color={color} />
        ),
      }}
    />
    <RecipeDetailTabs.Screen
      name="BaseItems"
      component={BaseItems}
      options={{
        tabBarLabel: 'Raw Materials',
        tabBarIcon: ({ color }) => (
          <Icon name="format-list-bulleted" size={20} color={color} />
        ),
      }}
    />
  </RecipeDetailTabs.Navigator>
);

const AppStackScreen = () => (
  <AppStack.Navigator
    initialRouteName="HuntList"
    screenOptions={{ header: props => <Header {...props} /> }}
  >
    <AppStack.Screen name="HuntList" component={HuntList} />
    <AppStack.Screen name="RecipeDetail" component={RecipeDetailTabsScreen} />
  </AppStack.Navigator>
);

function Routes() {
  const Stack = createStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="App" component={AppStackScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Routes;
