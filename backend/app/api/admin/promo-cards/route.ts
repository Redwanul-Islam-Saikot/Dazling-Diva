import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import PromoCard from "@/models/PromoCard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// 1. GET ALL CARDS
export async function GET() {
  try {
    await connectDB();
    const cards = await PromoCard.find({}).sort({ createdAt: 1 });
    return NextResponse.json({ success: true, data: cards }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch cards" },
      { status: 500 }
    );
  }
}

// 2. CREATE NEW CARD
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    if (body.isLarge) {
      await PromoCard.updateMany({}, { isLarge: false });
    }

    const newCard = await PromoCard.create(body);
    return NextResponse.json({ success: true, data: newCard }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create card" },
      { status: 500 }
    );
  }
}

// 3. UPDATE CARD (?id=xxx)
export async function PUT(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Card ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();

    if (body.isLarge) {
      await PromoCard.updateMany({ _id: { $ne: id } }, { isLarge: false });
    }

    const updatedCard = await PromoCard.findByIdAndUpdate(id, body, {
      new: true,
    });
    return NextResponse.json({ success: true, data: updatedCard }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Update failed" },
      { status: 500 }
    );
  }
}

// 4. DELETE CARD (?id=xxx)
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Card ID is required" },
        { status: 400 }
      );
    }

    await PromoCard.findByIdAndDelete(id);
    return NextResponse.json(
      { success: true, message: "Card deleted" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Delete failed" },
      { status: 500 }
    );
  }
}