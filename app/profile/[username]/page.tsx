import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { MapPin, Calendar } from "lucide-react";
import PostCard from "@/components/posts/PostCard";

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      posts: {
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { username: true } },
          board: { select: { name: true, slug: true, icon: true } },
          _count: { select: { comments: true, votes: true } },
          votes: { select: { value: true } },
        },
      },
      comments: {
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { post: { select: { id: true, title: true, board: { select: { slug: true } } } } },
      },
      _count: { select: { posts: true, comments: true } },
    },
  });

  if (!user) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex items-start gap-4 mb-8">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.image ?? undefined} />
          <AvatarFallback className="text-xl">{user.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{user.username}</h1>
          {user.bio && <p className="text-muted-foreground mt-1 text-sm">{user.bio}</p>}
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
            {user.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {user.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Joined {formatDate(user.createdAt)}
            </span>
          </div>
          {user.favoriteGenres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {user.favoriteGenres.map((g) => (
                <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>
              ))}
            </div>
          )}
          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
            <span>{user._count.posts} posts</span>
            <span>{user._count.comments} comments</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold mb-3">Recent Posts</h2>
          <div className="space-y-2">
            {user.posts.map((post) => (
              <PostCard key={post.id} post={post} showBoard />
            ))}
            {user.posts.length === 0 && <p className="text-sm text-muted-foreground">No posts yet.</p>}
          </div>
        </div>
        <div>
          <h2 className="font-semibold mb-3">Recent Comments</h2>
          <div className="space-y-2">
            {user.comments.map((comment) => (
              <div key={comment.id} className="rounded-lg border border-border p-3 text-sm">
                <Link
                  href={`/boards/${comment.post.board.slug}/${comment.post.id}`}
                  className="text-xs text-muted-foreground hover:text-foreground mb-1 block"
                >
                  on: {comment.post.title}
                </Link>
                <p className="line-clamp-2">{comment.isDeleted ? "[deleted]" : comment.body}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDate(comment.createdAt)}</p>
              </div>
            ))}
            {user.comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
