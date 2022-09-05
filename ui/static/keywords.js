/** @param {Record<string, boolean>} keywords */
export function countActiveKeywords(keywords) {
    return Object.values(keywords).reduce((count, active) => count + (active ? 1 : 0), 0)
}

/** @param {Record<string, boolean>} keywords */
export function getActiveKeywords(keywords) {
    return Object.entries(keywords)
        .filter(([, active]) => active)
        .map(([keyword]) => keyword)
}

/**
 * @param {string[]} value
 * @param {Record<string, boolean>} oldKeywords
 * @returns {[Record<string, boolean>, boolean]}
 */
export function keywordsListToActiveMap(value, oldKeywords = {}) {
    if (!Array.isArray(value)) throw Error("invalid keywords array")
    let didChange = false
    const keywords = {}
    for (const keyword of value) {
        if (typeof keyword !== "string") throw Error("invalid keyword")
        if (oldKeywords[keyword] !== true) {
            didChange = true
        }
        keywords[keyword] = true
    }
    for (const [keyword, active] of Object.entries(oldKeywords)) {
        if (keyword in keywords) continue
        if (active) {
            didChange = true
        }
        keywords[keyword] = false
    }
    return [keywords, didChange]
}
