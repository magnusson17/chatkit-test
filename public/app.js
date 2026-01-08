// fetcho il client_secret e monto una "live chat widget"

const el = document.getElementById("my-chat")
const btn = document.getElementById("toggle-theme")

let scheme = "dark"

const baseOptions = {
    api: {
        async getClientSecret() {
            const res = await fetch("/api/chatkit/session", { method: "POST" })
            const { client_secret } = await res.json()
            return client_secret
        }
    }
}

function applyOptions() {
    el.setOptions({
        ...baseOptions,
        theme: { colorScheme: scheme }
    })
}

applyOptions()

btn.addEventListener("click", () => {
    scheme = scheme === "dark" ? "light" : "dark"
    applyOptions()
})

