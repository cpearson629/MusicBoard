import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcryptjs from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

const boards = [
  { name: "Rock", slug: "rock", icon: "🎸", sortOrder: 1, description: "Discuss rock music, bands, and albums" },
  { name: "Hip-Hop & Rap", slug: "hip-hop", icon: "🎤", sortOrder: 2, description: "Hip-hop culture, rap battles, and beats" },
  { name: "Jazz", slug: "jazz", icon: "🎷", sortOrder: 3, description: "Jazz standards, improvisation, and artists" },
  { name: "Electronic", slug: "electronic", icon: "🎛️", sortOrder: 4, description: "EDM, techno, house, and all things electronic" },
  { name: "Classical", slug: "classical", icon: "🎻", sortOrder: 5, description: "Classical compositions and performances" },
  { name: "Metal", slug: "metal", icon: "🤘", sortOrder: 6, description: "Heavy metal, death metal, black metal, and more" },
  { name: "R&B / Soul", slug: "rnb-soul", icon: "🎵", sortOrder: 7, description: "R&B, soul, funk, and groove" },
  { name: "Country & Folk", slug: "country-folk", icon: "🪕", sortOrder: 8, description: "Country, folk, and americana" },
  { name: "Album Reviews", slug: "album-reviews", icon: "💿", sortOrder: 9, description: "Share and discuss album reviews" },
  { name: "Artist Discussion", slug: "artist-discussion", icon: "🌟", sortOrder: 10, description: "Deep dives on your favorite artists" },
  { name: "Gear & Tech", slug: "gear-tech", icon: "🔧", sortOrder: 11, description: "Instruments, gear, and music tech" },
  { name: "Concerts & Tours", slug: "concerts-tours", icon: "🎪", sortOrder: 12, description: "Live music, setlists, and tour news" },
];

async function main() {
  console.log("Seeding boards...");
  for (const board of boards) {
    await prisma.board.upsert({
      where: { slug: board.slug },
      update: {},
      create: board,
    });
  }

  console.log("Creating demo user...");
  const passwordHash = await bcryptjs.hash("password123", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@musicboard.dev" },
    update: {},
    create: {
      email: "demo@musicboard.dev",
      username: "musicfan",
      passwordHash,
      bio: "Lifelong music lover. I listen to everything.",
      location: "Nashville, TN",
      favoriteGenres: ["Rock", "Jazz", "Electronic"],
    },
  });

  console.log("Creating sample posts...");
  const rockBoard = await prisma.board.findUnique({ where: { slug: "rock" } });
  const albumBoard = await prisma.board.findUnique({ where: { slug: "album-reviews" } });

  if (rockBoard) {
    const post1 = await prisma.post.upsert({
      where: { id: "sample-post-1" },
      update: {},
      create: {
        id: "sample-post-1",
        title: "What's everyone's favorite classic rock album?",
        body: "I've been on a huge classic rock kick lately. Currently obsessed with Led Zeppelin IV. What are your all-time favorites?\n\nFor me it goes:\n1. Led Zeppelin IV\n2. Pink Floyd - The Wall\n3. The Beatles - Abbey Road",
        authorId: user.id,
        boardId: rockBoard.id,
      },
    });

    await prisma.comment.upsert({
      where: { id: "sample-comment-1" },
      update: {},
      create: {
        id: "sample-comment-1",
        body: "Has to be Dark Side of the Moon for me. That album changed my life.",
        authorId: user.id,
        postId: post1.id,
      },
    });
  }

  if (albumBoard) {
    await prisma.post.upsert({
      where: { id: "sample-post-2" },
      update: {},
      create: {
        id: "sample-post-2",
        title: "Album Review: Kendrick Lamar - GNX",
        body: "Rating: 9/10\n\nKendrick continues to push boundaries with GNX. The production is immaculate, the lyricism is dense and rewarding on repeated listens. Standout tracks include...",
        authorId: user.id,
        boardId: albumBoard.id,
      },
    });
  }

  console.log("Seeding concerts...");
  await prisma.concert.upsert({
    where: { id: "sample-concert-1" },
    update: {},
    create: {
      id: "sample-concert-1",
      artist: "The Rolling Stones",
      venue: "Madison Square Garden",
      city: "New York",
      country: "US",
      eventDate: new Date("2026-06-15T20:00:00Z"),
      genre: "Rock",
      description: "The Rolling Stones on their 2026 world tour",
      submittedById: user.id,
    },
  });

  console.log("Done seeding!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
