module.exports = async function handler(req, res) {

  const { prompt, system, imageBase64, fileMime } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: { message: "Missing GEMINI_API_KEY" }
    });
  }

  const userText = `SYSTEM INSTRUCTIONS: ${system}\n\nUSER QUESTION: ${prompt || "Analyze this image."}`;

  const parts = [{ text: userText }];

  if (imageBase64) {
    parts.push({
      inline_data: {
        mime_type: fileMime || "image/jpeg",
        data: imageBase64
      }
    });
  }

  /*try {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: { message: data.error?.message || "Google AI Error" }
      });
    }

    const resultText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I couldn't process that.";  */

     try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
          {
            role: "system",
            content: system || "You are a helpful assistant"
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    }); 

    const data = await response.json();

    console.log("FULL RESPONSE:", data); // debug

    if (!response.ok) {
      return res.status(500).json({
        error: data.error?.message || "OpenRouter Error"
      });
    }

    const resultText = data.choices?.[0]?.message?.content;

    if (!resultText) {
      return res.status(500).json({
         error: "No response from AI"
      });
    }

    res.status(200).json({ reply: resultText });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({
      error: { message: "AI Connection Failed" }
    });
  }
};