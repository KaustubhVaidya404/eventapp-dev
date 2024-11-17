import { prisma } from "@/utils/db";
import Link from "next/link";
import Image from "next/image";
import DeleteUserEventBtn from "./deleteUserEventBtn";

async function getSubEventById(id: number) {
  return await prisma.subEvent.findUnique({ where: { id } });
}

async function getEventById(id: number) {
  return await prisma.event.findUnique({ where: { id } });
}

async function getUserEventBySubEventId(subEventId: number) {
  return await prisma.userEvent.findMany({
    where: { subEventId },
  });
}

async function getUsersByIds(ids: number[]) {
  return await prisma.user.findMany({ where: { id: { in: ids } } });
}

export default async function SubEventPage({
  params,
}: {
  params: { id: string };
}) {
  const subEventId = parseInt(params.id);

  if (Number.isNaN(subEventId)) {
    return <ErrorMessage message="Invalid SubEvent Id!" />;
  }

  const subEvent = await getSubEventById(subEventId);

  if (!subEvent) {
    return <ErrorMessage message="Cannot find specified SubEvent!" />;
  }

  const event = await getEventById(subEvent.eventId);

  if (!event) {
    return <ErrorMessage message="Event does not exist for the Sub Event" />;
  }

  const userEvents = await getUserEventBySubEventId(subEventId);
  const userIds = userEvents.map((e) => e.userId);
  const users = await getUsersByIds(userIds);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center space-y-4 mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-center">
          Sub Event: {subEvent.name}
        </h1>
        <div className="text-lg text-center">
          <p>Starts at: {subEvent.startTime.toLocaleString()}</p>
          <p>Ends at: {subEvent.endTime.toLocaleString()}</p>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold">
          Event: {event.name}
        </h2>
        {
          subEvent.startTime > new Date() ? (
            <p className="text-yellow-500 font-medium text-2xl my-5">Event has not started yet.</p>
          ) : subEvent.endTime < new Date() ? (
            <p className="text-yellow-500 font-medium text-2xl my-5">Event has ended.</p>
          ) : (
            <Link
              href={`/scanner/${subEventId}`}
              className="block w-32 h-32 sm:w-48 sm:h-48 relative"
            >
              <Image
                src="/scanner-icon.png"
                alt="Scanner icon"
                layout="fill"
                objectFit="contain"
              />
            </Link>
          )
        }
      </div>

      <div className="overflow-x-auto">
        <h2 className="text-2xl font-semibold mb-4">Participants</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Phone No.</th>
              <th className="p-2 text-left">Attended at</th>
              <th className="p-2 text-center">Remove</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const userEvent = userEvents.find((event) => event.userId === user.id)
              const attendedAt = userEvent?.attendedAt || "Not attended"
              return (
                <tr key={user.id} id={`a${user.id}`} className="border-b">
                  <td className="p-2 text-blue-500 underline"><Link href={"/user/" + user.id}>{user.name}</Link></td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">{user.phone}</td>
                  <td className="p-2">{attendedAt.toLocaleString()}</td>
                  <td className="p-2 text-center">
                    <DeleteUserEventBtn
                      userId={user.id}
                      subEventId={subEventId}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-red-600">{message}</h1>
    </div>
  );
}
