// mi connetto al workflow dello specifico progetto ed espongo il client_secret via server

import "dotenv/config"
import express from "express"
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"
import rateLimit from "express-rate-limit"

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(express.static("public"))

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const WORKFLOW_ID = process.env.WORKFLOW_ID
const DRUPAL_JWT_SECRET = process.env.DRUPAL_JWT_SECRET
const DRUPAL_AUTH_URL = process.env.DRUPAL_AUTH_URL

if (!OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY")
if (!WORKFLOW_ID) throw new Error("Missing WORKFLOW_ID")
if (!DRUPAL_JWT_SECRET) throw new Error("Missing DRUPAL_JWT_SECRET")
if (!DRUPAL_AUTH_URL) throw new Error("Missing DRUPAL_AUTH_URL")

const COOKIE_NAME = "ck_auth"

function setAuthCookie(res, token) {
    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/"
    })
}

function clearAuthCookie(res) {
    res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/"
    })
}

function getUserIdFromCookie(req) {
    const token = req.cookies?.[COOKIE_NAME]
    if (!token) return null

    try {
        const payload = jwt.verify(token, DRUPAL_JWT_SECRET)
        const uid = String(payload.sub || "")
        return uid || null
    } catch {
        return null
    }
}

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 10, // 10 attempts per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, error: "Too many login attempts, try again later" }
})

app.post("/api/login", loginLimiter, async (req, res) => {

    try {
        const name = String(req.body?.name || "")
        const pass = String(req.body?.pass || "")

        if (!name || !pass) {
            return res.status(400).json({ ok: false, error: "Missing name or pass" })
        }

        const r = await fetch(DRUPAL_AUTH_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, pass })
        })

        const data = await r.json().catch(() => ({}))
        if (!r.ok) {
            return res.status(r.status).json({ ok: false, error: data.error || "Drupal login failed" })
        }

        const token = data.token
        if (!token) {
            return res.status(500).json({ ok: false, error: "Drupal did not return token" })
        }

        setAuthCookie(res, token)
        res.json({ ok: true })
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message })
    }
})

app.post("/api/logout", (req, res) => {
    clearAuthCookie(res)
    res.json({ ok: true })
})

// creo la route /api/chatkit/session
app.post("/api/chatkit/session", async (req, res) => {

    try {
        const uid = getUserIdFromCookie(req)
        if (!uid) { return res.status(401).json({ ok: false, error: "Not logged in" }) }

        // quando nel front end chiamerò /api/chatkit/session farò il fetch a openai
        const r = await fetch("https://api.openai.com/v1/chatkit/sessions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "OpenAI-Beta": "chatkit_beta=v1"
            },
            body: JSON.stringify({
                user: uid,
                workflow: { id: WORKFLOW_ID }
            })
        })

        if (!r.ok) {
            const text = await r.text()
            return res.status(r.status).send(text)
        }

        const session = await r.json()
        res.json({ client_secret: session.client_secret })
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message })
    }
})

app.listen(process.env.PORT || 10000, '0.0.0.0', () => {
    console.log('ChatKit session server running on', process.env.PORT || 10000)
})

