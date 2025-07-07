const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const path = require("path");
const Portfolio = require("../models/Portfolio");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      profilePicture: user.profilePicture,
      bio: user.bio,
      phone: user.phone,
      location: user.location,
      website: user.website,
      socialLinks: user.socialLinks,
      professionalInfo: user.professionalInfo,
      subscription: user.subscription,
      preferences: user.preferences,
      isAdmin: user.isAdmin,
      emailVerified: user.emailVerified,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.fullName = req.body.fullName ?? user.fullName;
    user.bio = req.body.bio ?? user.bio;
    user.phone = req.body.phone ?? user.phone;
    user.location = req.body.location ?? user.location;
    user.website = req.body.website ?? user.website;
    if (req.body.socialLinks) {
      user.socialLinks = { ...user.socialLinks, ...req.body.socialLinks };
    }
    if (req.body.professionalInfo) {
      user.professionalInfo = {
        ...user.professionalInfo,
        ...req.body.professionalInfo,
      };
      if (req.body.professionalInfo.skills)
        user.professionalInfo.skills = req.body.professionalInfo.skills;
      if (req.body.professionalInfo.education)
        user.professionalInfo.education = req.body.professionalInfo.education;
      if (req.body.professionalInfo.certifications)
        user.professionalInfo.certifications =
          req.body.professionalInfo.certifications;
      if (req.body.professionalInfo.languages)
        user.professionalInfo.languages = req.body.professionalInfo.languages;
    }
    if (req.body.preferences) {
      user.preferences = { ...user.preferences, ...req.body.preferences };
    }
    if (req.body.password) {
      user.password = req.body.password;
    }
    if (req.body.profilePicture !== undefined) {
      user.profilePicture = req.body.profilePicture;
    }
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      profilePicture: updatedUser.profilePicture,
      bio: updatedUser.bio,
      phone: updatedUser.phone,
      location: updatedUser.location,
      website: updatedUser.website,
      socialLinks: updatedUser.socialLinks,
      professionalInfo: updatedUser.professionalInfo,
      subscription: updatedUser.subscription,
      preferences: updatedUser.preferences,
      isAdmin: updatedUser.isAdmin,
      emailVerified: updatedUser.emailVerified,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "portfoliohub/avatars",
            width: 150,
            height: 150,
            crop: "fill",
            quality: "auto:eco",
            fetch_format: "auto",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(req.file.buffer);
    });
    const user = await User.findById(req.user._id);
    if (user) {
      user.profilePicture = result.secure_url;
      await user.save();
      res.json({
        message: "Avatar uploaded successfully",
        profilePicture: result.secure_url,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500);
    throw new Error("Failed to upload avatar");
  }
});

const deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    await Portfolio.deleteMany({ userId: user._id });
    await User.deleteOne({ _id: user._id });
    res.cookie("accessToken", "", { httpOnly: true, expires: new Date(0) });
    res.cookie("refreshToken", "", { httpOnly: true, expires: new Date(0) });
    res.json({ message: "User account deleted successfully" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const uploadImages = asyncHandler(async (req, res) => {
  const { category = "general" } = req.body;
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error("No files uploaded");
  }
  try {
    const uploadPromises = req.files.map(async (file) => {
      let uploadOptions = {
        folder: `portfoliohub/users/${req.user._id}/${category}`,
        resource_type: "image",
        quality: "auto",
        fetch_format: "auto",
        width: 1200,
        crop: "limit",
      };
      if (category === "hero") {
        uploadOptions = {
          ...uploadOptions,
          width: 1920,
          height: 1080,
          crop: "fill",
        };
      } else if (category === "projects" || category === "gallery") {
        uploadOptions = {
          ...uploadOptions,
          width: 800,
          height: 600,
          crop: "limit",
        };
      }
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(uploadOptions, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(file.buffer);
      });
      return {
        originalName: file.originalname,
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        size: result.bytes,
        format: result.format,
      };
    });
    const uploadedImages = await Promise.all(uploadPromises);
    res.json({
      message: "Images uploaded successfully",
      images: uploadedImages,
      category: category,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500);
    throw new Error("Failed to upload images");
  }
});

const deleteImage = asyncHandler(async (req, res) => {
  const { publicId } = req.params;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result === "ok") {
      res.json({ message: "Image deleted successfully" });
    } else {
      res.status(400);
      throw new Error("Failed to delete image (Cloudinary error)");
    }
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    res.status(500);
    throw new Error("Failed to delete image");
  }
});

