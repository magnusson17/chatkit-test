const elChat = document.getElementById("my-chat")
const elLogin = document.getElementById("login")
const elErr = document.getElementById("err")
const elName = document.getElementById("name")
const elPass = document.getElementById("pass")
const elBtn = document.getElementById("btn")

let scheme = "light"
let drupalToken = null

async function loginDrupal(name, pass) {
    const res = await fetch("https://ai-test.vegstaging.com/web/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, pass })
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || `Login failed (${res.status})`)

    return data.token
}

const api = {
    async getClientSecret() {
        if (!drupalToken) throw new Error("Not logged in")

        const res = await fetch("/api/chatkit/session", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${drupalToken}`
            }
        })

        // check in caso di 401
        // const text = await res.text()
        // console.log("chatkit/session status", res.status, text)

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Session failed")
        return data.client_secret
    }
}

function mountChatkit() {
    elChat.style.display = "block"

    elChat.setOptions({
        api,
        theme: { colorScheme: scheme },
        header: {
            rightAction: {
                icon: scheme === "dark" ? "light-mode" : "dark-mode",
                onClick: () => {
                    scheme = scheme === "dark" ? "light" : "dark"
                    setTimeout(mountChatkit, 0)
                }
            }
        }
    })
}

elBtn.addEventListener("click", async () => {
    elErr.textContent = ""

    try {
        elBtn.disabled = true
        const token = await loginDrupal(elName.value.trim(), elPass.value)
        drupalToken = token

        elLogin.style.display = "none"
        mountChatkit()
    } catch (e) {
        elErr.textContent = e.message
    } finally {
        elBtn.disabled = false
    }
})
