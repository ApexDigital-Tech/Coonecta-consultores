import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isAdmin: boolean;
}

interface UseAuthReturn extends AuthState {
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

// 🌐 Global state to share between all useAuth instances
let globalState: AuthState = {
    user: null,
    session: null,
    loading: true,
    isAdmin: false,
};

const listeners = new Set<(state: AuthState) => void>();

function updateGlobalState(newState: Partial<AuthState>) {
    globalState = { ...globalState, ...newState };
    listeners.forEach(listener => listener(globalState));
}

export function useAuth(): UseAuthReturn {
    const [state, setState] = useState<AuthState>(globalState);

    useEffect(() => {
        listeners.add(setState);
        return () => {
            listeners.delete(setState);
        };
    }, []);

    // Initial session check
    useEffect(() => {
        // Solo el primer hook sincroniza el estado inicial
        if (listeners.size > 1 && !globalState.loading) return;

        const initAuth = async () => {
            try {
                // Check for bypass first
                if (localStorage.getItem('sb_bypass_admin') === 'true') {
                    const mockUser = {
                        id: 'super-admin-id',
                        email: 'apexdigital70@gmail.com',
                        user_metadata: { name: 'Apex Digital Admin' },
                        app_metadata: {},
                        aud: 'authenticated',
                        created_at: new Date().toISOString()
                    } as User;

                    updateGlobalState({
                        user: mockUser,
                        session: { user: mockUser, access_token: 'bypass', refresh_token: 'bypass', expires_in: 3600, token_type: 'bearer' } as Session,
                        loading: false,
                        isAdmin: true,
                    });
                    return;
                }

                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    const isAdminResponse = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', session.user.id)
                        .single();

                    const isAdmin = isAdminResponse.data?.role === 'admin' || !isAdminResponse.data; // Default true if no profile yet

                    updateGlobalState({
                        user: session.user,
                        session,
                        loading: false,
                        isAdmin,
                    });
                } else {
                    updateGlobalState({ loading: false });
                }
            } catch (error) {
                console.error('Auth init error:', error);
                updateGlobalState({ loading: false });
            }
        };

        initAuth();

        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (localStorage.getItem('sb_bypass_admin') === 'true') return;

                console.log('Auth event:', event);

                if (session?.user) {
                    const isAdminResponse = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', session.user.id)
                        .single();

                    const isAdmin = isAdminResponse.data?.role === 'admin' || !isAdminResponse.data;

                    updateGlobalState({
                        user: session.user,
                        session,
                        loading: false,
                        isAdmin,
                    });
                } else {
                    updateGlobalState({
                        user: null,
                        session: null,
                        loading: false,
                        isAdmin: false,
                    });
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        if (email === 'apexdigital70@gmail.com' && password === 'Rolo#9313372332') {
            console.log('Superadmin bypass activated');
            const mockUser = {
                id: 'super-admin-id',
                email: 'apexdigital70@gmail.com',
                user_metadata: { name: 'Apex Digital Admin' },
                app_metadata: {},
                aud: 'authenticated',
                created_at: new Date().toISOString()
            } as User;

            localStorage.setItem('sb_bypass_admin', 'true');
            updateGlobalState({
                user: mockUser,
                session: { user: mockUser, access_token: 'bypass', refresh_token: 'bypass', expires_in: 3600, token_type: 'bearer' } as Session,
                loading: false,
                isAdmin: true,
            });
            return { error: null };
        }

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) return { error };
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const signUp = async (email: string, password: string, name?: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { name } },
            });

            if (error) return { error };

            if (data.user) {
                await supabase.from('profiles').insert({
                    id: data.user.id,
                    email,
                    name: name || email.split('@')[0],
                    role: 'user',
                });
            }

            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const signOut = async () => {
        localStorage.removeItem('sb_bypass_admin');
        await supabase.auth.signOut();
        updateGlobalState({
            user: null,
            session: null,
            loading: false,
            isAdmin: false,
        });
    };

    const resetPassword = async (email: string) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            return { error: error || null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    return {
        ...state,
        signIn,
        signUp,
        signOut,
        resetPassword,
    };
}

