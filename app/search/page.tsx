import { prisma } from "@/lib/prisma";
import PostCard from "@/components/posts/PostCard";
import { Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim() ?? "";

  const posts = q
    ? await prisma.post.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { body: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 50,
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { username: true } },
          board: { select: { name: true, slug: true, icon: true } },
          _count: { select: { comments: true, votes: true } },
          votes: { select: { value: true } },
        },
      })
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Search className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-xl font-bold">
          {q ? `Results for "${q}"` : "Search"}
        </h1>
      </div>

      {!q && (
        <p className="text-muted-foreground text-sm">Enter a search term in the bar above.</p>
      )}

      {q && posts.length === 0 && (
        <p className="text-muted-foreground text-sm">No posts found for &ldquo;{q}&rdquo;.</p>
      )}

      <div className="space-y-2">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} showBoard />
        ))}
      </div>
    </div>
  );
}
