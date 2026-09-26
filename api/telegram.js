
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("Luxxy AI Bot is running!");
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const groqKey = process.env.GROQ_API_KEY;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!token || !groqKey || !secret) {
    return res.status(500).send("Missing environment variables");
  }

  if (
    req.headers["x-telegram-bot-api-secret-token"] !== secret
  ) {
    return res.status(401).send("Unauthorized");
  }

  const message = req.body?.message;
  const chatId = message?.chat?.id;
  const text = message?.text;

  if (!chatId || !text) {
    return res.status(200).send("OK");
  }

  if (text === "/start") {
    await sendMessage(
      token,
      chatId,
      "မင်္ဂလာပါ။ Luxxy AI မှ ကြိုဆိုပါတယ်။ 🤖\nမေးချင်တာကို ပို့လိုက်ပါ။"
    );
    return res.status(200).send("OK");
  }

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are Luxxy AI. Reply in Burmese when the user speaks Burmese. Be helpful and friendly."
            },
            {
              role: "user",
              content: text
            }
          ],
          max_tokens: 1000
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq error:", data);
      await sendMessage(
        token,
        chatId,
        "AI Error ဖြစ်နေပါတယ်။ ခဏနေပြန်စမ်းပါ။"
      );
      return res.status(200).send("OK");
    }

    const answer =
      data.choices?.[0]?.message?.content ||
      "အဖြေမရရှိပါ။";

    // Telegram allows up to 4096 characters per message
    const chunks = answer.match(/[\s\S]{1,4000}/g) || [""];

    for (const chunk of chunks) {
      await sendMessage(token, chatId, chunk);
    }

    return res.status(200).send("OK");

  } catch (error) {
    console.error(error);

    await sendMessage(
      token,
      chatId,
      "တစ်ခုခုမှားနေပါတယ်။ ခဏနေပြန်စမ်းပါ။"
    );

    return res.status(200).send("OK");
  }
}

async function sendMessage(token, chatId, text) {
  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text
      })
    }
  );

  if (!response.ok) {
    console.error("Telegram sendMessage failed");
  }
}
