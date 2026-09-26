export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "API key is missing"
      });
    }

    const { message } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Please enter a message"
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-5",
          instructions: `
You are RZXXY AI, a helpful AI assistant.

Speak Burmese or English depending on the user's language.

Help users with:
- Coding and programming
- Business and technology
- Education and learning
- General questions

Be friendly, accurate, and easy to understand.
          `,
          input: message,
          max_output_tokens: 1000
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);

      return res.status(502).json({
        error: "AI service error. Please try again."
      });
    }

    return res.status(200).json({
      reply: data.output_text || "No response received."
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Something went wrong."
    });
  }
}
