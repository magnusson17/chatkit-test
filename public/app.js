// fetcho il client_secret e monto una "live chat widget"

const el = document.getElementById("my-chat")

el.setOptions({
    api: {
        async getClientSecret() {
            const res = await fetch("/api/chatkit/session", { method: "POST" })
            const { client_secret } = await res.json()
            return client_secret
        }
    },
    header: {
        rightAction: {
            icon: "moon",
            onClick: () => { switch_theme("dark"); },
        }
    }
})

