'use client'

import { useEffect, useState } from "react"
import CreateEventCard from "../components/CreateEventCard"
import EventCard from "../components/EventCard"

type Event = {
  id: number
  name: string
  startDate: Date
  endDate: Date
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([])

  const fetchEvents = async () => {
    const res = await fetch('/api/event')
    const data = await res.json()
    if (!data) return // handle this case later
    setEvents(data.events)
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  return (
      <div className="min-h-screen">
        <header className="w-full py-4 px-4 sm:px-6 lg:px-8 shadow">
          <h1 className="text-2xl sm:text-3xl font-semibold">EventApp</h1>
        </header>
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            <CreateEventCard />
            {events && events.map((event) => (
                <EventCard
                    key={event.id}
                    id={event.id}
                    eventName={event.name}
                    startDate={event.startDate}
                    endDate={event.endDate}
                />
            ))}
          </div>
        </main>
      </div>
  )
}