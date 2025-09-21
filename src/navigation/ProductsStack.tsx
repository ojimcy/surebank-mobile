/**
 * Products Stack Navigator
 * Handles product browsing and selection screens
 */

import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import { stackScreenOptions, secondaryScreenOptions, mainScreenOptions } from './navigationTheme';
import type { ProductsStackParamList } from './types';

// Import screens
import ProductsHomeScreen from '@/screens/Products/ProductsHomeScreen';
import CreateSBPackageScreen from '@/screens/Package/CreateSBPackageScreen';

const Stack = createStackNavigator<ProductsStackParamList>();

export default function ProductsStack() {
  return (
    <Stack.Navigator
      initialRouteName="ProductsHome"
      screenOptions={stackScreenOptions}
    >
      <Stack.Screen
        name="ProductsHome"
        component={ProductsHomeScreen}
        options={{
          ...mainScreenOptions,
          title: 'Products'
        }}
      />
      <Stack.Screen
        name="CreateSBPackage"
        component={CreateSBPackageScreen}
        options={({ navigation }) => ({
          ...secondaryScreenOptions,
          title: 'SB Package',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ paddingLeft: 16 }}
            >
              <Ionicons name="arrow-back" size={24} color="#0066A1" />
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  );
}