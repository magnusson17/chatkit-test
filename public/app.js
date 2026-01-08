// fetcho il client_secret e monto una "live chat widget"

const el = document.getElementById("my-chat")

let scheme = "light"

const api = {
    async getClientSecret() {
        const res = await fetch("/api/chatkit/session", { method: "POST" })
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


