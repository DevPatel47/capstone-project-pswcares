import { Router } from "express";
import Contact from "../models/contact.model.js";

const router = Router();

// Public — anyone can submit a contact form
router.post("/", async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const contact = await Contact.create({ name, email, subject, message });

    res.status(201).json({ message: "Message received. We'll get back to you soon.", id: contact._id });
  } catch (err) {
    next(err);
  }
});

export default router;
