import asyncHandler from 'express-async-handler';
import Contact from '../models/contactModel.js';

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

const validateImage = (base64String) => {
  if (!base64String) return true; // Allow empty photo

  // Check if it's a valid base64 image string
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid image format');
  }

  // Validate mime type
  const mimeType = matches[1];
  if (!ALLOWED_FORMATS.includes(mimeType)) {
    throw new Error('Unsupported image format. Please use JPEG, PNG, or WebP');
  }

  // Check file size
  const base64Data = matches[2];
  const fileSize = (base64Data.length * 3) / 4;
  if (fileSize > MAX_FILE_SIZE) {
    throw new Error('Image size must be less than 1MB');
  }

  return true;
};

export const getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({ user_id: req.user.id });
  res.status(200).json({ contacts });
});

export const getContact = asyncHandler(async (req, res) => {
  const contacts = await Contact.findOne({ _id: req.params.id, user_id: req.user.id });
  if (!contacts) {
    res.status(404);
    throw new Error("Contact Not Found");   
  }
  res.status(200).json(contacts);
});

export const createContact = asyncHandler(async (req, res) => {
  console.log("Processing contact creation request");
  const { name, email, phone, photo, customFields } = req.body;
  
  if (!name || !email || !phone) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  }

  try {
    // Validate image if provided
    validateImage(photo);

    const contactExists = await Contact.findOne({ email, user_id: req.user.id });
    if (contactExists) {
      res.status(403);
      throw new Error("Contact Already Exists");
    }

    const contact = await Contact.create({ 
      name, 
      email, 
      phone, 
      photo, 
      customFields, 
      user_id: req.user.id 
    });

    console.log("Contact created successfully");
    res.status(201).json(contact);
  } catch (error) {
    console.error("Contact creation error:", error);
    res.status(400);
    throw error;
  }
});

export const updateContact = asyncHandler(async (req, res) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!contact) {
      res.status(404);
      throw new Error("Contact Not Found");
    }

    if (contact.user_id.toString() !== req.user.id) {
      res.status(403);
      throw new Error("No User Found with this user!");
    }

    // Validate image if provided
    validateImage(req.body.photo);

    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    console.log("Contact updated successfully");
    res.status(200).json(updatedContact);
  } catch (error) {
    console.error("Contact update error:", error);
    res.status(400);
    throw error;
  }
});

export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOne({ _id: req.params.id, user_id: req.user.id });
  if (!contact) {
    res.status(404);
    throw new Error("Contact Not Found with this user!");
  }
  await Contact.deleteOne({ _id: req.params.id, user_id: req.user.id });
  res.status(200).json({ message: `Delete contacts for ${req.params.id}` });
});