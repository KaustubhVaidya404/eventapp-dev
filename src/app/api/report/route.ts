import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/utils/db"

export async function POST(req: NextRequest) {
  const { eventId } = await req.json()

  if (!eventId) {
    return NextResponse.json({ success: false, message: "Invalid Event Id" }, { status: 500 })
  }

  const subEvents = await prisma.subEvent.findMany({
    where: {
      eventId: Number(eventId)
    }
  })


  const subEventIds = subEvents.map((subEvent) => subEvent.id)

  const userEvents = await prisma.userEvent.findMany({
    where: {
      subEventId: {
        in: subEventIds
      }
    }
  })

  const eventUserIDs = Array.from(new Set(userEvents.map((userEvent) => userEvent.userId)))

  const eventUsers = await prisma.user.findMany({
    where: {
      id: {
        in: eventUserIDs
      }
    }
  })

  const result = eventUsers.map((user) => ({
    ...user,
    phone: user.phone.toString(),
    eventDetails: JSON.stringify(userEvents.filter((userEvent) => userEvent.userId === user.id)),
    subEvents: JSON.stringify(subEvents)
  }))

  return NextResponse.json({ success: true, result });
}