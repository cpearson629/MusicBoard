"use client";
import { useState, useOptimistic, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Users, Check } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = {
  concertId: string;
  initialAttending: boolean;
  initialCount: number;
};

export default function AttendButton({ concertId, initialAttending, initialCount }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(
    { attending: initialAttending, count: initialCount },
    (state, toggle: boolean) => ({
      attending: toggle,
      count: state.count + (toggle ? 1 : -1),
    })
  );

  const handleToggle = () => {
    if (!session) { router.push("/login"); return; }
    const newAttending = !optimistic.attending;
    startTransition(async () => {
      setOptimistic(newAttending);
      await fetch(`/api/concerts/${concertId}/attend`, { method: "POST" });
      router.refresh();
    });
  };

  return (
    <Button
      variant={optimistic.attending ? "default" : "outline"}
      onClick={handleToggle}
      disabled={isPending}
      className={cn("gap-2", optimistic.attending && "bg-green-600 hover:bg-green-700 border-green-600")}
    >
      {optimistic.attending ? <Check className="h-4 w-4" /> : <Users className="h-4 w-4" />}
      {optimistic.attending ? "Attending" : "I'm attending"}
      <span className="text-xs opacity-75">({optimistic.count})</span>
    </Button>
  );
}
