import { supabase } from "../../../supabase/supabase";

// This function can be imported and used directly in the PostJobForm component
export const notifyMatchingUsers = async (jobId: string) => {
  try {
    console.log("Sending job notifications for job ID:", jobId);

    // Try all available notification functions in sequence until one succeeds
    const notificationFunctions = [
      "email_notification",
      "job_notification_enhanced",
      "job_notification",
    ];

    let data = null;
    let error = null;
    let success = false;

    // Try each function in sequence until one succeeds
    for (const functionName of notificationFunctions) {
      try {
        console.log(`Attempting to invoke ${functionName} function...`);
        const result = await supabase.functions.invoke(functionName, {
          body: { job: { id: jobId } },
        });

        data = result.data;
        error = result.error;

        if (!error) {
          console.log(
            `Successfully sent notifications using ${functionName}:`,
            data,
          );
          success = true;
          break;
        } else {
          console.warn(`Function ${functionName} failed:`, error);
        }
      } catch (functionError) {
        console.error(`Error invoking ${functionName}:`, functionError);
      }
    }

    if (!success) {
      console.error("All notification functions failed");
      if (error) throw error;
      throw new Error(
        "Failed to send notifications through any available function",
      );
    }

    return data;
  } catch (error) {
    console.error("Error sending job notifications:", error);
    return null;
  }
};

// This hook can still be used in components that need toast notifications
export function useJobPostingNotification() {
  const notifyUsers = async (jobId: string) => {
    return await notifyMatchingUsers(jobId);
  };

  return { notifyMatchingUsers: notifyUsers };
}
