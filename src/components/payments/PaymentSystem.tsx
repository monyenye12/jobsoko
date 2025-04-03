import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../../supabase/auth";
import {
  DollarSign,
  CreditCard,
  Smartphone,
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Send,
  User,
  Briefcase,
  Calendar,
  ArrowRight,
  Lock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Transaction {
  id: string;
  type: "payment" | "withdrawal" | "escrow" | "refund";
  amount: number;
  status: "pending" | "completed" | "failed" | "cancelled";
  date: string;
  description: string;
  counterparty: {
    name: string;
    avatar?: string;
  };
  job?: {
    title: string;
    id: string;
  };
}

interface Contract {
  id: string;
  title: string;
  client: {
    name: string;
    avatar?: string;
  };
  worker: {
    name: string;
    avatar?: string;
  };
  amount: number;
  status: "draft" | "active" | "completed" | "cancelled" | "disputed";
  startDate: string;
  endDate?: string;
  description: string;
  terms: string[];
  paymentTerms: string;
  escrowId?: string;
}

export default function PaymentSystem() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddFundsDialog, setShowAddFundsDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showContractDialog, setShowContractDialog] = useState(false);
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  
  // Mock data
  const balance = 15000; // KSh
  const escrowBalance = 5000; // KSh
  const pendingPayments = 2500; // KSh
  
  const transactions: Transaction[] = [
    {
      id: "t1",
      type: "payment",
      amount: 3000,
      status: "completed",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      description: "Payment for construction work",
      counterparty: {
        name: "ABC Construction",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ABC"
      },
      job: {
        title: "Construction Worker",
        id: "j1"
      }
    },
    {
      id: "t2",
      type: "escrow",
      amount: 5000,
      status: "pending",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
      description: "Escrow for house cleaning contract",
      counterparty: {
        name: "CleanHome Services",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CHS"
      },
      job: {
        title: "House Cleaner",
        id: "j3"
      }
    },
    {
      id: "t3",
      type: "withdrawal",
      amount: 2000,
      status: "completed",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
      description: "Withdrawal to M-Pesa",
      counterparty: {
        name: "M-Pesa",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=MP"
      }
    },
    {
      id: "t4",
      type: "payment",
      amount: 1500,
      status: "completed",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
      description: "Payment for delivery services",
      counterparty: {
        name: "Quick Deliveries Ltd",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=QD"
      },
      job: {
        title: "Delivery Driver",
        id: "j2"
      }
    },
    {
      id: "t5",
      type: "refund",
      amount: 500,
      status: "completed",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(), // 20 days ago
      description: "Refund for cancelled job",
      counterparty: {
        name: "SecureLife Ltd",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SL"
      },
      job: {
        title: "Security Guard",
        id: "j5"
      }
    },
  ];
  
  const contracts: Contract[] = [
    {
      id: "c1",
      title: "House Cleaning Services",
      client: {
        name: "CleanHome Services",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CHS"
      },
      worker: {
        name: userProfile?.fullName || "You",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`
      },
      amount: 5000,
      status: "active",
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
      description: "Weekly house cleaning services for a residential property in Karen.",
      terms: [
        "Clean all rooms and bathrooms",
        "Dust and vacuum all areas",
        "Take out trash",
        "Change bed linens"
      ],
      paymentTerms: "Payment will be released from escrow upon completion of each cleaning session.",
      escrowId: "t2"
    },
    {
      id: "c2",
      title: "Construction Work Contract",
      client: {
        name: "ABC Construction",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ABC"
      },
      worker: {
        name: userProfile?.fullName || "You",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`
      },
      amount: 12000,
      status: "completed",
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
      endDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
      description: "Construction work for a commercial building project in Westlands.",
      terms: [
        "Assist with manual labor tasks",
        "Follow safety protocols",
        "Work 8 hours per day, 6 days a week",
        "Report to site supervisor"
      ],
      paymentTerms: "Payment will be made weekly based on hours worked."
    },
    {
      id: "c3",
      title: "Delivery Services Agreement",
      client: {
        name: "Quick Deliveries Ltd",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=QD"
      },
      worker: {
        name: userProfile?.fullName || "You",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`
      },
      amount: 0, // Pay per delivery
      status: "active",
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(), // 20 days ago
      description: "Motorcycle delivery services for packages within Nairobi.",
      terms: [
        "Use own motorcycle for deliveries",
        "Maintain delivery records",
        "Ensure timely delivery of packages",
        "Report any issues immediately"
      ],
      paymentTerms: "Payment is made per delivery based on distance and package size."
    },
  ];
  
  const handleAddFunds = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to add.",
        variant: "destructive",
      });
      return;
    }
    
    if (paymentMethod === "mpesa" && (!phoneNumber || phoneNumber.length < 10)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid M-Pesa phone number.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real implementation, integrate with M-Pesa API
    // For now, just show success message
    toast({
      title: "Payment Initiated",
      description: `Check your phone ${phoneNumber} for M-Pesa prompt to add KSh ${amount}.`,
    });
    
    setShowAddFundsDialog(false);
    setAmount("");
    setPhoneNumber("");
  };
  
  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to withdraw.",
        variant: "destructive",
      });
      return;
    }
    
    if (parseFloat(amount) > balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds to withdraw this amount.",
        variant: "destructive",
      });
      return;
    }
    
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid M-Pesa phone number.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real implementation, integrate with M-Pesa API
    // For now, just show success message
    toast({
      title: "Withdrawal Initiated",
      description: `KSh ${amount} will be sent to ${phoneNumber} shortly.`,
    });
    
    setShowWithdrawDialog(false);
    setAmount("");
    setPhoneNumber("");
  };
  
  const handleViewContract = (contract: Contract) => {
    setSelectedContract(contract);
    setShowContractDialog(true);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      case "active":
        return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
      case "draft":
        return <Badge className="bg-purple-100 text-purple-800">Draft</Badge>;
      case "disputed":
        return <Badge className="bg-orange-100 text-orange-800">Disputed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Please log in to access payment system</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Payment & Contract System</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"