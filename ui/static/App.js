import styled from "styled-components"

import { GenerateUI } from "./GenerateUI.js"
import html from "./html.js"
import { PendingPrompt } from "./PendingPrompt.js"
import { PromptResult } from "./PromptResult.js"
import { useGenerationParameters } from "./useGenerationParameters.js"
import { Generator } from "./Generator.js"
import { useGenerator } from "./useGenerator.js"
import { useLocalStorage } from "./useLocalStorage.js"

function* reverse(list) {
    for (let i = list.length - 1; i >= 0; i--) {
        yield list[i]
    }
}

const Grid = styled.div`
    display: grid;
    justify-content: center;
    gap: 5px;
    grid-auto-flow: dense;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
`

const generator = new Generator()

export default function App() {
    const [params, paramsDispatch] = useGenerationParameters()
    const [items, setItems] = useLocalStorage("generatedItems", [])

    const { activeTask, generate, pendingTasks } = useGenerator(generator, ({ item }) => {
        setItems((items) => [...items.filter((v) => v.hash !== item.hash), item])
    })

    return html`
        <div>
            <${GenerateUI} generator=${generator} params=${params} paramsDispatch=${paramsDispatch} />
            <${Grid}>
                ${Array.from(reverse(pendingTasks), (task) => html`<${PendingPrompt} key=${task.id} task=${task} />`)}
                ${activeTask && html`<${PendingPrompt} isGenerating key=${activeTask.id} task=${activeTask} />`}
                ${Array.from(
                    reverse(items),
                    (item) =>
                        html`<${PromptResult}
                            key=${item.hash}
                            item=${item}
                            onClick=${() => paramsDispatch({ type: "SET", ...item.prompt })}
                            onDelete=${() => setItems((items) => items.filter((v) => v.hash !== item.hash))}
                            onRegenerate=${(params) => generate(params)}
                        />`
                )}
            <//>
        </div>
    `
}
