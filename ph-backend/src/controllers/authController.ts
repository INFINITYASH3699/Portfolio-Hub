// src/controllers/authController.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import User, { IUser } from "../models/User";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  CloudinaryUploadResult
} from "../config/cloudinary";

// Generate JWT token
const generateToken = (id: string): string => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "your-jwt-secret-key-change-me",
    {
      expiresIn: "7d",
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { fullName, username, email, password } = req.body;

    if (!fullName || !username || !email || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide all required fields",
        });
    }

    const userExists = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    });

    if (userExists) {
      if (userExists.email === email.toLowerCase()) {
        return res
          .status(400)
          .json({ success: false, message: "Email is already in use" });
      }
      if (userExists.username === username.toLowerCase()) {
        return res
          .status(400)
          .json({ success: false, message: "Username is already taken" });
      }
    }

    const newUser = await User.create({
      fullName,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
    });

    const token = generateToken((newUser._id as string).toString());

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        profilePicture: newUser.profilePicture,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }

    const user = (await User.findOne({
      email: email.toLowerCase(),
    })) as IUser | null;

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken((user._id as string).toString());

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Get current user error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const {
      fullName,
      profilePicture,
      title,
      bio,
      location,
      website,
      socialLinks
    } = req.body;

    // Update the basic fields if provided
    if (fullName) user.fullName = fullName;

    // Handle profile picture update
    if (profilePicture && profilePicture !== user.profilePicture) {
      // If user already has a profile picture in Cloudinary, delete it
      if (user.profilePictureId) {
        await deleteFromCloudinary(user.profilePictureId);
      }

      // If a new profilePicture URL is provided, update it
      user.profilePicture = profilePicture;

      // If profilePictureId is provided in the request, update it too
      if (req.body.profilePictureId) {
        user.profilePictureId = req.body.profilePictureId;
      }
    }

    // Check if we need to update additional profile fields
    // We'll need to extend the user model to include these fields
    if (user.profile === undefined) {
      user.profile = {};
    }

    if (title) user.profile.title = title;
    if (bio) user.profile.bio = bio;
    if (location) user.profile.location = location;
    if (website) user.profile.website = website;
    if (socialLinks) user.profile.socialLinks = socialLinks;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        profilePictureId: user.profilePictureId,
        profile: user.profile,
      },
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during profile update",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Upload profile picture
// @route   POST /api/auth/profile/upload-image
// @access  Private
export const uploadProfilePicture = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get file path
    const filePath = req.file.path;

    // Upload to Cloudinary
    const cloudinaryResult: CloudinaryUploadResult = await uploadToCloudinary(
      filePath,
      'portfolio-hub/profile-pictures',
      user.profilePictureId || undefined // Use existing ID for overwrite if available
    );

    // Delete local file after upload
    fs.unlinkSync(filePath);

    if (!cloudinaryResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image to cloud storage',
        error: cloudinaryResult.error
      });
    }

    // If user already had a profile picture and we're not overwriting it
    if (user.profilePictureId &&
        user.profilePictureId !== cloudinaryResult.publicId) {
      // Delete the old image from Cloudinary
      await deleteFromCloudinary(user.profilePictureId);
    }

    // Update user with new profile picture
    user.profilePicture = cloudinaryResult.url;
    user.profilePictureId = cloudinaryResult.publicId;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      imageUrl: cloudinaryResult.url,
      publicId: cloudinaryResult.publicId
    });
  } catch (error: any) {
    console.error('Profile picture upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during profile picture upload',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete profile picture
// @route   DELETE /api/auth/profile/delete-image
// @access  Private
export const deleteProfilePicture = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has a profile picture
    if (!user.profilePictureId) {
      return res.status(400).json({
        success: false,
        message: 'No profile picture to delete'
      });
    }

    // Delete from Cloudinary
    const deleteResult = await deleteFromCloudinary(user.profilePictureId);

    if (!deleteResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete image from cloud storage',
        error: deleteResult.error
      });
    }

    // Update user
    user.profilePicture = '';
    user.profilePictureId = '';
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile picture deleted successfully'
    });
  } catch (error: any) {
    console.error('Profile picture deletion error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during profile picture deletion',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
