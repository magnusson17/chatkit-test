// fetcho il client_secret e monto una "live chat widget"

const el = document.getElementById("my-chat")
const toggleTheme = document.getElementById("toggle-theme")

let scheme = "dark"

el.setOptions({
    theme: { colorScheme: scheme },
    api: {
        async getClientSecret() {
            const res = await fetch("/api/chatkit/session", { method: "POST" })
            const { client_secret } = await res.json()
            return client_secret
        }
    }
})

toggleTheme.addEventListener("click", () => {
    scheme = scheme === "dark" ? "light" : "dark"
    el.setOptions({ theme: { colorScheme: scheme } })
})
