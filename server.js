// mi connetto al workflow dello specifico progetto ed espongo il client_secret via server

import "dotenv/config"
import express from "express"
import jwt from "jsonwebtoken"

const app = express()

app.use(express.json())
app.use(express.static("public"))

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const WORKFLOW_ID = process.env.WORKFLOW_ID
const DRUPAL_JWT_SECRET = process.env.DRUPAL_JWT_SECRET

if (!OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY")
if (!WORKFLOW_ID) throw new Error("Missing WORKFLOW_ID")
if (!DRUPAL_JWT_SECRET) throw new Error("Missing DRUPAL_JWT_SECRET")

function getBearerToken(req) {
    const auth = req.headers.authorization || ""
    const [type, token] = auth.split(" ")
    if (type !== "Bearer" || !token) return null
    return token
}

// crea la route /api/chatkit/session
app.post("/api/chatkit/session", async (req, res) => {

    try {

        const token = getBearerToken(req)
        if (!token) {
            return res.status(401).json({ ok: false, error: "Missing Authorization Bearer token" })
        }

        let payload
        try {
            payload = jwt.verify(token, DRUPAL_JWT_SECRET)
        } catch (e) {
            return res.status(401).json({ ok: false, error: "Invalid or expired token" })
        }

        const drupalUid = String(payload.sub || "")
        if (!drupalUid) {
            return res.status(401).json({ ok: false, error: "Token missing sub (uid)" })
        }

        // da route app.post("/api/chatkit/session" faccio un fetch di https://api.openai.com/v1/chatkit/sessions
        const r = await fetch("https://api.openai.com/v1/chatkit/sessions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "OpenAI-Beta": "chatkit_beta=v1"
            },
            body: JSON.stringify({
                user: req.body?.user || "anon",
                workflow: { id: WORKFLOW_ID },
            })
        })

        if (!r.ok) {
            const text = await r.text()
            return res.status(r.status).send(text)
        }

        // espongo il client_secret
        const session = await r.json()
        res.json({ client_secret: session.client_secret })

    } catch (e) {
        res.status(500).json({ ok: false, error: e.message })
    }
})

app.listen(process.env.PORT || 10000, '0.0.0.0', () => {
    console.log('ChatKit session server running on', process.env.PORT || 10000)
})

