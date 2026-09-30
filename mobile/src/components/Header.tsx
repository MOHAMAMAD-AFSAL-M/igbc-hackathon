import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { cluster, prosumer, triggerDemoDispatch, isDemoMode } = useApp();

  const getGridStatusColor = (status?: string) => {
    switch (status) {
      case 'CRITICAL':
        return Colors.statusCritical;
      case 'HIGH_STRESS':
        return Colors.statusHighStress;
      case 'WARNING':
        return Colors.statusWarning;
      case 'NORMAL':
      default:
        return Colors.statusNormal;
    }
  };

  const statusColor = getGridStatusColor(cluster?.grid_status);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Ionicons name="flash" size={18} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.brandTitle}>KSEB VPP</Text>
            <Text style={styles.brandSubtitle}>Prosumer Grid Node</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          {/* Quick Demo Trigger Button */}
          <TouchableOpacity
            style={styles.demoTriggerButton}
            onPress={triggerDemoDispatch}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={16} color={Colors.primary} />
            <Text style={styles.demoTriggerText}>Test Alert</Text>
          </TouchableOpacity>

          {/* Prosumer ID Badge */}
          <View style={styles.codeBadge}>
            <Text style={styles.codeText}>{prosumer?.prosumer_code || 'P001'}</Text>
          </View>
        </View>
      </View>

      {/* Cluster and Grid Status bar */}
      <View style={styles.clusterRow}>
        <View style={styles.clusterInfo}>
          <Ionicons name="location-sharp" size={14} color={Colors.secondary} />
          <Text style={styles.clusterName}>
            {cluster?.name || 'Kalamassery'} Substation
          </Text>
        </View>

        <View style={[styles.statusBadge, { borderColor: statusColor, backgroundColor: `${statusColor}1A` }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            GRID: {cluster?.grid_status?.replace('_', ' ') || 'NORMAL'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingTop: 48,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  demoTriggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: Colors.primaryGlow,
    borderWidth: 1,
    borderColor: `${Colors.primary}40`,
  },
  demoTriggerText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  codeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  codeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  clusterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  clusterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clusterName: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
