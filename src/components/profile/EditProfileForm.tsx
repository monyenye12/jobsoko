import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Upload,
  Save,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const jobCategories = [
  "Construction",
  "Delivery",
  "Cleaning",
  "Retail",
  "Hospitality",
  "Farming",
  "Security",
  "Driving",
  "Other",
];

const avatarEmojis = [
  "😀",
  "😎",
  "🤓",
  "🧑‍💼",
  "👷‍♂️",
  "👩‍🔧",
  "👨‍🌾",
  "👮‍♀️",
  "🧑‍🏭",
  "👨‍💻",
  "👩‍🍳",
  "🧑‍🚀",
];

export default function EditProfileForm() {
  const { user, userProfile, updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState("");

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [preferredCategory, setPreferredCategory] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || "");
      setPhone(userProfile.phone || "");
      setLocation(userProfile.location || "");
      setSkills(userProfile.skills ? userProfile.skills.join(", ") : "");
      setPreferredCategory(userProfile.preferredCategory || "");
      setBusinessName(userProfile.businessName || "");
      setBusinessType(userProfile.businessType || "");
      setBio(userProfile.bio || "");
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedProfile = {
        fullName,
        phone,
        location,
        skills: skills ? skills.split(",").map((skill) => skill.trim()) : [],
        preferredCategory,
        businessName,
        businessType,
        bio,
        avatar: selectedEmoji || undefined,
      };

      await updateProfile(updatedProfile);

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Resume upload triggered in EditProfileForm");
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is PDF
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Upload file to Supabase Storage
      const fileName = `${user?.id}-resume-${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from("resumes").getPublicUrl(fileName);
      const resumeUrl = data.publicUrl;

      // Update user profile with resume URL
      await supabase
        .from("users")
        .update({ resume_url: resumeUrl })
        .eq("id", user?.id);

      toast({
        title: "Resume uploaded",
        description: "Your resume has been uploaded successfully.",
      });
    } catch (error: any) {
      console.error("Error uploading resume:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload resume",
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
          <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.fullName || user?.email}`}
                      alt="Profile"
                    />
                    <AvatarFallback className="text-4xl">
                      {selectedEmoji ||
                        userProfile?.avatar ||
                        userProfile?.fullName?.[0] ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="text-center">
                    <Label className="text-sm font-medium mb-2 block">
                      Choose Avatar Emoji
                    </Label>
                    <div className="flex flex-wrap justify-center gap-2 max-w-xs">
                      {avatarEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setSelectedEmoji(emoji)}
                          className={`text-2xl p-2 rounded-full hover:bg-gray-100 ${selectedEmoji === emoji ? "bg-green-100 ring-2 ring-green-500" : ""}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="w-full space-y-4 mt-4">
                    <div>
                      <Label htmlFor="resume" className="text-sm font-medium">
                        Resume (PDF only)
                      </Label>
                      <div className="mt-2">
                        <Input
                          id="resume"
                          type="file"
                          accept="application/pdf"
                          onChange={handleResumeUpload}
                          className="hidden"
                        />
                        <Label
                          htmlFor="resume"
                          className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                        >
                          <Upload className="h-5 w-5 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            Upload Resume (PDF)
                          </span>
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:w-2/3 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="fullName"
                      className="text-sm font-medium flex items-center"
                    >
                      <User className="h-4 w-4 mr-1 text-gray-500" />
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-sm font-medium flex items-center"
                    >
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

                <div className="space-y-2">
                  <Label
                    htmlFor="location"
                    className="text-sm font-medium flex items-center"
                  >
                    <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Westlands, Nairobi"
                    className="h-10"
                  />
                </div>

                {userProfile?.role === "job_seeker" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="skills" className="text-sm font-medium">
                        Skills (comma separated)
                      </Label>
                      <Input
                        id="skills"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="e.g. Construction, Painting, Carpentry"
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="preferredCategory"
                        className="text-sm font-medium flex items-center"
                      >
                        <Briefcase className="h-4 w-4 mr-1 text-gray-500" />
                        Preferred Job Category
                      </Label>
                      <Select
                        value={preferredCategory}
                        onValueChange={setPreferredCategory}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {jobCategories.map((category) => (
                            <SelectItem
                              key={category}
                              value={category.toLowerCase()}
                            >
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label
                        htmlFor="businessName"
                        className="text-sm font-medium flex items-center"
                      >
                        <Briefcase className="h-4 w-4 mr-1 text-gray-500" />
                        Business Name
                      </Label>
                      <Input
                        id="businessName"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. ABC Construction Ltd"
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="businessType"
                        className="text-sm font-medium"
                      >
                        Business Type
                      </Label>
                      <Select
                        value={businessType}
                        onValueChange={setBusinessType}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          {jobCategories.map((category) => (
                            <SelectItem
                              key={category}
                              value={category.toLowerCase()}
                            >
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium">
                    Bio / About Me
                  </Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us a bit about yourself..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
