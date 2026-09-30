import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';

export const IncentivesScreen: React.FC = () => {
  const { incentives } = useApp();

  const totalIncentives = incentives.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalEnergy = incentives.reduce((sum, item) => sum + Number(item.energy_kwh), 0);
  const pendingSettlement = incentives
    .filter((item) => item.status !== 'SETTLED')
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const settledAmount = incentives
    .filter((item) => item.status === 'SETTLED')
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SETTLED':
        return Colors.statusNormal;
      case 'CALCULATED':
        return Colors.solar;
      case 'PENDING':
      default:
        return Colors.secondary;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Title */}
      <View style={styles.titleSection}>
        <Text style={styles.screenTitle}>Incentive Ledger</Text>
        <Text style={styles.screenSubtitle}>
          KSEB Grid Support Earnings & Bill Reductions
        </Text>
      </View>

      {/* Hero Earnings Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroLabel}>TOTAL INCENTIVES EARNED</Text>
          <View style={styles.rateBadge}>
            <Ionicons name="pricetag" size={12} color={Colors.solar} />
            <Text style={styles.rateText}>₹10 / kWh</Text>
          </View>
        </View>

        <Text style={styles.heroValue}>₹{totalIncentives.toFixed(2)}</Text>

        <View style={styles.heroBreakdown}>
          <View style={styles.breakdownCol}>
            <Text style={styles.breakdownLabel}>Settled (Bill Credit)</Text>
            <Text style={[styles.breakdownValue, { color: Colors.primary }]}>
              ₹{settledAmount.toFixed(2)}
            </Text>
          </View>
          <View style={styles.breakdownDivider} />
          <View style={styles.breakdownCol}>
            <Text style={styles.breakdownLabel}>Pending Settlement</Text>
            <Text style={[styles.breakdownValue, { color: Colors.solar }]}>
              ₹{pendingSettlement.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Metrics Row */}
      <View style={styles.statsRow}>
        <View style={styles.statTile}>
          <View style={[styles.statIconBox, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
            <Ionicons name="battery-charging" size={18} color={Colors.secondary} />
          </View>
          <Text style={styles.statValue}>{totalEnergy.toFixed(1)} kWh</Text>
          <Text style={styles.statLabel}>Total Supplied</Text>
        </View>

        <View style={styles.statTile}>
          <View style={[styles.statIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Ionicons name="trophy" size={18} color={Colors.primary} />
          </View>
          <Text style={styles.statValue}>{incentives.length}</Text>
          <Text style={styles.statLabel}>Events Participated</Text>
        </View>
      </View>

      {/* Transaction History Section */}
      <Text style={styles.sectionTitle}>PARTICIPATION HISTORY & SETTLEMENTS</Text>

      {incentives.map((item) => {
        const statusColor = getStatusColor(item.status);
        const formattedDate = new Date(item.created_at).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });

        return (
          <View key={item.id} style={styles.historyCard}>
            <View style={styles.historyTop}>
              <View>
                <Text style={styles.eventTitle}>
                  {item.dispatch_requests?.clusters?.name || 'Kalamassery'} Substation
                </Text>
                <Text style={styles.eventDate}>{formattedDate}</Text>
              </View>

              <View
                style={[
                  styles.statusTag,
                  { backgroundColor: `${statusColor}1A`, borderColor: statusColor },
                ]}
              >
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusTagText, { color: statusColor }]}>
                  {item.status}
                </Text>
              </View>
            </View>

            <View style={styles.historyBottom}>
              <View style={styles.paramItem}>
                <Text style={styles.paramLabel}>Energy</Text>
                <Text style={styles.paramValue}>{Number(item.energy_kwh).toFixed(1)} kWh</Text>
              </View>
              <View style={styles.paramItem}>
                <Text style={styles.paramLabel}>Rate</Text>
                <Text style={styles.paramValue}>₹{item.rate_per_kwh}/kWh</Text>
              </View>
              <View style={styles.paramItem}>
                <Text style={styles.paramLabel}>Payout</Text>
                <Text style={[styles.paramValue, { color: Colors.solar, fontWeight: '800' }]}>
                  ₹{Number(item.amount).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        );
      })}

      {/* Footer Info */}
      <View style={styles.footerNote}>
        <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
        <Text style={styles.footerNoteText}>
          Settled incentives are automatically credited against your monthly KSEB electricity bill.
        </Text>
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
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: Spacing.md,
    shadowColor: Colors.solar,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  rateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  rateText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.solar,
  },
  heroValue: {
    fontSize: 38,
    fontWeight: '900',
    color: Colors.solar,
    marginVertical: Spacing.sm,
    letterSpacing: -1,
  },
  heroBreakdown: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceLight,
    padding: 12,
    borderRadius: 12,
    marginTop: 6,
  },
  breakdownCol: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownDivider: {
    width: 1,
    backgroundColor: Colors.surfaceBorder,
  },
  breakdownLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statTile: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  historyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.sm,
  },
  historyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  eventDate: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  historyBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceLight,
    padding: 10,
    borderRadius: 10,
  },
  paramItem: {
    alignItems: 'center',
  },
  paramLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  paramValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceLight,
    padding: 12,
    borderRadius: 12,
    marginTop: Spacing.md,
  },
  footerNoteText: {
    fontSize: 11,
    color: Colors.textMuted,
    flex: 1,
    lineHeight: 16,
  },
});
