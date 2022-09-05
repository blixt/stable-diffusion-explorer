import styled from "styled-components"

import html from "./html.js"

const Container = styled.div`
    cursor: pointer;
    position: relative;
`

const ActionBar = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: var(--background-2);
    border: var(--border) solid 1px;
    border-style: solid none;
    gap: 5px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 10px;
    cursor: default;

    visibility: hidden;
    ${Container}:hover & {
        visibility: visible;
    }
`

const Image = styled.img`
    display: block;
    width: 100%;
    height: auto;
`

function RegenerateButton({ item, onRegenerate, steps }) {
    return html`
        <button
            disabled=${item.prompt.steps >= steps}
            onClick=${() => onRegenerate({ ...item.prompt, steps })}
            title=${`Regenerate this prompt with ${steps} steps`}
        >
            ${steps}
        </button>
    `
}

export function PromptResult({ item, onClick, onDelete, onRegenerate }) {
    const { width, height } = item.prompt
    const tooltip = `${item.prompt.base_prompt} (steps: ${item.prompt.steps}, keywords: ${item.prompt.keywords.length})`
    return html`
        <${Container} id=${item.hash} style=${{ aspectRatio: width / height }}>
            <${ActionBar}>
                <${RegenerateButton} item=${item} onRegenerate=${onRegenerate} steps=${50} />
                <${RegenerateButton} item=${item} onRegenerate=${onRegenerate} steps=${100} />
                <${RegenerateButton} item=${item} onRegenerate=${onRegenerate} steps=${150} />
                <${RegenerateButton} item=${item} onRegenerate=${onRegenerate} steps=${250} />
                <button onClick=${onDelete}>❌ Forget</button>
            <//>
            <${Image}
                loading="lazy"
                decoding="async"
                onClick=${onClick}
                src=${item.image}
                width=${width}
                height=${height}
                style=${{ aspectRatio: width / height }}
                title=${tooltip}
            />
        <//>
    `
}
