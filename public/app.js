// fetcho il client_secret e monto una "live chat widget"

const el = document.getElementById("my-chat")

let scheme = "light"

let drupalToken = null

async function loadDrupalJwt() {
    const res = await fetch("https://ai-test.vegstaging.com/web/api/auth/jwt", {
        credentials: "include"
    })
    if (!res.ok) throw new Error("Drupal JWT failed: " + res.status)
    const data = await res.json()
    drupalToken = data.token
}

const api = {
    async getClientSecret() {

        if (!drupalToken) await loadDrupalJwt()

        // scambio il token per avere una sessione di chatkit
        const res = await fetch("/api/chatkit/session", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
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