// @desc    Get user's uploaded images with pagination (from general assets)
// @route   GET /api/user/images
// @access  Private
const getUserImages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category } = req.query;
  
  let folderCategory = '';
  if (category && typeof category === 'string' && category.match(/^[a-zA-Z0-9_-]{1,50}$/)) { 
    folderCategory = category;
  } else if (category) {
    console.warn(`[getUserImages] Invalid category parameter received: '${category}'. Cloudinary search might fail.`);
  }

  try {
    let searchExpression = `folder:portfoliohub/users/${req.user._id}`;
    
    if (folderCategory) {
      searchExpression += `/${folderCategory}`;
    } else {
      // Search all user's subfolders by explicitly targeting the base folder and then wildcard.
      // The `folder:parent_folder/*` expression is generally more reliable than just `folder:parent_folder`
      // when you expect content in subfolders as well.
      searchExpression = `folder:${searchExpression}/*`; 
    }

    console.log(`[getUserImages] Cloudinary search expression: '${searchExpression}'`);
    
    let result = { resources: [], next_cursor: null, total_count: 0 }; // Initialize result to empty

    try {
      result = await cloudinary.search
        .expression(searchExpression)
        .sort_by([['created_at', 'desc']])
        .max_results(parseInt(limit))
        .next_cursor(req.query.next_cursor || null)
        .execute();
    } catch (cloudinaryErr) {
      const errorMsg = cloudinaryErr.message || (cloudinaryErr.error && cloudinaryErr.error.message) || 'Unknown Cloudinary error'; // Better error message extraction
      const httpCode = cloudinaryErr.http_code || (cloudinaryErr.error && cloudinaryErr.error.http_code) || 500;
      console.error(`[getUserImages] Cloudinary API search failed for expression '${searchExpression}' (HTTP ${httpCode}): ${errorMsg}`, cloudinaryErr);
      
      // *** THE CRITICAL PART OF THE FIX FOR EMPTY LIBRARY DISPLAY ***
      // Instead of throwing a 500, if it's a search error (especially 400/500), assume no images and return empty.
      // This allows the frontend Media Library to open, showing "No images in library".
      // Only re-throw a critical error if it's not a "no results" type of failure.
      if (httpCode === 400 || httpCode === 404 || (httpCode === 500 && (errorMsg.includes('General Error') || errorMsg.includes('search syntax')))) {
          console.warn(`[getUserImages] Cloudinary search returned an expected error for empty/non-existent folder or invalid syntax. Returning empty array gracefully.`);
          return res.json({ images: [], nextCursor: null, totalCount: 0 }); 
      }
      // For any other unexpected/critical errors, re-throw a 500
      res.status(httpCode);
      throw new Error(`Failed to query image library: ${errorMsg}`);
    }

    res.json({
      images: result.resources.map(image => ({
        publicId: image.public_id,
        url: image.secure_url,
        width: image.width,
        height: image.height,
        size: image.bytes,
        format: image.format,
        createdAt: image.created_at,
        metadata: image.context ? image.context.custom : {}
      })),
      nextCursor: result.next_cursor,
      totalCount: result.total_count
    });

  } catch (error) {
    console.error(`[getUserImages] Unhandled error in getUserImages: ${error.message}`, error);
    if (!res.headersSent) {
      res.status(500);
    }
    throw error;
  }
});


