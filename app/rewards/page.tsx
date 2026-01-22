import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Star, Trophy, Zap, ChevronRight } from "lucide-react";
import Link from "next/link";
import { generateMetadata } from "@/lib/seo/metadata";
import { Metadata } from "next";

export const metadata: Metadata = generateMetadata({
  title: "Rewards Program - Earn Points & Save | Eltooro Ghana",
  description:
    "Join the Eltooro Rewards Program and earn points on every purchase. Redeem points for discounts, exclusive offers, and special rewards. Bronze, Silver, Gold, and Platinum tiers available.",
  keywords: [
    "Eltooro rewards",
    "loyalty program Ghana",
    "earn points Eltooro",
    "rewards program Ghana",
    "customer rewards",
    "points program",
    "loyalty points",
    "Eltooro membership",
    "rewards tiers",
  ],
  url: "https://www.eltooro.com/rewards",
});

const rewardTiers = [
  { name: "Bronze", minPoints: 0, discount: "5%", color: "bg-amber-700" },
  { name: "Silver", minPoints: 500, discount: "7%", color: "bg-gray-400" },
  { name: "Gold", minPoints: 1500, discount: "10%", color: "bg-yellow-500" },
  { name: "Platinum", minPoints: 5000, discount: "15%", color: "bg-gray-600" },
];

const ways = [
  {
    icon: Gift,
    title: "Make a Purchase",
    points: "1 point per $1 spent",
    description: "Earn points on every order",
  },
  {
    icon: Star,
    title: "Write a Review",
    points: "10 points per review",
    description: "Share your product experience",
  },
  {
    icon: Zap,
    title: "Refer a Friend",
    points: "100 points per referral",
    description: "When they make their first order",
  },
  {
    icon: Trophy,
    title: "Birthday Bonus",
    points: "50 bonus points",
    description: "Celebrate with extra rewards",
  },
];

const recentActivity = [
  { date: "Jan 5, 2026", action: "Purchase - Order #12345", points: "+89" },
  { date: "Jan 3, 2026", action: "Product Review - Vitamin C", points: "+10" },
  { date: "Dec 28, 2025", action: "Purchase - Order #12344", points: "+124" },
  { date: "Dec 15, 2025", action: "Referral Bonus", points: "+100" },
];

export default function RewardsPage() {
  const currentPoints = 1250;
  const currentTier = "Silver";
  const nextTier = "Gold";
  const pointsToNext = 250;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-iherb-green text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Eltooro Rewards
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Earn points on every purchase and unlock exclusive benefits
            </p>
          </div>
        </section>

        {/* Current Status */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto bg-card border rounded-xl p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <p className="text-muted-foreground mb-1">
                    Your Current Balance
                  </p>
                  <p className="text-5xl font-bold text-iherb-green">
                    {currentPoints.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">points</p>
                </div>
                <div className="text-center">
                  <Badge className="bg-gray-400 text-white text-lg px-4 py-1 mb-2">
                    {currentTier} Member
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {pointsToNext} points to {nextTier}
                  </p>
                  <div className="w-48 h-2 bg-muted rounded-full mt-2">
                    <div
                      className="h-full bg-iherb-green rounded-full"
                      style={{ width: "83%" }}
                    />
                  </div>
                </div>
                <div>
                  <Button className="bg-iherb-green hover:bg-iherb-green-dark">
                    Redeem Points
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reward Tiers */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">
              Membership Tiers
            </h2>
            <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {rewardTiers.map((tier, index) => (
                <div
                  key={tier.name}
                  className={`bg-card border rounded-xl p-6 text-center relative ${
                    tier.name === currentTier ? "ring-2 ring-iherb-green" : ""
                  }`}
                >
                  {tier.name === currentTier && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-iherb-green">
                      Current
                    </Badge>
                  )}
                  <div
                    className={`w-12 h-12 ${tier.color} rounded-full mx-auto mb-4`}
                  />
                  <h3 className="font-bold text-xl mb-2">{tier.name}</h3>
                  <p className="text-3xl font-bold text-iherb-green mb-2">
                    {tier.discount}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    discount on all orders
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">
                    {tier.minPoints === 0
                      ? "Start here"
                      : `${tier.minPoints.toLocaleString()}+ points`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ways to Earn */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">
              Ways to Earn
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ways.map((way) => (
                <div
                  key={way.title}
                  className="border rounded-xl p-6 text-center hover:shadow-md transition-shadow"
                >
                  <div className="w-14 h-14 bg-iherb-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <way.icon className="h-7 w-7 text-iherb-green" />
                  </div>
                  <h3 className="font-semibold mb-1">{way.title}</h3>
                  <p className="text-iherb-green font-bold mb-2">
                    {way.points}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {way.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
              <div className="bg-card border rounded-xl divide-y">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.date}
                      </p>
                    </div>
                    <span className="font-bold text-iherb-green">
                      {activity.points}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-center mt-4">
                <Button variant="outline">View Full History</Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Start Earning Today!</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Every purchase brings you closer to exclusive rewards and bigger
              savings.
            </p>
            <Link href="/products">
              <Button className="bg-iherb-green hover:bg-iherb-green-dark">
                Shop Now
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
