const asyncHandler = require("express-async-handler");
const Portfolio = require("../models/Portfolio");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getImageTransformation = (section) => {
  const transformations = {
    hero: [{ width: 1920, height: 1080, crop: "fill", quality: "auto:good" }],
    projects: [{ width: 600, height: 400, crop: "fill", quality: "auto:good" }],
    testimonials: [
      {
        width: 100,
        height: 100,
        crop: "fill",
        gravity: "face",
        radius: "max",
        quality: "auto:eco",
      },
    ],
    services: [{ width: 200, height: 200, crop: "pad", quality: "auto:eco" }],
    blog: [{ width: 800, height: 450, crop: "fill", quality: "auto:good" }],
    awards: [{ width: 200, height: 200, crop: "limit", quality: "auto:eco" }],
    clients: [{ width: 200, height: 150, crop: "limit", quality: "auto:eco" }],
    "profile-avatar": [
      { width: 150, height: 150, crop: "fill", quality: "auto:eco" },
    ], // From ProfilePage
    "template-thumbnail": [
      { width: 400, height: 225, crop: "fill", quality: "auto:good" },
    ], // From AdminTemplateForm
    "template-preview": [
      { width: 800, height: 450, crop: "limit", quality: "auto:good" },
    ], // From AdminTemplateForm
    // Add other specific mappings here for sections that might upload images
    about: [{ width: 500, height: 500, crop: "fill", quality: "auto:good" }], // For about.image
  };
  return (
    transformations[section] || [
      { width: 1200, crop: "limit", quality: "auto" },
    ]
  );
};

const uploadSectionImages = asyncHandler(async (req, res) => {
  // `section` will now be the dataKey (e.g., 'projects', 'hero', 'testimonials')
  const { section, imageKey } = req.body;
  const itemIndex =
    req.body.itemIndex !== undefined ? parseInt(req.body.itemIndex) : undefined;

  const portfolioId = req.params.id;

  const portfolio = await Portfolio.findOne({
    _id: portfolioId,
    userId: req.user._id,
  });

  if (!portfolio) {
    res.status(404);
    throw new Error("Portfolio not found or unauthorized access");
  }

  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error("No files uploaded");
  }

  try {
    const uploadedResults = await Promise.all(
      req.files.map(async (file) => {
        const uploadOptions = {
          // Use the 'section' (dataKey) directly as the folder name
          folder: `portfoliohub/portfolios/${req.user._id}/${portfolioId}/${section}`,
          resource_type: "image",
          quality: "auto",
          fetch_format: "auto",
          transformation: getImageTransformation(section),
        };
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(uploadOptions, (error, result) => {
              if (error) reject(error);
              else resolve(result);
            })
            .end(file.buffer);
        });
        return {
          id: result.public_id.split("/").pop().split(".")[0],
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          alt: file.originalname.split(".")[0],
          caption: "",
          title: file.originalname.split(".")[0],
        };
      })
    );

    const uploadedImageUrl = uploadedResults[0].url;

    // Ensure the customData field for the section is initialized
    // This check is important as Mongoose requires the path to exist for `markModified`
    if (!portfolio.customData[section]) {
      // Initialize as array if itemIndex is provided, otherwise as object
      portfolio.customData[section] =
        itemIndex !== undefined && itemIndex !== null ? [] : {};
    }

    if (itemIndex !== undefined && itemIndex !== null) {
      // Path for array-based sections (projects, testimonials, blog, awards, clients, education, experience)
      const targetArray = portfolio.customData[section];

      if (!Array.isArray(targetArray)) {
        console.error(
          `[uploadSectionImages] customData.${section} is not an array, but itemIndex was provided. It's:`,
          typeof targetArray
        );
        res.status(400);
        throw new Error(
          `Section '${section}' data in customData is not an array. Cannot use itemIndex.`
        );
      }

      // Ensure the item at the given index exists before updating its property
      if (targetArray[itemIndex]) {
        if (imageKey) {
          targetArray[itemIndex][imageKey] = uploadedImageUrl;
          console.log(
            `[uploadSectionImages] Updated array item image: customData.${section}[${itemIndex}].${imageKey} to ${uploadedImageUrl}`
          );
        } else {
          targetArray[itemIndex].image = uploadedImageUrl; // Default image key
          console.warn(
            `[uploadSectionImages] No imageKey provided for array item in ${section}. Defaulted to 'image'.`
          );
        }
      } else {
        console.error(
          `[uploadSectionImages] Item at index ${itemIndex} not found in customData.${section} array. Current array length: ${targetArray.length}`
        );
        res.status(400);
        throw new Error(
          `Cannot attach image. Item at index ${itemIndex} not found in ${section} array.`
        );
      }
    } else if (imageKey) {
      // Path for single image fields within a section object (e.g., hero.profileImage, about.image)
      if (
        typeof portfolio.customData[section] === "object" &&
        portfolio.customData[section] !== null
      ) {
        portfolio.customData[section][imageKey] = uploadedImageUrl;
        console.log(
          `[uploadSectionImages] Updated single image: customData.${section}.${imageKey} to ${uploadedImageUrl}`
        );
      } else {
        console.error(
          `[uploadSectionImages] customData.${section} is not an object, but imageKey was provided. It's:`,
          typeof portfolio.customData[section]
        );
        res.status(400);
        throw new Error(
          `Section '${section}' data is not an object. Cannot use imageKey.`
        );
      }
    } else {
      // Fallback: If neither itemIndex nor imageKey is provided
      console.warn(
        `[uploadSectionImages] Unhandled image update case for section: ${section}. Missing imageKey/itemIndex.`
      );
      res.status(400);
      throw new Error(
        `Unsupported image attachment for section: ${section}. Missing imageKey/itemIndex.`
      );
    }

    portfolio.markModified("customData");
    await portfolio.save();

    res.json({
      message: "Image uploaded successfully",
      uploadedUrl: uploadedImageUrl,
      imageDetails: uploadedResults[0],
      section: section, // Confirm section (dataKey) passed back
      imageKey: imageKey, // Confirm imageKey passed back
      itemIndex: itemIndex, // Confirm itemIndex passed back
    });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(error.http_code || 500);
    throw new Error(error.message || "Failed to upload images");
  }
});

