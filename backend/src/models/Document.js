const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    author: { type: String, required: true, trim: true, index: true },
    keywords: [{ type: String, trim: true, lowercase: true }],
    abstract: { type: String, trim: true, default: "" },
    year: { type: Number, required: true, index: true },
    type: { type: String, required: true, trim: true, index: true },
    publishedAt: { type: Date }
  },
  { timestamps: true }
);

documentSchema.index({ title: "text", author: "text", keywords: "text", abstract: "text" });

module.exports = mongoose.model("Document", documentSchema);
