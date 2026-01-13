// fetcho il client_secret e monto una "live chat widget"

const el = document.getElementById("my-chat")

let scheme = "light"

const api = {
    async getClientSecret() {

        // prendo JWT da drupal
        const res1 = await fetch("https://ai-test.vegstaging.com/web/api/auth/jwt", {
            credentials: "include"
        })
        const { token } = await res1.json()

        // scambio il token per avere una sessione di chatkit
        const res2 = await fetch("/api/chatkit/session", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const { client_secret } = await res2.json()
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


