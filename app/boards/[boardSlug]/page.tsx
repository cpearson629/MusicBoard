import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostCard from "@/components/posts/PostCard";
import { Button } from "@/components/ui/button";
import { PenSquare } from "lucide-react";
import { getSessionUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function BoardPage({ params }: { params: { boardSlug: string } }) {
  const [board, user] = await Promise.all([
    prisma.board.findUnique({
      where: { slug: params.boardSlug },
      include: {
        posts: {
          orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
          take: 50,
          include: {
            author: { select: { username: true } },
            board: { select: { name: true, slug: true, icon: true } },
            _count: { select: { comments: true, votes: true } },
            votes: { select: { value: true } },
          },
        },
      },
    }),
    getSessionUser(),
  ]);

  if (!board) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">{board.icon}</span>
            {board.name}
          </h1>
          {board.description && <p className="text-muted-foreground mt-1">{board.description}</p>}
        </div>
        {user && (
          <Link href={`/boards/${board.slug}/new`}>
            <Button className="gap-2">
              <PenSquare className="h-4 w-4" /> New Post
            </Button>
          </Link>
        )}
      </div>
      <div className="space-y-2">
        {board.posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {board.posts.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No posts yet. Start the conversation!</p>
        )}
      </div>
    </div>
  );
}
