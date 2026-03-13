import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";

export async function POST(_req: NextRequest, { params }: { params: { concertId: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.concertAttendee.findUnique({
    where: { userId_concertId: { userId: user.id!, concertId: params.concertId } },
  });

  if (existing) {
    await prisma.concertAttendee.delete({
      where: { userId_concertId: { userId: user.id!, concertId: params.concertId } },
    });
    return NextResponse.json({ attending: false });
  }

  await prisma.concertAttendee.create({
    data: { userId: user.id!, concertId: params.concertId },
  });
  return NextResponse.json({ attending: true }, { status: 201 });
}
