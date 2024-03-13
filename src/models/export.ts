import { LocalDate, Period } from "@js-joda/core"


const reviver = (key: string, value: any): any => {
    if (key == "dateOfBirth" || key == "date") {
        return LocalDate.parse(value)
    }
    if (key == "age") {
        return Period.parse(value)
    }
    return value
}

function exportState<T>(state: T): string {
    const serialisedState = JSON.stringify(state)
    const encodedState = btoa(serialisedState)
    return `data:application/json;base64,${encodedState}`
}

function importState<T>(state: string): T {
    return JSON.parse(state, reviver)
}

export {
    exportState,
    importState,
}