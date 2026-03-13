"use client";
// This needs to be a client component for form state
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const schema = z.object({
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  favoriteGenres: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    setSuccess(false);
    const genres = data.favoriteGenres
      ? data.favoriteGenres.split(",").map((g) => g.trim()).filter(Boolean)
      : [];

    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, favoriteGenres: genres }),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Failed to save settings");
    } else {
      setSuccess(true);
      await update();
    }
  };

  if (!session) {
    return <div className="p-8 text-center text-muted-foreground">Please sign in to access settings.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your public profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {success && <p className="text-sm text-green-500">Settings saved!</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" rows={3} placeholder="Tell us about yourself..." {...register("bio")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="City, Country" {...register("location")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="favoriteGenres">Favorite Genres</Label>
              <Input id="favoriteGenres" placeholder="Rock, Jazz, Electronic (comma-separated)" {...register("favoriteGenres")} />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
