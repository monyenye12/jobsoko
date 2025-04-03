import { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";

type RecommendationParams = {
  userId: string;
  userSkills?: string[];
  userLocation?: string;
  preferredCategory?: string;
  searchHistory?: string[];
  applicationHistory?: string[];
  salaryRange?: [number | null, number | null];
  isRemote?: boolean;
  experienceLevel?: string;
  limit?: number;
};

export const useJobRecommendations = ({
  userId,
  userSkills = [],
  userLocation = "",
  preferredCategory = "",
  searchHistory = [],
  applicationHistory = [],
  salaryRange = [null, null],
  isRemote,
  experienceLevel,
  limit = 5,
}: RecommendationParams) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    fetchRecommendations();
  }, [
    userId,
    userSkills,
    userLocation,
    preferredCategory,
    isRemote,
    experienceLevel,
  ]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current date for deadline comparison
      const currentDate = new Date().toISOString().split("T")[0];

      // Start building the query
      let query = supabase
        .from("jobs")
        .select("*")
        .eq("status", "active")
        .gte("deadline", currentDate); // Only get jobs with deadlines in the future

      // Apply filters based on user preferences

      // Filter by skills if available
      if (userSkills && userSkills.length > 0) {
        // This is a simplified approach - in a real app, you'd use a more sophisticated matching algorithm
        query = query.contains("skills", userSkills);
      }

      // Filter by location if available
      if (userLocation) {
        // In a real app, you'd use geolocation to find nearby jobs
        query = query.ilike("location", `%${userLocation.split(",")[0]}%`);
      }

      // Filter by category if available
      if (preferredCategory) {
        query = query.eq("category", preferredCategory.toLowerCase());
      }

      // Filter by remote status if specified
      if (isRemote !== undefined) {
        query = query.eq("is_remote", isRemote);
      }

      // Filter by experience level if specified
      if (experienceLevel) {
        query = query.eq("experience_level", experienceLevel);
      }

      // Filter by salary range if specified
      if (salaryRange[0] !== null) {
        query = query.gte("salary_min", salaryRange[0]);
      }
      if (salaryRange[1] !== null) {
        query = query.lte("salary_max", salaryRange[1]);
      }

      // Exclude jobs the user has already applied to
      if (applicationHistory.length > 0) {
        query = query.not("id", "in", `(${applicationHistory.join(",")})`);
      }

      // Order by creation date and limit results
      query = query.order("created_at", { ascending: false }).limit(limit);

      const { data, error } = await query;

      if (error) throw error;

      if (data && data.length > 0) {
        // Calculate match percentage for each job
        const jobsWithMatchPercentage = data.map((job) => {
          const matchPercentage = calculateMatchPercentage(job, {
            userSkills,
            userLocation,
            preferredCategory,
            searchHistory,
            applicationHistory,
          });

          return {
            ...job,
            matchPercentage,
          };
        });

        // Sort by match percentage (highest first)
        jobsWithMatchPercentage.sort(
          (a, b) => b.matchPercentage - a.matchPercentage,
        );

        setRecommendations(jobsWithMatchPercentage);
      } else {
        // If no matching jobs found, fetch any recent active jobs as fallback
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("jobs")
          .select("*")
          .eq("status", "active")
          .gte("deadline", currentDate)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (fallbackError) throw fallbackError;

        // Add a default match percentage to fallback jobs
        const fallbackWithMatch = (fallbackData || []).map((job) => ({
          ...job,
          matchPercentage: 50, // Default match percentage for fallback jobs
        }));

        setRecommendations(fallbackWithMatch);
      }
    } catch (err: any) {
      console.error("Error fetching job recommendations:", err);
      setError(err.message || "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  // Calculate match percentage between a job and user profile
  const calculateMatchPercentage = (job: any, userProfile: any) => {
    let score = 0;
    let totalFactors = 0;

    // Skills match (highest weight)
    if (
      userProfile.userSkills &&
      userProfile.userSkills.length > 0 &&
      job.skills
    ) {
      totalFactors += 40;
      const jobSkills = Array.isArray(job.skills) ? job.skills : [];
      const matchingSkills = userProfile.userSkills.filter((skill) =>
        jobSkills.some(
          (jobSkill) =>
            typeof jobSkill === "string" &&
            jobSkill.toLowerCase().includes(skill.toLowerCase()),
        ),
      );

      if (matchingSkills.length > 0) {
        score +=
          40 *
          (matchingSkills.length / Math.max(userProfile.userSkills.length, 1));
      }
    }

    // Location match
    if (userProfile.userLocation && job.location) {
      totalFactors += 20;
      if (
        job.location
          .toLowerCase()
          .includes(userProfile.userLocation.toLowerCase())
      ) {
        score += 20;
      }
    }

    // Category match
    if (userProfile.preferredCategory && job.category) {
      totalFactors += 20;
      if (
        job.category.toLowerCase() ===
        userProfile.preferredCategory.toLowerCase()
      ) {
        score += 20;
      }
    }

    // Search history match
    if (userProfile.searchHistory && userProfile.searchHistory.length > 0) {
      totalFactors += 10;
      const matchingSearchTerms = userProfile.searchHistory.filter(
        (term) =>
          job.title.toLowerCase().includes(term.toLowerCase()) ||
          job.description.toLowerCase().includes(term.toLowerCase()),
      );

      if (matchingSearchTerms.length > 0) {
        score +=
          10 *
          (matchingSearchTerms.length /
            Math.max(userProfile.searchHistory.length, 1));
      }
    }

    // Application history match (similar jobs)
    if (
      userProfile.applicationHistory &&
      userProfile.applicationHistory.length > 0
    ) {
      totalFactors += 10;
      // This would require fetching the applied jobs and comparing them
      // For simplicity, we'll just add a small boost if the user has applied to jobs
      score += 5;
    }

    // Calculate final percentage (default to 50% if no factors)
    return totalFactors > 0 ? Math.round((score / totalFactors) * 100) : 50;
  };

  return { recommendations, loading, error, refetch: fetchRecommendations };
};

// Component to display job recommendations
export default function JobRecommendationEngine() {
  const { user, userProfile } = useAuth();
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [applicationHistory, setApplicationHistory] = useState<string[]>([]);

  // Fetch user's search and application history
  useEffect(() => {
    if (!user) return;

    const fetchUserHistory = async () => {
      try {
        // Fetch search history (mock implementation)
        setSearchHistory(["construction", "driver", "cleaner"]);

        // Fetch application history
        const { data, error } = await supabase
          .from("applications")
          .select("job_id")
          .eq("applicant_id", user.id);

        if (error) throw error;

        if (data) {
          setApplicationHistory(data.map((app) => app.job_id));
        }
      } catch (err) {
        console.error("Error fetching user history:", err);
      }
    };

    fetchUserHistory();
  }, [user]);

  const { recommendations, loading, error } = useJobRecommendations({
    userId: user?.id || "",
    userSkills: userProfile?.skills || [],
    userLocation: userProfile?.location || "",
    preferredCategory: userProfile?.preferredCategory || "",
    searchHistory,
    applicationHistory,
    limit: 10,
  });

  if (!user) {
    return <div>Please log in to see recommendations</div>;
  }

  if (loading) {
    return <div>Loading recommendations...</div>;
  }

  if (error) {
    return <div>Error loading recommendations: {error}</div>;
  }

  return (
    <div>
      <h2>Recommended Jobs for You</h2>
      {recommendations.length > 0 ? (
        <ul>
          {recommendations.map((job) => (
            <li key={job.id}>
              <h3>{job.title}</h3>
              <p>Match: {job.matchPercentage}%</p>
              <p>
                {job.company} • {job.location}
              </p>
              <p>{job.salary}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>
          No recommendations available. Try updating your profile with more
          skills.
        </p>
      )}
    </div>
  );
}
