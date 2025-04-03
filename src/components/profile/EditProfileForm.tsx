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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Upload,
  Save,
  User,
  Trash2,
  Plus,
  Calendar,
  DollarSign,
  Building,
  GraduationCap,
  Moon,
  Sun,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  const { user, userProfile, updateProfile, toggleDarkMode } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState("");
  const [activeTab, setActiveTab] = useState("basic");

  // Form state - Basic Info
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [skills, setSkills] = useState("");
  const [preferredCategory, setPreferredCategory] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [bio, setBio] = useState("");

  // Education state
  const [education, setEducation] = useState<
    Array<{
      institution: string;
      degree: string;
      fieldOfStudy: string;
      startDate: string;
      endDate?: string;
      stillStudying: boolean;
      description: string;
    }>
  >([]);

  // Hourly rate state
  const [hourlyRate, setHourlyRate] = useState<number | "">("");

  // Profile photo state
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);

  // Dark mode state
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || "");
      setPhone(userProfile.phone || "");
      setLocation(userProfile.location || "");
      setCity(userProfile.city || "");
      setState(userProfile.state || "");
      setDateOfBirth(userProfile.dateOfBirth || "");
      setSkills(userProfile.skills ? userProfile.skills.join(", ") : "");
      setPreferredCategory(userProfile.preferredCategory || "");
      setBusinessName(userProfile.businessName || "");
      setBusinessType(userProfile.businessType || "");
      setBio(userProfile.bio || "");
      setEducation(userProfile.education || []);
      setHourlyRate(userProfile.hourlyRate || "");
      setProfilePhotoUrl(userProfile.profilePhotoUrl || "");
      setDarkMode(userProfile.darkMode || false);
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload profile photo if selected
      let photoUrl = profilePhotoUrl;
      if (profilePhotoFile) {
        const fileName = `${user?.id}-profile-${Date.now()}.${profilePhotoFile.name.split(".").pop()}`;
        const { error: uploadError, data } = await supabase.storage
          .from("profiles")
          .upload(fileName, profilePhotoFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("profiles")
          .getPublicUrl(fileName);
        photoUrl = urlData.publicUrl;
      }

      const updatedProfile = {
        fullName,
        phone,
        location,
        city,
        state,
        dateOfBirth,
        skills: skills ? skills.split(",").map((skill) => skill.trim()) : [],
        preferredCategory,
        businessName,
        businessType,
        bio,
        avatar: selectedEmoji || undefined,
        education,
        hourlyRate: hourlyRate === "" ? null : Number(hourlyRate),
        profilePhotoUrl: photoUrl,
        darkMode,
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

  // Add a new education entry
  const addEducation = () => {
    setEducation([
      ...education,
      {
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        stillStudying: false,
        description: "",
      },
    ]);
  };

  // Remove an education entry
  const removeEducation = (index: number) => {
    const newEducation = [...education];
    newEducation.splice(index, 1);
    setEducation(newEducation);
  };

  // Update an education entry
  const updateEducation = (
    index: number,
    field: string,
    value: string | boolean,
  ) => {
    const newEducation = [...education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setEducation(newEducation);
  };

  // Handle profile photo upload
  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG or PNG image",
        variant: "destructive",
      });
      return;
    }

    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setProfilePhotoUrl(previewUrl);
    setProfilePhotoFile(file);
  };

  // Handle dark mode toggle
  const handleDarkModeToggle = async () => {
    try {
      const newDarkMode = await toggleDarkMode();
      setDarkMode(newDarkMode);
    } catch (error: any) {
      console.error("Error toggling dark mode:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to toggle dark mode",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="bg-background">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-gray-500" />
              <Switch
                checked={darkMode}
                onCheckedChange={handleDarkModeToggle}
                aria-label="Toggle dark mode"
              />
              <Moon className="h-4 w-4 text-gray-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="basic"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="mb-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="pricing">Hourly Rate</TabsTrigger>
              <TabsTrigger value="bio">Bio</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-6">
              <TabsContent value="basic" className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        <Avatar className="h-32 w-32 border-2 border-gray-200">
                          {profilePhotoUrl ? (
                            <AvatarImage src={profilePhotoUrl} alt="Profile" />
                          ) : (
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.fullName || user?.email}`}
                              alt="Profile"
                            />
                          )}
                          <AvatarFallback className="text-4xl">
                            {selectedEmoji ||
                              userProfile?.avatar ||
                              userProfile?.fullName?.[0] ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0 bg-white shadow-md"
                          onClick={() =>
                            document.getElementById("profilePhoto")?.click()
                          }
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Input
                          id="profilePhoto"
                          type="file"
                          accept="image/jpeg,image/png,image/jpg"
                          onChange={handleProfilePhotoUpload}
                          className="hidden"
                        />
                      </div>

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
                              className={`text-2xl p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedEmoji === emoji ? "bg-green-100 dark:bg-green-900 ring-2 ring-green-500" : ""}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="w-full space-y-4 mt-4">
                        <div>
                          <Label
                            htmlFor="resume"
                            className="text-sm font-medium"
                          >
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
                              className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              <Upload className="h-5 w-5 text-gray-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
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
                        htmlFor="dateOfBirth"
                        className="text-sm font-medium flex items-center"
                      >
                        <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                        Date of Birth
                      </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="h-10"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="city"
                          className="text-sm font-medium flex items-center"
                        >
                          <Building className="h-4 w-4 mr-1 text-gray-500" />
                          City
                        </Label>
                        <Input
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Nairobi"
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="state"
                          className="text-sm font-medium flex items-center"
                        >
                          <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                          State/Province
                        </Label>
                        <Input
                          id="state"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="e.g. Nairobi County"
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
                        Full Address
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
                          <Label
                            htmlFor="skills"
                            className="text-sm font-medium"
                          >
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
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="education" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2 text-gray-500" />
                    Education
                  </h3>
                  <Button
                    type="button"
                    onClick={addEducation}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Education
                  </Button>
                </div>

                {education.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <GraduationCap className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No education entries yet</p>
                    <Button
                      type="button"
                      onClick={addEducation}
                      variant="outline"
                      size="sm"
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Education
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {education.map((edu, index) => (
                      <Card key={index} className="relative">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                          onClick={() => removeEducation(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <Label
                                htmlFor={`institution-${index}`}
                                className="text-sm font-medium"
                              >
                                Institution Name
                              </Label>
                              <Input
                                id={`institution-${index}`}
                                value={edu.institution}
                                onChange={(e) =>
                                  updateEducation(
                                    index,
                                    "institution",
                                    e.target.value,
                                  )
                                }
                                placeholder="e.g. University of Nairobi"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label
                                htmlFor={`degree-${index}`}
                                className="text-sm font-medium"
                              >
                                Degree/Course
                              </Label>
                              <Input
                                id={`degree-${index}`}
                                value={edu.degree}
                                onChange={(e) =>
                                  updateEducation(
                                    index,
                                    "degree",
                                    e.target.value,
                                  )
                                }
                                placeholder="e.g. Bachelor's Degree"
                              />
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <Label
                              htmlFor={`fieldOfStudy-${index}`}
                              className="text-sm font-medium"
                            >
                              Field of Study
                            </Label>
                            <Input
                              id={`fieldOfStudy-${index}`}
                              value={edu.fieldOfStudy}
                              onChange={(e) =>
                                updateEducation(
                                  index,
                                  "fieldOfStudy",
                                  e.target.value,
                                )
                              }
                              placeholder="e.g. Computer Science"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <Label
                                htmlFor={`startDate-${index}`}
                                className="text-sm font-medium"
                              >
                                Start Date
                              </Label>
                              <Input
                                id={`startDate-${index}`}
                                type="date"
                                value={edu.startDate}
                                onChange={(e) =>
                                  updateEducation(
                                    index,
                                    "startDate",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label
                                htmlFor={`endDate-${index}`}
                                className="text-sm font-medium flex justify-between"
                              >
                                <span>End Date</span>
                                <div className="flex items-center">
                                  <Switch
                                    id={`stillStudying-${index}`}
                                    checked={edu.stillStudying}
                                    onCheckedChange={(checked) => {
                                      updateEducation(
                                        index,
                                        "stillStudying",
                                        checked,
                                      );
                                      if (checked) {
                                        updateEducation(index, "endDate", "");
                                      }
                                    }}
                                    className="mr-2"
                                  />
                                  <Label
                                    htmlFor={`stillStudying-${index}`}
                                    className="text-xs cursor-pointer"
                                  >
                                    Still Studying
                                  </Label>
                                </div>
                              </Label>
                              <Input
                                id={`endDate-${index}`}
                                type="date"
                                value={edu.endDate}
                                onChange={(e) =>
                                  updateEducation(
                                    index,
                                    "endDate",
                                    e.target.value,
                                  )
                                }
                                disabled={edu.stillStudying}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor={`description-${index}`}
                              className="text-sm font-medium"
                            >
                              Description (Optional)
                            </Label>
                            <Textarea
                              id={`description-${index}`}
                              value={edu.description}
                              onChange={(e) =>
                                updateEducation(
                                  index,
                                  "description",
                                  e.target.value,
                                )
                              }
                              placeholder="Describe your studies, achievements, etc."
                              rows={3}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pricing" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-gray-500" />
                    Hourly Rate
                  </h3>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label
                            htmlFor="hourlyRate"
                            className="text-sm font-medium mr-2"
                          >
                            Your Hourly Rate (KSh)
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="w-[200px] text-xs">
                                  Set your hourly rate. This is what clients
                                  will see on your profile.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="hourlyRate"
                            type="number"
                            min="0"
                            step="10"
                            value={hourlyRate}
                            onChange={(e) =>
                              setHourlyRate(
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                              )
                            }
                            className="pl-10"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      {hourlyRate !== "" && Number(hourlyRate) > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                          <h4 className="font-medium text-sm">
                            Rate Breakdown
                          </h4>
                          <div className="flex justify-between text-sm">
                            <span>Your Rate</span>
                            <span>KSh {hourlyRate}/hr</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Service Fee (10%)</span>
                            <span>
                              - KSh {(Number(hourlyRate) * 0.1).toFixed(2)}/hr
                            </span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between font-medium">
                            <span>You'll Receive</span>
                            <span>
                              KSh {(Number(hourlyRate) * 0.9).toFixed(2)}/hr
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bio" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Personal Bio</h3>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <Label htmlFor="bio" className="text-sm font-medium">
                        Tell clients about yourself
                      </Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Introduce yourself, your experience, and what makes you a great hire..."
                        rows={8}
                        className="resize-y min-h-[200px]"
                      />
                      <div className="text-xs text-gray-500">
                        <p>Tips for a great bio:</p>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>Highlight your key skills and experience</li>
                          <li>Mention your work style and availability</li>
                          <li>Keep it professional but personable</li>
                          <li>Include any relevant certifications</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <div className="flex justify-end gap-4 pt-4 mt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
