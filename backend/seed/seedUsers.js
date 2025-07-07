const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const User = require("../models/User");
const connectDB = require("../config/db");
const bcrypt = require("bcryptjs"); // Needed to hash passwords if not using pre-save hook

connectDB();

const seedUsers = async () => {
  try {
    console.log("Clearing existing users...");
    await User.deleteMany({});
    console.log("Existing users cleared.");

    const salt = await bcrypt.genSalt(10); // Generate salt once for hashing

    const users = [
      {
        username: "adminuser",
        email: "admin@example.com",
        password: await bcrypt.hash("admin123", salt), // Hash password manually
        fullName: "Admin Guy",
        profilePicture: "",
        isAdmin: true,
        subscription: {
          plan: "premium",
          status: "active",
          expiresAt: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ), // 1 year from now
        },
        emailVerified: true,
      },
      {
        username: "freeuser",
        email: "free@example.com",
        password: await bcrypt.hash("password123", salt), // Hash password manually
        fullName: "Free User",
        profilePicture: "",
        isAdmin: false,
        subscription: {
          plan: "free",
          status: "active",
          expiresAt: null,
        },
        professionalInfo: {
          title: "Aspiring Developer",
          skills: ["JavaScript", "HTML", "CSS"],
        },
        bio: "A passionate individual looking to showcase my work!",
        emailVerified: true,
      },
      {
        username: "premiumuser",
        email: "premium@example.com",
        password: await bcrypt.hash("premium123", salt), // Hash password manually
        fullName: "Premium Subscriber",
        profilePicture:
          "https://xsgames.co/randomusers/assets/avatars/female/4.jpg", // Sample profile picture
        isAdmin: false,
        subscription: {
          plan: "premium",
          status: "active",
          expiresAt: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ), // 1 year from now
        },
        professionalInfo: {
          title: "Senior UI/UX Designer",
          company: "Creative Solutions Inc.",
          experience:
            "5+ years in UI/UX design, specializing in mobile and web applications.",
          skills: [
            "Figma",
            "Sketch",
            "Adobe XD",
            "User Research",
            "Prototyping",
          ],
          education: [
            {
              degree: "M.Sc. in Human-Computer Interaction",
              institution: "University of Design",
              startDate: new Date("2015-09-01"),
              endDate: new Date("2017-06-30"),
            },
          ],
        },
        bio: "Crafting intuitive and beautiful user experiences.",
        socialLinks: {
          linkedin: "https://linkedin.com/in/premiumuser",
          twitter: "https://twitter.com/premiumuser",
        },
        emailVerified: true,
      },
    ];

    await User.insertMany(users);
    console.log("✅ Users seeded successfully!");
    console.log("📋 Created:");
    console.log("   - adminuser (admin@example.com, Pass: admin123)");
    console.log("   - freeuser (free@example.com, Pass: password123)");
    console.log("   - premiumuser (premium@example.com, Pass: premium123)");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    process.exit(1);
  }
};

seedUsers();
