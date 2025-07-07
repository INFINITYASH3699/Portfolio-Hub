const asyncHandler = require("express-async-handler");
const Template = require("../models/Template");
const Portfolio = require("../models/Portfolio");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getTemplates = asyncHandler(async (req, res) => {
  const { category, isPremium, search } = req.query;
  let query = { isActive: true };
  if (category) {
    query.category = category;
  }
  if (isPremium !== undefined) {
    query.isPremium = isPremium === "true";
  }
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }
  const templates = await Template.find(query).sort({ createdAt: -1 });
  res.json(templates);
});

const getTemplateById = asyncHandler(async (req, res) => {
  const template = await Template.findById(req.params.id);
  if (template) {
    res.json(template);
  } else {
    res.status(404);
    throw new Error("Template not found");
  }
});

const getTemplateCategories = asyncHandler(async (req, res) => {
  const categories = await Template.distinct("category");
  res.json(categories);
});

const getTemplatesWithUsage = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error("User not authenticated or user ID missing.");
  }
  const { category, isPremium, search } = req.query;
  let query = { isActive: true };
  if (category) query.category = category;
  if (isPremium !== undefined) query.isPremium = isPremium === "true";
  if (search) query.name = { $regex: search, $options: "i" };
  const templates = await Template.find(query).sort({ createdAt: -1 });
  let userPortfolios = [];
  try {
    userPortfolios = await Portfolio.find({ userId: req.user._id });
  } catch (dbError) {
    console.error("Database error fetching user portfolios:", dbError.message);
    res.status(500);
    throw new Error(
      "Failed to retrieve user portfolios for template usage check."
    );
  }
  const templatesWithUsage = templates.map((template) => {
    const usedPortfolio = userPortfolios.find(
      (p) =>
        p.templateId &&
        template._id &&
        p.templateId.toString() === template._id.toString()
    );
    return {
      ...template.toObject(),
      isUsedByUser: !!usedPortfolio,
      userPortfolioId: usedPortfolio ? usedPortfolio._id : null,
    };
  });
  res.json(templatesWithUsage);
});

const createTemplate = asyncHandler(async (req, res) => {
  const {
    name,
    slug,
    category,
    isPremium,
    price,
    sections,
    customizationOptions,
    tags,
    isActive,
  } = req.body;
  if (!name || !slug || !category || !sections) {
    res.status(400);
    throw new Error(
      "Please provide name, slug, category, and sections for the template"
    );
  }
  const templateExists = await Template.findOne({ $or: [{ name }, { slug }] });
  if (templateExists) {
    res.status(400);
    throw new Error("Template with this name or slug already exists");
  }
  let thumbnailUrl = "";
  let previewImageUrls = [];
  if (req.files) {
    if (req.files.thumbnail && req.files.thumbnail[0]) {
      const thumbResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "portfoliohub/templates/thumbnails",
              quality: "auto:best",
              fetch_format: "auto",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(req.files.thumbnail[0].buffer);
      });
      thumbnailUrl = thumbResult.secure_url;
    }
    if (req.files.previewImages) {
      const previewUploadPromises = req.files.previewImages.map(
        (file) =>
          new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                {
                  folder: "portfoliohub/templates/previews",
                  quality: "auto:good",
                  fetch_format: "auto",
                },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              )
              .end(file.buffer);
          })
      );
      const previewResults = await Promise.all(previewUploadPromises);
      previewImageUrls = previewResults.map((res) => res.secure_url);
    }
  }
  const template = new Template({
    name,
    slug,
    category,
    isPremium,
    price: isPremium ? price || 0 : 0,
    thumbnail: thumbnailUrl,
    previewImages: previewImageUrls,
    sections: JSON.parse(sections),
    customizationOptions: JSON.parse(customizationOptions),
    tags: JSON.parse(tags),
    isActive: isActive ?? true,
    createdBy: req.user._id,
  });
  const createdTemplate = await template.save();
  res.status(201).json(createdTemplate);
});

const updateTemplate = asyncHandler(async (req, res) => {
  const {
    name,
    slug,
    category,
    isPremium,
    price,
    sections,
    customizationOptions,
    tags,
    isActive,
  } = req.body;
  const template = await Template.findById(req.params.id);
  if (template) {
    template.name = name || template.name;
    template.slug = slug || template.slug;
    template.category = category || template.category;
    template.isPremium = isPremium ?? template.isPremium;
    template.price = template.isPremium ? (price ?? template.price) : 0;
    template.sections = JSON.parse(sections);
    template.customizationOptions = JSON.parse(customizationOptions);
    template.tags = JSON.parse(tags);
    template.isActive = isActive ?? template.isActive;

    if (req.files) {
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        const thumbResult = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: "portfoliohub/templates/thumbnails",
                quality: "auto:best",
                fetch_format: "auto",
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            )
            .end(req.files.thumbnail[0].buffer);
        });
        template.thumbnail = thumbResult.secure_url;
      }
      if (req.files.previewImages) {
        const previewUploadPromises = req.files.previewImages.map(
          (file) =>
            new Promise((resolve, reject) => {
              cloudinary.uploader
                .upload_stream(
                  {
                    folder: "portfoliohub/templates/previews",
                    quality: "auto:good",
                    fetch_format: "auto",
                  },
                  (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                  }
                )
                .end(file.buffer);
            })
        );
        const previewResults = await Promise.all(previewUploadPromises);
        template.previewImages = [
          ...template.previewImages,
          ...previewResults.map((res) => res.secure_url),
        ];
      }
    } else if (req.body.thumbnail !== undefined) {
      template.thumbnail = req.body.thumbnail;
    } else if (req.body.previewImages !== undefined) {
      template.previewImages = JSON.parse(req.body.previewImages);
    }
    const updatedTemplate = await template.save();
    res.json(updatedTemplate);
  } else {
    res.status(404);
    throw new Error("Template not found");
  }
});

const deleteTemplate = asyncHandler(async (req, res) => {
  const template = await Template.findById(req.params.id);
  if (template) {
    await Template.deleteOne({ _id: template._id });
    res.json({ message: "Template removed" });
  } else {
    res.status(404);
    throw new Error("Template not found");
  }
});

// @desc    Admin: Get aggregate template statistics
// @route   GET /api/templates/stats
// @access  Private/Admin
const getTemplateStats = asyncHandler(async (req, res) => {
  const totalTemplates = await Template.countDocuments();
  const activeTemplates = await Template.countDocuments({ isActive: true });
  const premiumTemplates = await Template.countDocuments({ isPremium: true });
  const freeTemplates = await Template.countDocuments({ isPremium: false });

  // Aggregate downloads: Sum of 'downloads' field across all templates
  const totalDownloadsResult = await Template.aggregate([
    {
      $group: {
        _id: null,
        totalDownloads: { $sum: "$downloads" },
      },
    },
  ]);
  const totalDownloads =
    totalDownloadsResult.length > 0
      ? totalDownloadsResult[0].totalDownloads
      : 0;

  // Most popular categories (top 3)
  const popularCategories = await Template.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 3 },
  ]);

  res.json({
    totalTemplates,
    activeTemplates,
    premiumTemplates,
    freeTemplates,
    totalDownloads,
    popularCategories,
  });
});

module.exports = {
  getTemplates,
  getTemplateById,
  getTemplateCategories,
  getTemplatesWithUsage,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplateStats,
};
