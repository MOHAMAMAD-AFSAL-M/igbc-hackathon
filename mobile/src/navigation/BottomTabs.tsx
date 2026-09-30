import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { DashboardScreen } from '../screens/DashboardScreen';
import { DispatchScreen } from '../screens/DispatchScreen';
import { IncentivesScreen } from '../screens/IncentivesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useApp } from '../context/AppContext';

export type TabKey = 'dashboard' | 'dispatch' | 'incentives' | 'settings';

export const BottomTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const { activeDispatch, incomingDispatch } = useApp();

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'dispatch':
        return <DispatchScreen />;
      case 'incentives':
        return <IncentivesScreen />;
      case 'settings':
        return <SettingsScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>{renderScreen()}</View>

      {/* Modern Floating Bottom Navigation Bar */}
      <View style={styles.tabBar}>
        {/* Dashboard Tab */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('dashboard')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'dashboard' ? 'speedometer' : 'speedometer-outline'}
            size={22}
            color={activeTab === 'dashboard' ? Colors.primary : Colors.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'dashboard' && styles.tabLabelActive,
            ]}
          >
            Dashboard
          </Text>
        </TouchableOpacity>

        {/* Dispatch Tab */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('dispatch')}
          activeOpacity={0.7}
        >
          <View style={styles.iconBadgeWrapper}>
            <Ionicons
              name={activeTab === 'dispatch' ? 'flash' : 'flash-outline'}
              size={22}
              color={
                activeTab === 'dispatch'
                  ? Colors.primary
                  : activeDispatch
                  ? Colors.secondary
                  : Colors.textMuted
              }
            />
            {(activeDispatch || incomingDispatch) && (
              <View style={styles.badgeDot} />
            )}
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'dispatch' && styles.tabLabelActive,
            ]}
          >
            Dispatches
          </Text>
        </TouchableOpacity>

        {/* Incentives Tab */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('incentives')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'incentives' ? 'wallet' : 'wallet-outline'}
            size={22}
            color={activeTab === 'incentives' ? Colors.solar : Colors.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'incentives' && { color: Colors.solar },
            ]}
          >
            Earnings
          </Text>
        </TouchableOpacity>

        {/* Settings Tab */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('settings')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'settings' ? 'options' : 'options-outline'}
            size={22}
            color={activeTab === 'settings' ? Colors.primary : Colors.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'settings' && styles.tabLabelActive,
            ]}
          >
            Controls
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    paddingBottom: 12,
    paddingTop: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconBadgeWrapper: {
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 4,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
});
