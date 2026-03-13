import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostDetail from "@/components/posts/PostDetail";
import CommentTree from "@/components/comments/CommentTree";
import { getSessionUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

type CommentNode = {
  id: string;
  body: string;
  isDeleted: boolean;
  createdAt: Date;
  author: { id: string; username: string; image: string | null };
  votes: { value: number; userId: string }[];
  replies: CommentNode[];
};

function buildCommentTree(
  flat: (Omit<CommentNode, "replies"> & { parentId: string | null })[],
  parentId: string | null = null
): CommentNode[] {
  return flat
    .filter((c) => c.parentId === parentId)
    .map((c) => ({ ...c, replies: buildCommentTree(flat, c.id) }));
}

export default async function PostPage({ params }: { params: { boardSlug: string; postId: string } }) {
  const [post, user] = await Promise.all([
    prisma.post.findUnique({
      where: { id: params.postId },
      include: {
        author: { select: { id: true, username: true, image: true } },
        board: { select: { name: true, slug: true, icon: true } },
        votes: { select: { value: true, userId: true } },
        _count: { select: { comments: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, username: true, image: true } },
            votes: { select: { value: true, userId: true } },
          },
        },
      },
    }),
    getSessionUser(),
  ]);

  if (!post || post.board.slug !== params.boardSlug) notFound();

  // Increment view count
  await prisma.post.update({ where: { id: params.postId }, data: { viewCount: { increment: 1 } } });

  const commentTree = buildCommentTree(
    post.comments.map((c) => ({ ...c, replies: [] }))
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      <PostDetail post={post} currentUserId={user?.id} />
      <CommentTree
        comments={commentTree}
        postId={post.id}
        isLocked={post.isLocked}
        currentUserId={user?.id}
      />
    </div>
  );
}
