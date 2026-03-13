import CommentCard from "./CommentCard";
import CommentForm from "./CommentForm";
import { Separator } from "@/components/ui/separator";

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
  comments: Comment[];
  postId: string;
  isLocked: boolean;
  currentUserId?: string;
};

export default function CommentTree({ comments, postId, isLocked, currentUserId }: Props) {
  return (
    <div>
      <h2 className="font-semibold mb-3">{comments.length} comment{comments.length !== 1 ? "s" : ""}</h2>
      {!isLocked && (
        <>
          <CommentForm postId={postId} />
          <Separator className="my-4" />
        </>
      )}
      {isLocked && (
        <p className="text-sm text-muted-foreground mb-4 italic">This post is locked. No new comments.</p>
      )}
      <div className="space-y-2">
        {comments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            postId={postId}
            depth={0}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </div>
  );
}
