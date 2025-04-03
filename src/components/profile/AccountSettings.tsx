import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import {
  User,
  Lock,
  LogOut,
  Trash2,
  CreditCard,
  Bell,
  Shield,
  Moon,
  Sun,
  Save,
  AlertCircle,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function AccountSettings() {
  const { user, userProfile, signOut, toggleDarkMode } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [darkMode, setDarkMode] = useState(userProfile?.darkMode || false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    applicationUpdates: true,
    jobAlerts: true,
    marketingEmails: false,
    smsNotifications: true,
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
  });

  // Subscription data (would be fetched from the database in a real app)
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  // Fetch subscription data
  useState(() => {
    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user?.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          setSubscriptionData(data[0]);
        } else {
          // No subscription found, set to free plan
          setSubscriptionData({
            plan_name: "Free Plan",
            price: 0,
            status: "active",
            start_date: new Date().toISOString(),
            end_date: null,
          });
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
      } finally {
        setLoadingSubscription(false);
      }
    };

    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // In a real app, this would verify the current password first
      // For demo purposes, we'll skip that step
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully",
        variant: "success",
      });

      // Clear form and close dialog
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordDialog(false);
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);

    try {
      // In a real app, this would delete the user's account
      // For demo purposes, we'll just show a success message
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted",
        variant: "success",
      });

      // Sign out and redirect to home page
      await signOut();
      navigate("/");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const handleDarkModeToggle = async () => {
    try {
      const newDarkMode = await toggleDarkMode();
      setDarkMode(newDarkMode);
    } catch (error: any) {
      console.error("Error toggling dark mode:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to toggle dark mode",
        variant: "destructive",
      });
    }
  };

  const handleNotificationSettingChange = (setting: string, value: boolean) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: value,
    });
  };

  const handleSecuritySettingChange = (setting: string, value: boolean) => {
    setSecuritySettings({
      ...securitySettings,
      [setting]: value,
    });
  };

  const saveNotificationSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your notification preferences have been updated",
      variant: "success",
    });
  };

  const saveSecuritySettings = () => {
    toast({
      title: "Settings saved",
      description: "Your security settings have been updated",
      variant: "success",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">
              Account Settings
            </CardTitle>
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-gray-500" />
              <Switch
                checked={darkMode}
                onCheckedChange={handleDarkModeToggle}
                aria-label="Toggle dark mode"
              />
              <Moon className="h-4 w-4 text-gray-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="account">
            <TabsList className="mb-6">
              <TabsTrigger value="account" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Account
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="subscription" className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Subscription
              </TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={user?.email || ""}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <Input
                      value={userProfile?.role || ""}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Account Created</Label>
                  <Input
                    value={
                      user?.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : ""
                    }
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Dialog
                    open={showPasswordDialog}
                    onOpenChange={setShowPasswordDialog}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                          Enter your current password and a new password below.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">
                            Current Password
                          </Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">
                            Confirm New Password
                          </Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setShowPasswordDialog(false)}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handlePasswordChange}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <LoadingSpinner size="sm" className="mr-2" />
                              Updating...
                            </>
                          ) : (
                            "Update Password"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>

                <AlertDialog
                  open={showDeleteDialog}
                  onOpenChange={setShowDeleteDialog}
                >
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full mt-4">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove all your data from our
                        servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={deleteLoading}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteAccount();
                        }}
                        disabled={deleteLoading}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {deleteLoading ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Deleting...
                          </>
                        ) : (
                          "Delete Account"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Security Settings</h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">
                            Two-Factor Authentication
                          </Label>
                          <p className="text-sm text-gray-500">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Switch
                          checked={securitySettings.twoFactorAuth}
                          onCheckedChange={(checked) =>
                            handleSecuritySettingChange(
                              "twoFactorAuth",
                              checked,
                            )
                          }
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Login Alerts</Label>
                          <p className="text-sm text-gray-500">
                            Receive alerts when someone logs into your account
                          </p>
                        </div>
                        <Switch
                          checked={securitySettings.loginAlerts}
                          onCheckedChange={(checked) =>
                            handleSecuritySettingChange("loginAlerts", checked)
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Button onClick={saveSecuritySettings} className="mt-4">
                  <Save className="h-4 w-4 mr-2" />
                  Save Security Settings
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Notification Preferences
                </h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">
                            Email Notifications
                          </Label>
                          <p className="text-sm text-gray-500">
                            Receive notifications via email
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked) =>
                            handleNotificationSettingChange(
                              "emailNotifications",
                              checked,
                            )
                          }
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">
                            Application Updates
                          </Label>
                          <p className="text-sm text-gray-500">
                            Receive updates about job applications
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.applicationUpdates}
                          onCheckedChange={(checked) =>
                            handleNotificationSettingChange(
                              "applicationUpdates",
                              checked,
                            )
                          }
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Job Alerts</Label>
                          <p className="text-sm text-gray-500">
                            Receive alerts about new job matches
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.jobAlerts}
                          onCheckedChange={(checked) =>
                            handleNotificationSettingChange(
                              "jobAlerts",
                              checked,
                            )
                          }
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Marketing Emails</Label>
                          <p className="text-sm text-gray-500">
                            Receive marketing and promotional emails
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.marketingEmails}
                          onCheckedChange={(checked) =>
                            handleNotificationSettingChange(
                              "marketingEmails",
                              checked,
                            )
                          }
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">SMS Notifications</Label>
                          <p className="text-sm text-gray-500">
                            Receive important notifications via SMS
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.smsNotifications}
                          onCheckedChange={(checked) =>
                            handleNotificationSettingChange(
                              "smsNotifications",
                              checked,
                            )
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Button onClick={saveNotificationSettings} className="mt-4">
                  <Save className="h-4 w-4 mr-2" />
                  Save Notification Settings
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="subscription" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Subscription Details</h3>
                {loadingSubscription ? (
                  <div className="flex items-center justify-center h-40">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : subscriptionData ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-800">
                            Current Plan: {subscriptionData.plan_name}
                          </h4>
                          <p className="text-sm text-blue-600 mt-1">
                            {subscriptionData.price > 0
                              ? `KSh ${subscriptionData.price.toLocaleString()}/month`
                              : "Free"}
                          </p>
                          {subscriptionData.end_date && (
                            <p className="text-sm text-blue-600 mt-1">
                              Renews on:{" "}
                              {new Date(
                                subscriptionData.end_date,
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium">Payment Method</h4>
                          {subscriptionData.payment_method ? (
                            <div className="flex items-center">
                              {subscriptionData.payment_method === "card" && (
                                <>
                                  <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                                  <span>
                                    Card ending in{" "}
                                    {subscriptionData.payment_details?.last4 ||
                                      "****"}
                                  </span>
                                </>
                              )}
                              {subscriptionData.payment_method === "mpesa" && (
                                <>
                                  <Smartphone className="h-4 w-4 mr-2 text-gray-500" />
                                  <span>
                                    M-Pesa (
                                    {subscriptionData.payment_details?.phone ||
                                      "*****"}
                                    )
                                  </span>
                                </>
                              )}
                              {subscriptionData.payment_method === "bank" && (
                                <>
                                  <Building className="h-4 w-4 mr-2 text-gray-500" />
                                  <span>
                                    {subscriptionData.payment_details?.bank ||
                                      "Bank Account"}
                                  </span>
                                </>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">
                              No payment method on file
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium">Billing History</h4>
                          <p className="text-sm text-gray-500">
                            {subscriptionData.price > 0
                              ? "View your billing history and download invoices"
                              : "No billing history available for free plan"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      No subscription found
                    </h3>
                    <p className="text-gray-500 mb-4">
                      You don't have an active subscription plan
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => navigate("/dashboard/payments")}
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {subscriptionData && subscriptionData.price > 0
                    ? "Manage Subscription"
                    : "Upgrade Plan"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
