import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Send,
  Clock,
  CheckCircle,
  User,
  Briefcase,
  Calendar,
  ArrowLeft,
} from "lucide-react";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  job_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface Conversation {
  id: string;
  job_seeker_id: string;
  employer_id: string;
  job_id: string;
  job_seeker?: {
    id: string;
    full_name: string;
    profile_photo_url?: string;
  };
  employer?: {
    id: string;
    full_name: string;
    business_name?: string;
    profile_photo_url?: string;
  };
  job?: {
    id: string;
    title: string;
  };
  last_message_at: string;
  last_message?: string;
  unread_count?: number;
}

export default function MessagingInterface() {
  // Function to fetch employer's jobs
  const fetchEmployerJobs = async (employerId: string) => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title")
        .eq("employer_id", employerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching employer jobs:", error);
      return [];
    }
  };
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isEmployer = userProfile?.role === "employer";

  // Parse query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const jobId = params.get("job");
    const employerId = params.get("employer");
    const jobSeekerId = params.get("jobseeker");

    console.log("URL params:", { jobId, employerId, jobSeekerId });

    if (user) {
      if (jobId && (employerId || jobSeekerId)) {
        // Find or create conversation based on URL params
        findOrCreateConversation(jobId, employerId, jobSeekerId);
      } else if (employerId) {
        // If only employer ID is provided, try to find or create a conversation
        // This handles the case when clicking from applications
        fetchEmployerJobs(employerId).then((jobs) => {
          if (jobs && jobs.length > 0) {
            findOrCreateConversation(jobs[0].id, employerId, null);
          }
        });
      }
    }
  }, [location, user]);

  useEffect(() => {
    if (user) {
      fetchConversations();

      // Set up real-time subscription for new messages
      const messagesSubscription = supabase
        .channel("messages-channel")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: isEmployer
              ? `receiver_id=eq.${user.id}`
              : `receiver_id=eq.${user.id}`,
          },
          (payload) => {
            const newMessage = payload.new as Message;
            // If the message belongs to the current conversation, add it
            if (selectedConversation) {
              const isForCurrentConversation =
                (newMessage.sender_id === selectedConversation.job_seeker_id &&
                  newMessage.receiver_id ===
                    selectedConversation.employer_id) ||
                (newMessage.sender_id === selectedConversation.employer_id &&
                  newMessage.receiver_id ===
                    selectedConversation.job_seeker_id);

              if (
                isForCurrentConversation &&
                newMessage.job_id === selectedConversation.job_id
              ) {
                setMessages((prev) => [...prev, newMessage]);
                markMessageAsRead(newMessage.id);
              }
            }
            // Refresh conversations to update unread counts
            fetchConversations();
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(messagesSubscription);
      };
    }
  }, [user, selectedConversation]);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let query;

      if (isEmployer) {
        // For employers
        query = supabase
          .from("conversations")
          .select(
            `
            *,
            job_seeker:job_seeker_id(id, full_name, profile_photo_url),
            job:job_id(id, title)
            `,
          )
          .eq("employer_id", user.id)
          .order("last_message_at", { ascending: false });
      } else {
        // For job seekers
        query = supabase
          .from("conversations")
          .select(
            `
            *,
            employer:employer_id(id, full_name, business_name, profile_photo_url),
            job:job_id(id, title)
            `,
          )
          .eq("job_seeker_id", user.id)
          .order("last_message_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get unread message counts for each conversation
      const conversationsWithUnreadCounts = await Promise.all(
        (data || []).map(async (conversation) => {
          const { count, error: countError } = await supabase
            .from("messages")
            .select("id", { count: "exact" })
            .eq("job_id", conversation.job_id)
            .eq("receiver_id", user.id)
            .eq("read", false);

          if (countError) throw countError;

          // Get last message for preview
          const { data: lastMessageData, error: lastMessageError } =
            await supabase
              .from("messages")
              .select("content")
              .eq("job_id", conversation.job_id)
              .or(
                `sender_id.eq.${conversation.job_seeker_id},sender_id.eq.${conversation.employer_id}`,
              )
              .or(
                `receiver_id.eq.${conversation.job_seeker_id},receiver_id.eq.${conversation.employer_id}`,
              )
              .order("created_at", { ascending: false })
              .limit(1);

          if (lastMessageError) throw lastMessageError;

          return {
            ...conversation,
            unread_count: count || 0,
            last_message: lastMessageData?.[0]?.content || "",
          };
        }),
      );

      setConversations(conversationsWithUnreadCounts);

      // If there's a selected conversation, update it with the new data
      if (selectedConversation) {
        const updatedConversation = conversationsWithUnreadCounts.find(
          (c) => c.id === selectedConversation.id,
        );
        if (updatedConversation) {
          setSelectedConversation(updatedConversation);
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const findOrCreateConversation = async (
    jobId: string,
    employerId: string | null,
    jobSeekerId: string | null,
  ) => {
    console.log("Finding conversation with params:", {
      jobId,
      employerId,
      jobSeekerId,
    });
    if (!user) return;

    try {
      let query;

      if (isEmployer && jobSeekerId) {
        // Employer looking for conversation with job seeker
        query = supabase
          .from("conversations")
          .select("*")
          .eq("job_id", jobId)
          .eq("employer_id", user.id)
          .eq("job_seeker_id", jobSeekerId)
          .single();
      } else if (!isEmployer && employerId) {
        // Job seeker looking for conversation with employer
        query = supabase
          .from("conversations")
          .select("*")
          .eq("job_id", jobId)
          .eq("employer_id", employerId)
          .eq("job_seeker_id", user.id)
          .single();
      } else {
        return; // Invalid parameters
      }

      const { data, error } = await query;

      if (error && error.code !== "PGRST116") {
        // PGRST116 is the error code for "No rows found"
        throw error;
      }

      if (data) {
        // Conversation exists, select it
        const conversation = await getConversationDetails(data.id);
        if (conversation) {
          setSelectedConversation(conversation);
          fetchMessages(conversation);
        }
      } else {
        // Create new conversation
        const newConversation = {
          job_id: jobId,
          employer_id: isEmployer ? user.id : employerId,
          job_seeker_id: isEmployer ? jobSeekerId : user.id,
        };

        const { data: createdData, error: createError } = await supabase
          .from("conversations")
          .insert([newConversation])
          .select()
          .single();

        if (createError) throw createError;

        if (createdData) {
          const conversation = await getConversationDetails(createdData.id);
          if (conversation) {
            setSelectedConversation(conversation);
            fetchConversations(); // Refresh the list
          }
        }
      }
    } catch (error) {
      console.error("Error finding or creating conversation:", error);
      toast({
        title: "Error",
        description: "Failed to load or create conversation",
        variant: "destructive",
      });
    }
  };

  const getConversationDetails = async (conversationId: string) => {
    try {
      let query;

      if (isEmployer) {
        query = supabase
          .from("conversations")
          .select(
            `
            *,
            job_seeker:job_seeker_id(id, full_name, profile_photo_url),
            job:job_id(id, title)
            `,
          )
          .eq("id", conversationId)
          .single();
      } else {
        query = supabase
          .from("conversations")
          .select(
            `
            *,
            employer:employer_id(id, full_name, business_name, profile_photo_url),
            job:job_id(id, title)
            `,
          )
          .eq("id", conversationId)
          .single();
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error getting conversation details:", error);
      return null;
    }
  };

  const fetchMessages = async (conversation: Conversation) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("job_id", conversation.job_id)
        .or(
          `sender_id.eq.${conversation.job_seeker_id},sender_id.eq.${conversation.employer_id}`,
        )
        .or(
          `receiver_id.eq.${conversation.job_seeker_id},receiver_id.eq.${conversation.employer_id}`,
        )
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages(data || []);

      // Mark unread messages as read
      const unreadMessages = data?.filter(
        (msg) => !msg.read && msg.receiver_id === user?.id,
      );

      if (unreadMessages && unreadMessages.length > 0) {
        for (const msg of unreadMessages) {
          await markMessageAsRead(msg.id);
        }
        // Refresh conversations to update unread counts
        fetchConversations();
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("id", messageId);
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      setSendingMessage(true);

      const messageData = {
        sender_id: user.id,
        receiver_id: isEmployer
          ? selectedConversation.job_seeker_id
          : selectedConversation.employer_id,
        job_id: selectedConversation.job_id,
        content: newMessage.trim(),
        read: false,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("messages")
        .insert([messageData])
        .select();

      if (error) throw error;

      // Update conversation last_message_at
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", selectedConversation.id);

      // Add the new message to the list
      if (data && data[0]) {
        setMessages((prev) => [...prev, data[0]]);
      }

      // Clear the input
      setNewMessage("");

      // Refresh conversations
      fetchConversations();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffInDays === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
  };

  const filteredConversations = conversations.filter((conversation) => {
    const searchTerm = searchQuery.toLowerCase();
    const jobTitle = conversation.job?.title?.toLowerCase() || "";
    const personName = isEmployer
      ? conversation.job_seeker?.full_name?.toLowerCase() || ""
      : (
          conversation.employer?.business_name ||
          conversation.employer?.full_name ||
          ""
        ).toLowerCase();

    return jobTitle.includes(searchTerm) || personName.includes(searchTerm);
  });

  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Conversations List */}
      <div className="w-1/3 border-r bg-white overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              className="pl-9 pr-4 py-2 w-full"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedConversation?.id === conversation.id ? "bg-blue-50" : ""}`}
                onClick={() => selectConversation(conversation)}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    {isEmployer ? (
                      conversation.job_seeker?.profile_photo_url ? (
                        <AvatarImage
                          src={conversation.job_seeker.profile_photo_url}
                          alt={conversation.job_seeker.full_name}
                        />
                      ) : (
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.job_seeker_id}`}
                        />
                      )
                    ) : conversation.employer?.profile_photo_url ? (
                      <AvatarImage
                        src={conversation.employer.profile_photo_url}
                        alt={conversation.employer.full_name}
                      />
                    ) : (
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.employer_id}`}
                      />
                    )}
                    <AvatarFallback>
                      {isEmployer
                        ? conversation.job_seeker?.full_name?.[0] || "U"
                        : conversation.employer?.full_name?.[0] || "E"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-medium truncate">
                        {isEmployer
                          ? conversation.job_seeker?.full_name
                          : conversation.employer?.business_name ||
                            conversation.employer?.full_name}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatTime(conversation.last_message_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.job?.title}
                    </p>
                    <p className="text-sm truncate">
                      {conversation.last_message}
                    </p>
                  </div>
                  {conversation.unread_count &&
                    conversation.unread_count > 0 && (
                      <Badge className="ml-2 bg-blue-500">
                        {conversation.unread_count}
                      </Badge>
                    )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              {searchQuery
                ? "No conversations match your search"
                : "No conversations yet"}
            </div>
          )}
        </div>
      </div>

      {/* Message Thread */}
      <div className="w-2/3 flex flex-col bg-white">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-10 w-10">
                  {isEmployer ? (
                    selectedConversation.job_seeker?.profile_photo_url ? (
                      <AvatarImage
                        src={selectedConversation.job_seeker.profile_photo_url}
                        alt={selectedConversation.job_seeker.full_name}
                      />
                    ) : (
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.job_seeker_id}`}
                      />
                    )
                  ) : selectedConversation.employer?.profile_photo_url ? (
                    <AvatarImage
                      src={selectedConversation.employer.profile_photo_url}
                      alt={selectedConversation.employer.full_name}
                    />
                  ) : (
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.employer_id}`}
                    />
                  )}
                  <AvatarFallback>
                    {isEmployer
                      ? selectedConversation.job_seeker?.full_name?.[0] || "U"
                      : selectedConversation.employer?.full_name?.[0] || "E"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {isEmployer
                      ? selectedConversation.job_seeker?.full_name
                      : selectedConversation.employer?.business_name ||
                        selectedConversation.employer?.full_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedConversation.job?.title}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length > 0 ? (
                messages.map((message) => {
                  const isOwnMessage = message.sender_id === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          isOwnMessage
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p>{message.content}</p>
                        <div
                          className={`text-xs mt-1 flex justify-end items-center ${isOwnMessage ? "text-blue-100" : "text-gray-500"}`}
                        >
                          {formatTime(message.created_at)}
                          {isOwnMessage && message.read && (
                            <CheckCircle className="h-3 w-3 ml-1" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <MessageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    No messages yet
                  </h3>
                  <p className="text-gray-500 max-w-md">
                    Start the conversation by sending a message about the job
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  className="flex-1"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                >
                  {sendingMessage ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <MessageIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Select a conversation
            </h3>
            <p className="text-gray-500 max-w-md">
              Choose a conversation from the list to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Message icon component
function MessageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
