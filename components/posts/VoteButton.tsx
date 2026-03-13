"use client";
import { useState, useOptimistic, useTransition } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type VoteButtonProps = {
  targetId: string;
  type: "post" | "comment";
  initialScore: number;
  userVote: number | null; // 1, -1, or null
};

export default function VoteButton({ targetId, type, initialScore, userVote: initialUserVote }: VoteButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticState, setOptimistic] = useOptimistic(
    { score: initialScore, userVote: initialUserVote },
    (state, newVote: number | null) => {
      const prevVote = state.userVote ?? 0;
      const voteDelta = (newVote ?? 0) - prevVote;
      return { score: state.score + voteDelta, userVote: newVote };
    }
  );

  const handleVote = async (value: 1 | -1) => {
    if (!session) { router.push("/login"); return; }
    const newVote = optimisticState.userVote === value ? null : value;
    const actualValue = optimisticState.userVote === value ? (value === 1 ? -1 : 1) : value;

    startTransition(async () => {
      setOptimistic(newVote);
      const endpoint = type === "post"
        ? `/api/posts/${targetId}/vote`
        : `/api/comments/${targetId}/vote`;
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: actualValue }),
      });
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-6 w-6", optimisticState.userVote === 1 && "text-orange-500")}
        onClick={() => handleVote(1)}
        disabled={isPending}
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium min-w-[2ch] text-center">{optimisticState.score}</span>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-6 w-6", optimisticState.userVote === -1 && "text-blue-500")}
        onClick={() => handleVote(-1)}
        disabled={isPending}
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
    </div>
  );
}
