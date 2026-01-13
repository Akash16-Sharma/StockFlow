import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateSKU, PRODUCT_CATEGORIES } from "@/lib/sku";
import { 
  Package, 
  User, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Building2,
  Loader2
} from "lucide-react";

const ONBOARDING_COMPLETE_KEY = 'stockflow-onboarding-complete';

const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  businessName: z.string().optional(),
});

const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  category: z.string().min(1, "Please select a category"),
  quantity: z.coerce.number().min(0, "Quantity must be 0 or more"),
  minStock: z.coerce.number().min(0, "Minimum stock must be 0 or more"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type ProductFormValues = z.infer<typeof productSchema>;

const steps = [
  { id: 1, title: "Welcome", icon: Sparkles },
  { id: 2, title: "Your Profile", icon: User },
  { id: 3, title: "First Product", icon: Package },
  { id: 4, title: "All Done!", icon: CheckCircle2 },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [createdProductName, setCreatedProductName] = useState("");

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      businessName: "",
    },
  });

  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "General",
      quantity: 10,
      minStock: 5,
    },
  });

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  const handleProfileSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.fullName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      
      setCurrentStep(3);
    } catch (error: any) {
      toast.error(error.message || "Failed to save profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductSubmit = async (values: ProductFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const sku = generateSKU(values.category);
      
      const { error } = await supabase
        .from('products')
        .insert({
          name: values.name,
          sku,
          category: values.category,
          quantity: values.quantity,
          min_stock: values.minStock,
          user_id: user.id,
        });

      if (error) throw error;
      
      setCreatedProductName(values.name);
      setCurrentStep(4);
    } catch (error: any) {
      toast.error(error.message || "Failed to create product");
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    toast.success("Welcome to StockFlow!");
    navigate('/');
  };

  const skipOnboarding = () => {
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="p-2 bg-primary rounded-lg">
          <Package className="h-6 w-6 text-primary-foreground" />
        </div>
        <span className="text-2xl font-bold">StockFlow</span>
      </div>

      {/* Progress */}
      <div className="w-full max-w-md mb-8">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-2">
          {steps.map((step) => (
            <div 
              key={step.id}
              className={`flex flex-col items-center ${
                step.id <= currentStep ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <step.icon className={`h-5 w-5 ${step.id === currentStep ? 'animate-pulse' : ''}`} />
              <span className="text-xs mt-1 hidden sm:block">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="w-full max-w-md">
        {/* Step 1: Welcome */}
        {currentStep === 1 && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit mb-4">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">Welcome to StockFlow!</CardTitle>
              <CardDescription className="text-base">
                Let's get you set up in just a few quick steps. You'll be managing your inventory like a pro in no time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Set up your profile</p>
                    <p className="text-xs text-muted-foreground">Personalize your experience</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Add your first product</p>
                    <p className="text-xs text-muted-foreground">Get familiar with inventory tracking</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button onClick={() => setCurrentStep(2)} className="w-full">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={skipOnboarding} className="w-full text-muted-foreground">
                  Skip for now
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {/* Step 2: Profile */}
        {currentStep === 2 && (
          <>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Your Profile</CardTitle>
                  <CardDescription>Tell us a bit about yourself</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="My Awesome Store" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>This helps personalize your dashboard</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </>
        )}

        {/* Step 3: First Product */}
        {currentStep === 3 && (
          <>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Add Your First Product</CardTitle>
                  <CardDescription>Let's create a sample product to get started</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...productForm}>
                <form onSubmit={productForm.handleSubmit(handleProductSubmit)} className="space-y-4">
                  <FormField
                    control={productForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Wireless Mouse" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={productForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PRODUCT_CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={productForm.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Starting Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="minStock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Stock</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Product
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full text-muted-foreground"
                    onClick={() => {
                      setCurrentStep(4);
                      setCreatedProductName("");
                    }}
                  >
                    Skip this step
                  </Button>
                </form>
              </Form>
            </CardContent>
          </>
        )}

        {/* Step 4: Complete */}
        {currentStep === 4 && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto p-4 bg-green-100 dark:bg-green-900/30 rounded-full w-fit mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">You're All Set!</CardTitle>
              <CardDescription className="text-base">
                {createdProductName 
                  ? `Great job! "${createdProductName}" has been added to your inventory.`
                  : "Your account is ready to go. Start adding products to your inventory!"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-sm">What's next?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Add more products to your inventory</li>
                  <li>• Use barcode scanning for quick entry</li>
                  <li>• Invite team members to help manage stock</li>
                  <li>• Set up low stock alerts</li>
                </ul>
              </div>
              
              <Button onClick={completeOnboarding} className="w-full">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}

export function isOnboardingComplete(): boolean {
  return localStorage.getItem(ONBOARDING_COMPLETE_KEY) === 'true';
}

export function resetOnboarding(): void {
  localStorage.removeItem(ONBOARDING_COMPLETE_KEY);
}
