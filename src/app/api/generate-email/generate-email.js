import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const { prompt } = req.body;

  try {
    // Generate email using OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a helpful email marketing assistant.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    const openaiData = await openaiResponse.json();
    const message = openaiData.choices[0].message.content;
    console.log("Generated email content:", message);

    // Send to Mailchimp
    const mailchimpAuth = {
      username: 'anystring',
      password: process.env.MAILCHIMP_API_KEY,
    };

    const mailchimpBase = `https://${process.env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0`;

    const campaign = await axios.post(
      `${mailchimpBase}/campaigns`,
      {
        type: 'regular',
        recipients: { list_id: process.env.MAILCHIMP_LIST_ID },
        settings: {
          subject_line: 'AI-Generated Campaign',
          title: `AI Campaign - ${new Date().toISOString()}`,
          from_name: 'Your Company',
          reply_to: 'you@example.com',
        },
      },
      { auth: mailchimpAuth }
    );

    await axios.put(
      `${mailchimpBase}/campaigns/${campaign.data.id}/content`,
      { html: message },
      { auth: mailchimpAuth }
    );

    console.log("OpenAI API response:", JSON.stringify(data, null, 2));
    res.status(200).json({ email: message });
  } catch (err) {
    console.error("Error calling OpenAI:", err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}
