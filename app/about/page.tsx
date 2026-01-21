import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  Building2,
  Globe,
  Users,
  Award,
  Heart,
  Leaf,
  Shield,
  Sparkles,
  Package,
} from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-iherb-green text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Eltooro</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Your Trusted Partner in Natural Wellness and Beauty
            </p>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Eltooro is an online wellness and beauty platform offering
                  organic hair growth, cosmetic, supplement, and wellness
                  products to customers in Ghana and around the world.
                </p>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  We believe in natural care that supports confidence, healthy
                  living, and everyday well-being. Our products are carefully
                  selected from trusted manufacturers and made with organic or
                  naturally inspired ingredients.
                </p>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Eltooro makes it easy to discover and receive wellness
                  products wherever you are, while promoting responsible use,
                  transparency, and quality. Our products are designed to support
                  beauty and wellness routines, not replace professional medical
                  care.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="bg-muted py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  At Eltooro, our mission is to empower individuals on their
                  wellness journey by providing access to high-quality, natural
                  products that enhance both beauty and health. We are committed
                  to making organic and naturally-inspired wellness solutions
                  accessible to everyone, regardless of where they are located.
                </p>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  We understand that true wellness comes from a holistic
                  approach that combines natural ingredients, responsible
                  practices, and informed choices. That&apos;s why we carefully
                  curate our product selection, working only with manufacturers
                  who share our commitment to quality, sustainability, and
                  transparency.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Our goal is to be more than just an online store—we strive to
                  be a trusted partner in your wellness journey, providing not
                  only products but also education, support, and a community
                  dedicated to natural living.
                </p>
              </div>
              <div className="relative h-80 rounded-lg overflow-hidden">
                <Image
                  src="/wellness-healthy-lifestyle-products.jpg"
                  alt="Eltooro Wellness Products"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Product Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              What We Offer
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 border rounded-lg hover:border-iherb-green transition-colors">
                <div className="w-16 h-16 bg-iherb-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-iherb-green" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Organic Hair Growth
                </h3>
                <p className="text-muted-foreground text-sm">
                  Natural solutions for healthy, strong hair growth using
                  organic ingredients that nourish from root to tip.
                </p>
              </div>
              <div className="text-center p-6 border rounded-lg hover:border-iherb-green transition-colors">
                <div className="w-16 h-16 bg-iherb-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-iherb-green" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Cosmetics</h3>
                <p className="text-muted-foreground text-sm">
                  Beauty products made with natural and organic ingredients that
                  enhance your natural beauty while caring for your skin.
                </p>
              </div>
              <div className="text-center p-6 border rounded-lg hover:border-iherb-green transition-colors">
                <div className="w-16 h-16 bg-iherb-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-iherb-green" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Supplements</h3>
                <p className="text-muted-foreground text-sm">
                  Premium vitamins and supplements to support your daily
                  wellness goals and nutritional needs.
                </p>
              </div>
              <div className="text-center p-6 border rounded-lg hover:border-iherb-green transition-colors">
                <div className="w-16 h-16 bg-iherb-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-iherb-green" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Wellness Products</h3>
                <p className="text-muted-foreground text-sm">
                  Comprehensive wellness solutions designed to support your
                  overall health and well-being naturally.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-muted py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center p-6 bg-white rounded-lg">
                <div className="w-16 h-16 bg-iherb-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-iherb-green" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Natural First</h3>
                <p className="text-muted-foreground">
                  We prioritize organic and naturally-inspired ingredients,
                  believing that nature provides the best solutions for health
                  and beauty. Every product in our selection is chosen for its
                  natural composition and effectiveness.
                </p>
              </div>
              <div className="text-center p-6 bg-white rounded-lg">
                <div className="w-16 h-16 bg-iherb-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-iherb-green" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Quality & Transparency
                </h3>
                <p className="text-muted-foreground">
                  We work exclusively with trusted manufacturers who meet our
                  strict quality standards. We believe in complete transparency
                  about ingredients, sourcing, and product information so you can
                  make informed decisions.
                </p>
              </div>
              <div className="text-center p-6 bg-white rounded-lg">
                <div className="w-16 h-16 bg-iherb-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-iherb-green" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Customer Care</h3>
                <p className="text-muted-foreground">
                  Your confidence, health, and satisfaction are at the heart of
                  everything we do. We&apos;re committed to providing exceptional
                  service, support, and education to help you on your wellness
                  journey.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Commitment Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">
                Our Commitment to You
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-iherb-green/10 rounded-full flex items-center justify-center">
                      <Award className="h-6 w-6 text-iherb-green" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Carefully Selected Products
                    </h3>
                    <p className="text-muted-foreground">
                      Every product in our catalog undergoes a rigorous selection
                      process. We partner only with manufacturers who share our
                      commitment to quality, natural ingredients, and ethical
                      production practices. Our team carefully evaluates each
                      product for its ingredients, effectiveness, and alignment
                      with our natural wellness philosophy.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-iherb-green/10 rounded-full flex items-center justify-center">
                      <Globe className="h-6 w-6 text-iherb-green" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Accessible Worldwide
                    </h3>
                    <p className="text-muted-foreground">
                      While we proudly serve customers in Ghana, our reach
                      extends globally. We&apos;ve built a reliable shipping network
                      that ensures you can receive your wellness products no
                      matter where you are. Our user-friendly platform makes it
                      easy to discover, compare, and order products that support
                      your wellness goals.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-iherb-green/10 rounded-full flex items-center justify-center">
                      <Shield className="h-6 w-6 text-iherb-green" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Responsible Use & Education
                    </h3>
                    <p className="text-muted-foreground">
                      We believe in empowering our customers with knowledge. Our
                      products are designed to support your beauty and wellness
                      routines, complementing a healthy lifestyle. We emphasize
                      that our products are not intended to replace professional
                      medical care, and we encourage responsible use and
                      consultation with healthcare professionals when needed.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-iherb-green/10 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-iherb-green" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Building Confidence & Well-being
                    </h3>
                    <p className="text-muted-foreground">
                      At Eltooro, we understand that wellness is deeply personal.
                      Our products are chosen to support not just physical health,
                      but also confidence and everyday well-being. We believe that
                      when you feel good about yourself, you can live your best
                      life. That&apos;s why we focus on natural solutions that work
                      with your body, not against it.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Important Notice */}
        <section className="bg-foreground text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Shield className="h-8 w-8 text-iherb-green" />
                <h2 className="text-3xl font-bold">Important Notice</h2>
              </div>
              <p className="text-lg text-white/90 leading-relaxed">
                While Eltooro is committed to providing high-quality wellness and
                beauty products, we want to emphasize that our products are
                designed to support your wellness routines and enhance your
                natural beauty. They are not intended to diagnose, treat, cure,
                or prevent any disease or medical condition.
              </p>
              <p className="text-lg text-white/90 mt-4 leading-relaxed">
                We strongly encourage you to consult with qualified healthcare
                professionals for medical advice, diagnosis, or treatment. Our
                products should complement, not replace, professional medical care.
                Always read product labels and follow usage instructions carefully.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
