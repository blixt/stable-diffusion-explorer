import { useMemo, useState } from "react"
import styled from "styled-components"

import KeywordPicker from "./KeywordPicker.js"
import html from "./html.js"
import { countActiveKeywords, getActiveKeywords } from "./keywords.js"
import { useGenerator } from "./useGenerator.js"

const Row = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: center;
`

export function GenerateUI({ generator, params, paramsDispatch }) {
    const activeKeywordsCount = useMemo(() => countActiveKeywords(params.keywords), [params.keywords])

    const [exploreTagCount, setExploreTagCount] = useState(10)
    const limitedExploreTagCount = Math.min(exploreTagCount, activeKeywordsCount)

    const [isExploring, setIsExploring] = useState(false)

    const { generate, hasPendingTasks, isIdle } = useGenerator(generator, ({ hasPendingTasks }) => {
        // Keep exploring!
        if (isExploring && !hasPendingTasks) explore()
    })

    function explore() {
        if (!limitedExploreTagCount) {
            setIsExploring(false)
            return
        }
        let keywords = getActiveKeywords(params.keywords)
        shuffle(keywords)
        if (keywords.length > limitedExploreTagCount) {
            keywords = keywords.slice(0, limitedExploreTagCount)
        }
        generate({ ...params, keywords })
    }

    function toggleExplore() {
        setIsExploring((isExploring) => {
            if (!isExploring && !hasPendingTasks) explore()
            return !isExploring
        })
    }

    return html`
        <fieldset
            style=${{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                position: "sticky",
                top: 0,
                zIndex: 1_000,
            }}
        >
            <input
                onChange=${(e) =>
                    paramsDispatch({
                        type: "SET",
                        base_prompt: e.currentTarget.value,
                    })}
                onKeyDown=${(e) => {
                    if (e.key !== "Enter") return
                    e.preventDefault()
                    generate(params)
                }}
                value=${params.base_prompt}
            />
            <${KeywordPicker}
                keywords=${params.keywords}
                onDeleteKeyword=${(keyword) => paramsDispatch({ type: "DELETE_KEYWORD", keyword })}
                onKeyword=${({ keyword, active }) => paramsDispatch({ type: "UPDATE_KEYWORD", keyword, active })}
                onKeywords=${(keywords) => paramsDispatch({ type: "SET", keywords })}
            />
            <${Row}>
                <span style=${{ width: "8ch" }}>${params.steps} steps</span>
                <input
                    type="range"
                    min=${1}
                    max=${250}
                    value=${params.steps}
                    onChange=${(e) =>
                        paramsDispatch({
                            type: "SET",
                            steps: e.currentTarget.value,
                        })}
                    style=${{ flex: 1 }}
                />
            <//>
            <${Row}>
                <span style=${{ width: "8ch" }} title="Guidance Scale"> GS (${params.guidance_scale}) </span>
                <input
                    type="range"
                    min=${1}
                    max=${10}
                    step=${0.1}
                    value=${params.guidance_scale}
                    onChange=${(e) =>
                        paramsDispatch({
                            type: "SET",
                            guidance_scale: e.currentTarget.value,
                        })}
                    style=${{ flex: 1 }}
                />
            <//>
            <${Row}>
                <span style=${{ width: "8ch" }}>Seed</span>
                <input
                    value=${params.seed ?? ""}
                    onChange=${(e) =>
                        paramsDispatch({
                            type: "SET",
                            seed: e.currentTarget.value,
                        })}
                    style=${{ flex: 1 }}
                />
            <//>
            <${Row}>
                <span style=${{ width: "8ch" }}>Width</span>
                <input
                    value=${params.width}
                    onChange=${(e) =>
                        paramsDispatch({
                            type: "SET",
                            width: e.currentTarget.value,
                        })}
                    style=${{ flex: 1 }}
                />
                <span style=${{ width: "8ch" }}>Height</span>
                <input
                    value=${params.height}
                    onChange=${(e) =>
                        paramsDispatch({
                            type: "SET",
                            height: e.currentTarget.value,
                        })}
                    style=${{ flex: 1 }}
                />
                <select
                    onChange=${(e) => {
                        const size = e.currentTarget.value
                        if (!size) return
                        const [width, height] = size.split("x")
                        paramsDispatch({ type: "SET", width, height })
                    }}
                >
                    <option>Pick a preset</option>
                    <optgroup label="Square">
                        <option>512x512</option>
                    </optgroup>
                    <optgroup label="Portrait">
                        <option>448x576</option>
                        <option>384x640</option>
                    </optgroup>
                    <optgroup label="Landscape">
                        <option>576x448</option>
                        <option>640x384</option>
                    </optgroup>
                    <optgroup label="Banner">
                        <option>1024x256</option>
                        <option>1280x192</option>
                    </optgroup>
                </select>
            <//>
            <${Row}>
                <button style=${{ flex: 1 }} onClick=${() => generate(params)}>
                    ${isIdle ? "Generate" : "Enqueue"}
                </button>
                <input
                    type="range"
                    disabled=${!activeKeywordsCount}
                    min=${0}
                    max=${activeKeywordsCount}
                    onChange=${(e) => setExploreTagCount(parseInt(e.currentTarget.value))}
                    value=${limitedExploreTagCount}
                />
                <button
                    disabled=${!limitedExploreTagCount && !isExploring}
                    style=${{ width: "18ch" }}
                    onClick=${toggleExplore}
                >
                    ${isExploring ? "Stop Exploring" : `Explore (${limitedExploreTagCount} tags)`}
                </button>
            <//>
        </fieldset>
    `
}

/** @param {unknown[]} array */
function shuffle(array) {
    let currentIndex = array.length,
        randomIndex
    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex--
        let a = array[currentIndex],
            b = array[randomIndex]
        array[currentIndex] = b
        array[randomIndex] = a
    }
}
