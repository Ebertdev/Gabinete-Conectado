'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/infrastructure/supabase/client';
import { User } from '@supabase/supabase-js';
import { Role, Plan, hasPermission } from '@/utils/permissions';

export interface UserProfile {
  id: string;
  email: string;
  nome: string;
  role: Role;
  gabinete_id: string;
  gabinete_nome?: string;
  gabinete_plano?: Plan;
}

interface AuthContextProps {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  can: (permission: string) => boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  profile: null,
  loading: true,
  can: () => false,
  signOut: async () => { },
});

function normalizeRole(value: unknown): Role {
  const role = String(value ?? 'Assessor').trim().toLowerCase();
  if (role === 'administrador' || role === 'admin') return 'Administrador';
  if (role === 'parlamentar') return 'Parlamentar';
  return 'Assessor';
}

function buildProfileFromAuth(user: User): UserProfile {
  const email = user.email ?? '';
  return {
    id: user.id,
    email,
    nome: (user.user_metadata?.full_name as string) || email.split('@')[0] || 'Usuário',
    role: normalizeRole(user.user_metadata?.role),
    gabinete_id: (user.user_metadata?.gabinete_id as string) ?? '',
  };
}

type ProfileRow = {
  id: string;
  email: string;
  nome: string;
  role: string | null;
  gabinete_id: string | null;
  gabinetes: { nome: string | null; plano: string | null } | { nome: string | null; plano: string | null }[] | null;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (authUser: User): Promise<UserProfile> => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          id, email, nome, role, gabinete_id,
          gabinetes (nome, plano)
        `)
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error.message, error.code, error.details);
        return buildProfileFromAuth(authUser);
      }

      if (!data) {
        console.warn('Profile not found in usuarios table; using auth metadata fallback.', authUser.id);
        return buildProfileFromAuth(authUser);
      }

      const profileRow = data as ProfileRow;
      const gabRaw = profileRow.gabinetes;
      const gab = Array.isArray(gabRaw) ? gabRaw[0] : gabRaw;
      return {
        id: profileRow.id,
        email: profileRow.email,
        nome: profileRow.nome,
        role: normalizeRole(profileRow.role),
        gabinete_id: profileRow.gabinete_id ?? '',
        gabinete_nome: gab?.nome ?? undefined,
        gabinete_plano: gab?.plano as Plan,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      const code =
        err && typeof err === 'object' && 'code' in err ? String(err.code) : undefined;
      const details =
        err && typeof err === 'object' && 'details' in err ? String(err.details) : undefined;
      console.error('Error fetching profile:', message, code, details);
      return buildProfileFromAuth(authUser);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const safeSetState = (updater: () => void) => {
      if (mounted) updater();
    };

    const applyUser = (authUser: User | null) => {
      if (!authUser) {
        safeSetState(() => {
          setUser(null);
          setProfile(null);
        });
        return;
      }

      safeSetState(() => {
        setUser(authUser);
        setProfile(buildProfileFromAuth(authUser));
      });

      void fetchProfile(authUser).then(nextProfile => {
        safeSetState(() => setProfile(nextProfile));
      });
    };

    const loadUserAndProfile = async () => {
      safeSetState(() => setLoading(true));
      const {
        data: { session },
      } = await supabase.auth.getSession();

      applyUser(session?.user ?? null);
      safeSetState(() => setLoading(false));
    };

    loadUserAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return;
      applyUser(session?.user ?? null);
      safeSetState(() => setLoading(false));
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const can = useCallback((permission: string) => {
    return hasPermission(profile?.role, permission);
  }, [profile?.role]);

  const value = useMemo(
    () => ({ user, profile, loading, can, signOut }),
    [user, profile, loading, can, signOut]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
