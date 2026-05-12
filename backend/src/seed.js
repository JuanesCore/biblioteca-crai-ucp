require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");
const Document = require("./models/Document");

const users = [
  { name: "Admin User", email: "admin@ucp.edu", password: "Admin123!", role: "admin" },
  { name: "Teacher User", email: "teacher@ucp.edu", password: "Teacher123!", role: "teacher" },
  { name: "Student User", email: "student@ucp.edu", password: "Student123!", role: "student" }
];

const documents = [
  {
    title: "Machine Learning for Academic Libraries",
    author: "Ana Perez",
    keywords: ["machine learning", "library", "research"],
    abstract: "A study about ML adoption in digital repositories.",
    year: 2024,
    type: "research article",
    publishedAt: new Date("2024-04-10")
  },
  {
    title: "Climate Change and Urban Development",
    author: "Carlos Diaz",
    keywords: ["climate", "urban", "sustainability"],
    abstract: "Correlation between urban planning and climate resilience.",
    year: 2023,
    type: "thesis",
    publishedAt: new Date("2023-08-15")
  }
];

const seed = async () => {
  await connectDB();
  await User.deleteMany({});
  await Document.deleteMany({});

  const createdDocuments = await Document.insertMany(documents);

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await User.create({ ...user, passwordHash, favorites: [createdDocuments[0]._id] });
  }

  console.log("Seed completed.");
  process.exit(0);
};

seed().catch((error) => {
  console.error("Seed failed", error);
  process.exit(1);
});
