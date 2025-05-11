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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="font-bold mb-2">Saved Emails</h2>
        {savedEmails.map((email, idx) => (
          <div
            key={idx}
            className="cursor-pointer hover:bg-gray-200 p-2 rounded"
            onClick={() => setSelectedEmail(email)}
          >
            {email.subject}
          </div>
        ))}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto space-y-4">
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-xl font-bold">AI Email Marketer</h2>
            <Input
              placeholder="Product or Service"
              name="product"
              value={formData.product}
              onChange={handleChange}
            />
            <Input
              placeholder="Target Audience"
              name="audience"
              value={formData.audience}
              onChange={handleChange}
            />
            <Input
              placeholder="Marketing Goal (e.g., drive sales, build list)"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
            />
            <Input
              placeholder="Tone (e.g., friendly, professional)"
              name="tone"
              value={formData.tone}
              onChange={handleChange}
            />
            <Input
              placeholder="Additional Notes (optional)"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            />
            <Button onClick={generateEmail} disabled={loading}>
              {loading ? <Loader className="animate-spin" /> : "Generate Email"}
            </Button>
          </CardContent>
        </Card>

        {selectedEmail && (
          <Card>
            <CardContent>
              <h3 className="text-lg font-semibold">{selectedEmail.subject}</h3>
              <Textarea className="mt-2 h-60" value={selectedEmail.content} readOnly />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}