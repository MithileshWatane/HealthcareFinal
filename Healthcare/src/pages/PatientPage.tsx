import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase"; // Adjusted the path to be relative

export default function PatientPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
      } else {
        setData(data);
      }
      setLoading(false);
    };

    fetchPatient();
  }, [id]);

  if (loading) return <p>loading...</p>;
  if (!data) return <p>No data found</p>;

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-2">
      <h1 className="text-2xl font-bold">{data.full_name}'s Medical Profile</h1>
      <p>DOB: {data.dob}</p>
      <p>Gender: {data.gender}</p>
      <p>Blood Group: {data.blood_group}</p>
      <p>Phone: {data.phone}</p>
      <p>Emergency Contact: {data.emergency_contact}</p>
      <p>Height: {data.height}</p>
      <p>Weight: {data.weight}</p>
      <p>Diseases: {data.diseases}</p>
      <p>Allergies: {data.allergies}</p>
      <p>Medications: {data.medications}</p>
      <p>Surgeries: {data.surgeries}</p>
      <p>Lifestyle: {data.lifestyle}</p>
      <p>Notes: {data.notes}</p>
    </div>
  );
}
