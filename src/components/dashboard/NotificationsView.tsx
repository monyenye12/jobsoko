import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Bell,
  CheckCircle,
  MessageSquare,
  Briefcase,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "message" | "application" | "job" | "system";
  read: boolean;
  created_at: string;
  user_id: string;
  link?: string;
}

export default function NotificationsView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      // In a real app, this would fetch from the notifications table
      // For demo, we'll use mock data
      const mockNotifications: Notification[] = [
        {
          id: "1",
          title: "New message from ABC Construction",
          message:
            "Hello! We've reviewed your application and would like to schedule an interview.",
          type: "message",
          read: false,
          created_at: new Date(
            new Date().setHours(new Date().getHours() - 2),
          ).toISOString(),
          user_id: user?.id || "",
          link: "/dashboard/messages",
        },
        {
          id: "2",
          title: "Application status updated",
          message:
            "Your application for Delivery Driver at Quick Deliveries has been shortlisted.",
          type: "application",
          read: false,
          created_at: new Date(
            new Date().setHours(new Date().getHours() - 5),
          ).toISOString(),
          user_id: user?.id || "",
          link: "/dashboard",
        },
        {
          id: "3",
          title: "New job matches your skills",
          message:
            "5 new jobs matching your skills have been posted in your area.",
          type: "job",
          read: true,
          created_at: new Date(
            new Date().setDate(new Date().getDate() - 1),
          ).toISOString(),
          user_id: user?.id || "",
          link: "/dashboard/map-jobs",
        },
        {
          id: "4",
          title: "Interview reminder",
          message:
            "Don't forget your interview with Retail Mart tomorrow at 10:00 AM.",
          type: "system",
          read: true,
          created_at: new Date(
            new Date().setDate(new Date().getDate() - 2),
          ).toISOString(),
          user_id: user?.id || "",
          link: "/dashboard/calendar",
        },
        {
          id: "5",
          title: "Profile completion reminder",
          message:
            "Complete your profile to increase your chances of getting hired.",
          type: "system",
          read: true,
          created_at: new Date(
            new Date().setDate(new Date().getDate() - 3),
          ).toISOString(),
          user_id: user?.id || "",
          link: "/profile/edit",
        },
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // In a real app, this would update the database
      setNotifications(
        notifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification,
        ),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // In a real app, this would update the database
      setNotifications(
        notifications.map((notification) => ({ ...notification, read: true })),
      );

      toast({
        title: "All notifications marked as read",
        description: "You've cleared all your unread notifications.",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      // In a real app, this would update the database
      setNotifications(
        notifications.filter(
          (notification) => notification.id !== notificationId,
        ),
      );

      toast({
        title: "Notification deleted",
        description: "The notification has been removed.",
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case "application":
        return <Briefcase className="h-5 w-5 text-green-500" />;
      case "job":
        return <Briefcase className="h-5 w-5 text-purple-500" />;
      case "system":
        return <Bell className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredNotifications = filter
    ? notifications.filter((notification) => notification.type === filter)
    : notifications;

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-xl font-semibold flex items-center">
              <Bell className="mr-2 h-5 w-5 text-yellow-500" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className={filter === null ? "bg-gray-100" : ""}
                onClick={() => setFilter(null)}
              >
                All
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={
                  filter === "message" ? "bg-blue-100 text-blue-800" : ""
                }
                onClick={() => setFilter("message")}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Messages
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={
                  filter === "application" ? "bg-green-100 text-green-800" : ""
                }
                onClick={() => setFilter("application")}
              >
                <Briefcase className="h-4 w-4 mr-1" />
                Applications
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={
                  filter === "job" ? "bg-purple-100 text-purple-800" : ""
                }
                onClick={() => setFilter("job")}
              >
                <Briefcase className="h-4 w-4 mr-1" />
                Jobs
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={
                  filter === "system" ? "bg-yellow-100 text-yellow-800" : ""
                }
                onClick={() => setFilter("system")}
              >
                <Bell className="h-4 w-4 mr-1" />
                System
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length > 0 ? (
            <div className="space-y-4 mt-4">
              {unreadCount > 0 && (
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={markAllAsRead}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark all as read
                  </Button>
                </div>
              )}

              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${notification.read ? "bg-white" : "bg-blue-50 border-blue-100"}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4
                          className={`font-medium ${notification.read ? "" : "text-blue-800"}`}
                        >
                          {notification.title}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleString(
                            "en-US",
                            {
                              hour: "numeric",
                              minute: "numeric",
                              hour12: true,
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>

                      <div className="flex justify-between items-center mt-3">
                        {notification.link && (
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto text-blue-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = notification.link || "";
                            }}
                          >
                            View details
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-red-500 ml-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">
                {filter ? `No ${filter} notifications` : "No notifications"}
              </h3>
              <p className="text-gray-500 mt-1">
                {filter
                  ? `You don't have any ${filter} notifications at the moment.`
                  : "You're all caught up! No new notifications at the moment."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
