const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Optional for Google-authenticated users. Local auth users still store this hash.
    passwordHash: { type: String, default: null },
    role: { type: String, enum: ["admin", "teacher", "student", "guest"], required: true },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
