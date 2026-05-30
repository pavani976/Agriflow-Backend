import express from 'express'

const router = express.Router()

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openchat/openchat-3.5',
        messages: [
          {
            role: 'system',
            content: `
You are an agriculture assistant.

- Answer dynamically (NO repetition)
- Give real farming advice
- Use simple language
- Support Indian languages
`
          },
          { role: 'user', content: message }
        ]
      })
    })

    const data = await response.json()

    console.log("OPENROUTER:", data)

    if (!response.ok) {
      return res.status(500).json({
        reply: data.error?.message || "AI error"
      })
    }

    const reply =
      data?.choices?.[0]?.message?.content ||
      "No response from AI"

    res.json({ reply })

  } catch (err) {
    console.error("AI ERROR:", err)
    res.status(500).json({ reply: "⚠️ AI server error" })
  }
})

export default router