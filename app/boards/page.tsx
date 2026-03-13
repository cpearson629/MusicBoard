import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BoardsPage() {
  const boards = await prisma.board.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">All Boards</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {boards.map((board) => (
          <Link key={board.id} href={`/boards/${board.slug}`}>
            <Card className="hover:bg-accent/50 transition-colors h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-2xl">{board.icon}</span>
                  {board.name}
                </CardTitle>
                {board.description && (
                  <CardDescription className="text-xs">{board.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{board._count.posts} post{board._count.posts !== 1 ? "s" : ""}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
