export default async function handler(req, res) {
  const { prompt, system, imageBase64 } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // We combine the system prompt and the user question
  const userText = `SYSTEM INSTRUCTIONS: ${system}\n\nUSER QUESTION: ${prompt || "Analyze this image."}`;

  const parts = [{ text: userText }];

  // If the user pasted an image, add it to the request
  if (imageBase64) {
    parts.push({
      inline_data: {
        mime_type: "image/jpeg",
        data: imageBase64
      }
    });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: parts }] })
    });

    const data = await response.json();

    // ADDED: Better error checking for API limits or invalid keys
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: { message: data.error?.message || "Google AI Error" } 
      });
    }

    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that.";
    res.status(200).json({ reply: resultText });

  } catch (error) {
    res.status(500).json({ error: { message: "AI Bridge Connection Failed" } });
  }