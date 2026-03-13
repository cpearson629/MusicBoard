import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";

const voteSchema = z.object({ value: z.union([z.literal(1), z.literal(-1)]) });

export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { value } = voteSchema.parse(body);

  const existing = await prisma.postVote.findUnique({
    where: { userId_postId: { userId: user.id!, postId: params.postId } },
  });

  if (existing) {
    if (existing.value === value) {
      await prisma.postVote.delete({
        where: { userId_postId: { userId: user.id!, postId: params.postId } },
      });
      return NextResponse.json({ removed: true });
    }
    const updated = await prisma.postVote.update({
      where: { userId_postId: { userId: user.id!, postId: params.postId } },
      data: { value },
    });
    return NextResponse.json(updated);
  }

  const vote = await prisma.postVote.create({
    data: { value, userId: user.id!, postId: params.postId },
  });
  return NextResponse.json(vote, { status: 201 });
}
