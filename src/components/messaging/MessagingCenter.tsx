import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Search,
  Phone,
  SendHorizontal,
  MoreVertical,
  User,
  Users,
} from "lucide-react";

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unread: number;
  online: boolean;
  role: "employer" | "job_seeker";
  phone?: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

// Fix MessageSquare import
import { MessageSquare } from "lucide-react";

export default function MessagingCenter() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchContacts();
    }

    // Check if there's an applicant ID or employer ID in the URL query params
    const queryParams = new URLSearchParams(window.location.search);
    const applicantId = queryParams.get("applicant");
    const applicantName = queryParams.get("name");
    const employerId = queryParams.get("employer");
    const employerName = queryParams.get("employer_name");
    const jobId = queryParams.get("job_id");
    const jobTitle = queryParams.get("job_title");

    if (applicantId && applicantName) {
      // Create or select a contact for this applicant
      handleApplicantContact(applicantId, decodeURIComponent(applicantName));
    } else if (employerId) {
      // Create or select a contact for this employer
      handleEmployerContact(
        employerId,
        decodeURIComponent(employerName || "Employer"),
        jobId,
        jobTitle,
      );
    }
  }, [user]);

  const handleApplicantContact = async (
    applicantId: string,
    applicantName: string,
  ) => {
    // Check if we already have this contact
    const existingContact = contacts.find(
      (contact) => contact.id === applicantId,
    );

    if (existingContact) {
      setSelectedContact(existingContact);
    } else {
      // Create a new contact for this applicant
      const newContact: Contact = {
        id: applicantId,
        name: applicantName,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${applicantName}`,
        unread: 0,
        online: false,
        role: "job_seeker",
      };

      setContacts((prev) => [...prev, newContact]);
      setSelectedContact(newContact);
    }
  };

  const handleEmployerContact = async (
    employerId: string,
    employerName: string,
    jobId?: string | null,
    jobTitle?: string | null,
  ) => {
    // Check if we already have this contact
    const existingContact = contacts.find(
      (contact) => contact.id === employerId,
    );

    if (existingContact) {
      setSelectedContact(existingContact);
    } else {
      // Create a new contact for this employer
      const newContact: Contact = {
        id: employerId,
        name: employerName || "Employer",
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${employerName || "Employer"}`,
        unread: 0,
        online: false,
        role: "employer",
        lastMessage: jobTitle ? `About: ${jobTitle}` : undefined,
      };

      setContacts((prev) => [...prev, newContact]);
      setSelectedContact(newContact);

      // If we have a job ID, create an initial message
      if (jobId && jobTitle) {
        const initialMessage: Message = {
          id: `msg-${Date.now()}-initial`,
          sender_id: user?.id || "",
          receiver_id: employerId,
          content: `Hello, I'm interested in the "${jobTitle}" position. I'd like to discuss this opportunity further.`,
          created_at: new Date().toISOString(),
          read: false,
        };

        setMessages([initialMessage]);

        // Try to save the initial message to the database
        try {
          const { data, error } = await supabase
            .from("messages")
            .insert([
              {
                sender_id: user?.id,
                receiver_id: employerId,
                content: initialMessage.content,
                created_at: initialMessage.created_at,
                read: false,
              },
            ])
            .select();

          if (error) {
            console.error("Error saving initial message:", error);
          }

          // Create a notification for the employer
          await supabase.from("notifications").insert([
            {
              user_id: employerId,
              title: "New Job Inquiry",
              message: `${userProfile?.fullName || "A job seeker"} is interested in your "${jobTitle}" position`,
              type: "message",
              read: false,
              created_at: new Date().toISOString(),
            },
          ]);
        } catch (dbError) {
          console.error("Database error with initial message:", dbError);
        }
      }
    }
  };

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.id);

      // Set up real-time subscription for new messages
      const messagesSubscription = supabase
        .channel("messages-channel")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `sender_id=eq.${selectedContact.id},receiver_id=eq.${user?.id}`,
          },
          (payload) => {
            // Add the new message to the messages state
            const newMessage = payload.new as Message;
            if (
              newMessage.sender_id === selectedContact.id &&
              newMessage.receiver_id === user?.id
            ) {
              setMessages((currentMessages) => [
                ...currentMessages,
                newMessage,
              ]);
              scrollToBottom();
            }
          },
        )
        .subscribe();

      // Clean up subscription when component unmounts or selected contact changes
      return () => {
        supabase.removeChannel(messagesSubscription);
      };
    }
  }, [selectedContact, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchContacts = async () => {
    try {
      // In a real app, this would fetch from the database
      // For demo, we'll use mock data
      const mockContacts: Contact[] = [
        {
          id: "1",
          name: "ABC Construction",
          avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ABC",
          lastMessage: "When can you start the job?",
          lastMessageTime: new Date(
            new Date().setHours(new Date().getHours() - 1),
          ).toISOString(),
          unread: 2,
          online: true,
          role: "employer",
          phone: "+254 712 345 678",
        },
        {
          id: "2",
          name: "Quick Deliveries Ltd",
          avatar: "https://api.dicebear.com/7.x/initials/svg?seed=QD",
          lastMessage: "Your application has been received.",
          lastMessageTime: new Date(
            new Date().setHours(new Date().getHours() - 3),
          ).toISOString(),
          unread: 0,
          online: false,
          role: "employer",
          phone: "+254 723 456 789",
        },
        {
          id: "3",
          name: "John Doe",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
          lastMessage: "I'm interested in the position.",
          lastMessageTime: new Date(
            new Date().setDate(new Date().getDate() - 1),
          ).toISOString(),
          unread: 0,
          online: true,
          role: "job_seeker",
          phone: "+254 734 567 890",
        },
        {
          id: "4",
          name: "Mary Johnson",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mary",
          lastMessage: "Thank you for the opportunity.",
          lastMessageTime: new Date(
            new Date().setDate(new Date().getDate() - 2),
          ).toISOString(),
          unread: 0,
          online: false,
          role: "job_seeker",
          phone: "+254 745 678 901",
        },
      ];

      // Show all contacts regardless of role to ensure access to everything
      const filteredContacts = mockContacts;

      setContacts(filteredContacts);

      // Select first contact by default
      if (filteredContacts.length > 0 && !selectedContact) {
        setSelectedContact(filteredContacts[0]);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (contactId: string) => {
    try {
      // First try to get real messages from the database
      const { data: realMessages, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .or(`sender_id.eq.${contactId},receiver_id.eq.${contactId}`)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching real messages:", error);
      }

      // If we have real messages, use them
      if (realMessages && realMessages.length > 0) {
        setMessages(realMessages);
        // Mark messages as read
        markMessagesAsRead(contactId);
        return;
      }

      // Otherwise, use mock data
      const mockMessages: Message[] = [
        {
          id: "1",
          sender_id: contactId,
          receiver_id: user?.id || "",
          content:
            "Hello! I saw your application for the construction worker position.",
          created_at: new Date(
            new Date().setHours(new Date().getHours() - 24),
          ).toISOString(),
          read: true,
        },
        {
          id: "2",
          sender_id: user?.id || "",
          receiver_id: contactId,
          content: "Hi! Yes, I'm very interested in the position.",
          created_at: new Date(
            new Date().setHours(new Date().getHours() - 23),
          ).toISOString(),
          read: true,
        },
        {
          id: "3",
          sender_id: contactId,
          receiver_id: user?.id || "",
          content: "Great! Do you have experience in this field?",
          created_at: new Date(
            new Date().setHours(new Date().getHours() - 22),
          ).toISOString(),
          read: true,
        },
        {
          id: "4",
          sender_id: user?.id || "",
          receiver_id: contactId,
          content: "Yes, I have 3 years of experience in construction work.",
          created_at: new Date(
            new Date().setHours(new Date().getHours() - 21),
          ).toISOString(),
          read: true,
        },
        {
          id: "5",
          sender_id: contactId,
          receiver_id: user?.id || "",
          content: "That's perfect! When can you come in for an interview?",
          created_at: new Date(
            new Date().setHours(new Date().getHours() - 5),
          ).toISOString(),
          read: true,
        },
        {
          id: "6",
          sender_id: user?.id || "",
          receiver_id: contactId,
          content: "I'm available any day this week in the morning.",
          created_at: new Date(
            new Date().setHours(new Date().getHours() - 4),
          ).toISOString(),
          read: true,
        },
        {
          id: "7",
          sender_id: contactId,
          receiver_id: user?.id || "",
          content: "How about Wednesday at 10 AM?",
          created_at: new Date(
            new Date().setHours(new Date().getHours() - 3),
          ).toISOString(),
          read: true,
        },
        {
          id: "8",
          sender_id: user?.id || "",
          receiver_id: contactId,
          content: "Wednesday at 10 AM works perfectly for me.",
          created_at: new Date(
            new Date().setHours(new Date().getHours() - 2),
          ).toISOString(),
          read: true,
        },
        {
          id: "9",
          sender_id: contactId,
          receiver_id: user?.id || "",
          content:
            "Great! Our office is located in Westlands. I'll send you the exact address.",
          created_at: new Date(
            new Date().setHours(new Date().getHours() - 1.5),
          ).toISOString(),
          read: true,
        },
        {
          id: "10",
          sender_id: contactId,
          receiver_id: user?.id || "",
          content: "When can you start the job?",
          created_at: new Date(
            new Date().setHours(new Date().getHours() - 1),
          ).toISOString(),
          read: false,
        },
      ];

      // Only show messages for the selected contact
      const filteredMessages =
        contactId === "1" ? mockMessages : mockMessages.slice(0, 3);
      setMessages(filteredMessages);

      // Mark messages as read
      markMessagesAsRead(contactId);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const markMessagesAsRead = async (contactId: string) => {
    try {
      // In a real app, this would update the database
      // For demo, we'll just update the UI
      setContacts(
        contacts.map((contact) =>
          contact.id === contactId ? { ...contact, unread: 0 } : contact,
        ),
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedContact) return;

    try {
      // Create a new message object
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        sender_id: user?.id || "",
        receiver_id: selectedContact.id,
        content: messageInput,
        created_at: new Date().toISOString(),
        read: false,
      };

      // Try to save to the database first
      const { data, error } = await supabase
        .from("messages")
        .insert([
          {
            sender_id: user?.id,
            receiver_id: selectedContact.id,
            content: messageInput,
            created_at: new Date().toISOString(),
            read: false,
          },
        ])
        .select();

      if (error) {
        console.error("Error saving message to database:", error);
        // If database save fails, just update the UI
        setMessages([...messages, newMessage]);
      } else if (data && data.length > 0) {
        // If database save succeeds, use the returned message with its DB ID
        setMessages([...messages, data[0]]);

        // Create a notification for the recipient
        await supabase.from("notifications").insert([
          {
            user_id: selectedContact.id,
            title: "New Message",
            message: `You have a new message from ${userProfile?.fullName || user?.email}`,
            type: "message",
            read: false,
            created_at: new Date().toISOString(),
          },
        ]);
      } else {
        // Fallback to local update if no data returned
        setMessages([...messages, newMessage]);
      }

      setMessageInput("");

      // Update last message in contacts
      setContacts(
        contacts.map((contact) =>
          contact.id === selectedContact.id
            ? {
                ...contact,
                lastMessage: messageInput,
                lastMessageTime: new Date().toISOString(),
              }
            : contact,
        ),
      );

      // Scroll to bottom to show new message
      scrollToBottom();

      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredContacts = searchTerm
    ? contacts.filter((contact) =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : contacts;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="h-[calc(100vh-12rem)] flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-green-500" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <div className="flex h-full">
            {/* Contacts sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 ${selectedContact?.id === contact.id ? "bg-gray-100" : ""}`}
                      onClick={() => setSelectedContact(contact)}
                    >
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={contact.avatar} />
                          <AvatarFallback>{contact.name[0]}</AvatarFallback>
                        </Avatar>
                        {contact.online && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium truncate">
                            {contact.name}
                          </h4>
                          {contact.lastMessageTime && (
                            <span className="text-xs text-gray-500">
                              {formatTime(contact.lastMessageTime)}
                            </span>
                          )}
                        </div>
                        {contact.lastMessage && (
                          <p className="text-sm text-gray-500 truncate">
                            {contact.lastMessage}
                          </p>
                        )}
                      </div>
                      {contact.unread > 0 && (
                        <span className="bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {contact.unread}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No contacts found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat area */}
            <div className="w-2/3 flex flex-col">
              {selectedContact ? (
                <>
                  {/* Chat header */}
                  <div className="p-3 border-b flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={selectedContact.avatar} />
                        <AvatarFallback>
                          {selectedContact.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{selectedContact.name}</h3>
                        <p className="text-xs text-gray-500 flex items-center">
                          {selectedContact.online ? (
                            <>
                              <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                              Online
                            </>
                          ) : (
                            "Offline"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Phone className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => {
                      const isOwnMessage = message.sender_id === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                        >
                          {!isOwnMessage && (
                            <Avatar className="h-8 w-8 mr-2 mt-1">
                              <AvatarImage src={selectedContact.avatar} />
                              <AvatarFallback>
                                {selectedContact.name[0]}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${isOwnMessage ? "bg-green-500 text-white" : "bg-gray-100"}`}
                          >
                            <p className="whitespace-pre-wrap">
                              {message.content}
                            </p>
                            <p
                              className={`text-xs mt-1 ${isOwnMessage ? "text-green-100" : "text-gray-500"}`}
                            >
                              {new Date(message.created_at).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message input */}
                  <div className="p-3 border-t">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!messageInput.trim()}
                        className="bg-green-600 hover:bg-green-700 h-10 w-10 p-0"
                      >
                        <SendHorizontal className="h-5 w-5" />
                      </Button>
                    </div>
                    {selectedContact.phone && (
                      <p className="text-xs text-gray-500 mt-2">
                        Contact phone: {selectedContact.phone}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <MessageSquare className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium">
                      No conversation selected
                    </h3>
                    <p className="text-gray-500 mt-1">
                      Select a contact to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
