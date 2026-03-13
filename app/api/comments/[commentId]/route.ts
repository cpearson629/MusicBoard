import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";

export async function DELETE(_req: NextRequest, { params }: { params: { commentId: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const comment = await prisma.comment.findUnique({ where: { id: params.commentId } });
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (comment.authorId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Soft delete to preserve tree structure
  await prisma.comment.update({
    where: { id: params.commentId },
    data: { isDeleted: true, body: "[deleted]" },
  });

  return NextResponse.json({ success: true });
}
