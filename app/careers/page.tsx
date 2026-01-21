import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Clock,
  Briefcase,
  Heart,
  Zap,
  Users,
  Coffee,
  Dumbbell,
} from "lucide-react";
import Link from "next/link";

const jobListings = [
  {
    id: 1,
    title: "Senior Software Engineer",
    department: "Engineering",
    location: "Irvine, CA",
    type: "Full-time",
    posted: "2 days ago",
  },
  {
    id: 2,
    title: "Product Manager",
    department: "Product",
    location: "Remote",
    type: "Full-time",
    posted: "1 week ago",
  },
  {
    id: 3,
    title: "UX Designer",
    department: "Design",
    location: "Irvine, CA",
    type: "Full-time",
    posted: "3 days ago",
  },
  {
    id: 4,
    title: "Customer Service Representative",
    department: "Support",
    location: "Remote",
    type: "Full-time",
    posted: "5 days ago",
  },
  {
    id: 5,
    title: "Supply Chain Analyst",
    department: "Operations",
    location: "Kentucky, USA",
    type: "Full-time",
    posted: "1 week ago",
  },
  {
    id: 6,
    title: "Marketing Specialist",
    department: "Marketing",
    location: "Irvine, CA",
    type: "Full-time",
    posted: "4 days ago",
  },
];

const benefits = [
  {
    icon: Heart,
    title: "Health Benefits",
    description: "Comprehensive medical, dental, and vision coverage",
  },
  {
    icon: Coffee,
    title: "Free Products",
    description: "Monthly allowance for Eltooro products",
  },
  {
    icon: Dumbbell,
    title: "Wellness Programs",
    description: "Gym membership and wellness initiatives",
  },
  {
    icon: Zap,
    title: "Growth Opportunities",
    description: "Learning and development programs",
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-iherb-green text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Join Our Team
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Help us make health and wellness accessible to everyone around the
              world
            </p>
          </div>
        </section>

        {/* Why Work Here */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">
              Why Work at Eltooro?
            </h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
              We&apos;re passionate about health and wellness, and we want our
              team to thrive too.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="p-6 border rounded-lg text-center"
                >
                  <div className="w-12 h-12 bg-iherb-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-6 w-6 text-iherb-green" />
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Job Listings */}
        <section className="bg-muted py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">
              Open Positions
            </h2>
            <p className="text-muted-foreground text-center mb-12">
              Find your next opportunity with us
            </p>
            <div className="max-w-4xl mx-auto space-y-4">
              {jobListings.map((job) => (
                <div
                  key={job.id}
                  className="bg-card p-6 rounded-lg border hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {job.posted}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{job.type}</Badge>
                      <Button className="bg-iherb-green hover:bg-iherb-green-dark">
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button variant="outline" size="lg">
                View All Positions
              </Button>
            </div>
          </div>
        </section>

        {/* Culture Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <Users className="h-12 w-12 text-iherb-green mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Our Culture</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              At Eltooro, we believe in fostering an inclusive, collaborative
              environment where every voice is heard. We celebrate diversity and
              encourage innovation in everything we do.
            </p>
            <Link href="/about">
              <Button variant="outline">Learn More About Us</Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
