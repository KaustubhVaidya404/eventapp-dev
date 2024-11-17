import ScannerAndDetails from "@/components/ScannerAndDetails";

async function QRScanner({ params }: { params: Promise<{ subEventId: string }> }) {
  const subEventId = Number((await params).subEventId)

  return (
    <div className="p-4">
      <ScannerAndDetails subEventId={subEventId} />
    </div>
  );
}

export default QRScanner;