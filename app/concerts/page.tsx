import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ConcertCard from "@/components/concerts/ConcertCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getSessionUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function ConcertsPage({ searchParams }: { searchParams: { city?: string; genre?: string } }) {
  const [concerts, user] = await Promise.all([
    prisma.concert.findMany({
      where: {
        eventDate: { gte: new Date() },
        ...(searchParams.city ? { city: { contains: searchParams.city, mode: "insensitive" } } : {}),
        ...(searchParams.genre ? { genre: { contains: searchParams.genre, mode: "insensitive" } } : {}),
      },
      include: {
        submittedBy: { select: { username: true } },
        _count: { select: { attendees: true } },
      },
      orderBy: { eventDate: "asc" },
    }),
    getSessionUser(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Upcoming Concerts</h1>
        {user && (
          <Link href="/concerts/new">
            <Button className="gap-2"><Plus className="h-4 w-4" /> Submit Concert</Button>
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {concerts.map((concert) => (
          <ConcertCard key={concert.id} concert={concert} />
        ))}
        {concerts.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground py-12">No upcoming concerts found.</p>
        )}
      </div>
    </div>
  );
}
