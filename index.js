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

    const parsedQuery = openaiRes.data.choices[0].message.content;

    // Step 2: SerpAPI for LinkedIn and news results
    const serpApiRes = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google",
        q: query,
        api_key: process.env.SERPAPI_KEY,
      },
    });

    const newsResults = serpApiRes.data.news_results || [];
    const organicResults = serpApiRes.data.organic_results || [];

    // Placeholder stakeholders based on organic results
    const stakeholders = organicResults.slice(0, 3).map((result, index) => {
      const linkedInMention = result.link?.includes("linkedin.com");
      const matchedKeywords = query.split(" ").filter((word) =>
        result.title?.toLowerCase().includes(word.toLowerCase())
      );

      const relevanceScore = Math.min(
        100,
        60 + matchedKeywords.length * 5 + (linkedInMention ? 10 : 0)
      );

      const responsivenessScore = Math.min(
        100,
        (linkedInMention ? 40 : 0) +
          (newsResults.length > 0 ? 20 : 0) +
          15 + // role-based assumption
          10 + // email discoverability (placeholder)
          10 + // vendor engagement (placeholder)
          5 // tenure (placeholder)
      );

      return {
        id: `stakeholder-${index}`,
        name: result.title || "Unknown",
        profileLink: result.link,
        relevanceScore,
        responsivenessScore,
        matchedKeywords,
        reportingLine: "Reports to Head of " + (parsedQuery.split(" ")[0] || "Company"),
        recentLinkedInActivity: linkedInMention ? result.snippet : null,
        newsMention: newsResults[index]?.snippet || null,
        newsLink: newsResults[index]?.link || null,
      };
    });

    res.json({
      parsedQuery,
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
