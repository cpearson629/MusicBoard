import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";

const createConcertSchema = z.object({
  artist: z.string().min(1).max(200),
  venue: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  country: z.string().default("US"),
  eventDate: z.string().datetime(),
  ticketUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().max(5000).optional(),
  genre: z.string().max(50).optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const genre = searchParams.get("genre");

  const concerts = await prisma.concert.findMany({
    where: {
      eventDate: { gte: new Date() },
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
      ...(genre ? { genre: { contains: genre, mode: "insensitive" } } : {}),
    },
    include: {
      submittedBy: { select: { username: true } },
      _count: { select: { attendees: true } },
    },
    orderBy: { eventDate: "asc" },
  });

  return NextResponse.json(concerts);
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = createConcertSchema.parse(body);

    const concert = await prisma.concert.create({
      data: {
        ...data,
        eventDate: new Date(data.eventDate),
        ticketUrl: data.ticketUrl || null,
        submittedById: user.id!,
      },
    });

    return NextResponse.json(concert, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
