import React, { useState } from "react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../../supabase/auth";
import {
  DollarSign,
  CreditCard,
  Smartphone,
  CheckCircle,
  Download,
  FileText,
  Calendar,
  ArrowRight,
  Clock,
  AlertCircle,
  Shield,
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
  type: "payment" | "refund";
  amount: number;
  status: "completed" | "pending" | "failed";
  date: string;
  description: string;
  paymentMethod: string;
  reference: string;
}

const PaymentsPage = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("1500");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [loading, setLoading] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  // Mock transactions data
  const transactions: Transaction[] = [
    {
      id: "tx-001",
      type: "payment",
      amount: 1500,
      status: "completed",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      description: "Premium Job Posting",
      paymentMethod: "M-Pesa",
      reference: "MPESA123456",
    },
    {
      id: "tx-002",
      type: "payment",
      amount: 2500,
      status: "completed",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
      description: "Featured Job Posting - 30 days",
      paymentMethod: "Card",
      reference: "CARD789012",
    },
    {
      id: "tx-003",
      type: "refund",
      amount: 1500,
      status: "completed",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
      description: "Refund for cancelled job posting",
      paymentMethod: "M-Pesa",
      reference: "MPESA345678",
    },
    {
      id: "tx-004",
      type: "payment",
      amount: 1500,
      status: "pending",
      date: new Date().toISOString(), // Today
      description: "Premium Job Posting",
      paymentMethod: "M-Pesa",
      reference: "MPESA901234",
    },
  ];

  const handlePayment = () => {
    if (!phoneNumber && paymentMethod === "mpesa") {
      toast({
        title: "Phone Number Required",
        description: "Please enter your M-Pesa phone number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      setShowPaymentDialog(false);
      setShowPaymentSuccess(true);

      toast({
        title: "Payment Initiated",
        description:
          paymentMethod === "mpesa"
            ? `Please check your phone ${phoneNumber} for the M-Pesa prompt.`
            : "Your payment is being processed.",
      });
    }, 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <TopNavigation />
      <div className="flex h-[calc(100vh-64px)] mt-16">
        <Sidebar activeItem="Payments" />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-6">Payments & Billing</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Current Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">Free Plan</p>
                      <p className="text-sm text-gray-500 mt-1">
                        3 job posts per month
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Active
                    </Badge>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      2 job posts remaining this month
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <div
                        className="bg-green-600 h-2.5 rounded-full"
                        style={{ width: "33%" }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowPaymentDialog(true)}
                  >
                    Upgrade to Premium
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Payment Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <Smartphone className="h-5 w-5 text-green-600 mr-3" />
                        <div>
                          <p className="font-medium">M-Pesa</p>
                          <p className="text-xs text-gray-500">
                            Default payment method
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        Default
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <CreditCard className="h-5 w-5 text-gray-600 mr-3" />
                        <div>
                          <p className="font-medium">Credit/Debit Card</p>
                          <p className="text-xs text-gray-500">
                            Add a card for payments
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                      >
                        Add Card
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Billing Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <p className="text-gray-600">This Month</p>
                      <p className="font-medium">KSh 0.00</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-600">Last Month</p>
                      <p className="font-medium">KSh 1,500.00</p>
                    </div>
                    <div className="flex justify-between pt-4 border-t border-gray-100">
                      <p className="font-medium">Total Spent</p>
                      <p className="font-bold">KSh 5,500.00</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" /> Download Invoices
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  View all your payment transactions and receipts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All Transactions</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                    <TabsTrigger value="refunds">Refunds</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-4">
                    {transactions.length > 0 ? (
                      <div className="rounded-md border">
                        <div className="grid grid-cols-6 gap-4 p-4 font-medium border-b bg-gray-50">
                          <div>Date</div>
                          <div className="col-span-2">Description</div>
                          <div>Amount</div>
                          <div>Payment Method</div>
                          <div>Status</div>
                        </div>
                        {transactions.map((transaction) => (
                          <div
                            key={transaction.id}
                            className="grid grid-cols-6 gap-4 p-4 border-b last:border-0"
                          >
                            <div className="text-gray-600">
                              {formatDate(transaction.date)}
                            </div>
                            <div className="col-span-2">
                              {transaction.description}
                            </div>
                            <div
                              className={
                                transaction.type === "refund"
                                  ? "text-red-600"
                                  : "text-green-600"
                              }
                            >
                              {transaction.type === "refund" ? "-" : "+"} KSh{" "}
                              {transaction.amount.toLocaleString()}
                            </div>
                            <div>{transaction.paymentMethod}</div>
                            <div>{getStatusBadge(transaction.status)}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No transactions found</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="payments" className="space-y-4">
                    {transactions.filter((t) => t.type === "payment").length >
                    0 ? (
                      <div className="rounded-md border">
                        <div className="grid grid-cols-6 gap-4 p-4 font-medium border-b bg-gray-50">
                          <div>Date</div>
                          <div className="col-span-2">Description</div>
                          <div>Amount</div>
                          <div>Payment Method</div>
                          <div>Status</div>
                        </div>
                        {transactions
                          .filter((t) => t.type === "payment")
                          .map((transaction) => (
                            <div
                              key={transaction.id}
                              className="grid grid-cols-6 gap-4 p-4 border-b last:border-0"
                            >
                              <div className="text-gray-600">
                                {formatDate(transaction.date)}
                              </div>
                              <div className="col-span-2">
                                {transaction.description}
                              </div>
                              <div className="text-green-600">
                                + KSh {transaction.amount.toLocaleString()}
                              </div>
                              <div>{transaction.paymentMethod}</div>
                              <div>{getStatusBadge(transaction.status)}</div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No payments found</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="refunds" className="space-y-4">
                    {transactions.filter((t) => t.type === "refund").length >
                    0 ? (
                      <div className="rounded-md border">
                        <div className="grid grid-cols-6 gap-4 p-4 font-medium border-b bg-gray-50">
                          <div>Date</div>
                          <div className="col-span-2">Description</div>
                          <div>Amount</div>
                          <div>Payment Method</div>
                          <div>Status</div>
                        </div>
                        {transactions
                          .filter((t) => t.type === "refund")
                          .map((transaction) => (
                            <div
                              key={transaction.id}
                              className="grid grid-cols-6 gap-4 p-4 border-b last:border-0"
                            >
                              <div className="text-gray-600">
                                {formatDate(transaction.date)}
                              </div>
                              <div className="col-span-2">
                                {transaction.description}
                              </div>
                              <div className="text-red-600">
                                - KSh {transaction.amount.toLocaleString()}
                              </div>
                              <div>{transaction.paymentMethod}</div>
                              <div>{getStatusBadge(transaction.status)}</div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No refunds found</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Payment Dialog */}
          <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Upgrade to Premium Plan</DialogTitle>
                <DialogDescription>
                  Choose your payment method to complete the upgrade
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`p-4 border rounded-lg cursor-pointer ${paymentMethod === "mpesa" ? "border-green-500 bg-green-50" : ""}`}
                    onClick={() => setPaymentMethod("mpesa")}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <Smartphone className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-center font-medium">M-Pesa</p>
                  </div>
                  <div
                    className={`p-4 border rounded-lg cursor-pointer ${paymentMethod === "card" ? "border-blue-500 bg-blue-50" : ""}`}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <CreditCard className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-center font-medium">Card</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (KSh)</Label>
                  <Input
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled
                  />
                </div>

                {paymentMethod === "mpesa" && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">M-Pesa Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="e.g. 0712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                )}

                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Cardholder Name</Label>
                      <Input id="name" placeholder="John Doe" />
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Premium Plan</span>
                    <span>KSh 1,500.00</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>KSh 1,500.00</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? "Processing..." : "Pay Now"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Payment Success Dialog */}
          <Dialog
            open={showPaymentSuccess}
            onOpenChange={setShowPaymentSuccess}
          >
            <DialogContent className="sm:max-w-[500px]">
              <div className="flex flex-col items-center justify-center py-6">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-center mb-2">
                  Payment Initiated
                </h2>
                <p className="text-center text-gray-600 mb-6">
                  {paymentMethod === "mpesa"
                    ? "Please check your phone for the M-Pesa prompt to complete the payment."
                    : "Your payment is being processed. You will receive a confirmation shortly."}
                </p>
                <div className="w-full p-4 bg-gray-50 rounded-lg mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">KSh 1,500.00</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">
                      {paymentMethod === "mpesa" ? "M-Pesa" : "Card"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-yellow-600">Pending</span>
                  </div>
                </div>
                <Button onClick={() => setShowPaymentSuccess(false)}>
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default PaymentsPage;
