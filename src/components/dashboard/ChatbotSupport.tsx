import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SendHorizontal, Bot } from "lucide-react";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
};

const jobSokoResponses = [
  {
    keywords: ["post", "job", "listing", "create"],
    response:
      "To post a new job, click on the 'Post a Job' button in the top navigation bar. You'll be guided through a step-by-step form to create your job listing.",
  },
  {
    keywords: ["candidate", "applicant", "application"],
    response:
      "You can view all applicants by clicking on 'View Applicants' in the dashboard. From there, you can filter candidates, review their profiles, and take actions like shortlisting or scheduling interviews.",
  },
  {
    keywords: ["payment", "subscription", "premium", "plan", "upgrade"],
    response:
      "JobSoko offers both free and premium plans. To upgrade your account, go to the 'Subscription' tab in your dashboard. Premium features include priority job visibility, verified employer badge, and advanced candidate filtering.",
  },
  {
    keywords: ["message", "chat", "communicate"],
    response:
      "You can message job seekers directly through our in-app messaging system. Just click on the 'Messages' button in your dashboard to view and send messages to candidates.",
  },
  {
    keywords: ["profile", "edit", "update"],
    response:
      "To update your profile information, click on the 'Settings' button in your dashboard. From there, you can edit your business details, contact information, and account settings.",
  },
  {
    keywords: ["verification", "verify", "badge"],
    response:
      "Verified employers get higher visibility in job listings. To get verified, upgrade to our Premium plan and complete the verification process in your account settings.",
  },
  {
    keywords: ["delete", "remove", "job"],
    response:
      "To delete a job listing, go to 'Manage Job Posts' in your dashboard, find the job you want to remove, and click on the delete button. This action cannot be undone.",
  },
  {
    keywords: ["interview", "schedule", "meeting"],
    response:
      "You can schedule interviews with candidates by selecting them in the applicants list and clicking 'Schedule Interview'. You can then set a date, time, and location for the interview.",
  },
  {
    keywords: ["notification", "alert"],
    response:
      "JobSoko sends notifications when new candidates apply to your jobs, when shortlisted applicants respond, or when job postings are expiring soon. You can manage notification settings in your account preferences.",
  },
  {
    keywords: ["rating", "review", "feedback"],
    response:
      "After hiring a candidate, you can rate and review their performance. This helps build a reliable community and helps other employers make informed hiring decisions.",
  },
  {
    keywords: ["task", "project", "management"],
    response:
      "The Task Board feature allows you to create and assign tasks to hired workers. You can track progress, set deadlines, and mark tasks as complete in the Project Management section.",
  },
  {
    keywords: ["filter", "sort", "search", "find"],
    response:
      "You can filter applications by experience level, ratings, or application date. Use the search and filter options in the Applicants section to find the most suitable candidates quickly.",
  },
  {
    keywords: ["password", "security", "login"],
    response:
      "To change your password or update security settings, go to the Settings section and select the Security tab. From there, you can update your password and manage other security preferences.",
  },
  {
    keywords: ["deactivate", "delete account"],
    response:
      "To deactivate or delete your account, go to Settings > Account > Deactivate Account. Please note that this action will remove all your job listings and application data.",
  },
  {
    keywords: ["help", "support", "contact"],
    response:
      "For additional support, you can contact our team at support@jobsoko.co.ke or call our helpline at +254 712 345 678. We're available Monday to Friday, 8 AM to 5 PM.",
  },
];

export default function ChatbotSupport() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm JobSoko Assistant. How can I help you today? I can answer questions about posting jobs, managing applications, subscription plans, and more.",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Generate bot response
    setTimeout(() => {
      const botResponse = generateResponse(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    }, 500);
  };

  const generateResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    // Check if input matches any keywords
    for (const item of jobSokoResponses) {
      if (item.keywords.some((keyword) => input.includes(keyword))) {
        return item.response;
      }
    }

    // Default response if no keywords match
    return "I can only answer questions related to JobSoko platform. For questions about posting jobs, managing applications, subscription plans, or other JobSoko features, please rephrase your question.";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center">
          <Bot className="h-5 w-5 mr-2 text-green-600" />
          JobSoko Support
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 pr-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} mb-4`}
            >
              {message.sender === "bot" && (
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src="/bot-avatar.png" alt="Bot" />
                  <AvatarFallback className="bg-green-100 text-green-800">
                    JS
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[80%] p-3 rounded-lg ${message.sender === "user" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-800"}`}
              >
                <p>{message.text}</p>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {message.sender === "user" && (
                <Avatar className="h-8 w-8 ml-2">
                  <AvatarImage
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                    alt="User"
                  />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex items-center">
          <Input
            placeholder="Type your question here..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 mr-2"
          />
          <Button
            onClick={handleSendMessage}
            className="bg-green-600 hover:bg-green-700 h-10 w-10 p-0"
          >
            <SendHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
