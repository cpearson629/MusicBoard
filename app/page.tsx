import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PostCard from "@/components/posts/PostCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [boards, recentPosts] = await Promise.all([
    prisma.board.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { posts: true } } } }),
    prisma.post.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { username: true } },
        board: { select: { name: true, slug: true, icon: true } },
        _count: { select: { comments: true, votes: true } },
        votes: { select: { value: true } },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold mb-4">Recent Posts</h1>
          <div className="space-y-2">
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post} showBoard />
            ))}
            {recentPosts.length === 0 && (
              <p className="text-muted-foreground text-sm py-8 text-center">No posts yet. Be the first to post!</p>
            )}
          </div>
        </div>
        <aside className="w-64 shrink-0 hidden lg:block">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Boards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 p-3 pt-0">
              {boards.map((board) => (
                <Link
                  key={board.id}
                  href={`/boards/${board.slug}`}
                  className="flex items-center justify-between text-sm rounded-md px-2 py-1.5 hover:bg-accent transition-colors"
                >
                  <span>{board.icon} {board.name}</span>
                  <span className="text-xs text-muted-foreground">{board._count.posts}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
