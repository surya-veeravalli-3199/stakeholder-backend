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
      "https://api.openai.com/openai/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Extract the company, function, and sector from the user's query."
          },
          {
            role: "user",
            content: query
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const extraction = openaiRes.data.choices[0].message.content;

    // mock response (you’ll later connect this to scraping logic)
    res.json({
      parsedQuery: extraction,
      stakeholders: [
        {
          id: "123",
          name: "Example Person",
          title: "Head of Partnerships",
          company: "Vistria Partners",
          relevanceScore: 0.92
        }
      ]
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
