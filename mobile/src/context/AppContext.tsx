import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Profile,
  Prosumer,
  Telemetry,
  DispatchParticipant,
  Incentive,
  Cluster,
  AvailabilityStatus,
  ParticipationMode,
} from '../types';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import {
  DEMO_ACCOUNTS,
  DEMO_CLUSTERS,
  INITIAL_DEMO_TELEMETRY,
  INITIAL_DISPATCH_REQUEST,
  DEMO_INCENTIVES,
} from '../config/demoData';

interface AppContextType {
  isConfigured: boolean;
  isDemoMode: boolean;
  isAuthenticated: boolean;
  profile: Profile | null;
  prosumer: Prosumer | null;
  cluster: Cluster | null;
  telemetry: Telemetry;
  telemetryHistory: Telemetry[];
  activeDispatch: DispatchParticipant | null;
  incomingDispatch: DispatchParticipant | null;
  incentives: Incentive[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loginWithDemo: (index?: number) => void;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    pass: string,
    name: string,
    phone: string,
    clusterId: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateAvailability: (status: AvailabilityStatus) => Promise<void>;
  updateParticipationMode: (mode: ParticipationMode) => Promise<void>;
  updateSettings: (maxDischargeKw: number, minReserveSoc: number) => Promise<void>;
  acceptDispatch: (participantId: string, acceptedKw?: number) => Promise<void>;
  declineDispatch: (participantId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  triggerDemoDispatch: () => void;
  dismissIncomingModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(!isSupabaseConfigured);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // default to logged in demo for instant testing
  const [profile, setProfile] = useState<Profile | null>(DEMO_ACCOUNTS[0].profile);
  const [prosumer, setProsumer] = useState<Prosumer | null>(DEMO_ACCOUNTS[0].prosumer);
  const [cluster, setCluster] = useState<Cluster | null>(DEMO_CLUSTERS[0]);
  const [telemetry, setTelemetry] = useState<Telemetry>(INITIAL_DEMO_TELEMETRY);
  const [telemetryHistory, setTelemetryHistory] = useState<Telemetry[]>([
    { ...INITIAL_DEMO_TELEMETRY, soc: 79, battery_power_kw: 0, timestamp: '14:20' },
    { ...INITIAL_DEMO_TELEMETRY, soc: 78.5, battery_power_kw: 0, timestamp: '14:25' },
    { ...INITIAL_DEMO_TELEMETRY, soc: 78, battery_power_kw: 0, timestamp: '14:30' },
  ]);
  const [activeDispatch, setActiveDispatch] = useState<DispatchParticipant | null>(null);
  const [incomingDispatch, setIncomingDispatch] = useState<DispatchParticipant | null>(INITIAL_DISPATCH_REQUEST);
  const [incentives, setIncentives] = useState<Incentive[]>(DEMO_INCENTIVES);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize or check Supabase session
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsDemoMode(true);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsDemoMode(false);
        setIsAuthenticated(true);
        loadUserData(session.user.id);
      } else {
        // Fallback to demo mode if no active session
        setIsDemoMode(true);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsDemoMode(false);
        setIsAuthenticated(true);
        loadUserData(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setProfile(null);
        setProsumer(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Fetch real user data from Supabase
  const loadUserData = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch profile
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (profErr) throw profErr;
      setProfile(prof);

      // 2. Fetch prosumer
      const { data: pros, error: prosErr } = await supabase
        .from('prosumers')
        .select('*, clusters(*)')
        .eq('user_id', userId)
        .single();
      if (prosErr) throw prosErr;

      if (pros) {
        setProsumer(pros);
        if (pros.clusters) {
          setCluster(pros.clusters);
        }

        // 3. Fetch telemetry
        const { data: telem } = await supabase
          .from('telemetry')
          .select('*')
          .eq('prosumer_id', pros.id)
          .order('timestamp', { ascending: false })
          .limit(20);
        if (telem && telem.length > 0) {
          setTelemetry(telem[0]);
          setTelemetryHistory(telem.reverse());
        }

        // 4. Fetch dispatches
        const { data: parts } = await supabase
          .from('dispatch_participants')
          .select('*, dispatch_requests(*, clusters(name))')
          .eq('prosumer_id', pros.id)
          .order('created_at', { ascending: false });

        if (parts) {
          const pending = parts.find((p) => p.status === 'PENDING');
          const active = parts.find((p) => p.status === 'ACTIVE' || p.status === 'ACCEPTED');
          if (pending) setIncomingDispatch(pending);
          if (active) setActiveDispatch(active);
        }

        // 5. Fetch incentives
        const { data: incs } = await supabase
          .from('incentives')
          .select('*, dispatch_requests(*, clusters(name))')
          .eq('prosumer_id', pros.id)
          .order('created_at', { ascending: false });
        if (incs) setIncentives(incs);
      }
    } catch (err: any) {
      console.warn('Supabase fetch error, maintaining state:', err?.message);
      setError(err?.message || 'Failed to fetch Supabase data');
    } finally {
      setIsLoading(false);
    }
  };

  // Realtime subscriptions
  useEffect(() => {
    if (!isSupabaseConfigured || !prosumer?.id) return;

    // Realtime subscription for incoming dispatches
    const dispatchChannel = supabase
      .channel('public:dispatch_participants')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dispatch_participants',
          filter: `prosumer_id=eq.${prosumer.id}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // New dispatch request allocated to this prosumer
            const { data } = await supabase
              .from('dispatch_participants')
              .select('*, dispatch_requests(*, clusters(name))')
              .eq('id', payload.new.id)
              .single();
            if (data) {
              setIncomingDispatch(data);
            }
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new.status === 'ACTIVE') {
              setActiveDispatch((prev) => (prev ? ({ ...prev, ...payload.new } as DispatchParticipant) : (payload.new as DispatchParticipant)));
              setIncomingDispatch(null);
            } else if (payload.new.status === 'COMPLETED') {
              setActiveDispatch(null);
              refreshData();
            }
          }
        }
      )
      .subscribe();

    // Realtime telemetry subscription
    const telemetryChannel = supabase
      .channel('public:telemetry')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'telemetry',
          filter: `prosumer_id=eq.${prosumer.id}`,
        },
        (payload) => {
          const newTelem = payload.new as Telemetry;
          setTelemetry(newTelem);
          setTelemetryHistory((prev) => [...prev.slice(-19), newTelem]);
          setProsumer((prev) => (prev ? { ...prev, current_soc: newTelem.soc } : null));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(dispatchChannel);
      supabase.removeChannel(telemetryChannel);
    };
  }, [prosumer?.id]);

  // Demo mode ticker: simulate battery/solar/grid fluctuations
  useEffect(() => {
    if (!isDemoMode) return;

    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const deltaSolar = (Math.random() - 0.5) * 0.2;
        const newSolar = Math.max(0, Math.min(6.5, Number((prev.solar_generation_kw + deltaSolar).toFixed(2))));
        
        // If active dispatch, battery is discharging
        let batteryPower = prev.battery_power_kw;
        let newSoc = prev.soc;
        if (activeDispatch?.status === 'ACCEPTED' || activeDispatch?.status === 'ACTIVE') {
          batteryPower = activeDispatch.accepted_kw || 3.8;
          newSoc = Math.max(20, Number((prev.soc - 0.05).toFixed(2)));
        } else {
          // Normal battery idle / slight charge
          batteryPower = -0.2;
          newSoc = Math.min(100, Number((prev.soc + 0.02).toFixed(2)));
        }

        const capacity = prosumer?.battery_capacity_kwh || 13.5;
        const minReserve = prosumer?.minimum_reserve_soc || 20;
        const availableEnergy = Math.max(0, Number((((newSoc - minReserve) / 100) * capacity).toFixed(2)));

        const nextTelem: Telemetry = {
          ...prev,
          soc: newSoc,
          solar_generation_kw: newSolar,
          battery_power_kw: batteryPower,
          available_energy_kwh: availableEnergy,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setTelemetryHistory((hist) => [...hist.slice(-14), nextTelem]);
        setProsumer((p) => (p ? { ...p, current_soc: newSoc } : null));
        return nextTelem;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isDemoMode, activeDispatch, prosumer?.battery_capacity_kwh, prosumer?.minimum_reserve_soc]);

  // Switch demo account
  const loginWithDemo = (index = 0) => {
    const acc = DEMO_ACCOUNTS[index] || DEMO_ACCOUNTS[0];
    setIsDemoMode(true);
    setIsAuthenticated(true);
    setProfile(acc.profile);
    setProsumer(acc.prosumer);
    const cl = DEMO_CLUSTERS.find((c) => c.id === acc.prosumer.cluster_id) || DEMO_CLUSTERS[0];
    setCluster(cl);
    setTelemetry({
      ...INITIAL_DEMO_TELEMETRY,
      prosumer_id: acc.prosumer.id,
      soc: acc.prosumer.current_soc,
    });
  };

  // Sign In
  const signIn = async (email: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!isSupabaseConfigured) {
        loginWithDemo(0);
        return { success: true };
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      if (data.user) {
        setIsAuthenticated(true);
        setIsDemoMode(false);
        await loadUserData(data.user.id);
      }
      return { success: true };
    } catch (err: any) {
      setError(err?.message || 'Login failed');
      return { success: false, error: err?.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up
  const signUp = async (
    email: string,
    pass: string,
    name: string,
    phone: string,
    clusterId: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!isSupabaseConfigured) {
        loginWithDemo(0);
        return { success: true };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            name,
            phone,
            role: 'PROSUMER',
          },
        },
      });
      if (error) throw error;

      if (data.user) {
        // Create prosumer record if not created by DB trigger
        const prosumerCode = `P-${Math.floor(1000 + Math.random() * 9000)}`;
        await supabase.from('prosumers').insert({
          user_id: data.user.id,
          prosumer_code: prosumerCode,
          cluster_id: clusterId,
          solar_capacity_kw: 5.0,
          battery_capacity_kwh: 13.5,
          max_discharge_kw: 5.0,
          minimum_reserve_soc: 20,
          current_soc: 80,
          availability_status: 'AVAILABLE',
          participation_mode: 'AUTOMATIC',
        });

        setIsAuthenticated(true);
        setIsDemoMode(false);
        await loadUserData(data.user.id);
      }
      return { success: true };
    } catch (err: any) {
      setError(err?.message || 'Sign up failed');
      return { success: false, error: err?.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    setProfile(null);
    setProsumer(null);
    setActiveDispatch(null);
    setIncomingDispatch(null);
  };

  // Availability status toggle
  const updateAvailability = async (status: AvailabilityStatus) => {
    if (!prosumer) return;
    setProsumer((p) => (p ? { ...p, availability_status: status } : null));

    if (isSupabaseConfigured && !isDemoMode) {
      await supabase
        .from('prosumers')
        .update({ availability_status: status })
        .eq('id', prosumer.id);
    }
  };

  // Participation mode toggle
  const updateParticipationMode = async (mode: ParticipationMode) => {
    if (!prosumer) return;
    setProsumer((p) => (p ? { ...p, participation_mode: mode } : null));

    if (isSupabaseConfigured && !isDemoMode) {
      await supabase
        .from('prosumers')
        .update({ participation_mode: mode })
        .eq('id', prosumer.id);
    }
  };

  // Update battery limits (Max discharge, Min reserve)
  const updateSettings = async (maxDischargeKw: number, minReserveSoc: number) => {
    if (!prosumer) return;
    setProsumer((p) =>
      p ? { ...p, max_discharge_kw: maxDischargeKw, minimum_reserve_soc: minReserveSoc } : null
    );

    if (isSupabaseConfigured && !isDemoMode) {
      await supabase
        .from('prosumers')
        .update({
          max_discharge_kw: maxDischargeKw,
          minimum_reserve_soc: minReserveSoc,
        })
        .eq('id', prosumer.id);
    }
  };

  // Accept incoming dispatch
  const acceptDispatch = async (participantId: string, acceptedKw?: number) => {
    const kw = acceptedKw || incomingDispatch?.requested_kw || 4.0;
    const updated: DispatchParticipant = {
      ...(incomingDispatch || (INITIAL_DISPATCH_REQUEST as any)),
      status: 'ACCEPTED',
      accepted_kw: kw,
      responded_at: new Date().toISOString(),
    };

    setActiveDispatch(updated);
    setIncomingDispatch(null);

    if (isSupabaseConfigured && !isDemoMode) {
      await supabase
        .from('dispatch_participants')
        .update({
          status: 'ACCEPTED',
          accepted_kw: kw,
          responded_at: new Date().toISOString(),
        })
        .eq('id', participantId);
    }
  };

  // Decline incoming dispatch
  const declineDispatch = async (participantId: string) => {
    setIncomingDispatch(null);

    if (isSupabaseConfigured && !isDemoMode) {
      await supabase
        .from('dispatch_participants')
        .update({
          status: 'DECLINED',
          responded_at: new Date().toISOString(),
        })
        .eq('id', participantId);
    }
  };

  const refreshData = async () => {
    if (isSupabaseConfigured && profile?.id) {
      await loadUserData(profile.id);
    }
  };

  // Live demonstration helper: Trigger an incoming dispatch on-demand!
  const triggerDemoDispatch = () => {
    setIncomingDispatch({
      ...INITIAL_DISPATCH_REQUEST,
      id: `dp-demo-${Date.now()}`,
      created_at: new Date().toISOString(),
      dispatch_requests: {
        id: `disp-demo-${Date.now()}`,
        cluster_id: cluster?.id || '11111111-0000-0000-0000-000000000001',
        cluster_name: `${cluster?.name || 'Kalamassery'} Substation`,
        requested_kw: 4.0,
        duration_minutes: 120,
        status: 'AWAITING_RESPONSES',
        created_at: new Date().toISOString(),
      },
    });
  };

  const dismissIncomingModal = () => {
    setIncomingDispatch(null);
  };

  return (
    <AppContext.Provider
      value={{
        isConfigured: isSupabaseConfigured,
        isDemoMode,
        isAuthenticated,
        profile,
        prosumer,
        cluster,
        telemetry,
        telemetryHistory,
        activeDispatch,
        incomingDispatch,
        incentives,
        isLoading,
        error,
        loginWithDemo,
        signIn,
        signUp,
        signOut,
        updateAvailability,
        updateParticipationMode,
        updateSettings,
        acceptDispatch,
        declineDispatch,
        refreshData,
        triggerDemoDispatch,
        dismissIncomingModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
