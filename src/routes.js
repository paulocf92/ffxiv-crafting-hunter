import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Header from './components/Header';
import Home from './pages/Home';
import HuntList from './pages/HuntList';
import RecipeDetail from './pages/RecipeDetail';

function Routes() {
  const Stack = createStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="App">
          {() => (
            <Stack.Navigator
              initialRouteName="HuntList"
              screenOptions={{ header: props => <Header {...props} /> }}
            >
              <Stack.Screen name="HuntList" component={HuntList} />
              <Stack.Screen name="RecipeDetail" component={RecipeDetail} />
            </Stack.Navigator>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Routes;
