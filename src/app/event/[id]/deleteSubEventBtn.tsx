"use client"

async function removeSubEventFromEvent(subEventId: number) {
    try {
        const result = await fetch(`/api/sub-event?subEventId=${subEventId}`, {
            method: "DELETE"
        })
        if (result.status != 200) {
            throw "err"
        }

        let row = document.querySelector("tr#a" + subEventId.toString())
        if (row != null) {
            row.remove()
        }

    } catch (err) {
        console.log("error while deleting sub-event", err)
    }
}

export default function ({ subEventId }: { subEventId: number }) {
    return <>
        <button className="" onClick={() => { removeSubEventFromEvent(subEventId) }}>X</button>
    </>
}