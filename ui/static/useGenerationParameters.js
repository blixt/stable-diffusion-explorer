import { useReducer } from "react"

import { keywordsListToActiveMap } from "./keywords.js"

const defaultState = {
    base_prompt: "an astronaut riding a horse on mars",
    keywords: {
        "digital art": true,
        "highly detailed": true,
        intricate: true,
        "sharp focus": true,
        "4k uhd image": true,
        "8k hdr": true,
        "trending on artstation hq": true,
        "unreal engine 5": true,
        "beautiful shot": true,
        "hyper realistic": true,
        "canon eos 5d": true,
        bokeh: true,
        "35mm 1.8f dslr": true,
        "cinematic shot": true,
        symmetric: true,
        "beautiful colors": true,
        "sharp focus": true,
    },
    steps: 50,
    guidance_scale: 7.5,
    seed: undefined,
    width: 512,
    height: 512,
}

const localStorageKey = "generationParameters"

function init(state) {
    try {
        const serializedState = localStorage.getItem(localStorageKey)
        if (serializedState) {
            return { ...state, ...JSON.parse(serializedState) }
        }
    } catch {}
    return state
}

export function useGenerationParameters() {
    return useReducer(
        (state, action) => {
            const newState = reducer(state, action)
            if (state !== newState) {
                try {
                    localStorage.setItem(localStorageKey, JSON.stringify(newState))
                } catch (error) {
                    console.error(error)
                }
            }
            return newState
        },
        defaultState,
        init
    )
}

function reducer(state, action) {
    switch (action.type) {
        case "DELETE_KEYWORD": {
            if (typeof action.keyword !== "string") throw Error("invalid keyword")
            if (!(action.keyword in state.keywords)) return state
            const { [action.keyword]: _, ...keywords } = state.keywords
            return { ...state, keywords }
        }
        case "UPDATE_KEYWORD": {
            if (typeof action.keyword !== "string") throw Error("invalid keyword")
            const active = Boolean(action.active ?? true)
            if (state.keywords[action.keyword] === active) return state
            const keywords = { ...state.keywords, [action.keyword]: active }
            return { ...state, keywords }
        }
        case "SET": {
            const newState = {}
            if ("base_prompt" in action) {
                const base_prompt = getPrompt(action.base_prompt)
                if (base_prompt !== state.base_prompt) {
                    newState.base_prompt = base_prompt
                }
            }
            if ("steps" in action) {
                const steps = getSteps(action.steps)
                if (steps !== state.steps) {
                    newState.steps = steps
                }
            }
            if ("guidance_scale" in action) {
                const guidance_scale = getGuidanceScale(action.guidance_scale)
                if (guidance_scale !== state.guidance_scale) {
                    newState.guidance_scale = guidance_scale
                }
            }
            if ("seed" in action) {
                const seed = getSeed(action.seed)
                if (seed !== state.seed) {
                    newState.seed = seed
                }
            }
            if ("width" in action) {
                const width = getSize(action.width)
                if (width && width !== state.width) {
                    newState.width = width
                }
            }
            if ("height" in action) {
                const height = getSize(action.height)
                if (height && height !== state.height) {
                    newState.height = height
                }
            }
            if ("keywords" in action) {
                const [keywords, didChange] = keywordsListToActiveMap(action.keywords, state.keywords)
                if (didChange) {
                    newState.keywords = keywords
                }
            }
            if (Object.keys(newState).length === 0) {
                return state
            }
            return { ...state, ...newState }
        }
        default:
            throw Error("unrecognized action " + action.type)
    }
}

function getPrompt(value) {
    if (typeof value !== "string") throw Error("invalid prompt")
    return value
}

function getSteps(value) {
    const steps = getInt(value)
    if (isNaN(steps) || steps < 1 || steps > 250) throw Error("invalid steps")
    return steps
}

function getGuidanceScale(value) {
    const guidanceScale = getFloat(value)
    if (isNaN(guidanceScale) || guidanceScale < 1) throw Error("invalid guidance scale")
    return guidanceScale
}

function getSize(value) {
    const size = getInt(value)
    if (isNaN(size) || size < 1) return undefined
    return size
}

function getSeed(value) {
    const seed = getInt(value)
    return isNaN(seed) ? undefined : seed
}

function getFloat(value) {
    if (typeof value === "string") return parseFloat(value)
    if (typeof value !== "number") return NaN
    return value
}

function getInt(value) {
    if (typeof value === "string") return parseInt(value)
    if (typeof value !== "number") return NaN
    return value
}
