import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';

export const DispatchModal: React.FC = () => {
  const { incomingDispatch, acceptDispatch, declineDispatch, dismissIncomingModal, prosumer } = useApp();

  if (!incomingDispatch) return null;

  const req = incomingDispatch.dispatch_requests;
  const requestedKw = incomingDispatch.requested_kw || 4.0;
  const durationHours = req ? (req.duration_minutes / 60) : 2.0;
  const estimatedEnergyKwh = requestedKw * durationHours;
  const estimatedIncentiveInr = Math.round(estimatedEnergyKwh * 10); // ₹10/kWh standard rate
  const clusterName = req?.cluster_name || 'Kalamassery Substation';

  // Projected SoC after dispatch
  const currentSoc = prosumer?.current_soc || 78;
  const batteryCap = prosumer?.battery_capacity_kwh || 13.5;
  const energyNeededPercent = (estimatedEnergyKwh / batteryCap) * 100;
  const projectedSoc = Math.max(prosumer?.minimum_reserve_soc || 20, Math.round(currentSoc - energyNeededPercent));

  return (
    <Modal
      transparent
      animationType="fade"
      visible={Boolean(incomingDispatch)}
      onRequestClose={dismissIncomingModal}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Urgent Header Banner */}
          <View style={styles.header}>
            <View style={styles.urgentIcon}>
              <Ionicons name="flash" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.urgentTitle}>GRID SUPPORT REQUEST</Text>
              <Text style={styles.urgentSubtitle}>KSEB VPP Demand Response Event</Text>
            </View>
            <TouchableOpacity onPress={dismissIncomingModal} style={styles.closeButton}>
              <Ionicons name="close" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Location / Cluster */}
          <View style={styles.clusterBox}>
            <Ionicons name="business" size={16} color={Colors.secondary} />
            <Text style={styles.clusterText}>Cluster: <Text style={styles.clusterHighlight}>{clusterName}</Text></Text>
          </View>

          {/* Key Parameters Grid */}
          <View style={styles.specsGrid}>
            <View style={styles.specTile}>
              <Text style={styles.specLabel}>Requested Output</Text>
              <Text style={styles.specValue}>{requestedKw.toFixed(1)} <Text style={styles.specUnit}>kW</Text></Text>
            </View>

            <View style={styles.specTile}>
              <Text style={styles.specLabel}>Event Duration</Text>
              <Text style={styles.specValue}>{durationHours.toFixed(1)} <Text style={styles.specUnit}>hrs</Text></Text>
            </View>

            <View style={styles.specTile}>
              <Text style={styles.specLabel}>Est. Energy</Text>
              <Text style={styles.specValue}>{estimatedEnergyKwh.toFixed(1)} <Text style={styles.specUnit}>kWh</Text></Text>
            </View>

            <View style={[styles.specTile, styles.incentiveTile]}>
              <Text style={styles.incentiveLabel}>Estimated Incentive</Text>
              <Text style={styles.incentiveValue}>₹{estimatedIncentiveInr}</Text>
            </View>
          </View>

          {/* Battery Reserve Impact Check */}
          <View style={styles.impactCard}>
            <View style={styles.impactHeader}>
              <Ionicons name="shield-checkmark" size={16} color={Colors.primary} />
              <Text style={styles.impactTitle}>Battery Reserve Protection</Text>
            </View>
            <Text style={styles.impactDesc}>
              Current SoC: <Text style={styles.boldText}>{currentSoc}%</Text> → Projected: <Text style={styles.boldText}>{projectedSoc}%</Text> (Safe above your {prosumer?.minimum_reserve_soc || 20}% reserve).
            </Text>
          </View>

          {/* Action Buttons: ACCEPT & DECLINE */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.declineButton}
              activeOpacity={0.8}
              onPress={() => declineDispatch(incomingDispatch.id)}
            >
              <Ionicons name="close-circle" size={18} color={Colors.danger} />
              <Text style={styles.declineText}>DECLINE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acceptButton}
              activeOpacity={0.8}
              onPress={() => acceptDispatch(incomingDispatch.id, requestedKw)}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.acceptText}>ACCEPT REQUEST</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 16, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalContent: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    padding: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  urgentIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  urgentTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  urgentSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
  },
  clusterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: Spacing.md,
  },
  clusterText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  clusterHighlight: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: Spacing.md,
  },
  specTile: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surfaceLight,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  specLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 4,
  },
  specValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  specUnit: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  incentiveTile: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  incentiveLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.solar,
    marginBottom: 4,
  },
  incentiveValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.solar,
  },
  impactCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    marginBottom: Spacing.lg,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  impactTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  impactDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  declineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.dangerGlow,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  declineText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.danger,
    letterSpacing: 0.5,
  },
  acceptButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  acceptText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
