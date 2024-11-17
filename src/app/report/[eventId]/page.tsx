'use client'

import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

interface IUser {
  id: number
  name: string
  email: string
  phone: number
  class: string
  eventDetails: string
  subEvents: string
}

interface IEventDetails {
  userId: number
  subEventId: number
  attendedAt: string | null
}

interface ISubEvent {
  id: number
  name: string
}

export default function Report() {
  const params = useParams()
  const eventId = Number(params.eventId)

  const [data, setData] = useState<IUser[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId }),
        })
        const result = await response.json()
        setData(result.result)
      } catch (error) {
        console.error(error)
      }
    }

    fetchData()
  }, [eventId])

  return (
    <div className="px-4">
      <h1 className="text-2xl my-5 font-semibold">Report for Event {eventId}</h1>

      <table className="my-5 w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Phone</th>
            <th className="p-2 border">Class</th>
            <th className="p-2 border">Event Details</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user) => {
            const eventDetails: IEventDetails[] = JSON.parse(user.eventDetails)
            const subEvents: ISubEvent[] = JSON.parse(user.subEvents)

            const subEventOrder = subEvents.reduce<Record<number, number>>(
              (acc, subEvent, index) => {
                acc[subEvent.id] = index
                return acc
              },
              {}
            )
            
            const sortedEventDetails = [...eventDetails].sort(
              (a, b) => (subEventOrder[a.subEventId] ?? Infinity) - (subEventOrder[b.subEventId] ?? Infinity)
            )

            return (
              <tr key={user.id}>
                <td className="py-1 px-2 border">{user.name}</td>
                <td className="py-1 px-2 border">{user.email}</td>
                <td className="py-1 px-2 border">{user.phone}</td>
                <td className="py-1 px-2 border">{user.class}</td>
                <td className="py-1 px-2 border">
                  {sortedEventDetails.map((item, index) => {
                    const subEvent = subEvents.find((s) => s.id === item.subEventId)
                    return (
                      <div className="flex justify-between" key={index}>
                        <div>{subEvent ? subEvent.name : 'Unknown'}</div>
                        <div>{item.attendedAt ? 'Attended' : 'Not Attended'}</div>
                      </div>
                    )
                  })}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
