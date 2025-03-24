import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, Mail, Briefcase, Upload, Save, User, Building, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

const businessCategories = [
  "Construction",
  "Delivery",
  "Cleaning",
  "Retail",
  "Hospitality",
  "Farming",
  "Security",
  "Transportation",
  "Manufacturing",
  "Other",
];

export default function CompanyProfile() {
  const { user, userProfile, updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [location, setLocation] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [yearFounded, setYearFounded] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");

  useEffect(() => {
    if (userProfile) {
      setBusinessName(userProfile.businessName || "");
      setBusinessType(userProfile.businessType || "");
      setLocation(userProfile.location || "");
      setContactPerson(userProfile.fullName || "");
      setPhone(userProfile.phone || "");
      setEmail(user?.email || "");
      setWebsite(userProfile.website || "");
      setDescription(userProfile.description || "");
      setLogoUrl(userProfile.logoUrl || "");
      setYearFounded(userProfile.yearFounded || "");
      setEmployeeCount(userProfile.employeeCount || "");
    }
  }, [userProfile, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedProfile = {
        businessName,
        businessType,
        location,
        fullName: contactPerson,
        phone,
        website,
        description,
        logoUrl,
        yearFounded,
        employeeCount
      };

      await updateProfile(updatedProfile);

      toast({
        title: "Company profile updated",
        description: "Your company profile has been updated successfully.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error updating company profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update company profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Upload file to Supabase Storage
      const fileName = `${user?.id}-logo-${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage
        .from("company_logos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from("company_logos").getPublicUrl(fileName);
      const logoUrl = data.publicUrl;

      // Update state
      setLogoUrl(logoUrl);

      toast({
        title: "Logo uploaded",
        description: "Your company logo has been uploaded successfully.",
      });
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload logo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Company Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-32 w-32">
                    {logoUrl ? (
                      <AvatarImage 
                        src={logoUrl} 
                        alt="Company Logo" 
                      />
                    ) : (
                      <AvatarImage 
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${businessName || user?.email}`} 
                        alt="Company Logo" 
                      />
                    )}
                    <AvatarFallback className="text-4xl">
                      {businessName?.[0] || "C"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="w-full space-y-4 mt-4">
                    <div>
                      <Label htmlFor="logo" className="text-sm font-medium">Company Logo</Label>
                      <div className="mt-2">
                        <Input
                          id="logo"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <Label htmlFor="logo" className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                          <Upload className="h-5 w-5 text-gray-500" />
                          <span className="text-sm text-gray-600">{logoUrl ? "Change Logo" : "Upload Logo"}</span>
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:w-2/3 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-sm font-medium flex items-center">
                      <Building className="h-4 w-4 mr-1 text-gray-500" />
                      Business Name
                    </Label>
                    <Input
                      id="businessName"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="h-10"
                      placeholder="e.g. ABC Construction Ltd"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessType" className="text-sm font-medium flex items-center">
                      <Briefcase className="h-4 w-4 mr-1 text-gray-500" />
                      Business Type
                    </Label>
                    <Select value={businessType} onValueChange={setBusinessType}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessCategories.map((category) => (
                          <SelectItem key={category} value={category.toLowerCase()}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="yearFounded" className="text-sm font-medium">
                      Year Founded
                    </Label>
                    <Input
                      id="yearFounded"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={yearFounded}
                      onChange={(e) => setYearFounded(e.target.value)}
                      className="h-10"
                      placeholder="e.g. 2010"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employeeCount" className="text-sm font-medium">
                      Number of Employees
                    </Label>
                    <Select value={employeeCount} onValueChange={setEmployeeCount}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select employee count" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10</SelectItem>
                        <SelectItem value="11-50">11-50</SelectItem>
                        <SelectItem value="51-200">51-200</SelectItem>
                        <SelectItem value="201-500">201-500</SelectItem>
                        <SelectItem value="500+">500+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                    Business Location
                  </Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Westlands, Nairobi"
                    className="h-10"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson" className="text-sm font-medium flex items-center">
                      <User className="h-4 w-4 mr-1 text-gray-500" />
                      Contact Person
                    </Label>
                    <Input
                      id="contactPerson"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium flex items-center">
                      <Phone className="h-4 w-4 mr-1 text-gray-500" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium flex items-center">
                      <Mail className="h-4 w-4 mr-1 text-gray-500" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      value={email}
                      disabled
                      className="h-10 bg-gray-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-sm font-medium flex items-center">
                      <Globe className="h-4 w-4 mr-1 text-gray-500" />
                      Website (optional)
                    </Label>
                    <Input
                      id="website"
                      value={website}
                      onChange={(e