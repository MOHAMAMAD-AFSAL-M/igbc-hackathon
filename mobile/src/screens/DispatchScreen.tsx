import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { ActiveDispatchBanner } from '../components/ActiveDispatchBanner';

export const DispatchScreen: React.FC = () => {
  const {
    activeDispatch,
    incomingDispatch,
    triggerDemoDispatch,
    prosumer,
    cluster,
    telemetry,
  } = useApp();

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Title */}
      <View style={styles.titleSection}>
        <Text style={styles.screenTitle}>Grid Dispatches</Text>
        <Text style={styles.screenSubtitle}>
          KSEB Virtual Power Plant demand-response events
        </Text>
      </View>

      {/* Active Dispatch Display */}
      {activeDispatch ? (
        <View style={styles.activeSection}>
          <Text style={styles.sectionBadge}>ACTIVE DISPATCH EVENT</Text>
          <ActiveDispatchBanner />

          {/* Real-time telemetry during dispatch */}
          <View style={styles.detailCard}>
            <Text style={styles.cardHeader}>EVENT TELEMETRY</Text>
            
            <View style={styles.telemetryRow}>
              <View style={styles.telemItem}>
                <Text style={styles.telemLabel}>Target kW</Text>
                <Text style={styles.telemVal}>{(activeDispatch.accepted_kw || 4.0).toFixed(1)} kW</Text>
              </View>
              <View style={styles.telemItem}>
                <Text style={styles.telemLabel}>Current Discharge</Text>
                <Text style={[styles.telemVal, { color: Colors.primary }]}>
                  {telemetry.battery_power_kw > 0 ? telemetry.battery_power_kw.toFixed(1) : '3.8'} kW
                </Text>
              </View>
              <View style={styles.telemItem}>
                <Text style={styles.telemLabel}>Current SoC</Text>
                <Text style={styles.telemVal}>{Math.round(telemetry.soc)}%</Text>
              </View>
            </View>

            <View style={styles.noticeBox}>
              <Ionicons name="information-circle" size={16} color={Colors.primary} />
              <Text style={styles.noticeText}>
                Your battery inverter is responding to KSEB substation dispatch commands.
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.idleCard}>
          <View style={styles.idleIcon}>
            <Ionicons name="checkmark-done-circle" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.idleTitle}>No Active Dispatch</Text>
          <Text style={styles.idleDesc}>
            Your battery is in standby mode, ready to supply power when KSEB grid stress peaks.
          </Text>

          <TouchableOpacity
            style={styles.simulateBtn}
            onPress={triggerDemoDispatch}
            activeOpacity={0.8}
          >
            <Ionicons name="flash" size={18} color="#FFFFFF" />
            <Text style={styles.simulateBtnText}>SIMULATE INCOMING REQUEST</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Cluster Status Summary */}
      <View style={styles.clusterSummaryCard}>
        <View style={styles.clusterHeader}>
          <Ionicons name="git-network" size={18} color={Colors.secondary} />
          <Text style={styles.clusterTitle}>Grid Cluster: {cluster?.name || 'Kalamassery'}</Text>
        </View>

        <View style={styles.clusterGrid}>
          <View style={styles.clusterCol}>
            <Text style={styles.clusterLabel}>Substation</Text>
            <Text style={styles.clusterVal}>{cluster?.substation || 'KSB-KLM'}</Text>
          </View>
          <View style={styles.clusterCol}>
            <Text style={styles.clusterLabel}>Grid Stress</Text>
            <Text
              style={[
                styles.clusterVal,
                {
                  color:
                    cluster?.grid_status === 'CRITICAL'
                      ? Colors.statusCritical
                      : cluster?.grid_status === 'HIGH_STRESS'
                      ? Colors.statusHighStress
                      : Colors.statusNormal,
                },
              ]}
            >
              {cluster?.grid_status?.replace('_', ' ') || 'NORMAL'}
            </Text>
          </View>
          <View style={styles.clusterCol}>
            <Text style={styles.clusterLabel}>Participation</Text>
            <Text style={styles.clusterVal}>{prosumer?.participation_mode || 'AUTOMATIC'}</Text>
          </View>
        </View>
      </View>

      {/* How Dispatch Works guide */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>HOW VPP DISPATCH WORKS</Text>
        <View style={styles.stepRow}>
          <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
          <Text style={styles.stepText}>KSEB substation detects peak grid stress or deficit.</Text>
        </View>
        <View style={styles.stepRow}>
          <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
          <Text style={styles.stepText}>VPP Engine routes dispatch requests to available batteries.</Text>
        </View>
        <View style={styles.stepRow}>
          <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
          <Text style={styles.stepText}>You earn ₹10 per kWh fed back into the grid.</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: Spacing.md,
    paddingTop: 60,
    paddingBottom: 90,
  },
  titleSection: {
    marginBottom: Spacing.md,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  screenSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activeSection: {
    marginBottom: Spacing.md,
  },
  sectionBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  detailCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  telemItem: {
    alignItems: 'center',
  },
  telemLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  telemVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primaryGlow,
    padding: 10,
    borderRadius: 10,
  },
  noticeText: {
    fontSize: 11,
    color: Colors.primaryLight,
    flex: 1,
  },
  idleCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.md,
  },
  idleIcon: {
    marginBottom: Spacing.md,
  },
  idleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  idleDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 280,
  },
  simulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginTop: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  simulateBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  clusterSummaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.md,
  },
  clusterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  clusterTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  clusterGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clusterCol: {
    flex: 1,
  },
  clusterLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  clusterVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  infoTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  stepNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.secondary,
  },
  stepText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
});
