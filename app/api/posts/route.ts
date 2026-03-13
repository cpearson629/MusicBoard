import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";

const createPostSchema = z.object({
  title: z.string().min(3).max(300),
  body: z.string().min(1).max(40000),
  boardSlug: z.string(),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, body: postBody, boardSlug } = createPostSchema.parse(body);

    const board = await prisma.board.findUnique({ where: { slug: boardSlug } });
    if (!board) return NextResponse.json({ error: "Board not found" }, { status: 404 });

    const post = await prisma.post.create({
      data: {
        title,
        body: postBody,
        authorId: user.id!,
        boardId: board.id,
      },
      include: { author: { select: { username: true } }, board: true },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
