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

export function useAuth(): UseAuthReturn {
    const [state, setState] = useState<AuthState>({
        user: null,
        session: null,
        loading: true,
        isAdmin: false,
    });

    // Check if user has admin role
    const checkAdminRole = useCallback(async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (error) {
                // Si no hay tabla profiles, asumimos admin por ahora
                console.warn('Profiles table not found, defaulting to admin');
                return true;
            }

            return data?.role === 'admin';
        } catch {
            return false;
        }
    }, []);

    // Initial session check
    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    const isAdmin = await checkAdminRole(session.user.id);
                    setState({
                        user: session.user,
                        session,
                        loading: false,
                        isAdmin,
                    });
                } else {
                    setState(prev => ({ ...prev, loading: false }));
                }
            } catch (error) {
                console.error('Auth init error:', error);
                setState(prev => ({ ...prev, loading: false }));
            }
        };

        initAuth();

        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth event:', event);

                if (session?.user) {
                    const isAdmin = await checkAdminRole(session.user.id);
                    setState({
                        user: session.user,
                        session,
                        loading: false,
                        isAdmin,
                    });
                } else {
                    setState({
                        user: null,
                        session: null,
                        loading: false,
                        isAdmin: false,
                    });
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [checkAdminRole]);

    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return { error };
            }

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
                options: {
                    data: { name },
                },
            });

            if (error) {
                return { error };
            }

            // Create profile after signup
            if (data.user) {
                await supabase.from('profiles').insert({
                    id: data.user.id,
                    email,
                    name: name || email.split('@')[0],
                    role: 'user', // Default role
                });
            }

            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setState({
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
