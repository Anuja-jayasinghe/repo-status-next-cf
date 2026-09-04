import Dashboard from "@/components/Dashboard";
import { getAllStatuses } from "@/lib/data";

export default async function Page() {
  const data = await getAllStatuses();
  return <Dashboard data={data} generatedAt={new Date().toISOString()} />;
}
