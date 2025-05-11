export const runtime = "nodejs";

export async function POST(req: Request) {

  const { prompt } = await req.json();

  try {
    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        messages: [
          {
            role: "system",
            content: "You are a helpful email marketing assistant.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return new Response(JSON.stringify({ error: data.error.message }), {
        status: 500,
      });
    }

    const message = data.choices?.[0]?.message?.content ?? "No message returned.";
    return new Response(JSON.stringify({ email: message }), { status: 200 });

  } catch (error) {
    console.error("Error communicating with Together API:", error);
    return new Response(JSON.stringify({ error: "Failed to generate email." }), {
      status: 500,
    });
  }
}