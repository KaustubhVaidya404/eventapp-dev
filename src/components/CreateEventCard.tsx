"use client";
import React, { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Loader2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DatePicker } from "./DatePicker";
import { useRouter } from "next/navigation";
function CreateEventCard() {
  const [eventName, setEventName] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const router = useRouter()
  const handleSubmit = async () => {
    if (!eventName || !startDate || !endDate || loading) return;
    setLoading(true)
    const res = await fetch("/api/event", {
        method:"POST",
        body: JSON.stringify({ eventName, startDate, endDate }),
    });
    const data = await res.json();
    router.push(`/event/${data.newEvent.id}`)
  };
  return (
    <div className=" w-[340px] h-[186px] ">
      <AlertDialog>
        <AlertDialogTrigger className=" w-full h-full">
          <Card className=" w-full h-full hover:bg-slate-50 bg-transparent hover:cursor-pointer border-dashed border-2 opacity-80 hover:opacity-100  relative">
            <CardContent className=" w-full h-full p-0">
              <CardTitle className=" w-full absolute -translate-x-1/2 left-1/2 top-4 text-center text-xl  ">
                Create New Event
              </CardTitle>
              <div className=" w-full h-full flex justify-center items-center">
                <Plus className="size-16 " strokeWidth={1} />
              </div>
            </CardContent>
          </Card>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create a new event</AlertDialogTitle>
          </AlertDialogHeader>
          <Input
            type="text"
            required
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="Enter event name"
          />
          <div className=" w-full flex justify-between ">
            <DatePicker
              placeholder={"Pick Start Date"}
              date={startDate}
              setDate={setStartDate}
            />
            <DatePicker
              placeholder={"Pick End Date"}
              date={endDate}
              setDate={setEndDate}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setEndDate(undefined);
                setStartDate(undefined);
              }}
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction onClick={handleSubmit}>
              {loading ? (
                <Loader2 className="mx-3 animate-spin size-5" />
              ) : (
                "Create"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default CreateEventCard;
