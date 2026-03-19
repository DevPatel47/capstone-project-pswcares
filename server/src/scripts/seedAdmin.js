import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/user.model.js";

dotenv.config();

const MIN_ADMIN_PASSWORD_LENGTH = 12;

const getArgValue = (name) => {
  const prefix = `--${name}=`;
  const entry = process.argv.find((item) => item.startsWith(prefix));
  return entry ? entry.slice(prefix.length) : "";
};

const requireEnv = (name) => {
  const value = String(process.env[name] || "").trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const run = async () => {
  const providedToken = getArgValue("token");
  const expectedToken = requireEnv("ADMIN_SEED_TOKEN");

  if (!providedToken) {
    throw new Error("Missing --token argument.");
  }

  if (providedToken !== expectedToken) {
    throw new Error("Invalid seed token.");
  }

  const mongoUri = requireEnv("MONGODB_URI");
  const adminName = requireEnv("ADMIN_SEED_NAME");
  const adminEmail = requireEnv("ADMIN_SEED_EMAIL").toLowerCase();
  const adminPassword = requireEnv("ADMIN_SEED_PASSWORD");

  if (adminPassword.length < MIN_ADMIN_PASSWORD_LENGTH) {
    throw new Error(
      `ADMIN_SEED_PASSWORD must be at least ${MIN_ADMIN_PASSWORD_LENGTH} characters.`,
    );
  }

  await mongoose.connect(mongoUri);

  const existingUser = await User.findOne({ email: adminEmail }).select(
    "+password",
  );

  if (existingUser && existingUser.role !== "admin") {
    throw new Error(
      "A non-admin user with ADMIN_SEED_EMAIL already exists. Use a different email.",
    );
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  if (!existingUser) {
    await User.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      status: "active",
    });

    console.log(`Admin account created for ${adminEmail}.`);
  } else {
    existingUser.name = adminName;
    existingUser.password = hashedPassword;
    existingUser.role = "admin";
    existingUser.status = "active";
    await existingUser.save();

    console.log(`Admin account updated for ${adminEmail}.`);
  }

  await mongoose.disconnect();
};

run()
  .then(() => {
    process.exit(0);
  })
  .catch(async (error) => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    console.error(error.message || "Failed to seed admin user.");
    process.exit(1);
  });
