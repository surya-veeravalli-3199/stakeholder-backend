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
    const openaiRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo", // ← CHANGED FROM gpt-4
        messages: [
          {
            role: "system",
            content:
              "Extract the company, function, and sector from the user's query.",
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

    res.json({
      parsedQuery: extraction,
      stakeholders: [
        {
          id: "123",
          name: "Sample Stakeholder",
          reason: "Based on role and recent activity in healthcare partnerships",
        },
      ],
    });
  } catch (error) {
    console.error("🔥 API Error:", error.message);
    if (error.response) {
      console.error("🔍 OpenAI Error:", error.response.data);
    }
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
