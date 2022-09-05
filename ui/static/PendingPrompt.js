import styled from "styled-components"

import html from "./html.js"

const Container = styled.div`
    background: var(--background-2);
`

export function PendingPrompt({ isGenerating, task }) {
    const { width, height, steps } = task.params
    return html`
        <${Container} style=${{ aspectRatio: width / height }}>
            <span>0/${steps} steps</span>
        <//>
    `
}
