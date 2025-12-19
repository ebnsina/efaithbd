import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all footer links
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get("sectionId");

    const where = sectionId ? { sectionId } : {};

    const links = await prisma.footerLink.findMany({
      where,
      orderBy: { order: "asc" },
      include: {
        section: true,
      },
    });
    return NextResponse.json(links);
  } catch (error) {
    console.error("Error fetching footer links:", error);
    return NextResponse.json(
      { error: "Failed to fetch footer links" },
      { status: 500 },
    );
  }
}

// POST create new footer link
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sectionId, label, url, order, active } = body;

    const link = await prisma.footerLink.create({
      data: {
        sectionId,
        label,
        url,
        order: order || 0,
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json(link);
  } catch (error) {
    console.error("Error creating footer link:", error);
    return NextResponse.json(
      { error: "Failed to create footer link" },
      { status: 500 },
    );
  }
}
