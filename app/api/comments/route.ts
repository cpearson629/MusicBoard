import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";

const createCommentSchema = z.object({
  body: z.string().min(1).max(10000),
  postId: z.string(),
  parentId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { body: commentBody, postId, parentId } = createCommentSchema.parse(body);

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (post.isLocked) return NextResponse.json({ error: "Post is locked" }, { status: 403 });

    const comment = await prisma.comment.create({
      data: {
        body: commentBody,
        authorId: user.id!,
        postId,
        parentId: parentId ?? null,
      },
      include: {
        author: { select: { id: true, username: true, image: true } },
        votes: true,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
