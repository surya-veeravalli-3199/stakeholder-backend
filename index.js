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

    // mock response (later you’ll connect scraping APIs here)
    res.json({
      parsedQuery: extraction,
      stakeholders: [
        {
          id: "123",
          name: "Jane Smith",
          title: "VP of Business Development",
          score: 82,
          reason: "Active on LinkedIn, quoted in news last month, mid-tenure"
        },
        {
          id: "456",
          name: "Raj Patel",
          title: "Director of Partnerships",
          score: 74,
          reason: "Recently posted about partnerships at XYZ"
        }
      ]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/stakeholder/:id", (req, res) => {
  const { id } = req.params;
  // mock data
  if (id === "123") {
    return res.json({
      name: "Jane Smith",
      relevance: 95,
      responsiveness: 82,
      breakdown: {
        "LinkedIn Activity": "High (3 posts in 2 weeks)",
        "News Mention": "Quoted in Forbes in Feb",
        "Role Fit": "VP of Biz Dev in healthcare",
      }
    });
  } else if (id === "456") {
    return res.json({
      name: "Raj Patel",
      relevance: 88,
      responsiveness: 74,
      breakdown: {
        "LinkedIn Activity": "Medium (1 post last month)",
        "News Mention": "Mentioned in PR for XYZ",
        "Role Fit": "Director of Partnerships",
      }
    });
  } else {
    res.status(404).json({ error: "Not found" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
