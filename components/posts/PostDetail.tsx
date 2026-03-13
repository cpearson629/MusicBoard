import { formatFullDate } from "@/lib/utils";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import VoteButton from "./VoteButton";
import { Pin, Lock } from "lucide-react";

type Post = {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  author: { id: string; username: string; image: string | null };
  board: { name: string; slug: string; icon: string | null };
  votes: { value: number; userId: string }[];
  _count: { comments: number };
};

type Props = { post: Post; currentUserId?: string };

export default function PostDetail({ post, currentUserId }: Props) {
  const score = post.votes.reduce((sum, v) => sum + v.value, 0);
  const userVote = currentUserId
    ? (post.votes.find((v) => v.userId === currentUserId)?.value ?? null)
    : null;

  return (
    <article className="rounded-lg border border-border p-5">
      <div className="flex items-start gap-3">
        <VoteButton
          targetId={post.id}
          type="post"
          initialScore={score}
          userVote={userVote}
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 mb-2">
            <Link
              href={`/boards/${post.board.slug}`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {post.board.icon} {post.board.name}
            </Link>
            {post.isPinned && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Pin className="h-3 w-3" /> Pinned
              </Badge>
            )}
            {post.isLocked && (
              <Badge variant="outline" className="text-xs gap-1">
                <Lock className="h-3 w-3" /> Locked
              </Badge>
            )}
          </div>
          <h1 className="text-xl font-bold mb-3">{post.title}</h1>
          <div className="prose prose-invert max-w-none text-sm text-foreground/90 whitespace-pre-wrap">
            {post.body}
          </div>
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
            <Avatar className="h-6 w-6">
              <AvatarImage src={post.author.image ?? undefined} />
              <AvatarFallback>{post.author.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <Link href={`/profile/${post.author.username}`} className="hover:text-foreground font-medium">
              {post.author.username}
            </Link>
            <span>{formatFullDate(post.createdAt)}</span>
            <span>{post.viewCount} views</span>
            <span>{post._count.comments} comments</span>
          </div>
        </div>
      </div>
    </article>
  );
}
