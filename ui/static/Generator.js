import EventEmitter from "eventemitter3"

import { Queue } from "./Queue.js"

let nextId = 1

class Task {
    #controller = new AbortController()
    #id = nextId++

    get id() {
        return this.#id
    }

    constructor(params) {
        this.params = params
    }

    /** @param {unknown} [reason] */
    abort(reason) {
        this.#controller.abort(reason)
    }

    async do() {
        signal.throwIfAborted()
        const resp = await fetch("/generate", {
            signal,
            method: "POST",
            body: JSON.stringify(params),
        })
        if (!resp.ok) {
            throw Error(`Failed to generate: ${resp.statusText}`)
        }
        return resp.json()
    }
}

export class Generator extends EventEmitter {
    /** @type {Task | undefined} */
    #activeTask = undefined
    /** @type {Queue<Task>} */
    #tasks = new Queue()

    constructor() {
        super()
    }

    get activeTask() {
        return this.#activeTask
    }

    get pendingTasks() {
        return this.#tasks
    }

    generate(params) {
        const task = new Task(params)
        this.#tasks.push(task)
        queueMicrotask(() => this.#tick())
    }

    async #tick() {
        if (this.#activeTask) {
            this.emit("status", {})
            return
        }
        // Time to start a new task (TODO: support pause).
        const task = this.#tasks.shift()
        if (!task) {
            this.emit("status", {})
            return
        }
        this.#activeTask = task
        this.emit("status", {})
        try {
            const item = await task.do()
            this.emit("item", { item })
        } finally {
            if (this.#activeTask !== task) {
                throw Error("active task state corruption")
            }
            this.#activeTask = undefined
            this.#tick()
        }
    }
}
