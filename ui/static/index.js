import { createRoot } from "react-dom/client"

import App from "./App.js"
import html from "./html.js"

const container = document.querySelector("main")
const root = createRoot(container)
root.render(html`<${App} />`)