const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password").sort({ createdAt: -1 });
  res.json(users);
});

const updateUserById = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;
  const {
    username,
    email,
    fullName,
    isAdmin,
    isActive,
    subscription,
    professionalInfo,
    profilePicture,
  } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (username !== undefined) user.username = username;
  if (email !== undefined) user.email = email;
  if (fullName !== undefined) user.fullName = fullName;
  if (isAdmin !== undefined) user.isAdmin = isAdmin;
  if (isActive !== undefined) user.isActive = isActive;
  if (profilePicture !== undefined) user.profilePicture = profilePicture;

  if (subscription && typeof subscription === "object") {
    user.subscription = { ...user.subscription, ...subscription };
  }

  if (professionalInfo && typeof professionalInfo === "object") {
    user.professionalInfo = { ...user.professionalInfo, ...professionalInfo };
    if (professionalInfo.skills !== undefined)
      user.professionalInfo.skills = professionalInfo.skills;
    if (professionalInfo.education !== undefined)
      user.professionalInfo.education = professionalInfo.education;
    if (professionalInfo.certifications !== undefined)
      user.professionalInfo.certifications = professionalInfo.certifications;
    if (professionalInfo.languages !== undefined)
      user.professionalInfo.languages = professionalInfo.languages;
  }

  const updatedUser = await user.save();
  res.json({
    _id: updatedUser._id,
    username: updatedUser.username,
    email: updatedUser.email,
    fullName: updatedUser.fullName,
    profilePicture: updatedUser.profilePicture,
    isAdmin: updatedUser.isAdmin,
    isActive: updatedUser.isActive,
    subscription: updatedUser.subscription,
    professionalInfo: updatedUser.professionalInfo,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
  });
});

const deleteUserById = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;

  if (req.user._id.toString() === userId) {
    res.status(403);
    throw new Error("Admins cannot delete their own account via this route.");
  }
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  await Portfolio.deleteMany({ userId: user._id });
  await User.deleteOne({ _id: user._id });
  res.json({ message: "User and associated data deleted successfully" });
});

const getUserStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalAdmins = await User.countDocuments({ isAdmin: true });
  const totalFreeUsers = await User.countDocuments({
    "subscription.plan": "free",
  });
  const totalPremiumUsers = await User.countDocuments({
    "subscription.plan": "premium",
  });
  const activeUsers = await User.countDocuments({ isActive: true });

  res.json({
    totalUsers,
    totalAdmins,
    totalFreeUsers,
    totalPremiumUsers,
    activeUsers,
  });
});

// @desc    Get user's own subscription status
// @route   GET /api/user/subscription
// @access  Private
const getUserSubscriptionStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("subscription");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user.subscription);
});

// @desc    Update user's subscription (mock/simplified)
// @route   PUT /api/user/subscription
// @access  Private
const updateUserSubscription = asyncHandler(async (req, res) => {
  const { plan, status, expiresAt, stripeCustomerId, stripeSubscriptionId } =
    req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Only allow updating specific subscription fields directly.
  // In a real app, plan/status updates would mostly come from Stripe webhooks.
  if (plan) user.subscription.plan = plan;
  if (status) user.subscription.status = status;
  if (expiresAt) user.subscription.expiresAt = expiresAt;
  if (stripeCustomerId) user.subscription.stripeCustomerId = stripeCustomerId;
  if (stripeSubscriptionId)
    user.subscription.stripeSubscriptionId = stripeSubscriptionId;

  const updatedUser = await user.save();

  res.json({
    message: "Subscription updated successfully",
    subscription: updatedUser.subscription,
  });
});

module.exports = {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  deleteAccount,
  uploadImages,
  deleteImage,
  getUserImages,
  upload,
  getAllUsers,
  updateUserById,
  deleteUserById,
  getUserStats,
  getUserSubscriptionStatus,
  updateUserSubscription,
};
