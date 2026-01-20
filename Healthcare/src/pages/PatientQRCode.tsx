import { useAuth } from "@/contexts/AuthContext";
import ReactQRCode from "react-qr-code";

export default function PatientQRCode() {
  const { user } = useAuth();

  if (!user) return <p>Please log in to generate QR code</p>;

  const qrUrl = `${window.location.origin}/patient/${user.id}`;

  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-2xl font-bold">Your Medical QR Code</h2>
      <div className="bg-white p-4 rounded">
        <ReactQRCode value={qrUrl} size={256} />
      </div>
      <p className="text-center text-muted-foreground">
        Scan this QR code to view your medical profile
      </p>
    </div>
  );
}
