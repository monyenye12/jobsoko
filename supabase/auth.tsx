import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { Navigate } from "react-router-dom";

type UserRole = "job_seeker" | "employer" | "admin";

type UserProfile = {
  role: UserRole;
  fullName: string;
  phone?: string;
  location?: string;
  skills?: string[];
  preferredCategory?: string;
  businessName?: string;
  businessType?: string;
  avatar?: string;
  rating?: number;
  verified?: boolean;
};

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state (signed in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (data) {
        setUserProfile({
          role: data.role || "job_seeker",
          fullName: data.full_name || "",
          phone: data.phone || "",
          location: data.location || "",
          skills: data.skills || [],
          preferredCategory: data.preferred_category || "",
          businessName: data.business_name || "",
          businessType: data.business_type || "",
          avatar: data.avatar_url || "",
          rating: data.rating || 0,
          verified: data.verified || false,
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.fullName,
          role: userData.role,
        },
        emailRedirectTo: `${window.location.origin}/login?verified=true`,
      },
    });

    if (error) throw error;

    if (data.user) {
      // Create user profile in the users table
      const { error: profileError } = await supabase.from("users").insert([
        {
          id: data.user.id,
          email: email,
          full_name: userData.fullName,
          role: userData.role,
          phone: userData.phone || null,
          location: userData.location || null,
          skills: userData.skills || null,
          preferred_category: userData.preferredCategory || null,
          business_name: userData.businessName || null,
          business_type: userData.businessType || null,
          created_at: new Date().toISOString(),
          verified: false,
          rating: 0,
        },
      ]);

      if (profileError) throw profileError;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("users")
      .update({
        full_name: data.fullName,
        phone: data.phone,
        location: data.location,
        skills: data.skills,
        preferred_category: data.preferredCategory,
        business_name: data.businessName,
        business_type: data.businessType,
        avatar_url: data.avatar,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) throw error;

    // Update local state
    setUserProfile((prev) => (prev ? { ...prev, ...data } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Add the PrivateRoute component
export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
}
