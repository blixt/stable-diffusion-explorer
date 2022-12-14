import { useState } from "react"

export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key)
            return item ? JSON.parse(item) : initialValue
        } catch (error) {
            console.error(error)
            return initialValue
        }
    })
    const setValue = (value) => {
        setStoredValue((storedValue) => {
            value = typeof value === "function" ? value(storedValue) : value
            try {
                window.localStorage.setItem(key, JSON.stringify(value))
            } catch (error) {
                console.error(error)
            }
            return value
        })
    }
    return [storedValue, setValue]
}
