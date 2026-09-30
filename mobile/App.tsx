import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from './src/context/AppContext';
import { AuthScreen } from './src/screens/AuthScreen';
import { BottomTabs } from './src/navigation/BottomTabs';
import { DispatchModal } from './src/components/DispatchModal';
import { Colors } from './src/constants/theme';

const MainNavigator = () => {
  const { isAuthenticated } = useApp();

  return (
    <View style={styles.rootContainer}>
      <StatusBar style="light" />
      {isAuthenticated ? <BottomTabs /> : <AuthScreen />}
      <DispatchModal />
    </View>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainNavigator />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
