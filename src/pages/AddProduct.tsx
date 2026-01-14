import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/FormField";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProducts } from "@/hooks/useProducts";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { toast } from "sonner";
import { ArrowLeft, Loader2, ScanBarcode, X, RefreshCw, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { productSchema, ProductFormData, productFormDefaults } from "@/lib/validations/product";
import { generateSKU, PRODUCT_CATEGORIES } from "@/lib/sku";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

type FormErrors = Partial<Record<keyof ProductFormData, string>>;

export default function AddProduct() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addProduct, products, isLoading: productsLoading } = useProducts();
  const { plan, limits, canAddProduct, getRemainingProducts, isLoading: subscriptionLoading } = useSubscription();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    ...productFormDefaults,
    sku: generateSKU("General"), // Auto-generate initial SKU
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [showScanner, setShowScanner] = useState(false);

  // Pre-fill barcode from URL params (from scan lookup)
  useEffect(() => {
    const barcodeParam = searchParams.get("barcode");
    if (barcodeParam) {
      setFormData(prev => ({ ...prev, barcode: barcodeParam }));
    }
  }, [searchParams]);

  // Regenerate SKU when category changes
  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category,
      sku: generateSKU(category), // Auto-regenerate SKU for new category
    }));
  };

  const regenerateSKU = () => {
    const newSKU = generateSKU(formData.category);
    setFormData(prev => ({ ...prev, sku: newSKU }));
    toast.success("SKU regenerated", { description: newSKU });
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? (value === '' ? 0 : Number(value)) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error on change
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => new Set(prev).add(name));
    
    // Validate single field on blur
    const result = productSchema.safeParse(formData);
    if (!result.success) {
      const fieldError = result.error.issues.find(i => i.path[0] === name);
      if (fieldError) {
        setErrors(prev => ({ ...prev, [name]: fieldError.message }));
      }
    }
  };

  const handleScan = (code: string, format: string) => {
    setShowScanner(false);
    
    // Check if product already exists with this barcode
    const existingProduct = products.find(p => p.barcode === code);
    if (existingProduct) {
      toast.info(`Found existing product: ${existingProduct.name}`, {
        description: `Barcode ${code} is already registered`,
      });
      navigate(`/products`);
      return;
    }
    
    // Fill barcode field
    setFormData(prev => ({
      ...prev,
      barcode: code,
    }));
    
    toast.success(`Scanned ${format} barcode`, {
      description: code,
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const result = productSchema.safeParse(formData);
    
    if (!result.success) {
      const newErrors: FormErrors = {};
      result.error.issues.forEach(issue => {
        const field = issue.path[0] as keyof FormErrors;
        if (!newErrors[field]) {
          newErrors[field] = issue.message;
        }
      });
      setErrors(newErrors);
      setTouched(new Set(Object.keys(formData)));
      
      // Focus first error field
      const firstErrorField = result.error.issues[0]?.path[0] as string;
      document.getElementById(firstErrorField)?.focus();
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addProduct.mutateAsync({
        name: formData.name,
        sku: formData.sku,
        barcode: formData.barcode || null,
        quantity: formData.quantity,
        minStock: formData.minStock,
        expiryDate: formData.expiryDate || null,
        category: formData.category || 'General',
      });
      
      navigate("/products");
    } catch {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const productCount = products.length;
  const canAdd = canAddProduct(productCount);
  const remainingProducts = getRemainingProducts(productCount);
  const isAtLimit = !canAdd;
  
  if (subscriptionLoading || productsLoading) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Show upgrade prompt if at product limit
  if (isAtLimit) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto space-y-4">
          <Link 
            to="/products" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to products
          </Link>
          
          <UpgradePrompt 
            feature="You've reached your product limit"
            currentPlan={plan}
            requiredPlan="professional"
            currentUsage={productCount}
            limit={limits.maxProducts}
          />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-lg mx-auto space-y-4">
        {/* Back button */}
        <Link 
          to="/products" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to products
        </Link>
        
        {/* Product limit warning */}
        {remainingProducts <= 10 && remainingProducts > 0 && (
          <Alert className="border-amber-500/50 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-sm">
              You have {remainingProducts} product slot{remainingProducts !== 1 ? 's' : ''} remaining on your {plan} plan.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Barcode Scanner */}
        {showScanner && (
          <BarcodeScanner
            onScan={handleScan}
            onClose={() => setShowScanner(false)}
            className="h-[300px]"
          />
        )}
        
        <Card className="animate-fade-in">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Add Product</CardTitle>
              <Button
                type="button"
                variant={showScanner ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowScanner(!showScanner)}
              >
                {showScanner ? (
                  <>
                    <X className="h-4 w-4 mr-1" />
                    Close Scanner
                  </>
                ) : (
                  <>
                    <ScanBarcode className="h-4 w-4 mr-1" />
                    Scan Barcode
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <FormField 
                id="name" 
                label="Product Name" 
                required
                error={touched.has('name') ? errors.name : undefined}
              >
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Organic Milk"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={cn(errors.name && touched.has('name') && "border-danger focus-visible:ring-danger")}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
              </FormField>
              
              <div className="grid grid-cols-2 gap-3">
                <FormField 
                  id="category" 
                  label="Category"
                  error={touched.has('category') ? errors.category : undefined}
                >
                  <Select
                    value={formData.category}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField 
                  id="sku" 
                  label="SKU" 
                  required
                  error={touched.has('sku') ? errors.sku : undefined}
                >
                  <div className="flex gap-2">
                    <Input
                      id="sku"
                      name="sku"
                      placeholder="Auto-generated"
                      value={formData.sku}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={cn("flex-1", errors.sku && touched.has('sku') && "border-danger focus-visible:ring-danger")}
                      aria-invalid={!!errors.sku}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={regenerateSKU}
                      title="Regenerate SKU"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </FormField>
              </div>
              
              {/* Barcode Field */}
              <FormField 
                id="barcode" 
                label="Barcode"
                error={touched.has('barcode') ? errors.barcode : undefined}
              >
                <div className="flex gap-2">
                  <Input
                    id="barcode"
                    name="barcode"
                    placeholder="Scan or enter barcode"
                    value={formData.barcode || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowScanner(true)}
                    title="Scan barcode"
                  >
                    <ScanBarcode className="h-4 w-4" />
                  </Button>
                </div>
              </FormField>
              
              <div className="grid grid-cols-2 gap-3">
                <FormField 
                  id="quantity" 
                  label="Quantity" 
                  required
                  error={touched.has('quantity') ? errors.quantity : undefined}
                >
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.quantity || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={cn(errors.quantity && touched.has('quantity') && "border-danger focus-visible:ring-danger")}
                    aria-invalid={!!errors.quantity}
                  />
                </FormField>
                <FormField 
                  id="minStock" 
                  label="Min Stock Level"
                  error={touched.has('minStock') ? errors.minStock : undefined}
                >
                  <Input
                    id="minStock"
                    name="minStock"
                    type="number"
                    min="0"
                    placeholder="10"
                    value={formData.minStock || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </FormField>
              </div>
              
              <FormField 
                id="expiryDate" 
                label="Expiry Date"
                error={touched.has('expiryDate') ? errors.expiryDate : undefined}
              >
                <Input
                  id="expiryDate"
                  name="expiryDate"
                  type="date"
                  value={formData.expiryDate || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </FormField>
              
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/products")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Product"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
