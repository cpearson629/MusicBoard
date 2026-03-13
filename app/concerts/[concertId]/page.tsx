import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { MapPin, Calendar, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AttendButton from "@/components/concerts/AttendButton";
import { getSessionUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function ConcertDetailPage({ params }: { params: { concertId: string } }) {
  const [concert, user] = await Promise.all([
    prisma.concert.findUnique({
      where: { id: params.concertId },
      include: {
        submittedBy: { select: { username: true } },
        attendees: { include: { user: { select: { id: true, username: true, image: true } } } },
      },
    }),
    getSessionUser(),
  ]);

  if (!concert) notFound();

  const isAttending = user ? concert.attendees.some((a) => a.userId === user.id) : false;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="rounded-lg border border-border p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{concert.artist}</h1>
            {concert.genre && <Badge variant="secondary" className="mt-1">{concert.genre}</Badge>}
          </div>
          <AttendButton
            concertId={concert.id}
            initialAttending={isAttending}
            initialCount={concert.attendees.length}
          />
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(concert.eventDate), "EEEE, MMMM d, yyyy 'at' h:mm a")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{concert.venue}, {concert.city}, {concert.country}</span>
          </div>
          {concert.ticketUrl && (
            <a
              href={concert.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Get Tickets
            </a>
          )}
        </div>

        {concert.description && (
          <p className="text-sm whitespace-pre-wrap text-foreground/90">{concert.description}</p>
        )}

        <div>
          <h2 className="font-semibold mb-2">{concert.attendees.length} Attending</h2>
          <div className="flex flex-wrap gap-2">
            {concert.attendees.map((attendee) => (
              <div key={attendee.id} className="flex items-center gap-1.5 text-sm">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={attendee.user.image ?? undefined} />
                  <AvatarFallback className="text-[10px]">{attendee.user.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <span>{attendee.user.username}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">Submitted by {concert.submittedBy.username}</p>
      </div>
    </div>
  );
}
