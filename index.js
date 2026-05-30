import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import Groq from "groq-sdk"
import buyersRoutes from './routes/buyers.js'
dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/buyers', buyersRoutes)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

// 🧠 Chat memory
const chatHistory = {}

app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, sessionId = "default" } = req.body

    if (!chatHistory[sessionId]) {
      chatHistory[sessionId] = []
    }

    const lastMessage = chatHistory[sessionId].slice(-1)[0]

    let userMessage = message

    // ✅ TRANSLATION FIX
    if (/^in\s+(telugu|hindi|tamil)$/i.test(message.trim()) && lastMessage) {
      userMessage = `Translate this into ${message.replace("in", "").trim()}:\n${lastMessage.content}`
    }

    // 🧠 Save user message
    chatHistory[sessionId].push({
      role: "user",
      content: userMessage
    })

    const history = chatHistory[sessionId].slice(-10)

    // 🤖 AI CALL
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
You are a smart agriculture assistant for Indian farmers.

Rules:
- Always answer in SHORT (2 lines max)
- Give REALISTIC Indian prices (₹ per kg)
- No dollar pricing ❌
- No long explanations ❌
- Simple language
- If crop asked → give price
- If "in telugu/hindi/tamil" → translate ONLY
`
        },
        ...history
      ]
    })

    const reply =
      response.choices?.[0]?.message?.content ||
      "⚠️ No response from AI"

    // 🧠 Save AI reply
    chatHistory[sessionId].push({
      role: "assistant",
      content: reply
    })

    res.json({ reply })

  } catch (error) {
    console.error("AI ERROR:", error)

    // ✅ SAFE FALLBACK (NO ERROR SCREEN)
    const msg = req.body.message?.toLowerCase() || ""

    let fallback = "🤖 Ask about crops, prices, or farming tips."

    if (msg.includes("tomato"))
      fallback = "🌾 Tomato price: ₹20–₹40/kg (approx)"
    else if (msg.includes("onion"))
      fallback = "🧅 Onion price: ₹25–₹45/kg (approx)"
    else if (msg.includes("rice"))
      fallback = "🌾 Use NPK fertilizer + urea for rice"
    else if (msg.includes("disease"))
      fallback = "🪲 Remove infected leaves & spray neem oil"

    res.json({ reply: fallback })
  }
})

app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000")
})