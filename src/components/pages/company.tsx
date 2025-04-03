import React from "react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "../../../supabase/auth";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Calendar,
  Building,
  Edit,
  Star,
  CheckCircle,
} from "lucide-react";

const CompanyPage = () => {
  const { userProfile } = useAuth();

  // Mock company data
  const companyData = {
    name: userProfile?.businessName || "Acme Corporation",
    logo: "/company-logo.png",
    description:
      "A leading employer in the construction and engineering sector, providing quality services across Kenya.",
    industry: userProfile?.businessType || "Construction & Engineering",
    location: userProfile?.location || "Nairobi, Kenya",
    website: "https://acmecorp.co.ke",
    phone: userProfile?.phone || "+254 712 345 678",
    email: "info@acmecorp.co.ke",
    founded: "2010",
    employees: "50-200",
    verified: true,
    rating: 4.7,
    reviews: 28,
    socialMedia: {
      facebook: "https://facebook.com/acmecorp",
      twitter: "https://twitter.com/acmecorp",
      linkedin: "https://linkedin.com/company/acmecorp",
    },
  };

  // Mock job listings
  const jobListings = [
    {
      id: "job1",
      title: "Construction Site Manager",
      location: "Nairobi CBD",
      type: "Full-time",
      salary: "KSh 80,000 - 120,000",
      posted: "2 days ago",
      applicants: 12,
    },
    {
      id: "job2",
      title: "Civil Engineer",
      location: "Westlands, Nairobi",
      type: "Full-time",
      salary: "KSh 70,000 - 90,000",
      posted: "1 week ago",
      applicants: 24,
    },
    {
      id: "job3",
      title: "Electrical Technician",
      location: "Mombasa Road",
      type: "Contract",
      salary: "KSh 45,000 - 60,000",
      posted: "3 days ago",
      applicants: 8,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-gray-950">
      <TopNavigation />
      <div className="flex h-[calc(100vh-64px)] mt-16">
        <Sidebar activeItem="Settings" />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="relative h-48 bg-gradient-to-r from-blue-500 to-blue-700">
                <Button
                  className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white"
                  size="sm"
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit Cover
                </Button>
              </div>

              <div className="px-6 pb-6">
                <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-4 gap-4">
                  <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-800 rounded-xl bg-white dark:bg-gray-700 shadow-md">
                    {companyData.logo ? (
                      <AvatarImage
                        src={companyData.logo}
                        alt={companyData.name}
                      />
                    ) : (
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${companyData.name}`}
                      />
                    )}
                    <AvatarFallback className="text-2xl">
                      {companyData.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {companyData.name}
                      </h1>
                      {companyData.verified && (
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 flex items-center gap-1 h-6 px-2"
                        >
                          <CheckCircle className="h-3 w-3" /> Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      {companyData.industry}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-gray-500 dark:text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{companyData.location}</span>
                    </div>
                    <div className="flex items-center mt-2 gap-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">
                          {companyData.rating}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                          ({companyData.reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 md:mt-0">
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      Contact
                    </Button>
                    <Button variant="outline">Share</Button>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      About {companyData.name}
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {companyData.description}
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                      Current Job Openings
                    </h3>
                    <div className="space-y-4">
                      {jobListings.map((job) => (
                        <Card
                          key={job.id}
                          className="border border-gray-200 dark:border-gray-700"
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {job.title}
                                </h4>
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  <span>{job.location}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {job.type}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                  >
                                    {job.salary}
                                  </Badge>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {job.posted}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {job.applicants} applicants
                                </span>
                                <Button
                                  size="sm"
                                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Card className="border border-gray-200 dark:border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">
                          Company Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-start gap-2">
                          <Building className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Industry
                            </p>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {companyData.industry}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Location
                            </p>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {companyData.location}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Website
                            </p>
                            <a
                              href={companyData.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {companyData.website.replace("https://", "")}
                            </a>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Phone
                            </p>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {companyData.phone}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Email
                            </p>
                            <a
                              href={`mailto:${companyData.email}`}
                              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {companyData.email}
                            </a>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Founded
                            </p>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {companyData.founded}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Users className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Company Size
                            </p>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {companyData.employees} employees
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CompanyPage;
