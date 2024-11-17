"use client"

import { Dispatch, SetStateAction, useState } from "react"

async function removeUserFromSubEvent(userId: number, subEventId: number) {
    try {
        const result = await fetch(`/api/user-event?userId=${userId}&subEventId=${subEventId}`, {
            method: "DELETE"
        })
        if (result.status != 200) {
            throw "err"
        }

        let row = document.querySelector("tr#a" + userId.toString())
        if (row != null) {
            row.remove()
        }

    } catch (err) {
        console.log("error while unassigning participant", err)
    }
}

export default function ({ userId, subEventId }: { userId: number, subEventId: number }) {
    return <>
        <button className="" onClick={() => { removeUserFromSubEvent(userId, subEventId) }}>X</button>
    </>
}