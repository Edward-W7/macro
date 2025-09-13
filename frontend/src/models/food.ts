import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFood extends Document {
  dish_name: string;
  restaurant: string;
  location: string;
  calories: number;
  proteinType: string;
  macros: {
    protein: number;
    carbohydrates: number;
    fat: number;
  };
  meal_type: string[];
  blacklisted: boolean;
  money: number;
}

interface IFoodDocument extends IFood, Document {}

const FoodSchema = new Schema<IFood>({
  dish_name: { type: String, required: true },
  restaurant: { type: String, required: true },
  location: { type: String, required: true },
  calories: { type: Number, required: true },
  proteinType: {type: String, required: true},
  macros: {
    protein: { type: Number, required: true },
    carbohydrates: { type: Number, required: true },
    fat: { type: Number, required: true },
  },
  meal_type: [{ type: String, required: true }],
  blacklisted: {type: Boolean, required: true},
  money: {type: Number, required: true},
},{
    collection: "dishes",
  });

const Food: Model<IFoodDocument> = mongoose.models.Food || mongoose.model<IFoodDocument>('Food', FoodSchema);
export default Food;
