import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { concertId: string } }) {
  const concert = await prisma.concert.findUnique({
    where: { id: params.concertId },
    include: {
      submittedBy: { select: { username: true } },
      attendees: { include: { user: { select: { id: true, username: true, image: true } } } },
    },
  });

  if (!concert) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(concert);
}
