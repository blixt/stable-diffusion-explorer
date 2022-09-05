import { useEffect, useMemo, useRef, useState } from "react"
import styled, { css } from "styled-components"

import html from "./html.js"
import { getActiveKeywords } from "./keywords.js"
import { useLocalStorage } from "./useLocalStorage.js"

const textStyle = css`
    font-family: monospace;
    font-size: 12px;
`

const boxStyle = css`
    align-items: center;
    background: var(--background-3);
    display: flex;
    flex-direction: row;
    gap: 5px;
    padding: 3px 10px 3px 3px;

    &:not(:disabled):hover {
        background: var(--background-4);
    }
`

const KeywordContainer = styled.label`
    ${textStyle}
    ${boxStyle}

    cursor: pointer;
`

function Keyword({ keyword, active, indeterminate, onChange }) {
    const ref = useRef(null)

    useEffect(() => {
        ref.current.indeterminate = indeterminate
    }, [indeterminate])

    return html`
        <${KeywordContainer}>
            <input ref=${ref} checked=${active} onChange=${onChange} type="checkbox" />
            ${keyword}
        <//>
    `
}

const InputContainer = styled.div`
    ${boxStyle}
    padding: 3px;
`

const Input = styled.input`
    input& {
        ${textStyle}
        background: none;
        border: none;
        padding: 0;
    }
`

function KeywordInput({ onKeyword }) {
    const [value, setValue] = useState("")
    return html`
        <${InputContainer}>
            <${Input}
                onChange=${(e) => setValue(e.currentTarget.value)}
                onKeyDown=${(e) => {
                    if (e.key !== "Enter") return
                    e.preventDefault()
                    onKeyword(e.currentTarget.value)
                    setValue("")
                }}
                value=${value}
            />
        <//>
    `
}

const Container = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 5px;
    margin: 5px 0;
`

const NewPresetButton = styled.button`
    ${textStyle}
    ${boxStyle}
    border: none;
    font-weight: normal;
    padding: 3px;
`

const PresetSelect = styled.select`
    ${textStyle}
    border: none;
    padding: 3px;
`

export default function KeywordPicker({ onDeleteKeyword, onKeyword, onKeywords, keywords }) {
    const allKeywordsList = Object.keys(keywords)
    const activeKeywordsList = getActiveKeywords(keywords)
    const [presets, setPresets] = useLocalStorage("keywordPresets", [])

    function createPreset() {
        const name = prompt("Enter a name for the preset")
        if (!name) return
        const preset = { name, keywords: activeKeywordsList }
        setPresets((presets) => [preset, ...presets.filter((p) => p.name !== name)])
    }

    const [allActive, someActive] = useMemo(() => {
        const activeValues = Object.values(keywords)
        let allActive = activeValues.length > 0
        let someActive = false
        for (const active of activeValues) {
            if (active) {
                someActive = true
            } else {
                allActive = false
            }
        }
        return [allActive, someActive]
    }, [keywords])

    return html`
        <${Container}>
            <${PresetSelect} onChange=${(e) => onKeywords(e.currentTarget.value.split(","))}>
                <option>${presets.length ? "Pick a preset" : "No presets"}</option>
                ${presets.map(
                    (preset, i) =>
                        html`<option key=${i} value=${preset.keywords.join(",")}>
                            ${preset.name} (${preset.keywords.length} tags)
                        <//>`
                )}
            <//>
            <${NewPresetButton} disabled=${activeKeywordsList.length === 0} onClick=${createPreset}>+ Preset<//>
            <${Keyword}
                keyword="ALL"
                active=${allActive}
                indeterminate=${someActive !== allActive}
                onChange=${(e) => onKeywords(e.currentTarget.checked ? allKeywordsList : [])}
            />
            ${Object.entries(keywords).map(
                ([keyword, active]) =>
                    html`<${Keyword}
                        key=${keyword}
                        keyword=${keyword}
                        active=${active}
                        onChange=${(e) =>
                            onKeyword({
                                keyword,
                                active: e.currentTarget.checked,
                            })}
                    />`
            )}
            <${KeywordInput} onKeyword=${(keyword) => onKeyword({ keyword, active: true })} />
        <//>
    `
}
