import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UPIPaymentDialog } from "@/components/UPIPaymentDialog";
import { 
  Package, 
  ScanBarcode, 
  BarChart3, 
  Users, 
  Shield, 
  Zap,
  CheckCircle2,
  ArrowRight,
  Star,
  Clock,
  TrendingDown,
  Timer,
  Award
} from "lucide-react";

const features = [
  {
    icon: ScanBarcode,
    title: "Barcode Scanning",
    description: "Scan products instantly with your phone camera. Supports all major barcode formats."
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Track stock levels, expiring items, and inventory trends with beautiful dashboards."
  },
  {
    icon: Users,
    title: "Team Management",
    description: "Invite staff members with role-based access control. Admins manage, staff operates."
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is encrypted and isolated. Multi-tenant architecture ensures complete privacy."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized for speed. Quick scans, instant updates, and real-time sync across devices."
  },
  {
    icon: Package,
    title: "Stock Alerts",
    description: "Get notified when stock runs low or products are about to expire. Never miss a reorder."
  }
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Store Manager",
    company: "Fresh Foods Co.",
    content: "StockFlow transformed how we manage inventory. Reduced stockouts by 80% in just 2 months.",
    rating: 5,
    avatar: "SJ"
  },
  {
    name: "Mike Chen",
    role: "Operations Director",
    company: "TechParts Inc.",
    content: "The barcode scanning is incredibly fast. Our team loves the mobile-first approach.",
    rating: 5,
    avatar: "MC"
  },
  {
    name: "Emily Roberts",
    role: "Small Business Owner",
    company: "Craft & Create",
    content: "Finally an inventory app that doesn't require a PhD to use. Simple, powerful, affordable.",
    rating: 5,
    avatar: "ER"
  }
];

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for getting started",
    features: [
      "Up to 100 products",
      "1 user",
      "Barcode scanning",
      "Basic analytics",
      "Email support"
    ],
    cta: "Get Started Free",
    popular: false
  },
  {
    name: "Professional",
    price: "$19",
    period: "/month",
    description: "For growing businesses",
    features: [
      "Unlimited products",
      "Up to 5 team members",
      "Advanced analytics",
      "Stock alerts & notifications",
      "CSV import/export",
      "Priority support"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations",
    features: [
      "Everything in Professional",
      "Unlimited team members",
      "API access",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee"
    ],
    cta: "Contact Sales",
    popular: false
  }
];

const stats = [
  { value: "10,000+", label: "Active Users" },
  { value: "2M+", label: "Products Tracked" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9/5", label: "User Rating" }
];

const painPoints = [
  {
    icon: TrendingDown,
    problem: "Losing money on expired stock?",
    solution: "Get automatic expiry alerts before it's too late"
  },
  {
    icon: Timer,
    problem: "Wasting hours on manual counts?",
    solution: "Scan & update inventory in seconds"
  },
  {
    icon: Award,
    problem: "Stockouts hurting sales?",
    solution: "Smart low-stock alerts keep you stocked"
  }
];

export default function Landing() {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState({ name: "", amount: 0 });

  const handlePlanSelect = (planName: string, amount: number) => {
    if (planName === "Starter") {
      return;
    }
    setSelectedPlan({ name: planName, amount });
    setPaymentDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation - Sticky with clear CTA */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <div className="p-2 bg-primary rounded-lg">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl">StockFlow</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Reviews
            </a>
          </nav>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">
                Start Free
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Benefit-focused headline */}
      <section className="container py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="secondary" className="px-4 py-1.5 text-sm">
            ✨ Trusted by 10,000+ businesses
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Stop Losing Money on
            <span className="text-primary block mt-1">Inventory Chaos</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Track stock in real-time, eliminate stockouts, and prevent expired goods from eating your profits. 
            <strong className="text-foreground"> Set up in 2 minutes.</strong>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" asChild className="text-lg px-8 h-14 shadow-lg hover:shadow-xl transition-shadow">
              <Link to="/auth">
                Start Free — No Credit Card
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 h-14">
              <a href="#features">See How It Works</a>
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Free forever plan
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              2-minute setup
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Cancel anytime
            </span>
          </div>
        </div>
        
        {/* Social Proof Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-lg bg-card border border-border">
              <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
        
        {/* Hero Image */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="relative rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-primary/10 via-accent to-primary/5 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full inline-block">
                  <Package className="h-16 w-16 text-primary" />
                </div>
                <p className="text-muted-foreground">Dashboard Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section - Agitate then solve */}
      <section className="container py-16 bg-muted/30 -mx-0">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {painPoints.map((item) => (
              <Card key={item.problem} className="border-border bg-card">
                <CardContent className="pt-6 text-center">
                  <div className="p-3 bg-destructive/10 rounded-full w-fit mx-auto mb-4">
                    <item.icon className="h-6 w-6 text-destructive" />
                  </div>
                  <p className="font-medium text-foreground mb-2">{item.problem}</p>
                  <p className="text-sm text-primary font-medium">{item.solution}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-20 md:py-28">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4">Features</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Take Control
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed for businesses of all sizes
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Mid-page CTA */}
        <div className="text-center mt-12">
          <Button size="lg" asChild>
            <Link to="/auth">
              Try All Features Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Testimonials Section - Social Proof */}
      <section id="testimonials" className="container py-20 md:py-28 bg-muted/30">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4">Reviews</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Loved by 10,000+ Business Owners
          </h2>
          <p className="text-lg text-muted-foreground">
            See why businesses trust StockFlow for their inventory
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="border-border bg-card">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-foreground mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container py-20 md:py-28">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4">Pricing</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start Free, Upgrade When Ready
          </h2>
          <p className="text-lg text-muted-foreground">
            No hidden fees. No surprises. Cancel anytime.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative ${plan.popular ? 'border-primary border-2 shadow-xl scale-105 z-10' : 'border-border'}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  Most Popular
                </Badge>
              )}
              <CardContent className="pt-8">
                <div className="text-center mb-6">
                  <h3 className="font-semibold text-xl mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {plan.name === "Starter" ? (
                  <Button 
                    className="w-full h-12" 
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link to="/auth">{plan.cta}</Link>
                  </Button>
                ) : (
                  <div className="relative pt-6">
                    <Badge 
                      variant="secondary" 
                      className="absolute top-0 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 whitespace-nowrap"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Coming Soon
                    </Badge>
                    <Button 
                      className="w-full h-12" 
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => handlePlanSelect(plan.name, plan.name === "Professional" ? 1599 : 4999)}
                    >
                      {plan.cta}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        <p className="text-center text-sm text-muted-foreground mt-8">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </section>

      {/* Final CTA Section */}
      <section className="container py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center bg-primary rounded-2xl p-12 shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Take Control of Your Inventory?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join 10,000+ businesses saving time and money with smarter inventory management
          </p>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8 h-14 shadow-lg">
            <Link to="/auth">
              Start Free Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="text-sm text-primary-foreground/60 mt-4">
            Free forever plan available • Setup in 2 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link to="/" className="flex items-center gap-2 font-semibold mb-4">
                <div className="p-1.5 bg-primary rounded-lg">
                  <Package className="h-4 w-4 text-primary-foreground" />
                </div>
                <span>StockFlow</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Modern inventory management for modern businesses.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} StockFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <UPIPaymentDialog 
        open={paymentDialogOpen} 
        onOpenChange={setPaymentDialogOpen}
        planName={selectedPlan.name}
        amount={selectedPlan.amount}
      />
    </div>
  );
}