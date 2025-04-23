const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post("/api/query", async (req, res) => {
  const { query } = req.body;

  try {
    // Step 1: Use OpenAI to parse the query
    const openaiRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Extract the company, function, and sector from the user's query.",
          },
          {
            role: "user",
            content: query,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const extraction = openaiRes.data.choices[0].message.content;

    // Step 2: Call SerpAPI for LinkedIn results
    const serpApiRes = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "linkedin",
        q: query,
        api_key: process.env.SERPAPI_KEY,
      },
    });

    const linkedinResults = serpApiRes.data?.linkedin_profiles || [];

    const stakeholders = Array.isArray(linkedinResults)
      ? linkedinResults.map((profile, index) => ({
          id: profile.id || `person-${index}`,
          name: profile.name || "Unknown",
          position: profile.position || "Unknown role",
        }))
      : [];

    res.json({
      parsedQuery: extraction,
      stakeholders,
    });
  } catch (error) {
    console.error("🔥 API Error:", error.message);
    if (error.response) {
      console.error("📎 API Response Error:", error.response.data);
    }
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
