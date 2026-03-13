"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useSession } from "next-auth/react";

const schema = z.object({ body: z.string().min(1).max(10000) });
type FormData = z.infer<typeof schema>;

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
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  if (!session) {
    return (
      <p className="text-sm text-muted-foreground">
        <a href="/login" className="text-primary hover:underline">Sign in</a> to comment
      </p>
    );
  }

  const onSubmit = async (data: FormData) => {
    setError(null);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: data.body, postId, parentId }),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Failed to post comment");
      return;
    }

    reset();
    onCancel?.();
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Textarea
        placeholder={placeholder}
        rows={parentId ? 3 : 4}
        {...register("body")}
        className="text-sm"
      />
      {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Posting..." : "Comment"}
        </Button>
        {onCancel && (
          <Button type="button" size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
        )}
      </div>
    </form>
  );
}
