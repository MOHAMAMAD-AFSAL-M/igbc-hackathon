import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../constants/theme';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  subtitle?: string;
  accentColor?: string;
  onPress?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  iconName,
  iconColor,
  subtitle,
  accentColor,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        accentColor ? { borderColor: `${accentColor}44` } : null,
      ]}
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}1A` }]}>
          <Ionicons name={iconName} size={18} color={iconColor} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.valueRow}>
        <Text style={styles.valueText}>{value}</Text>
        {unit && <Text style={styles.unitText}>{unit}</Text>}
      </View>

      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    minHeight: 104,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 6,
  },
  valueText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  unitText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 2,
  },
});
