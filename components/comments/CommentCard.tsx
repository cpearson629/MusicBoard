"use client";
import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import VoteButton from "@/components/posts/VoteButton";
import CommentForm from "./CommentForm";
import { MessageSquare, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Comment = {
  id: string;
  body: string;
  isDeleted: boolean;
  createdAt: Date;
  author: { id: string; username: string; image: string | null };
  votes: { value: number; userId: string }[];
  replies: Comment[];
};

type Props = {
  comment: Comment;
  postId: string;
  depth?: number;
  currentUserId?: string;
};

export default function CommentCard({ comment, postId, depth = 0, currentUserId }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showReply, setShowReply] = useState(false);
  const maxDepth = 6;

  const score = comment.votes.reduce((sum, v) => sum + v.value, 0);
  const userVote = currentUserId
    ? (comment.votes.find((v) => v.userId === currentUserId)?.value ?? null)
    : null;

  const handleDelete = async () => {
    if (!confirm("Delete this comment?")) return;
    await fetch(`/api/comments/${comment.id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className={depth > 0 ? "border-l border-border pl-3 ml-2" : ""}>
      <div className="py-2">
        {comment.isDeleted ? (
          <p className="text-sm text-muted-foreground italic">[deleted]</p>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1">
              <Avatar className="h-5 w-5">
                <AvatarImage src={comment.author.image ?? undefined} />
                <AvatarFallback className="text-[10px]">{comment.author.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <Link href={`/profile/${comment.author.username}`} className="text-xs font-medium hover:text-primary">
                {comment.author.username}
              </Link>
              <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{comment.body}</p>
            <div className="flex items-center gap-2 mt-1">
              <VoteButton targetId={comment.id} type="comment" initialScore={score} userVote={userVote} />
              {depth < maxDepth && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground"
                  onClick={() => setShowReply(!showReply)}
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}
              {session?.user?.id === comment.author.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </>
        )}

        {showReply && (
          <div className="mt-2">
            <CommentForm
              postId={postId}
              parentId={comment.id}
              onCancel={() => setShowReply(false)}
              placeholder={`Reply to ${comment.author.username}...`}
            />
          </div>
        )}
      </div>

      {comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
