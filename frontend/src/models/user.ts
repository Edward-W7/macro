import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
}
interface IUserDocument extends IUser, Document {}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  },
  {
    collection: "users",
  });

const User: Model<IUserDocument>  = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;