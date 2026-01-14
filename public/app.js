const elChat = document.getElementById("my-chat")
const elLogin = document.getElementById("login")
const elErr = document.getElementById("err")
const elName = document.getElementById("name")
const elPass = document.getElementById("pass")
const elBtn = document.getElementById("btn")

let scheme = "light"

async function login(name, pass) {
    const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, pass })
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || `Login failed (${res.status})`)

    return true
}

const api = {
    async getClientSecret() {
        const res = await fetch("/api/chatkit/session", {
            method: "POST",
        })

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

        await login(elName.value.trim(), elPass.value)

        elLogin.style.display = "none"
        mountChatkit()
    } catch (e) {
        elErr.textContent = e.message
    } finally {
        elBtn.disabled = false
    }
})