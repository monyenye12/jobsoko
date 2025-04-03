import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  XCircle,
  CreditCard,
  Smartphone,
  Building,
  AlertCircle,
} from "lucide-react";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: {
    included: string[];
    excluded: string[];
  };
  recommended?: boolean;
}

export default function SubscriptionPlans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentDetails, setPaymentDetails] = useState({
    phoneNumber: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    accountNumber: "",
    bankName: "",
  });
  const [processingPayment, setProcessingPayment] = useState(false);

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: "free",
      name: "Free Plan",
      price: 0,
      period: "month",
      features: {
        included: [
          "Post up to 3 jobs per month",
          "Basic applicant filtering",
          "Standard job visibility",
          "Email support",
        ],
        excluded: [
          "Verified employer badge",
          "Featured job listings",
          "Advanced candidate matching",
          "Priority support",
          "Detailed analytics",
        ],
      },
    },
    {
      id: "basic",
      name: "Basic Plan",
      price: 1500,
      period: "month",
      features: {
        included: [
          "Post up to 10 jobs per month",
          "Advanced applicant filtering",
          "Verified employer badge",
          "Email and chat support",
          "Basic analytics",
        ],
        excluded: [
          "Featured job listings",
          "Advanced candidate matching",
          "Priority support",
        ],
      },
    },
    {
      id: "premium",
      name: "Premium Plan",
      price: 2500,
      period: "month",
      recommended: true,
      features: {
        included: [
          "Unlimited job postings",
          "Advanced applicant filtering",
          "Verified employer badge",
          "Featured job listings",
          "Advanced candidate matching",
          "Priority support",
          "Detailed analytics and reports",
          "Dedicated account manager",
        ],
        excluded: [],
      },
    },
    {
      id: "enterprise",
      name: "Enterprise Plan",
      price: 5000,
      period: "month",
      features: {
        included: [
          "All Premium features",
          "Custom branding",
          "API access",
          "Bulk job posting",
          "Custom integrations",
          "Dedicated account manager",
          "24/7 priority support",
          "Onsite training and setup",
        ],
        excluded: [],
      },
    },
  ];

  const handleSubscribe = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowPaymentDialog(true);
  };

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
    // Reset payment details when changing method
    setPaymentDetails({
      phoneNumber: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      accountNumber: "",
      bankName: "",
    });
  };

  const handlePaymentDetailsChange = (field: string, value: string) => {
    setPaymentDetails({
      ...paymentDetails,
      [field]: value,
    });
  };

  const validatePaymentDetails = () => {
    if (!paymentMethod) {
      toast({
        title: "Payment method required",
        description: "Please select a payment method",
        variant: "destructive",
      });
      return false;
    }

    if (paymentMethod === "mpesa" && !paymentDetails.phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter your M-Pesa phone number",
        variant: "destructive",
      });
      return false;
    }

    if (
      paymentMethod === "card" &&
      (!paymentDetails.cardNumber ||
        !paymentDetails.expiryDate ||
        !paymentDetails.cvv)
    ) {
      toast({
        title: "Card details required",
        description: "Please enter all card details",
        variant: "destructive",
      });
      return false;
    }

    if (
      paymentMethod === "bank" &&
      (!paymentDetails.accountNumber || !paymentDetails.bankName)
    ) {
      toast({
        title: "Bank details required",
        description: "Please enter all bank details",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const processPayment = async () => {
    if (!selectedPlan || !validatePaymentDetails()) return;

    setProcessingPayment(true);

    try {
      // In a real app, this would call a payment API
      // For demo purposes, we'll simulate a successful payment
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

      // Save subscription to database
      const { data, error } = await supabase
        .from("subscriptions")
        .insert([
          {
            user_id: user?.id,
            plan_name: selectedPlan.name,
            price: selectedPlan.price,
            status: "active",
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            payment_method: paymentMethod,
            payment_details: {
              // Don't store sensitive info like full card numbers in production
              // This is just for demo purposes
              last4:
                paymentMethod === "card"
                  ? paymentDetails.cardNumber.slice(-4)
                  : null,
              phone:
                paymentMethod === "mpesa" ? paymentDetails.phoneNumber : null,
              bank: paymentMethod === "bank" ? paymentDetails.bankName : null,
            },
          },
        ])
        .select();

      if (error) throw error;

      // Create a notification for the user
      await supabase.from("notifications").insert([
        {
          user_id: user?.id,
          title: "Subscription Confirmed",
          message: `Your subscription to the ${selectedPlan.name} has been confirmed. Valid until ${endDate.toLocaleDateString()}.`,
          type: "payment",
          read: false,
          created_at: new Date().toISOString(),
        },
      ]);

      toast({
        title: "Payment Successful",
        description: `You have successfully subscribed to the ${selectedPlan.name}. Thank you for your payment!`,
      });

      setShowPaymentDialog(false);
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description:
          error.message ||
          "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Subscription Plans</h1>
        <p className="text-gray-600">
          Choose the plan that best fits your hiring needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {subscriptionPlans.map((plan) => (
          <Card
            key={plan.id}
            className={`border-2 ${plan.recommended ? "border-blue-500" : "border-gray-200"} relative`}
          >
            {plan.recommended && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                RECOMMENDED
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-6">
                KSh {plan.price.toLocaleString()}{" "}
                <span className="text-sm font-normal text-gray-500">
                  /{plan.period}
                </span>
              </p>
              <ul className="space-y-2 mb-6">
                {plan.features.included.map((feature, index) => (
                  <li key={`included-${index}`} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
                {plan.features.excluded.map((feature, index) => (
                  <li key={`excluded-${index}`} className="flex items-start">
                    <XCircle className="h-5 w-5 text-gray-300 mr-2 shrink-0" />
                    <span className="text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleSubscribe(plan)}
                className={`w-full ${plan.id === "free" ? "bg-gray-500 hover:bg-gray-600" : "bg-blue-600 hover:bg-blue-700"}`}
                disabled={plan.id === "free"}
              >
                {plan.id === "free" ? "Current Plan" : "Subscribe"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Subscription</DialogTitle>
            <DialogDescription>
              {selectedPlan && (
                <div className="mt-2">
                  <p>
                    Plan:{" "}
                    <span className="font-medium">{selectedPlan.name}</span>
                  </p>
                  <p>
                    Price:{" "}
                    <span className="font-medium">
                      KSh {selectedPlan.price.toLocaleString()}/
                      {selectedPlan.period}
                    </span>
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Payment Method</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={paymentMethod === "mpesa" ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-20"
                  onClick={() => handlePaymentMethodChange("mpesa")}
                >
                  <Smartphone className="h-8 w-8 mb-1" />
                  <span className="text-xs">M-Pesa</span>
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "card" ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-20"
                  onClick={() => handlePaymentMethodChange("card")}
                >
                  <CreditCard className="h-8 w-8 mb-1" />
                  <span className="text-xs">Card</span>
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "bank" ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-20"
                  onClick={() => handlePaymentMethodChange("bank")}
                >
                  <Building className="h-8 w-8 mb-1" />
                  <span className="text-xs">Bank</span>
                </Button>
              </div>
            </div>

            {paymentMethod === "mpesa" && (
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">M-Pesa Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="e.g. 254712345678"
                  value={paymentDetails.phoneNumber}
                  onChange={(e) =>
                    handlePaymentDetailsChange("phoneNumber", e.target.value)
                  }
                />
                <p className="text-xs text-gray-500">
                  Enter your M-Pesa registered phone number starting with 254
                </p>
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={paymentDetails.cardNumber}
                    onChange={(e) =>
                      handlePaymentDetailsChange("cardNumber", e.target.value)
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={paymentDetails.expiryDate}
                      onChange={(e) =>
                        handlePaymentDetailsChange("expiryDate", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={paymentDetails.cvv}
                      onChange={(e) =>
                        handlePaymentDetailsChange("cvv", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "bank" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    placeholder="e.g. Equity Bank"
                    value={paymentDetails.bankName}
                    onChange={(e) =>
                      handlePaymentDetailsChange("bankName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="Your bank account number"
                    value={paymentDetails.accountNumber}
                    onChange={(e) =>
                      handlePaymentDetailsChange(
                        "accountNumber",
                        e.target.value,
                      )
                    }
                  />
                </div>
              </div>
            )}

            {paymentMethod && (
              <div className="bg-yellow-50 p-3 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700">
                  This is a demo application. No actual payment will be
                  processed. In a production environment, this would securely
                  connect to payment gateways.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
              disabled={processingPayment}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={processPayment}
              disabled={!paymentMethod || processingPayment}
              className="bg-green-600 hover:bg-green-700"
            >
              {processingPayment ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                "Complete Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
