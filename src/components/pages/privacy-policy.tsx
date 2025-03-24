import React from "react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicyPage = () => {
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
            <CardTitle className="text-2xl font-bold">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <h2>1. Introduction</h2>
            <p>
              Welcome to JobSoko. We respect your privacy and are committed to
              protecting your personal data. This privacy policy will inform you
              about how we look after your personal data when you visit our
              website and tell you about your privacy rights and how the law
              protects you.
            </p>

            <h2>2. The Data We Collect About You</h2>
            <p>
              Personal data, or personal information, means any information
              about an individual from which that person can be identified. We
              may collect, use, store and transfer different kinds of personal
              data about you which we have grouped together as follows:
            </p>
            <ul>
              <li>
                <strong>Identity Data</strong> includes first name, last name,
                username or similar identifier, and date of birth.
              </li>
              <li>
                <strong>Contact Data</strong> includes email address, telephone
                numbers, and physical address.
              </li>
              <li>
                <strong>Technical Data</strong> includes internet protocol (IP)
                address, your login data, browser type and version, time zone
                setting and location, browser plug-in types and versions,
                operating system and platform, and other technology on the
                devices you use to access this website.
              </li>
              <li>
                <strong>Profile Data</strong> includes your username and
                password, your interests, preferences, feedback, and survey
                responses.
              </li>
              <li>
                <strong>Usage Data</strong> includes information about how you
                use our website, products, and services.
              </li>
            </ul>

            <h2>3. How We Use Your Personal Data</h2>
            <p>
              We will only use your personal data when the law allows us to.
              Most commonly, we will use your personal data in the following
              circumstances:
            </p>
            <ul>
              <li>
                Where we need to perform the contract we are about to enter into
                or have entered into with you.
              </li>
              <li>
                Where it is necessary for our legitimate interests (or those of
                a third party) and your interests and fundamental rights do not
                override those interests.
              </li>
              <li>Where we need to comply with a legal obligation.</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your
              personal data from being accidentally lost, used, or accessed in
              an unauthorized way, altered, or disclosed. In addition, we limit
              access to your personal data to those employees, agents,
              contractors, and other third parties who have a business need to
              know. They will only process your personal data on our
              instructions, and they are subject to a duty of confidentiality.
            </p>

            <h2>5. Data Retention</h2>
            <p>
              We will only retain your personal data for as long as reasonably
              necessary to fulfill the purposes we collected it for, including
              for the purposes of satisfying any legal, regulatory, tax,
              accounting, or reporting requirements. We may retain your personal
              data for a longer period in the event of a complaint or if we
              reasonably believe there is a prospect of litigation in respect to
              our relationship with you.
            </p>

            <h2>6. Your Legal Rights</h2>
            <p>
              Under certain circumstances, you have rights under data protection
              laws in relation to your personal data, including the right to:
            </p>
            <ul>
              <li>Request access to your personal data.</li>
              <li>Request correction of your personal data.</li>
              <li>Request erasure of your personal data.</li>
              <li>Object to processing of your personal data.</li>
              <li>Request restriction of processing your personal data.</li>
              <li>Request transfer of your personal data.</li>
              <li>Right to withdraw consent.</li>
            </ul>

            <h2>7. Changes to the Privacy Policy</h2>
            <p>
              We may update our privacy policy from time to time. We will notify
              you of any changes by posting the new privacy policy on this page
              and updating the "Last Updated" date at the top of this privacy
              policy.
            </p>

            <h2>8. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our privacy
              practices, please contact us at:
            </p>
            <p>
              Email: privacy@jobsoko.co.ke
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

export default PrivacyPolicyPage;
