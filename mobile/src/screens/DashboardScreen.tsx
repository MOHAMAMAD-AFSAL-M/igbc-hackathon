import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { SoCGauge } from '../components/SoCGauge';
import { MetricCard } from '../components/MetricCard';
import { ActiveDispatchBanner } from '../components/ActiveDispatchBanner';

export const DashboardScreen: React.FC = () => {
  const {
    prosumer,
    telemetry,
    cluster,
    activeDispatch,
    updateAvailability,
    refreshData,
    isLoading,
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const isAvailable = prosumer?.availability_status === 'AVAILABLE';

  const toggleAvailability = () => {
    updateAvailability(isAvailable ? 'UNAVAILABLE' : 'AVAILABLE');
  };

  const batteryCapacity = prosumer?.battery_capacity_kwh || 13.5;
  const minReserve = prosumer?.minimum_reserve_soc || 20;

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoading}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Active Dispatch Banner if participating */}
        {activeDispatch && <ActiveDispatchBanner />}

        {/* Battery State of Charge Circular Card */}
        <SoCGauge
          soc={telemetry.soc}
          batteryCapacityKwh={batteryCapacity}
          availableEnergyKwh={telemetry.available_energy_kwh}
          minReserveSoc={minReserve}
          batteryPowerKw={telemetry.battery_power_kw}
        />

        {/* Prosumer Availability Switch Card */}
        <View style={styles.availabilityCard}>
          <View style={styles.availInfo}>
            <Ionicons
              name={isAvailable ? 'checkmark-circle' : 'close-circle'}
              size={22}
              color={isAvailable ? Colors.primary : Colors.danger}
            />
            <View>
              <Text style={styles.availTitle}>VPP GRID PARTICIPATION</Text>
              <Text style={styles.availSubtitle}>
                Status: <Text style={{ color: isAvailable ? Colors.primary : Colors.danger, fontWeight: '700' }}>
                  {prosumer?.availability_status || 'AVAILABLE'}
                </Text>
              </Text>
            </View>
          </View>

          <Switch
            value={isAvailable}
            onValueChange={toggleAvailability}
            trackColor={{ false: Colors.surfaceBorder, true: `${Colors.primary}88` }}
            thumbColor={isAvailable ? Colors.primary : '#94A3B8'}
          />
        </View>

        {/* Core Metrics Grid */}
        <Text style={styles.sectionHeader}>LIVE TELEMETRY & CAPACITIES</Text>
        <View style={styles.gridRow}>
          <MetricCard
            title="SOLAR GENERATION"
            value={telemetry.solar_generation_kw.toFixed(2)}
            unit="kW"
            iconName="sunny"
            iconColor={Colors.solar}
            subtitle="Rooftop PV array"
            accentColor={Colors.solar}
          />
          <MetricCard
            title="MAX DISCHARGE"
            value={(prosumer?.max_discharge_kw || 5.0).toFixed(1)}
            unit="kW"
            iconName="flash"
            iconColor={Colors.primary}
            subtitle="Inverter rating"
            accentColor={Colors.primary}
          />
        </View>

        <View style={[styles.gridRow, { marginTop: Spacing.sm }]}>
          <MetricCard
            title="AVAILABLE CAPACITY"
            value={telemetry.available_energy_kwh.toFixed(1)}
            unit="kWh"
            iconName="battery-full"
            iconColor={Colors.secondary}
            subtitle={`Above ${minReserve}% reserve`}
            accentColor={Colors.secondary}
          />
          <MetricCard
            title="CLUSTER STRESS"
            value={cluster?.grid_status?.replace('_', ' ') || 'NORMAL'}
            iconName="pulse"
            iconColor={
              cluster?.grid_status === 'CRITICAL'
                ? Colors.statusCritical
                : cluster?.grid_status === 'HIGH_STRESS'
                ? Colors.statusHighStress
                : Colors.statusNormal
            }
            subtitle={`${cluster?.name || 'Kalamassery'} 110kV`}
            accentColor={
              cluster?.grid_status === 'CRITICAL'
                ? Colors.statusCritical
                : Colors.statusNormal
            }
          />
        </View>

        {/* Energy Flow Summary */}
        <View style={styles.flowCard}>
          <View style={styles.flowHeader}>
            <Ionicons name="git-network-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.flowCardTitle}>VPP OPERATING MODE</Text>
          </View>
          <View style={styles.flowDetailsRow}>
            <View style={styles.flowDetail}>
              <Text style={styles.flowLabel}>Mode</Text>
              <Text style={styles.flowValue}>{prosumer?.participation_mode || 'AUTOMATIC'}</Text>
            </View>
            <View style={styles.flowDetail}>
              <Text style={styles.flowLabel}>Substation</Text>
              <Text style={styles.flowValue}>{cluster?.substation || 'KSB-KLM'}</Text>
            </View>
            <View style={styles.flowDetail}>
              <Text style={styles.flowLabel}>Incentive Rate</Text>
              <Text style={[styles.flowValue, { color: Colors.solar }]}>₹10 / kWh</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 90,
  },
  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginTop: Spacing.md,
  },
  availInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  availTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  availSubtitle: {
    fontSize: 13,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  gridRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  flowCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginTop: Spacing.md,
  },
  flowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  flowCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  flowDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flowDetail: {
    flex: 1,
  },
  flowLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textMuted,
    marginBottom: 4,
  },
  flowValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
