import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import HeroSlider from "@/models/HeroSlider";

export const dynamic = "force-dynamic";

// গতিশীলভাবে Origin হ্যান্ডেল করার CORS ফাংশন
function corsHeaders(req?: Request) {
  const origin = req?.headers.get("origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Cache-Control, Pragma",
    "Access-Control-Allow-Credentials": "true",
  };
}

// Preflight CORS হ্যান্ডলার
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req),
  });
}

// GET: সব স্লাইড দেখা
export async function GET(req: Request) {
  try {
    await connectDB();
    const sliders = await HeroSlider.find({}).sort({ createdAt: 1 });
    
    return NextResponse.json(
      { success: true, data: sliders },
      { 
        headers: {
          ...corsHeaders(req),
          "Cache-Control": "no-store, max-age=0",
        } 
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders(req) }
    );
  }
}

// POST: নতুন স্লাইড তৈরি (কোনো ফিল্ডই আর required নয়)
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const slider = await HeroSlider.create({
      tagline: body.tagline || "",
      title: body.title || "",
      badgeText: body.badgeText || "",
      imageUrl: body.imageUrl || "",
      status: body.status || "active",
    });

    return NextResponse.json(
      { success: true, message: "Slider added successfully!", data: slider },
      { status: 201, headers: corsHeaders(req) }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders(req) }
    );
  }
}

// PUT: স্লাইড এডিট
export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Slider id is required." },
        { status: 400, headers: corsHeaders(req) }
      );
    }

    const updated = await HeroSlider.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Slider not found." },
        { status: 404, headers: corsHeaders(req) }
      );
    }

    return NextResponse.json(
      { success: true, message: "Slider updated successfully!", data: updated },
      { headers: corsHeaders(req) }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders(req) }
    );
  }
}

// DELETE: স্লাইড মুছে ফেলা
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Slider id is required." },
        { status: 400, headers: corsHeaders(req) }
      );
    }

    const deleted = await HeroSlider.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Slider not found." },
        { status: 404, headers: corsHeaders(req) }
      );
    }

    return NextResponse.json(
      { success: true, message: "Slider deleted successfully!" },
      { headers: corsHeaders(req) }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders(req) }
    );
  }
}