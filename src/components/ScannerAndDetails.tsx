"use client";

import { Scanner } from "@yudiel/react-qr-scanner";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface IUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  class: string;
}

export default function ScannerAndDetails({
  subEventId,
}: {
  subEventId: number;
}) {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<IUser | null>(null);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [subEventName, setSubEventName] = useState('This event.')
  const [error, setError] = useState('')
  const router = useRouter()

  const getSubEvent = async () => {
    const data = await fetch(`/api/sub-event?subEventId=${subEventId}`)
    const currentSubEvent = await data.json()
    console.log(currentSubEvent)
    setSubEventName(currentSubEvent.currentSubEvent.name)
  }

  useEffect(() => {
    getSubEvent()
  }, [])

  const handleScan = async (result: any) => {
    if (result && !loading) {
      setLoading(true);
      setScanResult(result[0].rawValue);

      try {
        const response = await fetch("/api/qr-scanner", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qrCodeData: result[0].rawValue, subEventId }),
        });
        const data = await response.json();
        console.log(data)
        setUser(data.userData.user);

        if (data.userData.userEvent.attendedAt) {
          setAlreadyCheckedIn(true);
        }
      } catch (error) {
        alert("An error occurred while scanning the QR Code.");
        console.error("Scan error:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleScanError = (error: any) => {
    console.error("Scan error:", error);
    alert("Error during scan: " + error.message);
  };

  const handleCheckIn = async () => {
    setCheckInLoading(true);
    try {
      const response = await fetch("/api/qr-scanner", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user?.id, subEventId }),
      });
      const data = await response.json();
      if (data.error) {
        alert(data.error);
      }
      if (data.newEvent) {
        setCheckInSuccess(true);
        // setTimeout(()=>{    //To automatically go back to sub-event page after clicking checkIn button
        //   router.back()
        // },2000)
      }
    } catch (error) {
      alert("An error occurred while scanning the QR Code.");
      console.error("Scan error:", error);
    } finally {
      setCheckInLoading(false);
    }
  };

  return scanResult ? (
    <div className="my-10">
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <>
          <div className="p-4 space-y-2 border rounded-lg">
            <p className="text-gray-800 font-medium text-lg">{user?.name}</p>
            <p className="text-gray-800 font-medium text-lg">{user?.email}</p>
            <p className="text-gray-800 font-medium text-lg">{user?.phone}</p>
            <p className="text-gray-800 font-medium text-lg">{user?.class}</p>
          </div>

          {alreadyCheckedIn ? (
            <div className="my-5">
              <p className="text-center text-red-600 font-semibold">
                Attendant already checked in for this subevent
              </p>
            </div>
          ) : (
            <div className="my-5">
              {!checkInSuccess ? (
                <button
                  className={`p-4 w-full flex-grow bg-green-100 text-green-700 text-xl font-medium rounded-lg ${checkInLoading && "opacity-50"
                    }`}
                  onClick={handleCheckIn}
                  disabled={checkInLoading}
                >
                  {checkInLoading ? "Loading" : "Check In"}
                </button>
              ) : (
                <div className="flex gap-5 items-center justify-center">
                  <Image src="/tick.svg" alt="" width={50} height={50} />
                  <p className="text-green-600 text-2xl font-bold">
                    Check-In Successfull
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
      <button
        className="fixed bottom-4 bg-gray-900 text-white px-4 py-2 rounded-xl mt-5"
        onClick={() => {
          setScanResult(null);
          setAlreadyCheckedIn(false);
          setCheckInSuccess(false);
          setCheckInLoading(false);
          setScanResult(null)
        }}
      >
        {"<"} Back to Scanner
      </button>
    </div>
  ) : (
    <div className="mt-10">
      <h3 className="text-xl text-center font-medium my-4">
        Scan to check-in for '{subEventName}' event
      </h3>
      <div className="h-80 w-80 my-5 mx-auto rounded-2xl overflow-hidden">
        <Scanner onScan={handleScan} onError={handleScanError} />
      </div>
      <p className="text-gray-400 mt-10 text-center text-lg">
        QR is available on the ID card of the attendent
      </p>
    </div>
  );
}
