"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";

export default function EmailMarketer() {
  const [formData, setFormData] = useState({
    product: "",
    audience: "",
    goal: "",
    tone: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [emailOutput, setEmailOutput] = useState("");
  const [savedEmails, setSavedEmails] = useState<{ subject: string; content: string }[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<{ subject: string; content: string } | null>(null);
  const [isResponder, setIsResponder] = useState(true); // Default to Email Responder tab
  const [receivedEmail, setReceivedEmail] = useState(""); // Capturing received email
  const [responseTone, setResponseTone] = useState(""); // Tone for response
  const [responseDetails, setResponseDetails] = useState(""); // Details for response

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const extractSubject = (email: string) => {
    const match = email.match(/Subject:\s*(.*)/i);
    return match ? match[1] : "Untitled Email";
  };

  const generateEmail = async () => {
    setLoading(true);
    setEmailOutput("");

    const prompt = `Write a marketing email for the following:
    Product: ${formData.product}
    Audience: ${formData.audience}
    Goal: ${formData.goal}
    Tone: ${formData.tone}
    Additional Notes: ${formData.notes}
    Make it engaging and persuasive. Include a clear call to action.
    Include subject line and CTA.`;

    try {
      const response = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      const subject = extractSubject(data.email);

      setEmailOutput(data.email);
      setSavedEmails([...savedEmails, { subject, content: data.email }]);
      setSelectedEmail({ subject, content: data.email });
    } catch (error) {
      setEmailOutput("Error generating email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateResponse = async () => {
  setLoading(true);
  setEmailOutput("");

  const prompt = `You are an email responder. Here's the email you received:

  "${receivedEmail}"

  Respond to this email in a ${responseTone} tone. Include context: ${responseDetails}`;

  try {
    const response = await fetch("/api/generate-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await response.json();
    const subject = extractSubject(receivedEmail) || "Response Email";

    setEmailOutput(data.email);
    setSavedEmails([...savedEmails, { subject, content: data.email }]);
    setSelectedEmail({ subject, content: data.email });
  } catch (error) {
    setEmailOutput("Error generating response. Please try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex h-screen bg-gray-50 flex-col">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-72 bg-white shadow-md p-6 flex flex-col">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Saved Emails</h2>
          {savedEmails.length > 0 ? (
            savedEmails.map((email, idx) => (
              <div
                key={idx}
                className="cursor-pointer hover:bg-gray-200 p-2 rounded-lg mb-2 text-gray-700"
                onClick={() => setSelectedEmail(email)}
              >
                {email.subject}
              </div>
            ))
          ) : (
            <div className="text-gray-500">No emails saved yet</div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-4 border-b-2 pb-4">
            <Button
              onClick={() => setIsResponder(true)}
              className={`text-lg font-medium py-2 px-4 rounded-lg transition duration-200 ${
                isResponder
                  ? "text-white bg-gray-600 hover:bg-gray-700"
                  : "text-gray-600 bg-transparent hover:bg-gray-100"
              }`}
            >
              Email Responder
            </Button>
            <Button
              onClick={() => setIsResponder(false)}
              className={`text-lg font-medium py-2 px-4 rounded-lg transition duration-200 ${
                !isResponder
                  ? "text-white bg-gray-600 hover:bg-gray-700"
                  : "text-gray-600 bg-transparent hover:bg-gray-100"
              }`}
            >
              Marketing Email
            </Button>
          </div>

          {/* Content Area */}
          <Card>
            <CardContent className="space-y-6">
              {isResponder ? (
                <>
                  <h3 className="text-2xl font-semibold text-gray-700">Generate Email Response</h3>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Paste the received email here"
                      name="receivedEmail"
                      value={receivedEmail}
                      onChange={(e) => setReceivedEmail(e.target.value)}
                      className="w-full h-32 p-4 border rounded-lg text-gray-700"
                    />
                    <Input
                      placeholder="Response Details (context, questions, etc.)"
                      name="responseDetails"
                      value={responseDetails}
                      onChange={(e) => setResponseDetails(e.target.value)}
                      className="p-4 border rounded-lg text-gray-700"
                    />
                    <Input
                      placeholder="Response Tone (e.g., friendly, formal)"
                      name="responseTone"
                      value={responseTone}
                      onChange={(e) => setResponseTone(e.target.value)}
                      className="p-4 border rounded-lg text-gray-700"
                    />
                  </div>
                  <Button
                    onClick={generateResponse}
                    className="w-full py-2 mt-4 text-white bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300"
                    disabled={loading}
                  >
                    {loading ? <Loader className="animate-spin text-white" /> : "Generate Response"}
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-semibold text-gray-700">Generate Marketing Email</h3>
                  <div className="space-y-4">
                    <Input
                      placeholder="Product or Service"
                      name="product"
                      value={formData.product}
                      onChange={handleChange}
                      className="text-gray-700"
                    />
                    <Input
                      placeholder="Target Audience"
                      name="audience"
                      value={formData.audience}
                      onChange={handleChange}
                      className="text-gray-700"
                    />
                    <Input
                      placeholder="Marketing Goal (e.g., drive sales, build list)"
                      name="goal"
                      value={formData.goal}
                      onChange={handleChange}
                      className="text-gray-700"
                    />
                    <Input
                      placeholder="Tone (e.g., friendly, professional)"
                      name="tone"
                      value={formData.tone}
                      onChange={handleChange}
                      className="text-gray-700"
                    />
                    <Input
                      placeholder="Additional Notes (optional)"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      className="text-gray-700"
                    />
                  </div>
                  <Button
                    onClick={generateEmail}
                    className="w-full py-2 mt-4 text-white bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300"
                    disabled={loading}
                  >
                    {loading ? <Loader className="animate-spin text-white" /> : "Generate Email"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Output Display */}
          {emailOutput && (
            <Card>
              <CardContent>
                <h3 className="text-xl font-semibold text-gray-700">Generated Output</h3>
                <Textarea
                  className="mt-2 h-60 p-4 border rounded-lg text-gray-700"
                  value={emailOutput}
                  readOnly
                />
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>&copy; {new Date().getFullYear()} Kelley Media. All Rights Reserved.</p>
      </footer>
    </div>
  );
}