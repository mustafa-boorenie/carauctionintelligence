import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Billing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const plans = [
    {
      name: "Starter",
      price: 29,
      period: "month",
      features: [
        "100 searches per month",
        "5 saved searches",
        "Email alerts",
        "Basic support"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: 79,
      period: "month",
      features: [
        "Unlimited searches",
        "Unlimited saved searches",
        "SMS + Email alerts",
        "Priority support",
        "Advanced filters",
        "Export data"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: 199,
      period: "month",
      features: [
        "Everything in Professional",
        "API access",
        "Custom integrations",
        "Dedicated account manager",
        "White-label options",
        "24/7 phone support"
      ],
      popular: false
    }
  ];

  const mockInvoices = [
    { id: "INV-001", date: "2024-01-15", amount: 79, status: "paid", plan: "Professional" },
    { id: "INV-002", date: "2023-12-15", amount: 79, status: "paid", plan: "Professional" },
    { id: "INV-003", date: "2023-11-15", amount: 79, status: "paid", plan: "Professional" },
  ];

  const handleUpgrade = async (planName: string) => {
    setIsLoading(true);
    try {
      // Simulate payment flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({ 
        title: "Upgrade successful!", 
        description: `You've been upgraded to the ${planName} plan.` 
      });
    } catch (error) {
      toast({ title: "Upgrade failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast({ title: "Invoice download started", description: `Downloading invoice ${invoiceId}` });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-md mx-auto pt-20">
          <Card>
            <CardContent className="pt-6 text-center">
              <i className="fas fa-lock text-4xl text-slate-400 mb-4"></i>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Authentication Required</h2>
              <p className="text-slate-600 mb-4">Please sign in to access billing information.</p>
              <Button onClick={() => window.location.href = '/auth'}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const trialDaysLeft = 180; // Mock trial days

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Billing & Subscription</h1>
            <p className="text-slate-600">Manage your subscription and billing information</p>
          </div>

          {/* Current Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 border-blue-200">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">Current Plan: Free Trial</CardTitle>
                    <p className="text-slate-600 mt-1">
                      <span className="font-semibold text-emerald-600">{trialDaysLeft} days</span> remaining
                    </p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700">Active Trial</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">
                      You're currently on a free trial with full access to all features.
                    </p>
                    <div className="w-full bg-slate-200 rounded-full h-2 max-w-md">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, (trialDaysLeft / 180) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <Button className="ml-4">
                    <i className="fas fa-crown mr-2"></i>
                    Upgrade Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pricing Plans */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Choose Your Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Card className={`relative ${plan.popular ? 'border-blue-500 ring-2 ring-blue-200' : ''}`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-blue-500 text-white px-3 py-1">Most Popular</Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-2">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <div className="mt-4">
                        <span className="text-4xl font-bold text-slate-900">${plan.price}</span>
                        <span className="text-slate-600">/{plan.period}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center text-sm">
                            <i className="fas fa-check text-green-500 mr-3"></i>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className={`w-full ${plan.popular ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                        variant={plan.popular ? 'default' : 'outline'}
                        onClick={() => handleUpgrade(plan.name)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-arrow-up mr-2"></i>
                            Choose {plan.name}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-6 bg-blue-500 rounded flex items-center justify-center">
                        <i className="fas fa-credit-card text-white text-xs"></i>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">•••• •••• •••• 4242</p>
                        <p className="text-sm text-slate-500">Expires 12/26</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <i className="fas fa-edit mr-2"></i>
                      Edit
                    </Button>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <i className="fas fa-plus mr-2"></i>
                    Add Payment Method
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Billing Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-900">Billing Address</p>
                    <p className="text-sm text-slate-600">
                      123 Business Street<br/>
                      San Francisco, CA 94105<br/>
                      United States
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-900">Billing Email</p>
                    <p className="text-sm text-slate-600">{user.email}</p>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <i className="fas fa-edit mr-2"></i>
                    Update Billing Info
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Invoice History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Invoice History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockInvoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium text-slate-900">{invoice.id}</p>
                          <p className="text-sm text-slate-500">{invoice.plan} Plan</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">{new Date(invoice.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium text-slate-900">${invoice.amount}</p>
                          <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Badge>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice.id)}
                        >
                          <i className="fas fa-download mr-2"></i>
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}