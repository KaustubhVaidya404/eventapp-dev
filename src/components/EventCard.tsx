import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

function EventCard({
  id,
  eventName,
  startDate,
  endDate,
}: {
  id: number;
  eventName: string;
  startDate: Date;
  endDate: Date;
}) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const router = useRouter()
  return (
    <div className=" w-[340px] h-[186px] ">
      <Card className=" w-full h-full">
        <CardHeader className=" pt-6 pb-3">
          <CardTitle className=" text-xl">{eventName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <h1>
              Start Date:{" "}
              {start.toLocaleDateString("en-IN", {
                timeZone: "Asia/Kolkata",
              })}
            </h1>
            <h1>
              End Date:{" "}
              {end.toLocaleDateString("en-IN", {
                timeZone: "Asia/Kolkata",
              })}
            </h1>
          </div>
          <Button
            onClick={() => router.push(`/event/${id}`)}
            className=" w-full mt-4"
          >
            View Event
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default EventCard;
