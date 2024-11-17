import { prisma } from "@/utils/db";
import Link from "next/link";
import DeleteSubEventBtn from "./deleteSubEventBtn";
import { Button } from "@/components/ui/button";
import CreateSubEventModal from "./createSubEventModal";
import EditEventModal from "./editEventModal";

async function getEventById(id: number) {
    return await prisma.event.findUnique({ where: { id } });
}

async function getSubEventsOfEvent(eventId: number) {
    return await prisma.subEvent.findMany({ where: { eventId } });
}

export default async function EventPage({
    params,
}: {
    params: { id: string };
}) {
    const eventId = parseInt((await params).id);

    if (Number.isNaN(eventId)) {
        return <ErrorMessage message="Invalid Event Id!" />;
    }

    const event = await getEventById(eventId);

    if (!event) {
        return <ErrorMessage message="Cannot find specified Event!" />;
    }

    const subEvents = await getSubEventsOfEvent(eventId);
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex bg-white shadow-md rounded-lg p-6 mb-8">
                <div className="flex-1">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-center mb-4">
                        {event.name}
                    </h1>
                    <div className="text-lg text-center space-y-2">
                        <p>
                            <span className="font-semibold">Starts on:</span>
                            {" " + event.startDate.toLocaleDateString()}
                        </p>
                        <p>
                            <span className="font-semibold">Ends on:</span>
                            {" " + event.endDate.toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div>
                    <EditEventModal eventId={event.id} name={event.name} startDate={event.startDate} endDate={event.endDate}/>
                </div>
            </div>

            <div className="w-full flex justify-end mb-2">
                <Link href={`/report/${eventId}`} className="">
                    <Button>View Realtime Report</Button>
                </Link>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
                <div className=" w-full pb-4  flex gap-4">
                    <h2 className="text-2xl font-semibold mb-4">SubEvents</h2>
                    <Button className="ml-auto">
                        <Link href={`/uploads/${eventId}`}>Upload Participants</Link>
                    </Button>
                    <CreateSubEventModal eventId={eventId}></CreateSubEventModal>

                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 text-left">Name</th>
                                <th className="p-2 text-left">Start Time</th>
                                <th className="p-2 text-left">End Time</th>
                                <th className="p-2 text-center">Remove</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subEvents.map((subEvent) => (
                                <tr
                                    key={subEvent.id}
                                    id={`a${subEvent.id}`}
                                    className="border-b"
                                >
                                    <td className="p-2">
                                        <Link
                                            href={`/sub-event/${subEvent.id}`}
                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            {subEvent.name}
                                        </Link>
                                    </td>
                                    <td className="p-2">{subEvent.startTime.toLocaleString()}</td>
                                    <td className="p-2">{subEvent.endTime.toLocaleString()}</td>
                                    <td className="p-2 text-center">
                                        <DeleteSubEventBtn subEventId={subEvent.id} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function ErrorMessage({ message }: { message: string }) {
    return (
        <div className="container mx-auto px-4 py-8">
            <div
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded"
                role="alert"
            >
                <p className="font-bold">Error</p>
                <p>{message}</p>
            </div>
        </div>
    );
}
