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
  education?: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate?: string;
    stillStudying?: boolean;
    description?: string;
  }[];
  bio?: string;
  hourlyRate?: number;
  dateOfBirth?: string;
  city?: string;
  state?: string;
  profilePhotoUrl?: string;
  darkMode?: boolean;
};

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  toggleDarkMode: () => Promise<boolean>;
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
      console.log("Fetching user profile for ID:", userId);

      // First, check if the user exists in the users table
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        setLoading(false);
        return;
      }

      if (!data) {
        console.error("No user data found for ID:", userId);

        // If no user data found, try to get role from auth metadata as fallback
        const { data: userData } = await supabase.auth.getUser();
        if (userData && userData.user && userData.user.user_metadata) {
          const role = userData.user.user_metadata.role || "job_seeker";
          console.log("Using role from auth metadata:", role);

          // Create a user record if it doesn't exist
          const { error: insertError } = await supabase.from("users").insert([
            {
              id: userId,
              email: userData.user.email,
              full_name: userData.user.user_metadata.full_name || "",
              role: role,
              created_at: new Date().toISOString(),
              verified: false,
              rating: 0,
            },
          ]);

          if (insertError) {
            console.error("Error creating missing user profile:", insertError);
          } else {
            console.log("Created missing user profile with role:", role);

            // Set basic profile with role from auth metadata
            setUserProfile({
              role: role as UserRole,
              fullName: userData.user.user_metadata.full_name || "",
              verified: false,
              rating: 0,
            });
          }
        }

        setLoading(false);
        return;
      }

      // Always use the role from the database, ignore localStorage
      const userRole = data.role || "job_seeker";
      console.log("User role from database:", userRole);

      // Clear any stored role to prevent conflicts
      localStorage.removeItem("userRole");

      setUserProfile({
        role: userRole as UserRole,
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
        education: data.education || [],
        bio: data.bio || "",
        hourlyRate: data.hourly_rate || null,
        dateOfBirth: data.date_of_birth || null,
        city: data.city || "",
        state: data.state || "",
        profilePhotoUrl: data.profile_photo_url || "",
        darkMode: data.dark_mode || false,
      });

      console.log("User profile set with role from database:", userRole);
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    console.log("Starting signup process with data:", { email, userData });

    try {
      // Ensure role is one of the valid types
      const role = userData.role === "employer" ? "employer" : "job_seeker";
      console.log("Using role:", role);

      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName,
            role: role, // Use validated role
          },
          emailRedirectTo: `${window.location.origin}/login?verified=true`,
        },
      });

      if (error) {
        console.error("Auth signup error:", error);
        throw error;
      }

      console.log("Auth signup successful, user data:", data);

      if (data.user) {
        try {
          // Create user profile in the users table with only essential fields
          console.log("Creating user profile in database with role:", role);
          const { error: profileError } = await supabase.from("users").insert([
            {
              id: data.user.id,
              email: email,
              full_name: userData.fullName,
              role: role, // Use validated role
              phone: userData.phone || null,
              location: userData.location || null,
              created_at: new Date().toISOString(),
              verified: false,
              rating: 0,
            },
          ]);

          if (profileError) {
            console.error("Error creating user profile:", profileError);
            throw new Error(
              `Failed to create user profile: ${profileError.message}`,
            );
          }

          // After successful profile creation, update with additional fields if needed
          if (
            role === "job_seeker" &&
            (userData.skills || userData.preferredCategory)
          ) {
            await supabase
              .from("users")
              .update({
                skills: userData.skills || null,
                preferred_category: userData.preferredCategory || null,
              })
              .eq("id", data.user.id);
          } else if (
            role === "employer" &&
            (userData.businessName || userData.businessType)
          ) {
            await supabase
              .from("users")
              .update({
                business_name: userData.businessName || null,
                business_type: userData.businessType || null,
              })
              .eq("id", data.user.id);
          }

          console.log("User profile created successfully with role:", role);
        } catch (err: any) {
          console.error("Error in profile creation:", err);
          throw new Error(`Profile creation failed: ${err.message}`);
        }
      } else {
        console.error("No user data returned from signup");
        throw new Error("Signup failed: No user data returned");
      }
    } catch (err: any) {
      console.error("Error in signup process:", err);
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log("Signing in user with email:", email);
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    console.log("Sign in successful, user:", data.user?.id);

    // Fetch user profile immediately after sign in to ensure role is set correctly
    if (data.user) {
      await fetchUserProfile(data.user.id);
    }
  };

  const signOut = async () => {
    // Clear any stored role before signing out
    localStorage.removeItem("userRole");

    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Clear user profile state
    setUserProfile(null);
    setUser(null);
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
        education: data.education,
        bio: data.bio,
        hourly_rate: data.hourlyRate,
        date_of_birth: data.dateOfBirth,
        city: data.city,
        state: data.state,
        profile_photo_url: data.profilePhotoUrl,
        dark_mode: data.darkMode,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) throw error;

    // Update local state
    setUserProfile((prev) => (prev ? { ...prev, ...data } : null));
  };

  const toggleDarkMode = async () => {
    try {
      if (!user || !userProfile) throw new Error("User not authenticated");

      const newDarkMode = !userProfile.darkMode;
      console.log("Toggling dark mode to:", newDarkMode);

      // Apply dark mode to document immediately for better UX
      if (newDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      // Update local state immediately
      setUserProfile((prev) =>
        prev ? { ...prev, darkMode: newDarkMode } : null,
      );

      // Then update in database
      await supabase
        .from("users")
        .update({
          dark_mode: newDarkMode,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      console.log("Dark mode updated successfully to:", newDarkMode);
      return newDarkMode;
    } catch (error) {
      console.error("Error toggling dark mode:", error);
      return userProfile?.darkMode || false;
    }
  };

  // Apply dark mode on initial load
  useEffect(() => {
    if (userProfile?.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [userProfile?.darkMode]);

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
        toggleDarkMode,
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

// Separate component definition from export to fix HMR issues
const PrivateRouteComponent = ({ children }: { children: React.ReactNode }) => {
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
};

// Export the component separately to ensure consistent exports
export const PrivateRoute = PrivateRouteComponent;
