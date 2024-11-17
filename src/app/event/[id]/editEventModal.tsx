"use client"

import { DatePicker } from "@/components/DatePicker"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

async function updateEvent(name: string, startDate: Date | undefined, endDate: Date | undefined,
    eventId: Number, setEditResponseSuccess: any, setEditResponseMsg: any, setSaveEventBtnDisabled: any) {
    setSaveEventBtnDisabled(true)

    if (name == "") {
        setEditResponseSuccess(false)
        setEditResponseMsg("Name cannot be empty")
        setSaveEventBtnDisabled(false)
        return
    }

    if (endDate && endDate < (new Date())) {
        setEditResponseSuccess(false)
        setEditResponseMsg("Date cannot be of past")
        setSaveEventBtnDisabled(false)
        return
    }

    const res = await fetch("/api/event", {
        method: "PUT",
        body: JSON.stringify({ id: eventId, name: name, startDate: startDate, endDate: endDate }),
    })

    const data = await res.json()
    setEditResponseSuccess(data.success)
    setEditResponseMsg(data.message)
    setSaveEventBtnDisabled(false)
    if (data.success) {
        window.location.reload()
    }
}

function handleOpenChange(setEditResponseMsg: any, setEditResponseSuccess: any, setEventName: any,
    setStartDate: any, setEndDate: any, name: string, startDate: Date, endDate: Date) {
    setEditResponseMsg("")
    setEditResponseSuccess(undefined)
    setEventName(name)
    setStartDate(startDate)
    setEndDate(endDate)
}

export default function EditEventModal(props: { eventId: Number, name: string, startDate: Date, endDate: Date }) {
    const [editResponseSuccess, setEditResponseSuccess] = useState()
    const [editResponseMsg, setEditResponseMsg] = useState()
    const [eventName, setEventName] = useState(props.name)
    const [startDate, setStartDate] = useState<undefined | Date>(props.startDate)
    const [endDate, setEndDate] = useState<undefined | Date>(props.endDate)
    const [saveEventBtnDisabled, setSaveEventBtnDisabled] = useState(false)

    return (
        <Dialog onOpenChange={() => handleOpenChange(setEditResponseMsg, setEditResponseSuccess, setEventName, setStartDate, setEndDate, props.name, props.startDate, props.endDate)}>
            <DialogTrigger asChild className="bg-black text-white">
                <Button variant="outline">Edit</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <div className={
                    ((editResponseSuccess == undefined) ? "hidden " : "block ") +
                    ((editResponseSuccess == true) ? "text-green-500" : "text-red-500")}>
                    {editResponseMsg}
                </div>
                <DialogHeader>
                    <DialogTitle>Event</DialogTitle>
                    <DialogDescription> Enter Event Details. Click Save when you're done.  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input
                            id="name"
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                            className="col-span-3"
                            placeholder="Name of Event" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="StartTimeAndDate" className="text-right">Start Date</Label>
                        <DatePicker
                            placeholder={"Pick Start Date"}
                            date={startDate}
                            setDate={setStartDate} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="EndTimeAndDate" className="text-right"> End Date </Label>
                        <DatePicker
                            placeholder={"Pick End Date"}
                            date={endDate}
                            setDate={setEndDate} />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" disabled={saveEventBtnDisabled} onClick={
                        () => updateEvent(eventName, startDate, endDate, props.eventId,
                            setEditResponseSuccess, setEditResponseMsg, setSaveEventBtnDisabled)
                    }>
                        Save Event
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}