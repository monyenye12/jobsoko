import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Info,
  Clock,
  CheckCircle,
  FileText,
  Briefcase,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
  sender?: {
    full_name: string;
    avatar_url?: string;
  };
  receiver?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface Conversation {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
  role?: string;
  job_title?: string;
}

export default function ChatSystem() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(
    null,
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showProposalDialog, setShowProposalDialog] = useState(false);
  const [proposal, setProposal] = useState("");
  const [proposalJob, setProposalJob] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data for conversations
  const mockConversations: Conversation[] = [
    {
      id: "1",
      user_id: "101",
      full_name: "ABC Construction",
      avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=ABC",
      last_message: "When can you start the job?",
      last_message_time: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
      unread_count: 2,
      role: "employer",
      job_title: "Construction Worker",
    },
    {
      id: "2",
      user_id: "102",
      full_name: "Quick Deliveries Ltd",
      avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=QD",
      last_message: "Your application has been shortlisted.",
      last_message_time: new Date(
        Date.now() - 1000 * 60 * 60 * 2,
      ).toISOString(), // 2 hours ago
      unread_count: 0,
      role: "employer",
      job_title: "Delivery Driver",
    },
    {
      id: "3",
      user_id: "103",
      full_name: "CleanHome Services",
      avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=CHS",
      last_message: "Thanks for your interest. We'll review your application.",
      last_message_time: new Date(
        Date.now() - 1000 * 60 * 60 * 24,
      ).toISOString(), // 1 day ago
      unread_count: 0,
      role: "employer",
      job_title: "House Cleaner",
    },
    {
      id: "4",
      user_id: "104",
      full_name: "John Kamau",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
      last_message: "I'm interested in the construction job.",
      last_message_time: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      unread_count: 1,
      role: "job_seeker",
      job_title: "Construction Worker",
    },
    {
      id: "5",
      user_id: "105",
      full_name: "Mary Wanjiku",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=mary",
      last_message: "When is the interview scheduled?",
      last_message_time: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
      unread_count: 0,
      role: "job_seeker",
      job_title: "House Cleaner",
    },
  ];

  // Mock data for messages
  const mockMessages: Record<string, Message[]> = {
    "1": [
      {
        id: "m1",
        sender_id: "101",
        receiver_id: user?.id || "",
        content:
          "Hello! We've reviewed your application for the Construction Worker position.",
        created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        read: true,
        sender: {
          full_name: "ABC Construction",
          avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=ABC",
        },
      },
      {
        id: "m2",
        sender_id: "101",
        receiver_id: user?.id || "",
        content:
          "We're impressed with your experience and would like to discuss the position further.",
        created_at: new Date(Date.now() - 1000 * 60 * 59).toISOString(),
        read: true,
        sender: {
          full_name: "ABC Construction",
          avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=ABC",
        },
      },
      {
        id: "m3",
        sender_id: user?.id || "",
        receiver_id: "101",
        content:
          "Thank you for considering my application. I'm very interested in the position.",
        created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        read: true,
        sender: {
          full_name: userProfile?.fullName || "You",
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`,
        },
      },
      {
        id: "m4",
        sender_id: "101",
        receiver_id: user?.id || "",
        content: "Great! Are you available for an interview this week?",
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: true,
        sender: {
          full_name: "ABC Construction",
          avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=ABC",
        },
      },
      {
        id: "m5",
        sender_id: user?.id || "",
        receiver_id: "101",
        content: "Yes, I'm available on Wednesday and Thursday afternoon.",
        created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        read: true,
        sender: {
          full_name: userProfile?.fullName || "You",
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`,
        },
      },
      {
        id: "m6",
        sender_id: "101",
        receiver_id: user?.id || "",
        content:
          "Perfect! Let's schedule for Thursday at 2 PM. Can you come to our office in Westlands?",
        created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        read: true,
        sender: {
          full_name: "ABC Construction",
          avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=ABC",
        },
      },
      {
        id: "m7",
        sender_id: "101",
        receiver_id: user?.id || "",
        content: "When can you start the job?",
        created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        read: false,
        sender: {
          full_name: "ABC Construction",
          avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=ABC",
        },
      },
    ],
    "2": [
      {
        id: "m8",
        sender_id: "102",
        receiver_id: user?.id || "",
        content:
          "Hello! Thank you for applying to the Delivery Driver position.",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        read: true,
        sender: {
          full_name: "Quick Deliveries Ltd",
          avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=QD",
        },
      },
      {
        id: "m9",
        sender_id: "102",
        receiver_id: user?.id || "",
        content: "Your application has been shortlisted.",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        read: true,
        sender: {
          full_name: "Quick Deliveries Ltd",
          avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=QD",
        },
      },
    ],
    // Add more mock conversations as needed
  };

  // Mock jobs for proposals
  const mockJobs = [
    {
      id: "j1",
      title: "Construction Worker",
      company: "ABC Construction",
      location: "Westlands, Nairobi",
      employer_id: "101",
    },
    {
      id: "j2",
      title: "Delivery Driver",
      company: "Quick Deliveries Ltd",
      location: "Kilimani, Nairobi",
      employer_id: "102",
    },
    {
      id: "j3",
      title: "House Cleaner",
      company: "CleanHome Services",
      location: "Karen, Nairobi",
      employer_id: "103",
    },
  ];

  useEffect(() => {
    if (user) {
      // In a real implementation, fetch conversations from Supabase
      // For now, use mock data
      setConversations(mockConversations);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeConversation) {
      // In a real implementation, fetch messages from Supabase
      // For now, use mock data
      setMessages(mockMessages[activeConversation] || []);

      // Mark messages as read
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversation ? { ...conv, unread_count: 0 } : conv,
        ),
      );

      // Scroll to bottom of messages
      scrollToBottom();
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    const activeConv = conversations.find((c) => c.id === activeConversation);
    if (!activeConv) return;

    const newMsg: Message = {
      id: `m${Date.now()}`,
      sender_id: user?.id || "",
      receiver_id: activeConv.user_id,
      content: newMessage,
      created_at: new Date().toISOString(),
      read: false,
      sender: {
        full_name: userProfile?.fullName || "You",
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`,
      },
    };

    // In a real implementation, save message to Supabase
    // For now, update local state
    setMessages((prev) => [...prev, newMsg]);

    // Update conversation with last message
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversation
          ? {
              ...conv,
              last_message: newMessage,
              last_message_time: new Date().toISOString(),
            }
          : conv,
      ),
    );

    setNewMessage("");
  };

  const handleSendProposal = async () => {
    if (!proposal.trim() || !proposalJob) return;

    // Find or create conversation with employer
    let conversation = conversations.find(
      (c) => c.user_id === proposalJob.employer_id,
    );

    if (!conversation) {
      // Create new conversation
      const newConvId = `${Date.now()}`;
      conversation = {
        id: newConvId,
        user_id: proposalJob.employer_id,
        full_name: proposalJob.company,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${proposalJob.company}`,
        unread_count: 0,
        role: "employer",
        job_title: proposalJob.title,
      };

      setConversations((prev) => [conversation!, ...prev]);
    }

    // Create proposal message
    const proposalMsg: Message = {
      id: `m${Date.now()}`,
      sender_id: user?.id || "",
      receiver_id: proposalJob.employer_id,
      content: `JOB PROPOSAL: ${proposalJob.title}\n\n${proposal}`,
      created_at: new Date().toISOString(),
      read: false,
      sender: {
        full_name: userProfile?.fullName || "You",
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`,
      },
    };

    // In a real implementation, save message to Supabase
    // For now, update local state
    if (conversation.id === activeConversation) {
      setMessages((prev) => [...prev, proposalMsg]);
    }

    // Update conversation with last message
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversation!.id
          ? {
              ...conv,
              last_message: "Job Proposal: " + proposalJob.title,
              last_message_time: new Date().toISOString(),
            }
          : conv,
      ),
    );

    setShowProposalDialog(false);
    setProposal("");
    setProposalJob(null);

    toast({
      title: "Proposal Sent",
      description: `Your proposal for ${proposalJob.title} has been sent to ${proposalJob.company}.`,
    });
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conv.job_title &&
        conv.job_title.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Please log in to access messaging</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-16rem)] overflow-hidden rounded-lg border">
      {/* Conversations sidebar */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="w-full justify-start p-2 bg-transparent">
            <TabsTrigger value="all" className="flex-1">
              All
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex-1">
              Unread
            </TabsTrigger>
            {userProfile?.role === "job_seeker" ? (
              <TabsTrigger value="employers" className="flex-1">
                Employers
              </TabsTrigger>
            ) : (
              <TabsTrigger value="applicants" className="flex-1">
                Applicants
              </TabsTrigger>
            )}
          </TabsList>

          <ScrollArea className="h-[calc(100vh-20rem)]">
            <TabsContent value="all" className="m-0">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${activeConversation === conv.id ? "bg-gray-100" : ""} ${conv.unread_count > 0 ? "bg-blue-50 hover:bg-blue-50" : ""}`}
                    onClick={() => setActiveConversation(conv.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={conv.avatar_url} />
                        <AvatarFallback>{conv.full_name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="font-medium truncate">
                            {conv.full_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(
                              conv.last_message_time || "",
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                        {conv.job_title && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            Re: {conv.job_title}
                          </div>
                        )}
                        <div className="text-sm text-gray-600 truncate mt-1">
                          {conv.last_message}
                        </div>
                        {conv.unread_count > 0 && (
                          <Badge className="mt-1 bg-blue-500">
                            {conv.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No conversations found
                </div>
              )}
            </TabsContent>

            <TabsContent value="unread" className="m-0">
              {filteredConversations.filter((c) => c.unread_count > 0).length >
              0 ? (
                filteredConversations
                  .filter((c) => c.unread_count > 0)
                  .map((conv) => (
                    <div
                      key={conv.id}
                      className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${activeConversation === conv.id ? "bg-gray-100" : ""} bg-blue-50 hover:bg-blue-50`}
                      onClick={() => setActiveConversation(conv.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={conv.avatar_url} />
                          <AvatarFallback>{conv.full_name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="font-medium truncate">
                              {conv.full_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(
                                conv.last_message_time || "",
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                          {conv.job_title && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              Re: {conv.job_title}
                            </div>
                          )}
                          <div className="text-sm text-gray-600 truncate mt-1">
                            {conv.last_message}
                          </div>
                          <Badge className="mt-1 bg-blue-500">
                            {conv.unread_count}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No unread messages
                </div>
              )}
            </TabsContent>

            <TabsContent value="employers" className="m-0">
              {filteredConversations.filter((c) => c.role === "employer")
                .length > 0 ? (
                filteredConversations
                  .filter((c) => c.role === "employer")
                  .map((conv) => (
                    <div
                      key={conv.id}
                      className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${activeConversation === conv.id ? "bg-gray-100" : ""} ${conv.unread_count > 0 ? "bg-blue-50 hover:bg-blue-50" : ""}`}
                      onClick={() => setActiveConversation(conv.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={conv.avatar_url} />
                          <AvatarFallback>{conv.full_name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="font-medium truncate">
                              {conv.full_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(
                                conv.last_message_time || "",
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                          {conv.job_title && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              Re: {conv.job_title}
                            </div>
                          )}
                          <div className="text-sm text-gray-600 truncate mt-1">
                            {conv.last_message}
                          </div>
                          {conv.unread_count > 0 && (
                            <Badge className="mt-1 bg-blue-500">
                              {conv.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No employer conversations
                </div>
              )}
            </TabsContent>

            <TabsContent value="applicants" className="m-0">
              {filteredConversations.filter((c) => c.role === "job_seeker")
                .length > 0 ? (
                filteredConversations
                  .filter((c) => c.role === "job_seeker")
                  .map((conv) => (
                    <div
                      key={conv.id}
                      className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${activeConversation === conv.id ? "bg-gray-100" : ""} ${conv.unread_count > 0 ? "bg-blue-50 hover:bg-blue-50" : ""}`}
                      onClick={() => setActiveConversation(conv.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={conv.avatar_url} />
                          <AvatarFallback>{conv.full_name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="font-medium truncate">
                              {conv.full_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(
                                conv.last_message_time || "",
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                          {conv.job_title && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              Re: {conv.job_title}
                            </div>
                          )}
                          <div className="text-sm text-gray-600 truncate mt-1">
                            {conv.last_message}
                          </div>
                          {conv.unread_count > 0 && (
                            <Badge className="mt-1 bg-blue-500">
                              {conv.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No applicant conversations
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {userProfile?.role === "job_seeker" && (
          <div className="p-4 border-t mt-auto">
            <Dialog
              open={showProposalDialog}
              onOpenChange={setShowProposalDialog}
            >
              <DialogTrigger asChild>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Send Job Proposal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send a Job Proposal</DialogTitle>
                  <DialogDescription>
                    Send a proposal to an employer for a specific job. Make sure
                    to highlight your skills and experience.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Job</label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={proposalJob?.id || ""}
                      onChange={(e) => {
                        const job = mockJobs.find(
                          (j) => j.id === e.target.value,
                        );
                        setProposalJob(job || null);
                      }}
                    >
                      <option value="">Select a job</option>
                      {mockJobs.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.title} at {job.company}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Proposal</label>
                    <Textarea
                      placeholder="Describe why you're a good fit for this job..."
                      value={proposal}
                      onChange={(e) => setProposal(e.target.value)}
                      rows={6}
                    />
                    <p className="text-xs text-gray-500">
                      Include relevant experience, skills, and availability.
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowProposalDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendProposal}
                    disabled={!proposal.trim() || !proposalJob}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Send Proposal
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={
                      conversations.find((c) => c.id === activeConversation)
                        ?.avatar_url
                    }
                  />
                  <AvatarFallback>
                    {
                      conversations.find((c) => c.id === activeConversation)
                        ?.full_name[0]
                    }
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">
                    {
                      conversations.find((c) => c.id === activeConversation)
                        ?.full_name
                    }
                  </h3>
                  {conversations.find((c) => c.id === activeConversation)
                    ?.job_title && (
                    <p className="text-xs text-gray-500">
                      Re:{" "}
                      {
                        conversations.find((c) => c.id === activeConversation)
                          ?.job_title
                      }
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isOwnMessage = msg.sender_id === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div className="flex gap-2 max-w-[80%]">
                        {!isOwnMessage && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={msg.sender?.avatar_url} />
                            <AvatarFallback>
                              {msg.sender?.full_name[0]}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <div
                            className={`p-3 rounded-lg ${isOwnMessage ? "bg-blue-500 text-white" : "bg-gray-100"} ${msg.content.startsWith("JOB PROPOSAL:") ? "border-2 border-green-500" : ""}`}
                          >
                            {msg.content.startsWith("JOB PROPOSAL:") ? (
                              <div>
                                <div className="font-medium text-green-700 mb-1">
                                  {msg.content.split("\n")[0]}
                                </div>
                                <div className="whitespace-pre-line">
                                  {msg.content.split("\n\n")[1]}
                                </div>
                              </div>
                            ) : (
                              <p className="whitespace-pre-line">
                                {msg.content}
                              </p>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {isOwnMessage && msg.read && (
                              <span className="flex items-center ml-2">
                                <CheckCircle className="h-3 w-3 text-blue-500 mr-1" />
                                Read
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Select a conversation
            </h3>
            <p className="text-gray-500 max-w-md">
              Choose a conversation from the list or start a new one by sending
              a job proposal.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Component for job proposal form
export function JobProposalForm({
  jobId,
  jobTitle,
  company,
}: {
  jobId: string;
  jobTitle: string;
  company: string;
}) {
  const [proposal, setProposal] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposal.trim()) return;

    setLoading(true);

    try {
      // In a real implementation, save proposal to Supabase
      // For now, just show success message
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast({
        title: "Proposal Sent",
        description: `Your proposal for ${jobTitle} has been sent to ${company}.`,
      });

      setProposal("");
    } catch (error) {
      console.error("Error sending proposal:", error);
      toast({
        title: "Error",
        description: "Failed to send proposal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Please log in to send a proposal</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Send a Proposal for {jobTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Cover Letter</label>
            <Textarea
              placeholder="Introduce yourself and explain why you're a good fit for this position..."
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              rows={6}
              required
            />
            <p className="text-xs text-gray-500">
              Include your relevant experience, skills, and availability.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Attach your resume (optional)</span>
            <Button variant="outline" size="sm" className="ml-auto">
              <Paperclip className="h-3 w-3 mr-1" /> Attach
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={!proposal.trim() || loading}
          >
            {loading ? "Sending..." : "Send Proposal"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
