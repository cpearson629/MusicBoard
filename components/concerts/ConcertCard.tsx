import Link from "next/link";
import { format } from "date-fns";
import { MapPin, Calendar, ExternalLink, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type ConcertCardProps = {
  concert: {
    id: string;
    artist: string;
    venue: string;
    city: string;
    country: string;
    eventDate: Date;
    genre: string | null;
    ticketUrl: string | null;
    _count: { attendees: number };
  };
};

export default function ConcertCard({ concert }: ConcertCardProps) {
  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/concerts/${concert.id}`} className="font-semibold hover:text-primary transition-colors">
            {concert.artist}
          </Link>
          {concert.genre && <Badge variant="secondary" className="text-xs shrink-0">{concert.genre}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>{format(new Date(concert.eventDate), "EEE, MMM d yyyy 'at' h:mm a")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          <span>{concert.venue}, {concert.city}, {concert.country}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {concert._count.attendees} attending
          </span>
          {concert.ticketUrl && (
            <a
              href={concert.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline text-xs"
            >
              Tickets <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
