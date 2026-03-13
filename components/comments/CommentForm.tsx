"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";

type Props = {
  postId: string;
  parentId?: string;
  onCancel?: () => void;
  placeholder?: string;
};

export default function CommentForm({ postId, parentId, onCancel, placeholder = "Write a comment..." }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!session) {
    return (
      <p className="text-sm text-muted-foreground">
        <a href="/login" className="text-primary hover:underline">Sign in</a> to comment
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const body = textareaRef.current?.value.trim() ?? "";
    if (!body) return;

    startTransition(async () => {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, postId, parentId }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Failed to post comment");
        return;
      }

      if (textareaRef.current) textareaRef.current.value = "";
      onCancel?.();
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Textarea
        ref={textareaRef}
        placeholder={placeholder}
        rows={parentId ? 3 : 4}
        className="text-sm"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Posting..." : "Comment"}
        </Button>
        {onCancel && (
          <Button type="button" size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
        )}
      </div>
    </form>
  );
}
