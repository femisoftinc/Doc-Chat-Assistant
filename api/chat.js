export default async function handler(req, res) {
  const { prompt, system, imageBase64 } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // Structure for Gemini to handle Text + Image
  const parts = [{ text: `SYSTEM: ${system}\n\nUSER QUESTION: ${prompt || "What is in this image?"}` }];
  
  if (imageBase64) {
    parts.push({
      inline_data: {
        mime_type: "image/jpeg",
        data: imageBase64
      }
    });
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: parts }]
    })
  });

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "I can't see that image clearly. Try again.";
  res.status(200).json({ reply: text });
}