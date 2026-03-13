import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import PostForm from "@/components/posts/PostForm";

export default async function NewPostPage({ params }: { params: { boardSlug: string } }) {
  await requireAuth();
  const board = await prisma.board.findUnique({ where: { slug: params.boardSlug } });
  if (!board) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-xl font-bold mb-6">
        New Post in {board.icon} {board.name}
      </h1>
      <PostForm boardSlug={params.boardSlug} />
    </div>
  );
}
