import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { DEMO_ACCOUNTS } from '../config/demoData';

export const SettingsScreen: React.FC = () => {
  const {
    profile,
    prosumer,
    cluster,
    updateAvailability,
    updateParticipationMode,
    updateSettings,
    loginWithDemo,
    signOut,
    isDemoMode,
    isConfigured,
  } = useApp();

  const [minReserve, setMinReserve] = useState(prosumer?.minimum_reserve_soc || 20);
  const [maxDischarge, setMaxDischarge] = useState(prosumer?.max_discharge_kw || 5.0);
  const [hasChanges, setHasChanges] = useState(false);

  const isAvailable = prosumer?.availability_status === 'AVAILABLE';
  const isAutoMode = prosumer?.participation_mode === 'AUTOMATIC';

  const handleReserveChange = (val: number) => {
    setMinReserve(val);
    setHasChanges(true);
  };

  const handleDischargeChange = (val: number) => {
    setMaxDischarge(val);
    setHasChanges(true);
  };

  const saveSettings = async () => {
    await updateSettings(maxDischarge, minReserve);
    setHasChanges(false);
    Alert.alert('Settings Saved', 'Battery reserve and discharge power updated.');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Title */}
      <View style={styles.titleSection}>
        <Text style={styles.screenTitle}>Settings & Controls</Text>
        <Text style={styles.screenSubtitle}>
          Configure your battery reserve and VPP participation rules
        </Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.name ? profile.name.charAt(0).toUpperCase() : 'P'}
          </Text>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{profile?.name || 'Anoop Kumar'}</Text>
          <Text style={styles.userPhone}>{profile?.phone || '+91 98470 12345'}</Text>
          <View style={styles.codeRow}>
            <View style={styles.codeBadge}>
              <Text style={styles.codeText}>{prosumer?.prosumer_code || 'P001'}</Text>
            </View>
            <Text style={styles.clusterBadgeText}>{cluster?.name || 'Kalamassery'} Substation</Text>
          </View>
        </View>
      </View>

      {/* Participation Rules Section */}
      <Text style={styles.sectionTitle}>PARTICIPATION SETTINGS</Text>

      {/* Availability Toggle */}
      <View style={styles.settingCard}>
        <View style={styles.settingLeft}>
          <Ionicons
            name="radio-button-on"
            size={20}
            color={isAvailable ? Colors.primary : Colors.danger}
          />
          <View>
            <Text style={styles.settingTitle}>Grid Availability</Text>
            <Text style={styles.settingDesc}>
              {isAvailable
                ? 'Your battery is discoverable for KSEB peak reduction'
                : 'Opted out from grid support requests'}
            </Text>
          </View>
        </View>

        <Switch
          value={isAvailable}
          onValueChange={(val) => updateAvailability(val ? 'AVAILABLE' : 'UNAVAILABLE')}
          trackColor={{ false: Colors.surfaceBorder, true: `${Colors.primary}88` }}
          thumbColor={isAvailable ? Colors.primary : '#94A3B8'}
        />
      </View>

      {/* Automatic vs Manual Mode */}
      <View style={styles.settingCard}>
        <View style={styles.settingLeft}>
          <Ionicons
            name="hardware-chip-outline"
            size={20}
            color={isAutoMode ? Colors.secondary : Colors.textMuted}
          />
          <View>
            <Text style={styles.settingTitle}>Participation Mode</Text>
            <Text style={styles.settingDesc}>
              {isAutoMode
                ? 'AUTOMATIC: Auto-accepts dispatches meeting your criteria'
                : 'MANUAL: Prompt for manual confirmation before each event'}
            </Text>
          </View>
        </View>

        <Switch
          value={isAutoMode}
          onValueChange={(val) => updateParticipationMode(val ? 'AUTOMATIC' : 'MANUAL')}
          trackColor={{ false: Colors.surfaceBorder, true: `${Colors.secondary}88` }}
          thumbColor={isAutoMode ? Colors.secondary : '#94A3B8'}
        />
      </View>

      {/* Battery Reserve Protection */}
      <View style={styles.settingCardColumn}>
        <View style={styles.settingRowHeader}>
          <Ionicons name="shield-checkmark-outline" size={18} color={Colors.warning} />
          <Text style={styles.settingTitle}>Minimum Battery Reserve (SoC)</Text>
          <Text style={[styles.valHighlight, { color: Colors.warning }]}>{minReserve}%</Text>
        </View>
        <Text style={styles.settingDesc}>
          The VPP engine will NEVER discharge your battery below this safety buffer for your own home use.
        </Text>

        <View style={styles.pillRow}>
          {[15, 20, 25, 30].map((socVal) => (
            <TouchableOpacity
              key={socVal}
              style={[
                styles.pillBtn,
                minReserve === socVal && styles.pillBtnActive,
              ]}
              onPress={() => handleReserveChange(socVal)}
            >
              <Text
                style={[
                  styles.pillText,
                  minReserve === socVal && styles.pillTextActive,
                ]}
              >
                {socVal}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Maximum Discharge Power */}
      <View style={styles.settingCardColumn}>
        <View style={styles.settingRowHeader}>
          <Ionicons name="flash-outline" size={18} color={Colors.primary} />
          <Text style={styles.settingTitle}>Maximum Discharge Power</Text>
          <Text style={[styles.valHighlight, { color: Colors.primary }]}>{maxDischarge.toFixed(1)} kW</Text>
        </View>
        <Text style={styles.settingDesc}>
          Inverter discharge limit allowed for grid feed-in during demand events.
        </Text>

        <View style={styles.pillRow}>
          {[3.0, 4.0, 5.0, 7.0].map((kwVal) => (
            <TouchableOpacity
              key={kwVal}
              style={[
                styles.pillBtn,
                maxDischarge === kwVal && styles.pillBtnActivePrimary,
              ]}
              onPress={() => handleDischargeChange(kwVal)}
            >
              <Text
                style={[
                  styles.pillText,
                  maxDischarge === kwVal && styles.pillTextActive,
                ]}
              >
                {kwVal.toFixed(1)} kW
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Preferred Support Hours */}
      <View style={styles.settingCard}>
        <View style={styles.settingLeft}>
          <Ionicons name="time-outline" size={20} color={Colors.textSecondary} />
          <View>
            <Text style={styles.settingTitle}>Preferred Support Window</Text>
            <Text style={styles.settingDesc}>
              18:00 – 22:00 (Kerala Evening Peak Demand Hours)
            </Text>
          </View>
        </View>
      </View>

      {/* Save Button */}
      {hasChanges && (
        <TouchableOpacity style={styles.saveBtn} onPress={saveSettings} activeOpacity={0.8}>
          <Text style={styles.saveBtnText}>SAVE PREFERENCES</Text>
        </TouchableOpacity>
      )}

      {/* Switch Demo Profile (For testing) */}
      <Text style={styles.sectionTitle}>SWITCH TEST PROSUMER PROFILE</Text>
      <View style={styles.demoSwitchRow}>
        {DEMO_ACCOUNTS.map((acc, idx) => (
          <TouchableOpacity
            key={acc.prosumer.prosumer_code}
            style={[
              styles.demoAccCard,
              prosumer?.prosumer_code === acc.prosumer.prosumer_code && styles.demoAccActive,
            ]}
            onPress={() => loginWithDemo(idx)}
          >
            <Text style={styles.demoAccCode}>{acc.prosumer.prosumer_code}</Text>
            <Text style={styles.demoAccName}>{acc.profile.name.split(' ')[0]}</Text>
            <Text style={styles.demoAccSub}>{acc.prosumer.battery_capacity_kwh} kWh</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutBtn} onPress={signOut} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
        <Text style={styles.signOutText}>SIGN OUT</Text>
      </TouchableOpacity>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  userPhone: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  codeBadge: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  clusterBadgeText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  settingDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  settingCardColumn: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.sm,
  },
  settingRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  valHighlight: {
    marginLeft: 'auto',
    fontSize: 15,
    fontWeight: '800',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Spacing.md,
  },
  pillBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  pillBtnActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: Colors.warning,
  },
  pillBtnActivePrimary: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  demoSwitchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  demoAccCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
  },
  demoAccActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryGlow,
  },
  demoAccCode: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  demoAccName: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  demoAccSub: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 1,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.dangerGlow,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: Spacing.xl,
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.danger,
    letterSpacing: 0.5,
  },
});
