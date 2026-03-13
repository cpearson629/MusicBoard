import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

export default async function Sidebar() {
  const boards = await prisma.board.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  return (
    <aside className="w-60 shrink-0">
      <div className="sticky top-20">
        <h2 className="mb-2 px-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Boards
        </h2>
        <nav className="space-y-0.5">
          {boards.map((board) => (
            <Link
              key={board.id}
              href={`/boards/${board.slug}`}
              className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors"
            >
              <span className="flex items-center gap-2">
                <span>{board.icon}</span>
                <span>{board.name}</span>
              </span>
              <Badge variant="secondary" className="text-xs h-5">
                {board._count.posts}
              </Badge>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
