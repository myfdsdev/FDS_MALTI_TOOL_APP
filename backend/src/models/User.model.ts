import mongoose, { Schema, type Document, type Model } from "mongoose";
import bcrypt from "bcryptjs";

export type AuthProvider = "local" | "google";
export type UserPlan = "free" | "pro" | "team";
export type UserRole = "user" | "admin";

export interface UserDocument extends Document {
  email: string;
  name: string;
  password?: string;
  googleId?: string;
  avatar?: string;
  provider: AuthProvider;
  role: UserRole;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  plan: UserPlan;
  usage: {
    today: { date: string; count: number };
    month: { yearMonth: string; count: number };
    total: number;
  };
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidate: string): Promise<boolean>;
  toPublicJSON(): Record<string, unknown>;
}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    password: { type: String, select: false, minlength: 8 },
    googleId: { type: String, index: true, sparse: true },
    avatar: String,
    provider: { type: String, enum: ["local", "google"], required: true, default: "local" },
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    plan: { type: String, enum: ["free", "pro", "team"], default: "free", index: true },
    usage: {
      today: {
        date: { type: String, default: "" },
        count: { type: Number, default: 0 },
      },
      month: {
        yearMonth: { type: String, default: "" },
        count: { type: Number, default: 0 },
      },
      total: { type: Number, default: 0 },
    },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id.toString(),
    email: this.email,
    name: this.name,
    avatar: this.avatar,
    provider: this.provider,
    role: this.role,
    emailVerified: this.emailVerified,
    plan: this.plan,
    usage: this.usage,
    createdAt: this.createdAt,
  };
};

export const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", userSchema);
