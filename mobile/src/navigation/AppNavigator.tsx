import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { getProfile } from '../store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import LoginScreen from '../screens/LoginScreen';
import SwipeScreen from '../screens/SwipeScreen';
import MatchesScreen from '../screens/MatchesScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6C5CE7',
        tabBarInactiveTintColor: '#B2BEC3',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#DFE6E9',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Swipe"
        component={SwipeScreen}
        options={{
          tabBarLabel: 'Keşfet',
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>🔍</span>,
        }}
      />
      <Tab.Screen
        name="Matches"
        component={MatchesScreen}
        options={{
          tabBarLabel: 'Eşleşmeler',
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>💬</span>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>👤</span>,
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        await dispatch(getProfile()).unwrap();
      }
    } catch (error) {
      console.log('Not authenticated');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#fff',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#DFE6E9',
          },
          headerTintColor: '#2D3436',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={({ route }: any) => ({
                title: 'Mesajlar',
              })}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
