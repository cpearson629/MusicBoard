import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { MessageSquare, ArrowUp, Pin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type PostCardProps = {
  post: {
    id: string;
    title: string;
    body: string;
    createdAt: Date;
    isPinned: boolean;
    isLocked: boolean;
    viewCount: number;
    author: { username: string };
    board: { name: string; slug: string; icon: string | null };
    _count: { comments: number; votes: number };
    votes: { value: number }[];
  };
  showBoard?: boolean;
};

export default function PostCard({ post, showBoard = false }: PostCardProps) {
  const voteScore = post.votes.reduce((sum, v) => sum + v.value, 0);

  return (
    <div className="flex gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
      <div className="flex flex-col items-center gap-1 min-w-[40px] text-center">
        <ArrowUp className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{voteScore}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          {post.isPinned && (
            <Badge variant="secondary" className="text-xs">
              <Pin className="h-3 w-3 mr-1" /> Pinned
            </Badge>
          )}
          {post.isLocked && (
            <Badge variant="outline" className="text-xs">Locked</Badge>
          )}
        </div>
        <Link
          href={`/boards/${post.board.slug}/${post.id}`}
          className="block font-medium text-sm mt-1 hover:text-primary transition-colors line-clamp-2"
        >
          {post.title}
        </Link>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.body}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          {showBoard && (
            <Link href={`/boards/${post.board.slug}`} className="hover:text-foreground">
              {post.board.icon} {post.board.name}
            </Link>
          )}
          <span>by <Link href={`/profile/${post.author.username}`} className="hover:text-foreground">{post.author.username}</Link></span>
          <span>{formatDate(post.createdAt)}</span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" /> {post._count.comments}
          </span>
          <span>{post.viewCount} views</span>
        </div>
      </div>
    </div>
  );
}
