import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  DollarSign,
  CreditCard,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle,
  Plus,
  Download,
  Wallet,
  Shield,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Payment {
  id: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "escrow";
  payment_method: string;
  invoice_number: string;
  description: string;
  created_at: string;
  job: {
    id: string;
    title: string;
  };
  applicant: {
    id: string;
    full_name: string;
  };
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  due_date: string;
  issued_date: string;
  paid_date?: string;
  payment: Payment;
}

interface PaymentMethod {
  id: string;
  method_type: "credit_card" | "mpesa" | "paypal" | "bank_transfer";
  is_default: boolean;
  last_four?: string;
  provider?: string;
  expiry_date?: string;
  billing_address?: string;
}

export default function EmployerPaymentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    method_type: "credit_card",
    last_four: "",
    provider: "",
    expiry_date: "",
    billing_address: "",
  });
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPayments();
      fetchInvoices();
      fetchPaymentMethods();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select(
          `
          *,
          job:job_id(id, title),
          applicant:applicant_id(id, full_name)
        `,
        )
        .eq("employer_id", user?.id);

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Error",
        description: "Failed to load payment data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(
          `
          *,
          payment:payment_id(*,
            job:job_id(id, title),
            applicant:applicant_id(id, full_name)
          )
        `,
        )
        .eq("employer_id", user?.id);

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("user_id", user?.id);

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      // Validate inputs
      if (newPaymentMethod.method_type === "credit_card") {
        if (
          !newPaymentMethod.last_four ||
          !newPaymentMethod.provider ||
          !newPaymentMethod.expiry_date
        ) {
          toast({
            title: "Missing Information",
            description: "Please fill in all required fields",
            variant: "destructive",
          });
          return;
        }
      }

      // Check if this is the first payment method (make it default)
      const isDefault = paymentMethods.length === 0;

      const { data, error } = await supabase.from("payment_methods").insert([
        {
          user_id: user?.id,
          method_type: newPaymentMethod.method_type,
          is_default: isDefault,
          last_four: newPaymentMethod.last_four || null,
          provider: newPaymentMethod.provider || null,
          expiry_date: newPaymentMethod.expiry_date || null,
          billing_address: newPaymentMethod.billing_address || null,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment method added successfully",
      });

      // Reset form and close dialog
      setNewPaymentMethod({
        method_type: "credit_card",
        last_four: "",
        provider: "",
        expiry_date: "",
        billing_address: "",
      });
      setShowAddPaymentMethod(false);

      // Refresh payment methods
      fetchPaymentMethods();
    } catch (error) {
      console.error("Error adding payment method:", error);
      toast({
        title: "Error",
        description: "Failed to add payment method",
        variant: "destructive",
      });
    }
  };

  const setDefaultPaymentMethod = async (id: string) => {
    try {
      // First, set all payment methods to non-default
      await supabase
        .from("payment_methods")
        .update({ is_default: false })
        .eq("user_id", user?.id);

      // Then set the selected one as default
      const { error } = await supabase
        .from("payment_methods")
        .update({ is_default: true })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Default payment method updated",
      });

      // Refresh payment methods
      fetchPaymentMethods();
    } catch (error) {
      console.error("Error setting default payment method:", error);
      toast({
        title: "Error",
        description: "Failed to update default payment method",
        variant: "destructive",
      });
    }
  };

  const deletePaymentMethod = async (id: string) => {
    try {
      const { error } = await supabase
        .from("payment_methods")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment method deleted successfully",
      });

      // Refresh payment methods
      fetchPaymentMethods();
    } catch (error) {
      console.error("Error deleting payment method:", error);
      toast({
        title: "Error",
        description: "Failed to delete payment method",
        variant: "destructive",
      });
    }
  };

  const viewInvoiceDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetails(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case "credit_card":
        return <CreditCard className="h-4 w-4 mr-2" />;
      case "mpesa":
        return <Wallet className="h-4 w-4 mr-2 text-green-600" />;
      case "paypal":
        return <DollarSign className="h-4 w-4 mr-2 text-blue-500" />;
      case "bank_transfer":
        return <Wallet className="h-4 w-4 mr-2 text-gray-600" />;
      default:
        return <CreditCard className="h-4 w-4 mr-2" />;
    }
  };

  const getPaymentMethodName = (type: string, provider?: string) => {
    switch (type) {
      case "credit_card":
        return `${provider || "Card"}`;
      case "mpesa":
        return "M-Pesa";
      case "paypal":
        return "PayPal";
      case "bank_transfer":
        return "Bank Transfer";
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            {status === "completed" ? "Completed" : "Paid"}
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "escrow":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Shield className="h-3 w-3 mr-1" />
            Escrow
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Overdue
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Calculate summary statistics
  const totalPayments = payments.reduce(
    (sum, payment) =>
      payment.status === "completed" ? sum + payment.amount : sum,
    0,
  );

  const pendingPayments = payments.reduce(
    (sum, payment) =>
      payment.status === "pending" ? sum + payment.amount : sum,
    0,
  );

  const escrowBalance = payments.reduce(
    (sum, payment) =>
      payment.status === "escrow" ? sum + payment.amount : sum,
    0,
  );

  const activeContracts = new Set(
    payments
      .filter((p) => p.status === "pending" || p.status === "escrow")
      .map((p) => p.job.id),
  ).size;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Payment Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Payments
                </p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(totalPayments)}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Total money spent on hiring talent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Pending Payments
                </p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(pendingPayments)}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Unpaid invoices or milestones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Active Contracts
                </p>
                <p className="text-2xl font-bold mt-1">{activeContracts}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Ongoing projects & payment status
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Escrow Balance
                </p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(escrowBalance)}
                </p>
              </div>
              <div className="p-2 bg-indigo-100 rounded-full">
                <Shield className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Funds held for secured payments
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payment-methods">
        <TabsList className="mb-4">
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="invoices">Invoices & Billing</TabsTrigger>
          <TabsTrigger value="payment-history">Payment History</TabsTrigger>
        </TabsList>

        {/* Payment Methods Tab */}
        <TabsContent value="payment-methods" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Your Payment Methods</h2>
            <Button onClick={() => setShowAddPaymentMethod(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Payment Method
            </Button>
          </div>

          {paymentMethods.length > 0 ? (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <Card key={method.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {getPaymentMethodIcon(method.method_type)}
                        <div>
                          <p className="font-medium">
                            {getPaymentMethodName(
                              method.method_type,
                              method.provider,
                            )}
                            {method.last_four && ` •••• ${method.last_four}`}
                          </p>
                          {method.expiry_date && (
                            <p className="text-sm text-gray-500">
                              Expires: {method.expiry_date}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {method.is_default ? (
                          <Badge variant="outline" className="bg-gray-100">
                            Default
                          </Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDefaultPaymentMethod(method.id)}
                          >
                            Set as Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePaymentMethod(method.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500 mb-4">
                  No payment methods added yet
                </p>
                <Button onClick={() => setShowAddPaymentMethod(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Payment Method
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Invoices & Billing</h2>
          </div>

          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell>{formatDate(invoice.issued_date)}</TableCell>
                      <TableCell>{formatDate(invoice.due_date)}</TableCell>
                      <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewInvoiceDetails(invoice)}
                          >
                            <FileText className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500">No invoices found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="payment-history" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Payment History</h2>
          </div>

          {payments.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-4">
              {payments.map((payment) => (
                <AccordionItem
                  key={payment.id}
                  value={payment.id}
                  className="border rounded-lg p-0 overflow-hidden"
                >
                  <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                    <div className="flex flex-1 justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-start">
                          <p className="font-medium">{payment.job.title}</p>
                          <p className="text-sm text-gray-500">
                            {payment.applicant.full_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-medium">
                          {formatCurrency(payment.amount)}
                        </p>
                        {getStatusBadge(payment.status)}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-0">
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="flex justify-between">
                        <p className="text-sm text-gray-500">Payment Method</p>
                        <p className="text-sm">
                          {getPaymentMethodName(payment.payment_method)}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="text-sm">
                          {formatDate(payment.created_at)}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm text-gray-500">Invoice Number</p>
                        <p className="text-sm">{payment.invoice_number}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm text-gray-500">Description</p>
                        <p className="text-sm">{payment.description}</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500">No payment history found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Payment Method Dialog */}
      <Dialog
        open={showAddPaymentMethod}
        onOpenChange={setShowAddPaymentMethod}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              Add a new payment method to your account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="method-type">Payment Method Type</Label>
              <Select
                value={newPaymentMethod.method_type}
                onValueChange={(value) =>
                  setNewPaymentMethod({
                    ...newPaymentMethod,
                    method_type: value,
                  })
                }
              >
                <SelectTrigger id="method-type">
                  <SelectValue placeholder="Select payment method type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit/Debit Card</SelectItem>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newPaymentMethod.method_type === "credit_card" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="card-provider">Card Provider</Label>
                  <Select
                    value={newPaymentMethod.provider}
                    onValueChange={(value) =>
                      setNewPaymentMethod({
                        ...newPaymentMethod,
                        provider: value,
                      })
                    }
                  >
                    <SelectTrigger id="card-provider">
                      <SelectValue placeholder="Select card provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Visa">Visa</SelectItem>
                      <SelectItem value="Mastercard">Mastercard</SelectItem>
                      <SelectItem value="American Express">
                        American Express
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last-four">Last 4 Digits</Label>
                  <Input
                    id="last-four"
                    value={newPaymentMethod.last_four}
                    onChange={(e) =>
                      setNewPaymentMethod({
                        ...newPaymentMethod,
                        last_four: e.target.value,
                      })
                    }
                    maxLength={4}
                    placeholder="1234"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiry-date">Expiry Date</Label>
                  <Input
                    id="expiry-date"
                    value={newPaymentMethod.expiry_date}
                    onChange={(e) =>
                      setNewPaymentMethod({
                        ...newPaymentMethod,
                        expiry_date: e.target.value,
                      })
                    }
                    placeholder="MM/YY"
                  />
                </div>
              </>
            )}

            {newPaymentMethod.method_type === "mpesa" && (
              <div className="space-y-2">
                <Label htmlFor="mpesa-provider">Provider</Label>
                <Select
                  value={newPaymentMethod.provider}
                  onValueChange={(value) =>
                    setNewPaymentMethod({
                      ...newPaymentMethod,
                      provider: value,
                    })
                  }
                >
                  <SelectTrigger id="mpesa-provider">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Safaricom">Safaricom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="billing-address">
                Billing Address (Optional)
              </Label>
              <Input
                id="billing-address"
                value={newPaymentMethod.billing_address}
                onChange={(e) =>
                  setNewPaymentMethod({
                    ...newPaymentMethod,
                    billing_address: e.target.value,
                  })
                }
                placeholder="Enter your billing address"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddPaymentMethod(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddPaymentMethod}>Add Payment Method</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Details Dialog */}
      <Dialog open={showInvoiceDetails} onOpenChange={setShowInvoiceDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">
                    Invoice #{selectedInvoice.invoice_number}
                  </h3>
                  <p className="text-gray-500">
                    Issued: {formatDate(selectedInvoice.issued_date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">Status</p>
                  {getStatusBadge(selectedInvoice.status)}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="font-medium mb-1">From</p>
                  <p>JobSoko Platform</p>
                  <p>Nairobi, Kenya</p>
                  <p>info@jobsoko.co.ke</p>
                </div>
                <div>
                  <p className="font-medium mb-1">To</p>
                  <p>Your Company Name</p>
                  <p>Your Address</p>
                  <p>{user?.email}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Invoice Items</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        {selectedInvoice.payment?.description ||
                          "Payment for services"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(selectedInvoice.amount)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Service Fee (5%)</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(selectedInvoice.amount * 0.05)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-4 rounded">
                <p className="font-medium">Total Amount</p>
                <p className="text-xl font-bold">
                  {formatCurrency(selectedInvoice.amount * 1.05)}
                </p>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setShowInvoiceDetails(false)}
                >
                  Close
                </Button>
                <Button>
                  <Download className="h-4 w-4 mr-2" /> Download Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
