import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { DEMO_ACCOUNTS, DEMO_CLUSTERS } from '../config/demoData';

export const AuthScreen: React.FC = () => {
  const { signIn, signUp, loginWithDemo, isLoading, isConfigured } = useApp();

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedClusterId, setSelectedClusterId] = useState(DEMO_CLUSTERS[0].id);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorMessage(null);
    if (!email || !password) {
      setErrorMessage('Please enter email and password');
      return;
    }

    if (isRegistering) {
      if (!name || !phone) {
        setErrorMessage('Please fill in your name and phone number');
        return;
      }
      const res = await signUp(email, password, name, phone, selectedClusterId);
      if (!res.success && res.error) {
        setErrorMessage(res.error);
      }
    } else {
      const res = await signIn(email, password);
      if (!res.success && res.error) {
        setErrorMessage(res.error);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header Branding */}
        <View style={styles.brandingBox}>
          <View style={styles.logoIcon}>
            <Ionicons name="flash" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.appTitle}>KSEB VPP Prosumer</Text>
          <Text style={styles.appSubtitle}>
            Virtual Power Plant & Distributed Battery Network
          </Text>
        </View>

        {/* Demo Fast Login Selector (Hackathon essential) */}
        <View style={styles.demoSection}>
          <View style={styles.demoHeader}>
            <Ionicons name="people" size={16} color={Colors.primary} />
            <Text style={styles.demoTitle}>QUICK DEMO SIGN-IN (PRESET PROSUMERS)</Text>
          </View>
          <View style={styles.demoAccountsRow}>
            {DEMO_ACCOUNTS.map((acc, idx) => (
              <TouchableOpacity
                key={acc.prosumer.prosumer_code}
                style={styles.demoBtn}
                onPress={() => loginWithDemo(idx)}
              >
                <Text style={styles.demoBtnCode}>{acc.prosumer.prosumer_code}</Text>
                <Text style={styles.demoBtnName}>{acc.profile.name.split(' ')[0]}</Text>
                <Text style={styles.demoBtnSub}>{acc.prosumer.battery_capacity_kwh} kWh</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR SIGN IN WITH SUPABASE</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            {isRegistering ? 'Register Prosumer Account' : 'Sign In to Your Node'}
          </Text>

          {errorMessage && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={Colors.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {isRegistering && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Anoop Kumar"
                  placeholderTextColor={Colors.textMuted}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+91 98470 XXXXX"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Select KSEB Substation Cluster</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clusterList}>
                  {DEMO_CLUSTERS.map((cl) => (
                    <TouchableOpacity
                      key={cl.id}
                      style={[
                        styles.clusterChip,
                        selectedClusterId === cl.id && styles.clusterChipActive,
                      ]}
                      onPress={() => setSelectedClusterId(cl.id)}
                    >
                      <Text
                        style={[
                          styles.clusterChipText,
                          selectedClusterId === cl.id && styles.clusterChipTextActive,
                        ]}
                      >
                        {cl.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="prosumer@kseb.in"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>
                {isRegistering ? 'CREATE PROSUMER ACCOUNT' : 'SIGN IN'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleModeBtn}
            onPress={() => {
              setIsRegistering(!isRegistering);
              setErrorMessage(null);
            }}
          >
            <Text style={styles.toggleModeText}>
              {isRegistering
                ? 'Already registered? Sign in here'
                : "New prosumer? Register your battery node"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Supabase Status notice */}
        <View style={styles.statusFooter}>
          <Ionicons
            name={isConfigured ? 'cloud-done' : 'information-circle'}
            size={14}
            color={isConfigured ? Colors.primary : Colors.warning}
          />
          <Text style={styles.statusFooterText}>
            {isConfigured
              ? 'Connected to live Supabase backend'
              : 'Demo Mode active (Configure .env for live Supabase)'}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingTop: 60,
    paddingBottom: 40,
  },
  brandingBox: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logoIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  demoSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: Spacing.md,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  demoTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  demoAccountsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  demoBtnCode: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  demoBtnName: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  demoBtnSub: {
    fontSize: 9,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 1,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.surfaceBorder,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.dangerGlow,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.danger,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    flex: 1,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  clusterList: {
    flexDirection: 'row',
    marginTop: 4,
  },
  clusterChip: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  clusterChipActive: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primary,
  },
  clusterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  clusterChipTextActive: {
    color: Colors.primary,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  toggleModeBtn: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  toggleModeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
  },
  statusFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.lg,
  },
  statusFooterText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
