import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";

const voteSchema = z.object({ value: z.union([z.literal(1), z.literal(-1)]) });

export async function POST(req: NextRequest, { params }: { params: { commentId: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { value } = voteSchema.parse(body);

  const existing = await prisma.commentVote.findUnique({
    where: { userId_commentId: { userId: user.id!, commentId: params.commentId } },
  });

  if (existing) {
    if (existing.value === value) {
      await prisma.commentVote.delete({
        where: { userId_commentId: { userId: user.id!, commentId: params.commentId } },
      });
      return NextResponse.json({ removed: true });
    }
    const updated = await prisma.commentVote.update({
      where: { userId_commentId: { userId: user.id!, commentId: params.commentId } },
      data: { value },
    });
    return NextResponse.json(updated);
  }

  const vote = await prisma.commentVote.create({
    data: { value, userId: user.id!, commentId: params.commentId },
  });
  return NextResponse.json(vote, { status: 201 });
}
