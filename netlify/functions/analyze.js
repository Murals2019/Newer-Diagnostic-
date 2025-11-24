import fetch from "node-fetch";

export async function handler(event, context) {
  const { data } = JSON.parse(event.body);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a professional AI diagnostic system. Analyze input data in detail and generate a structured report including symptoms, context, differential diagnoses, confidence scores, and actionable recommendations." },
          { role: "user", content: data }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    const result = await response.json();
    const report = result.choices[0].message.content;

    return { statusCode: 200, body: JSON.stringify({ report }) };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "AI analysis failed" }) };
  }
}