import { useCallback, useEffect, useRef, useState } from "react"

import { getActiveKeywords } from "./keywords.js"

export function useGenerator(generator, onItem) {
    const generate = useCallback(
        (item) => {
            if (!Array.isArray(item.keywords)) {
                item = { ...item, keywords: getActiveKeywords(item.keywords) }
            }
            generator.generate(item)
        },
        [generator]
    )
    const onItemRef = useRef(onItem)
    onItemRef.current = onItem
    const [status, setStatus] = useState(() => statusFromGenerator(generator, generate))
    useEffect(() => {
        function handleItem({ item }) {
            onItemRef.current?.({
                hasPendingTasks: generator.pendingTasks.size > 0,
                isIdle: !generator.activeTask,
                item,
            })
        }
        generator.on("item", handleItem)
        function handleStatus() {
            setStatus(statusFromGenerator(generator, generate))
        }
        generator.on("status", handleStatus)
        return () => {
            generator.removeListener("item", handleItem)
            generator.removeListener("status", handleStatus)
        }
    }, [generate, generator])
    return status
}

function statusFromGenerator(generator, generate) {
    return {
        generate,
        activeTask: generator.activeTask,
        hasPendingTasks: generator.pendingTasks.size > 0,
        isIdle: !generator.activeTask,
        pendingTasks: Array.from(generator.pendingTasks),
    }
}
