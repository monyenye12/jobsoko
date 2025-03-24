import React from "react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Users, Award, Globe, Phone, Mail, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AboutUsPage = () => {
  const navigate = useNavigate();

  const teamMembers = [
    {
      name: "John Kamau",
      role: "Founder & CEO",
      bio: "John has over 15 years of experience in the Kenyan job market and founded JobSoko to bridge the gap between informal workers and employers.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80"
    },
    {
      name: "Sarah Wanjiku",
      role: "Chief Operations Officer",
      bio: "With a background in HR and community development, Sarah ensures JobSoko's operations align with the needs of local communities.",
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&q=80"
    },
    {
      name: "David Ochieng",
      role: "Chief Technology Officer",
      bio: "David leads our tech team, bringing years of experience in developing mobile-first solutions for the African market.",
      image: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=300&q=80"
    },
    {
      name: "Mary Njeri",
      role: "Community Relations Manager",
      bio: "Mary works