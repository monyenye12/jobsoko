import React from "react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MapPin,
  Users,
  Award,
  Globe,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AboutUsPage = () => {
  const navigate = useNavigate();

  const teamMembers = [
    {
      name: "John Kamau",
      role: "Founder & CEO",
      bio: "John has over 15 years of experience in the Kenyan job market and founded JobSoko to bridge the gap between informal workers and employers.",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
    },
    {
      name: "Sarah Wanjiku",
      role: "Chief Operations Officer",
      bio: "With a background in HR and community development, Sarah ensures JobSoko's operations align with the needs of local communities.",
      image:
        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&q=80",
    },
    {
      name: "David Ochieng",
      role: "Chief Technology Officer",
      bio: "David leads our tech team, bringing years of experience in developing mobile-first solutions for the African market.",
      image:
        "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=300&q=80",
    },
    {
      name: "Mary Njeri",
      role: "Community Relations Manager",
      bio: "Mary works closely with communities to ensure JobSoko meets the needs of local workers.",
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=80",
    },
  ];

  const companyValues = [
    {
      title: "Community-Focused",
      description:
        "We build solutions that address the real needs of local communities.",
      icon: <Users className="h-8 w-8 text-blue-500" />,
    },
    {
      title: "Integrity",
      description:
        "We operate with transparency and honesty in all our dealings.",
      icon: <Award className="h-8 w-8 text-blue-500" />,
    },
    {
      title: "Innovation",
      description:
        "We continuously seek new ways to solve employment challenges in Kenya.",
      icon: <Globe className="h-8 w-8 text-blue-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <TopNavigation />
      <div className="container mx-auto px-4 py-16 mt-16">
        <Button
          variant="ghost"
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            About JobSoko
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <p className="text-gray-700 dark:text-gray-300">
              JobSoko is a hyper-local job marketplace designed specifically for
              the Kenyan informal sector. Our mission is to connect skilled
              workers with local job opportunities, reducing unemployment and
              improving livelihoods across Kenya.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Founded in 2023, we've already connected thousands of workers with
              employers in their local communities, focusing on blue-collar and
              service jobs that don't require formal qualifications.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {companyValues.map((value, index) => (
              <Card
                key={index}
                className="border border-gray-200 dark:border-gray-700"
              >
                <CardHeader className="pb-2">
                  <div className="mb-2">{value.icon}</div>
                  <CardTitle>{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {teamMembers.map((member, index) => (
              <Card
                key={index}
                className="border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-1/3">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover aspect-square"
                    />
                  </div>
                  <div className="w-full md:w-2/3 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {member.name}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 mb-2">
                      {member.role}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {member.bio}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Contact Us
          </h2>
          <Card className="border border-gray-200 dark:border-gray-700 mb-12">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Get in Touch
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <MapPin className="h-5 w-5 text-blue-500" />
                      <span>Kimathi Street, Nairobi, Kenya</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <Phone className="h-5 w-5 text-blue-500" />
                      <span>+254 712 345 678</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <Mail className="h-5 w-5 text-blue-500" />
                      <span>info@jobsoko.co.ke</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Business Hours
                  </h3>
                  <div className="space-y-2 text-gray-600 dark:text-gray-400">
                    <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p>Saturday: 9:00 AM - 1:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit Our Office
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
