import { prisma } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { eventName, startDate, endDate } = await req.json();

    const startDateUTC = new Date(startDate);
    const endDateUTC = new Date(endDate);

    const startDateIST = new Date(startDateUTC.getTime() + 5.5 * 60 * 60 * 1000);
    const endDateIST = new Date(endDateUTC.getTime() + 5.5 * 60 * 60 * 1000);

    try {
        const newEvent = await prisma.event.create({
            data: {
                name: eventName,
                startDate: startDateIST,
                endDate: endDateIST,
            },
        });
        if (!newEvent) {
            return NextResponse.json(
                { success: false, error: "Something went wrong" },
                { status: 500 }
            );
        }
        return NextResponse.json({ success: true, newEvent });
    } catch (error) {
        return NextResponse.json({ success: false, error: error }, { status: 500 });
    }
}

export async function GET() {
    try {
        const events = await prisma.event.findMany();
        if (!events)
            return NextResponse.json(
                { success: false, error: "Something went wrong" },
                { status: 500 }
            );
        return NextResponse.json({ success: true, events });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error },
            { status: 500 }
        );
    }
}

interface eventData {
    name?: string,
    startDate?: Date,
    endDate?: Date,
}

export async function PUT(req: NextRequest) {
    try {
        const eventData = await req.json()
        let data: eventData = {}
        data.name = eventData.name
        data.startDate = eventData.startDate && new Date(eventData.startDate)
        data.endDate = eventData.endDate && new Date(eventData.endDate)

        if (data.startDate && data.endDate && data.startDate > data.endDate) {
            const err = new Error("End Date cannot be after Start Date")
            err.name = "Custom"
            throw err
        }

        let subEventsOfEvent = await prisma.subEvent.findMany({ where: { eventId: eventData.id } })

        for (let i = 0; i < subEventsOfEvent.length; i++) {
            if (data.startDate && data.startDate > subEventsOfEvent[i].startTime) {
                const err = new Error("one of the subevents has start time less than start time of event")
                err.name = "Custom"
                throw err
            }
            if (data.endDate && data.endDate < subEventsOfEvent[i].endTime) {
                const err = new Error("one of the subevents has end time more than start time of event")
                err.name = "Custom"
                throw err
            }
        }

        const dbRes = await prisma.event.update({
            where: { id: eventData.id },
            data: data
        })

        return NextResponse.json({ success: true, message: "Event Updated Successfully" }, { status: 200 })
    } catch (err: any) {
        console.log(err.message)
        let msg = "Error while updating event"
        if (err.name == "Custom") {
            msg = err.message
        } else if (err.code == "P2002") {
            msg = "Event name already exists"
        }
        return NextResponse.json({ success: false, message: msg }, { status: 500 })
    }
}