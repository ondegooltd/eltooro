import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, Globe, TrendingUp, ArrowRight } from "lucide-react";

const benefits = [
  {
    icon: DollarSign,
    title: "Competitive Commission",
    description: "Earn up to 10% commission on all qualifying sales",
  },
  {
    icon: Users,
    title: "Dedicated Support",
    description: "Personal affiliate manager to help you succeed",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Promote to customers in over 180 countries",
  },
  {
    icon: TrendingUp,
    title: "Real-time Tracking",
    description: "Advanced dashboard with detailed analytics",
  },
];

const steps = [
  {
    step: 1,
    title: "Sign Up",
    description: "Complete our simple application form",
  },
  {
    step: 2,
    title: "Get Approved",
    description: "Quick review process, usually within 24 hours",
  },
  {
    step: 3,
    title: "Start Promoting",
    description: "Access banners, links, and promotional materials",
  },
  {
    step: 4,
    title: "Earn Commission",
    description: "Get paid monthly via PayPal or bank transfer",
  },
];

export default function AffiliatesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-iherb-green text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Affiliate Program
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Partner with eltooro and earn commission promoting trusted health
              products
            </p>
            <Button
              size="lg"
              className="bg-white text-iherb-green hover:bg-white/90"
            >
              Join Now <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Partner With Us?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="text-center p-6 border rounded-lg"
                >
                  <div className="w-14 h-14 bg-iherb-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-7 w-7 text-iherb-green" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Commission Structure */}
        <section className="bg-muted py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Commission Structure
            </h2>
            <div className="max-w-3xl mx-auto">
              <div className="bg-card rounded-lg border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-iherb-green text-white">
                    <tr>
                      <th className="py-4 px-6 text-left">Tier</th>
                      <th className="py-4 px-6 text-left">Monthly Sales</th>
                      <th className="py-4 px-6 text-left">Commission Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-4 px-6 font-medium">Bronze</td>
                      <td className="py-4 px-6">$0 - $999</td>
                      <td className="py-4 px-6 text-iherb-green font-semibold">
                        5%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-medium">Silver</td>
                      <td className="py-4 px-6">$1,000 - $4,999</td>
                      <td className="py-4 px-6 text-iherb-green font-semibold">
                        7%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-medium">Gold</td>
                      <td className="py-4 px-6">$5,000 - $9,999</td>
                      <td className="py-4 px-6 text-iherb-green font-semibold">
                        8%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-medium">Platinum</td>
                      <td className="py-4 px-6">$10,000+</td>
                      <td className="py-4 px-6 text-iherb-green font-semibold">
                        10%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              How It Works
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              {steps.map((item, index) => (
                <div key={item.step} className="relative text-center">
                  <div className="w-12 h-12 bg-iherb-green text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-0.5 bg-border" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-foreground text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
            <p className="text-white/80 max-w-xl mx-auto mb-8">
              Join thousands of affiliates who are already earning with eltooro.
              No fees, no minimum sales required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-iherb-green hover:bg-iherb-green-dark"
              >
                Apply Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 bg-transparent"
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
