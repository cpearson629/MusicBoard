"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ConcertForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const get = (name: string) =>
      (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement)?.value ?? "";

    const eventDateRaw = get("eventDate");
    if (!eventDateRaw) { setError("Date & Time is required"); return; }

    const body = {
      artist: get("artist"),
      venue: get("venue"),
      city: get("city"),
      country: get("country") || "US",
      eventDate: new Date(eventDateRaw).toISOString(),
      genre: get("genre") || undefined,
      ticketUrl: get("ticketUrl") || undefined,
      description: get("description") || undefined,
    };

    startTransition(async () => {
      const res = await fetch("/api/concerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Failed to submit concert");
        return;
      }

      const concert = await res.json();
      router.push(`/concerts/${concert.id}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="artist">Artist / Band *</Label>
          <Input id="artist" name="artist" required />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="venue">Venue *</Label>
          <Input id="venue" name="venue" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="city">City *</Label>
          <Input id="city" name="city" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" defaultValue="US" />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="eventDate">Date & Time *</Label>
          <Input id="eventDate" name="eventDate" type="datetime-local" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="genre">Genre</Label>
          <Input id="genre" name="genre" placeholder="e.g. Rock, Jazz..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ticketUrl">Ticket URL</Label>
          <Input id="ticketUrl" name="ticketUrl" type="url" placeholder="https://..." />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={4} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Submitting..." : "Submit Concert"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
