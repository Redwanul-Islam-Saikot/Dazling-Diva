import mongoose, { Schema, Document } from "mongoose";

export interface IPromoCard extends Document {
  imageSrc: string;
  category: string;
  title: string;
  buttonText: string;
  isLarge: boolean;
  createdAt: Date;
}

const PromoCardSchema: Schema = new Schema(
  {
    imageSrc: { type: String, required: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    buttonText: { type: String, required: true, default: "Discover More" },
    isLarge: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.PromoCard ||
  mongoose.model<IPromoCard>("PromoCard", PromoCardSchema);