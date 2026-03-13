import { requireAuth } from "@/lib/auth-helpers";
import ConcertForm from "@/components/concerts/ConcertForm";

export default async function NewConcertPage() {
  await requireAuth();
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-xl font-bold mb-6">Submit a Concert</h1>
      <ConcertForm />
    </div>
  );
}
