// fetcho il client_secret e monto una "live chat widget"

const el = document.getElementById("my-chat")

let scheme = "light"
let drupalToken = null

async function loginDrupal(name, pass) {
    const res = await fetch("https://ai-test.vegstaging.com/web/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, pass })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Login failed")

    drupalToken = data.token
}

const api = {
    async getClientSecret() {

        if (!drupalToken) throw new Error("Not logged in")

        // scambio il drupalToken per avere una sessione di chatkit
        const res = await fetch("/api/chatkit/session", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${drupalToken}`
            }
        })
        const { client_secret } = await res.json()
        return client_secret
    }
}

function apply() {
    el.setOptions({
        api,
        theme: {
            colorScheme: scheme,
        },
        header: {
            rightAction: {
                icon: scheme === "dark" ? "light-mode" : "dark-mode",
                onClick: () => {
                    scheme = scheme === "dark" ? "light" : "dark"
                    setTimeout(apply, 0) // avoid reconfig during click
                }
            }
        }
    })
}

apply()


