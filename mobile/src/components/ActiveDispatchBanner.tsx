import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';

export const ActiveDispatchBanner: React.FC = () => {
  const { activeDispatch, telemetry } = useApp();

  const [remainingSeconds, setRemainingSeconds] = useState(5640); // ~01:34:00
  const [deliveredKwh, setDeliveredKwh] = useState(1.7);

  useEffect(() => {
    if (!activeDispatch) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
      setDeliveredKwh((prev) => Number((prev + 0.001).toFixed(3)));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeDispatch]);

  if (!activeDispatch) return null;

  const requestedKw = activeDispatch.accepted_kw || activeDispatch.requested_kw || 4.0;
  // Live output slightly fluctuates near requested kW
  const currentOutputKw = telemetry.battery_power_kw > 0 ? telemetry.battery_power_kw : (requestedKw - 0.2);
  const estimatedRewardInr = Math.round(deliveredKwh * 10);

  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.card}>
      {/* Top Banner Status */}
      <View style={styles.topRow}>
        <View style={styles.statusGroup}>
          <View style={styles.pulsingDot} />
          <Text style={styles.statusTitle}>DISPATCH ACTIVE</Text>
        </View>

        <View style={styles.timerBadge}>
          <Ionicons name="time-outline" size={14} color={Colors.secondary} />
          <Text style={styles.timerText}>{formatTime(remainingSeconds)}</Text>
        </View>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <Text style={styles.label}>Requested</Text>
          <Text style={styles.val}>{requestedKw.toFixed(1)} kW</Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.label}>Current Output</Text>
          <Text style={[styles.val, { color: Colors.primary }]}>
            {currentOutputKw.toFixed(1)} kW
          </Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.label}>Energy Delivered</Text>
          <Text style={styles.val}>{deliveredKwh.toFixed(2)} kWh</Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.label}>Est. Reward</Text>
          <Text style={[styles.val, { color: Colors.solar }]}>₹{estimatedRewardInr}</Text>
        </View>
      </View>

      {/* Energy Flow Animation Bar */}
      <View style={styles.flowBar}>
        <Ionicons name="flash" size={14} color={Colors.primary} />
        <Text style={styles.flowText}>Supplying power to KSEB grid cluster</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    marginBottom: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  statusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulsingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 1,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
    fontVariant: ['tabular-nums'],
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  metricItem: {
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 4,
  },
  val: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  flowBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primaryGlow,
    paddingVertical: 6,
    borderRadius: 8,
  },
  flowText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primaryLight,
  },
});