const updateImageDetails = asyncHandler(async (req, res) => {
  const { section, imageKey, itemIndex, value } = req.body;
  const portfolioId = req.params.id;

  const portfolio = await Portfolio.findOne({
    _id: portfolioId,
    userId: req.user._id,
  });

  if (!portfolio) {
    res.status(404);
    throw new Error("Portfolio not found");
  }

  let targetField = null;

  if (itemIndex !== undefined && itemIndex !== null) {
    const targetArray = portfolio.customData[section];
    if (Array.isArray(targetArray) && targetArray[itemIndex]) {
      targetField = targetArray[itemIndex];
    }
  } else {
    targetField = portfolio.customData[section];
  }

  if (targetField && imageKey) {
    targetField[imageKey] = value;
  } else {
    res.status(404);
    throw new Error("Image target or key not found in section data");
  }

  portfolio.markModified("customData");
  await portfolio.save();

  res.json({
    message: "Image details updated successfully",
    data: targetField,
  });
});

const deletePortfolioImage = asyncHandler(async (req, res) => {
  const { publicId } = req.params;
  const { section, imageKey, itemIndex } = req.body;
  const portfolioId = req.params.id;

  const portfolio = await Portfolio.findOne({
    _id: portfolioId,
    userId: req.user._id,
  });

  if (!portfolio) {
    res.status(404);
    throw new Error("Portfolio not found");
  }

  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`[ImageDelete] Cloudinary deleted publicId: ${publicId}`);

    const sectionData = portfolio.customData[section];

    if (itemIndex !== undefined && itemIndex !== null) {
      const targetArray = sectionData;
      if (Array.isArray(targetArray) && targetArray[itemIndex]) {
        if (imageKey) {
          targetArray[itemIndex][imageKey] = "";
          console.log(
            `[ImageDelete] Cleared image from array item: ${section}[${itemIndex}].${imageKey}`
          );
        } else {
          targetArray[itemIndex].image = "";
          console.warn(
            `[ImageDelete] No imageKey provided for array item in ${section}. Defaulted to 'image'.`
          );
        }
      }
    } else if (imageKey) {
      if (
        sectionData &&
        typeof sectionData === "object" &&
        sectionData[imageKey] !== undefined
      ) {
        sectionData[imageKey] = "";
        console.log(
          `[ImageDelete] Cleared image from single field: ${section}.${imageKey}`
        );
      }
    } else {
      if (
        sectionData &&
        typeof sectionData === "string" &&
        sectionData === `https://res.cloudinary.com/${publicId}`
      ) {
        portfolio.customData[section] = "";
        console.log(
          `[ImageDelete] Cleared direct image URL from section: ${section}`
        );
      } else {
        console.warn(
          `[ImageDelete] Unhandled scenario for image deletion in section: ${section}.`
        );
      }
    }

    portfolio.markModified("customData");
    await portfolio.save();

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Image deletion error:", error);
    res.status(500);
    throw new Error(error.message || "Failed to delete image");
  }
});

module.exports = {
  uploadSectionImages,
  updateImageDetails,
  deletePortfolioImage,
};
