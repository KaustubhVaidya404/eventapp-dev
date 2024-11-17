"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

async function createSubEvent(subEventName: string, startTime: string, endTime: string, eventId: number, setCreationStatus: any) {
    const data = {
        name: subEventName,
        startTime: startTime,
        endTime: endTime,
        eventId: eventId
    }
    const res = await fetch("/api/sub-event/", {
        method: "POST",
        body: JSON.stringify(data)
    })
    setCreationStatus(res.status)
    if (res.status != 201) {
        return
    }
    window.location.reload()
}

export default function CreateSubEventModal({ eventId }: { eventId: number }) {
    const [subEventName, setSubEventName] = useState("")
    const [startTime, setStartTime] = useState("")
    const [endTime, setEndTime] = useState("")
    const [creationStatus, setCreationStatus] = useState(0)

    return (
        <Dialog>
            <DialogTrigger asChild className="bg-black text-white">
                <Button variant="outline">Add Sub Event</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                {
                    <div className={(creationStatus != 500) ? "hidden" : "block text-red-500"}>failed subevent creation</div>
                }
                {
                    <div className={(creationStatus != 201) ? "hidden" : "block text-green-500"}>successfully added subevent</div>
                }
                <DialogHeader>
                    <DialogTitle>Sub Event</DialogTitle>
                    <DialogDescription>
                        Enter Sub Event Details. Click Add when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={subEventName}
                            onChange={(e) => setSubEventName(e.target.value)}
                            className="col-span-3"
                            placeholder="Name of Sub Event"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="StartTimeAndDate" className="text-right">
                            Start Date and Time
                        </Label>
                        <Input
                            id="StartTimeAndDate"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            type="datetime-local"
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="EndTimeAndDate" className="text-right">
                            End Date and Time
                        </Label>
                        <Input
                            id="EndTimeAndDate"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            type="datetime-local"
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={() => createSubEvent(subEventName, startTime, endTime, eventId, setCreationStatus)}>Add Sub Event</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
