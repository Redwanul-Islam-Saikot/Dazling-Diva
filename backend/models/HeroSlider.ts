import mongoose, { Schema, Document } from "mongoose";

export interface IHeroSlider extends Document {
  tagline?: string;
  title?: string;
  badgeText?: string;
  imageUrl?: string;
  status: "active" | "inactive";
}

const HeroSliderSchema: Schema = new Schema(
  {
    tagline: { type: String, default: "" },
    title: { type: String, default: "" },
    badgeText: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

// Mongoose Cache Issue এড়াতে এই লাইনটি ব্যবহার করুন:
export default mongoose.models.HeroSlider ||
  mongoose.model<IHeroSlider>("HeroSlider", HeroSliderSchema);