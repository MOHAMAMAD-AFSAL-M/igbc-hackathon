import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../constants/theme';

interface SoCGaugeProps {
  soc: number;
  batteryCapacityKwh: number;
  availableEnergyKwh: number;
  minReserveSoc: number;
  batteryPowerKw: number;
}

export const SoCGauge: React.FC<SoCGaugeProps> = ({
  soc,
  batteryCapacityKwh,
  availableEnergyKwh,
  minReserveSoc,
  batteryPowerKw,
}) => {
  // Determine color based on SoC level
  const getSoCColor = (level: number) => {
    if (level <= minReserveSoc) return Colors.danger;
    if (level < 40) return Colors.warning;
    return Colors.primary;
  };

  const activeColor = getSoCColor(soc);
  const isDischarging = batteryPowerKw > 0.05;
  const isCharging = batteryPowerKw < -0.05;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <Ionicons name="battery-charging" size={20} color={activeColor} />
          <Text style={styles.cardTitle}>BATTERY STATE OF CHARGE</Text>
        </View>

        {/* Discharge/Charge Mode Tag */}
        <View
          style={[
            styles.modeBadge,
            {
              backgroundColor: isDischarging
                ? 'rgba(249, 115, 22, 0.15)'
                : isCharging
                ? 'rgba(16, 185, 129, 0.15)'
                : Colors.surfaceLight,
            },
          ]}
        >
          <Ionicons
            name={isDischarging ? 'arrow-up-circle' : isCharging ? 'arrow-down-circle' : 'pause-circle'}
            size={14}
            color={isDischarging ? Colors.statusHighStress : isCharging ? Colors.primary : Colors.textMuted}
          />
          <Text
            style={[
              styles.modeText,
              {
                color: isDischarging
                  ? Colors.statusHighStress
                  : isCharging
                  ? Colors.primary
                  : Colors.textMuted,
              },
            ]}
          >
            {isDischarging
              ? `Discharging ${Math.abs(batteryPowerKw).toFixed(1)} kW`
              : isCharging
              ? `Charging ${Math.abs(batteryPowerKw).toFixed(1)} kW`
              : 'Standby'}
          </Text>
        </View>
      </View>

      {/* Main SoC Number & Circular Display */}
      <View style={styles.centerDisplay}>
        <View style={[styles.outerRing, { borderColor: `${activeColor}33` }]}>
          <View style={[styles.innerCircle, { backgroundColor: Colors.surface }]}>
            <Text style={[styles.socPercent, { color: activeColor }]}>
              {Math.round(soc)}
              <Text style={styles.percentSymbol}>%</Text>
            </Text>
            <Text style={styles.socLabel}>CURRENT SOC</Text>

            <View style={styles.availableEnergyBox}>
              <Text style={styles.availableValue}>{availableEnergyKwh.toFixed(1)} kWh</Text>
              <Text style={styles.availableLabel}>GRID EXPORTABLE</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Progress Bar with Reserve SoC Marker */}
      <View style={styles.barContainer}>
        <View style={styles.barTrack}>
          {/* Main battery filled level */}
          <View
            style={[
              styles.barFill,
              {
                width: `${Math.min(100, Math.max(0, soc))}%`,
                backgroundColor: activeColor,
              },
            ]}
          />

          {/* Min reserve marker pin */}
          <View
            style={[
              styles.reserveMarker,
              { left: `${Math.min(100, Math.max(0, minReserveSoc))}%` },
            ]}
          >
            <View style={styles.reserveLine} />
          </View>
        </View>

        {/* Labels below progress bar */}
        <View style={styles.barLabelsRow}>
          <Text style={styles.barSubLabel}>0%</Text>
          <Text style={[styles.barSubLabel, { color: Colors.warning }]}>
            Reserve: {minReserveSoc}%
          </Text>
          <Text style={styles.barSubLabel}>Total: {batteryCapacityKwh} kWh</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  centerDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  outerRing: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 146,
    height: 146,
    borderRadius: 73,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socPercent: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1,
  },
  percentSymbol: {
    fontSize: 22,
    fontWeight: '600',
  },
  socLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginTop: -2,
  },
  availableEnergyBox: {
    marginTop: 6,
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: Colors.surfaceLight,
  },
  availableValue: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  availableLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: Colors.primaryLight,
    letterSpacing: 0.5,
  },
  barContainer: {
    marginTop: Spacing.md,
  },
  barTrack: {
    height: 10,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  reserveMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    alignItems: 'center',
  },
  reserveLine: {
    width: 2,
    height: '100%',
    backgroundColor: Colors.warning,
  },
  barLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  barSubLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
  },
});
