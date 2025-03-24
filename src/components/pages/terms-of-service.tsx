import React from "react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsOfServicePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <TopNavigation />
      <div className="container mx-auto p-6 mt-16">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Terms of Service
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <h2>1. Introduction</h2>
            <p>
              Welcome to JobSoko. These terms and conditions outline the rules
              and regulations for the use of our website and services.
            </p>
            <p>
              By accessing this website, we assume you accept these terms and
              conditions in full. Do not continue to use JobSoko if you do not
              accept all of the terms and conditions stated on this page.
            </p>

            <h2>2. License to Use</h2>
            <p>
              Unless otherwise stated, JobSoko and/or its licensors own the
              intellectual property rights for all material on JobSoko. All
              intellectual property rights are reserved. You may view and/or
              print pages from the website for your own personal use subject to
              restrictions set in these terms and conditions.
            </p>
            <p>You must not:</p>
            <ul>
              <li>Republish material from this website</li>
              <li>Sell, rent, or sub-license material from the website</li>
              <li>Reproduce, duplicate, or copy material from the website</li>
              <li>
                Redistribute content from JobSoko (unless content is
                specifically made for redistribution)
              </li>
            </ul>

            <h2>3. User Accounts</h2>
            <p>
              When you create an account with us, you guarantee that the
              information you provide is accurate, complete, and current at all
              times. Inaccurate, incomplete, or obsolete information may result
              in the immediate termination of your account on the service.
            </p>
            <p>
              You are responsible for maintaining the confidentiality of your
              account and password, including but not limited to the restriction
              of access to your computer and/or account. You agree to accept
              responsibility for any and all activities or actions that occur
              under your account and/or password.
            </p>

            <h2>4. Job Listings and Applications</h2>
            <p>
              Employers are responsible for the content of their job listings.
              JobSoko does not guarantee the accuracy, completeness, or quality
              of any jobs posted on our platform or the qualifications of any
              job seeker.
            </p>
            <p>
              Job seekers are responsible for the content of their applications,
              resumes, and any other information they provide to employers
              through our platform. JobSoko does not guarantee employment or the
              quality of employers posting jobs on our platform.
            </p>

            <h2>5. Prohibited Activities</h2>
            <p>
              You may not use our platform for any illegal or unauthorized
              purpose. You must not, in the use of the service, violate any laws
              in your jurisdiction (including but not limited to copyright
              laws).
            </p>
            <p>Prohibited activities include, but are not limited to:</p>
            <ul>
              <li>
                Posting false, inaccurate, misleading, defamatory, or libelous
                content
              </li>
              <li>
                Posting content that is discriminatory, unlawful, harassing, or
                offensive
              </li>
              <li>Impersonating any person or entity</li>
              <li>
                Interfering with or disrupting the service or servers or
                networks connected to the service
              </li>
              <li>Collecting or tracking the personal information of others</li>
              <li>
                Spamming, phishing, or engaging in any other fraudulent activity
              </li>
            </ul>

            <h2>6. Limitation of Liability</h2>
            <p>
              In no event shall JobSoko, nor its directors, employees, partners,
              agents, suppliers, or affiliates, be liable for any indirect,
              incidental, special, consequential, or punitive damages, including
              without limitation, loss of profits, data, use, goodwill, or other
              intangible losses, resulting from your access to or use of or
              inability to access or use the service.
            </p>

            <h2>7. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the
              laws of Kenya, without regard to its conflict of law provisions.
            </p>
            <p>
              Our failure to enforce any right or provision of these Terms will
              not be considered a waiver of those rights. If any provision of
              these Terms is held to be invalid or unenforceable by a court, the
              remaining provisions of these Terms will remain in effect.
            </p>

            <h2>8. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace
              these Terms at any time. If a revision is material, we will
              provide at least 30 days' notice prior to any new terms taking
              effect. What constitutes a material change will be determined at
              our sole discretion.
            </p>

            <h2>9. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p>
              Email: terms@jobsoko.co.ke
              <br />
              Phone: +254 700 123 456
              <br />
              Address: Westlands Business Park, Nairobi, Kenya
            </p>

            <p className="text-sm text-gray-500 mt-8">
              Last Updated: July 1, 2024
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
