"use client";

import React, { useState, ChangeEvent } from "react";
import { Card, CardContent } from "../components/ui/card";
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
  });
  const [loading, setLoading] = useState(false);
  const [emailOutput, setEmailOutput] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateEmail = async () => {
    setLoading(true);
    setEmailOutput("");
    console.log("▶ Sending request to API...");

    const prompt = `Write a marketing email for the following:
    Product: ${formData.product}
    Audience: ${formData.audience}
    Goal: ${formData.goal}
    Tone: ${formData.tone}
    Include subject line and CTA.`;

    try {
      console.log("📩 Prompt sent to API:", prompt);
      const response = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      console.log("✅ Response from backend:", data);
      setEmailOutput(data.email);
    } catch (error) {
      console.error("❌ Error calling API:", error);
      setEmailOutput("Error generating email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
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
          <Button onClick={generateEmail} disabled={loading}>
            {loading ? <Loader className="animate-spin" /> : "Generate Email"}
          </Button>
        </CardContent>
      </Card>

      {emailOutput && (
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold">Generated Email</h3>
            <Textarea className="mt-2 h-60" value={emailOutput} readOnly />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

