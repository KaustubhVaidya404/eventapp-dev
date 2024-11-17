"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, FileCheck, AlertCircle } from "lucide-react";
import Papa from "papaparse";
import { useParams, useRouter } from "next/navigation";

type ExtractedData = {
  name: string;
  email: string;
  phone: number;
  class: string;
};

export default function Uploads() {
  const router = useRouter()
  const params = useParams();
  if (Array.isArray(params.id) || !params.id) return
  const eventId = params.id;
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setMessage(null);
    } else {
      setFile(null);
      setMessage({ type: "error", text: "Please select a valid CSV file." });
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (file) {
      // Read and parse the CSV file
      Papa.parse(file, {
        header: true, // Use the first row as header
        complete: async (results) => {
          const extractedData: ExtractedData[] = results.data.map(
            (row: any) => ({
              name: row.name,
              email: row.email,
              phone: Number(row.phone),
              class: row.class,
            })
          );
          await uploadUserData(extractedData, eventId);
          setMessage({ type: "success", text: "File uploaded successfully!" });
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          setMessage({ type: "error", text: "Error parsing CSV file." });
        },
      });
    } else {
      setMessage({
        type: "error",
        text: "Please select a CSV file before submitting.",
      });
    }
  };

  async function uploadUserData(
    extractedData: ExtractedData[],
    eventId: string
  ) {
    console.log(eventId);
    try {
      await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receivedData: extractedData, eventId }),
      });
    } catch (e) {
      console.log(`Error ${e}`);
    }
  }
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Upload Participants
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Upload your .csv file here
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <Label htmlFor="file-upload" className="sr-only">
                Choose CSV file
              </Label>
              <Input
                id="file-upload"
                name="file-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={!file}
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <Upload
                  className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                  aria-hidden="true"
                />
              </span>
              Upload CSV
            </Button>
          </div>
        </form>

        {message && (
          <Alert
            variant={message.type === "success" ? "default" : "destructive"}
          >
            {message.type === "success" ? (
              <FileCheck className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {message.type === "success" ? "Success" : "Error"}
            </AlertTitle>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {file && (
          <div className="mt-4 text-sm text-gray-600">
            Selected file: {file.name}
          </div>
        )}
        <Button onClick={() => router.back()} className="bg-indigo-600"> &lt; Back</Button>
      </div>
    </div>
  );
}
