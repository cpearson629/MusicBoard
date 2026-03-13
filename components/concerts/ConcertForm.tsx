"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const schema = z.object({
  artist: z.string().min(1).max(200),
  venue: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  country: z.string().optional(),
  eventDate: z.string().min(1, "Date is required"),
  ticketUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  description: z.string().max(5000).optional(),
  genre: z.string().max(50).optional(),
});
type FormData = z.infer<typeof schema>;

export default function ConcertForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { country: "US" },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    const eventDate = new Date(data.eventDate).toISOString();
    const res = await fetch("/api/concerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, eventDate }),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Failed to submit concert");
      return;
    }

    const concert = await res.json();
    router.push(`/concerts/${concert.id}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="artist">Artist / Band *</Label>
          <Input id="artist" {...register("artist")} />
          {errors.artist && <p className="text-xs text-destructive">{errors.artist.message}</p>}
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="venue">Venue *</Label>
          <Input id="venue" {...register("venue")} />
          {errors.venue && <p className="text-xs text-destructive">{errors.venue.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="city">City *</Label>
          <Input id="city" {...register("city")} />
          {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="country">Country</Label>
          <Input id="country" {...register("country")} />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="eventDate">Date & Time *</Label>
          <Input id="eventDate" type="datetime-local" {...register("eventDate")} />
          {errors.eventDate && <p className="text-xs text-destructive">{errors.eventDate.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="genre">Genre</Label>
          <Input id="genre" placeholder="e.g. Rock, Jazz..." {...register("genre")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ticketUrl">Ticket URL</Label>
          <Input id="ticketUrl" type="url" placeholder="https://..." {...register("ticketUrl")} />
          {errors.ticketUrl && <p className="text-xs text-destructive">{errors.ticketUrl.message}</p>}
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={4} {...register("description")} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Concert"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
