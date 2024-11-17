import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/utils/db"

export async function GET(req: NextRequest) {
    const subEventIdStr = req.nextUrl.searchParams.get("subEventId")
    if (subEventIdStr == null) {
        return NextResponse.json({ success: false, message: "Invalid SubEvent Id" }, { status: 500 })
    }
    const subEventId = Number(subEventIdStr)
    if (Number.isNaN(subEventId)) {
        return NextResponse.json({ success: false, message: "Invalid SubEvent Id" }, { status: 500 })
    }
    const currentSubEvent = await prisma.subEvent.findUnique({
        where: { id: subEventId },
    });
    if (!currentSubEvent) return NextResponse.json({ message: "Sub Event not found" });
    return NextResponse.json({ currentSubEvent })
}

export async function POST(req: NextRequest) {
    try {
        const { name, startTime, endTime, eventId } = await req.json()
        const newSubEvent = {
            name: name,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            eventId: eventId
        }
        const res = await prisma.subEvent.create({
            data: newSubEvent
        })

        return NextResponse.json({ sucess: true }, { status: 201 })
    } catch (err: any) {
        console.log(err.message)
        return NextResponse.json({ sucess: false }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const subEventIdStr: string | null = req.nextUrl.searchParams.get("subEventId")

        let subEventId: number

        if (subEventIdStr == null) {
            throw "subEventIdStr cannot be null"
        }

        subEventId = parseInt(subEventIdStr)

        await prisma.subEvent.delete({
            where: {
                id: subEventId
            }
        })

        return NextResponse.json({ success: true }, { status: 200 })

    } catch (err) {
        console.log("Error while deleting sub-event", err)
        return NextResponse.json({ success: false, error: "Deleting sub-event failed" }, { status: 500 })
    }
}