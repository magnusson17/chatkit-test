// fetcho il client_secret e monto una "live chat widget"

await customElements.whenDefined("openai-chatkit")

const el = document.getElementById("my-chat")

let scheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

const baseOptions = {
    api: {
        async getClientSecret() {
            const res = await fetch("/api/chatkit/session", { method: "POST" })
            const { client_secret } = await res.json()
            return client_secret
        }
    }
}

function apply() {
    el.setOptions({
        ...baseOptions,
        theme: { colorScheme: scheme },
        header: {
            customButtonRight: {
                icon: scheme === "dark" ? "sun" : "moon",
                onClick: () => {
                    scheme = scheme === "dark" ? "light" : "dark"
                    setTimeout(apply, 0) // defer
                }
            }
        }
    })
}

apply()


