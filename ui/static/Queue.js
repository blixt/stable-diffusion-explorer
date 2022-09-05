/** @template T */
class Item {
    /** @type {Item<T> | undefined} */
    next = undefined
    /** @param {T} value */
    constructor(value) {
        this.value = value
    }
}

/** @template T */
export class Queue {
    /** @type {Item<T> | undefined} */
    #head = undefined
    /** @type {Item<T> | undefined} */
    #tail = undefined
    #size = 0

    /** @param {Iterable<T>} [values] */
    constructor(values) {
        if (!values) return
        let previousItem
        for (const value of values) {
            const item = new Item(value)
            if (previousItem) {
                previousItem.next = item
            } else {
                this.#head = item
            }
            previousItem = item
            this.#size++
        }
        this.#tail = previousItem
    }

    *[Symbol.iterator]() {
        let item = this.#head
        while (item) {
            yield item.value
            item = item.next
        }
    }

    get firstValue() {
        return this.#head?.value
    }

    get lastValue() {
        return this.#tail?.value
    }

    get size() {
        return this.#size
    }

    /** @param {T} value */
    push(value) {
        const item = new Item(value)
        if (this.#tail) {
            this.#tail.next = item
            this.#tail = item
            this.#size++
        } else {
            this.#head = this.#tail = item
            this.#size = 1
        }
        return this.#size
    }

    /** @returns {T | undefined} */
    shift() {
        const item = this.#head
        if (!item) return undefined
        this.#head = item.next
        if (this.#head) {
            this.#size--
        } else {
            this.#tail = undefined
            this.#size = 0
        }
        return item.value
    }

    /** @param {T} value */
    unshift(value) {
        const item = new Item(value)
        if (this.#head) {
            item.next = this.#head
            this.#head = item
            this.#size++
        } else {
            this.#head = this.#tail = item
            this.#size = 1
        }
        return this.#size
    }
}
