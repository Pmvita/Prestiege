import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './screens/HomeScreen';
import CategoryScreen from './screens/CategoryScreen';
import ListingScreen from './screens/ListingScreen';
import ListingsScreen from './screens/ListingsScreen';
import CollectionsScreen from './screens/CollectionsScreen';
import CollectionDetailScreen from './screens/CollectionDetailScreen';
import { colors } from './theme';

const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.ink,
    card: colors.inkSoft,
    text: colors.parchment,
    border: colors.line,
    primary: colors.gold,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.inkSoft },
            headerTintColor: colors.parchment,
            headerTitleStyle: { letterSpacing: 1 },
            contentStyle: { backgroundColor: colors.ink },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Category" component={CategoryScreen} />
          <Stack.Screen
            name="Listings"
            component={ListingsScreen}
            options={{ title: 'All listings' }}
          />
          <Stack.Screen name="Listing" component={ListingScreen} />
          <Stack.Screen name="Collections" component={CollectionsScreen} />
          <Stack.Screen
            name="CollectionDetail"
            component={CollectionDetailScreen}
            options={{ title: 'Collection' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
