const asyncHandler = require("express-async-handler");
const Portfolio = require("../models/Portfolio");
const Template = require("../models/Template");
const User = require("../models/User");

// @desc    Get user's portfolios
// @route   GET /api/portfolios (deprecated, use /api/portfolios/my-portfolios)
// @access  Private
// Keeping this for backward compatibility if any old route still points here,
// but encouraging use of getMyPortfolios for better clarity.
const getUserPortfolios = asyncHandler(async (req, res) => {
  const portfolios = await Portfolio.find({ userId: req.user._id }).populate(
    "templateId",
    "name thumbnail"
  );
  res.json(portfolios);
});

// @desc    Create a new portfolio (generic, not from template directly)
// @route   POST /api/portfolios
// @access  Private
// This is a generic create. createPortfolioFromTemplate is preferred.
const createPortfolio = asyncHandler(async (req, res) => {
  const {
    templateId,
    title,
    customData,
    customStyling,
    seoSettings,
    settings,
  } = req.body;

  if (!templateId || !title) {
    res.status(400);
    throw new Error("Please provide templateId and title for the portfolio");
  }

  const template = await Template.findById(templateId);
  if (!template) {
    res.status(404);
    throw new Error("Selected template not found");
  }

  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-*|-*$/g, "");
  let slugExists = await Portfolio.findOne({
    userId: req.user._id,
    slug: slug,
  });
  let counter = 1;
  while (slugExists) {
    slug = `${title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-*|-*$/g, "")}-${counter}`;
    slugExists = await Portfolio.findOne({ userId: req.user._id, slug: slug });
    counter++;
  }

  const portfolio = new Portfolio({
    userId: req.user._id,
    templateId,
    title,
    slug,
    customData: customData || {},
    customStyling: customStyling || {},
    seoSettings: seoSettings || {},
    settings: settings || {},
    activeSections: template.sections.map((s) => s.id), // Default all template sections active
  });

  const createdPortfolio = await portfolio.save();
  res.status(201).json(createdPortfolio);
});

// @desc    Get single portfolio by ID
// @route   GET /api/portfolios/:id
// @access  Private (user's own portfolio or admin accessing)
const getPortfolioById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let query = { _id: id };
  if (!req.user.isAdmin) {
    query.userId = req.user._id; // Only restrict by userId if not an admin
  }

  // CRITICAL FIX: Add 'sections' to the fields populated from Template
  const portfolio = await Portfolio.findOne(query).populate(
    "templateId userId", // Populate both templateId and userId
    "name thumbnail username sections" // <<<--- ADD 'sections' HERE
  );

  if (portfolio) {
    res.json(portfolio);
  } else {
    res.status(404);
    throw new Error("Portfolio not found or unauthorized access");
  }
});


// @desc    Get public portfolio by slug (for unauthenticated viewing)
// @route   GET /api/portfolios/public/:username/:slug
// @access  Public
const getPublicPortfolioBySlug = asyncHandler(async (req, res) => {
  const { username, slug } = req.params;

  console.log(`[PublicPortfolio] Attempting to fetch for username: '${username}', slug: '${slug}'`); // NEW LOG

  const user = await User.findOne({ username });
  if (!user) {
    console.warn(`[PublicPortfolio] User not found for username: '${username}'`); // NEW LOG
    res.status(404);
    throw new Error('User not found');
  }

  console.log(`[PublicPortfolio] Found user ID: '${user._id}' for username: '${username}'`); // NEW LOG

  // CRITICAL QUERY: portfolio.findOne
  const queryCriteria = {
    userId: user._id,
    slug: slug,
    'settings.isPublished': true
  };
  console.log(`[PublicPortfolio] Querying for portfolio with criteria: ${JSON.stringify(queryCriteria)}`); // NEW LOG

  const portfolio = await Portfolio.findOne(queryCriteria).populate('templateId');

  if (portfolio) {
    console.log(`[PublicPortfolio] Portfolio found: '${portfolio.title}' (ID: ${portfolio._id})`); // NEW LOG
    // Increment view count and update last viewed date
    portfolio.stats.views = (portfolio.stats.views || 0) + 1;
    portfolio.stats.lastViewed = new Date();
    await portfolio.save();

    res.json(portfolio);
  } else {
    console.warn(`[PublicPortfolio] Portfolio NOT found for user ID: '${user._id}', slug: '${slug}', and published status.`); // NEW LOG
    res.status(404);
    throw new Error('Public portfolio not found or not published');
  }
});


// @desc    Update a portfolio
// @route   PUT /api/portfolios/:id (deprecated, use /api/portfolios/:id/customize)
// @access  Private
// Keeping this for backward compatibility
const updatePortfolio = asyncHandler(async (req, res) => {
  const { title, customData, customStyling, seoSettings, settings } = req.body;

  const portfolio = await Portfolio.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (portfolio) {
    portfolio.title = title || portfolio.title;
    portfolio.customData = customData || portfolio.customData;
    portfolio.customStyling = customStyling || portfolio.customStyling;
    portfolio.seoSettings = seoSettings || portfolio.seoSettings;
    portfolio.settings = settings || portfolio.settings; // Includes isPublished, customDomain, password, analytics

    const updatedPortfolio = await portfolio.save();
    res.json(updatedPortfolio);
  } else {
    res.status(404);
    throw new Error("Portfolio not found or unauthorized access");
  }
});

// @desc    Delete a portfolio
// @route   DELETE /api/portfolios/:id
// @access  Private
const deletePortfolio = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (portfolio) {
    await Portfolio.deleteOne({ _id: portfolio._id });
    res.json({ message: "Portfolio removed" });
  } else {
    res.status(404);
    throw new Error("Portfolio not found or unauthorized access");
  }
});

// @desc    Publish a portfolio (deprecated, use /api/portfolios/:id/toggle-publish)
// @route   POST /api/portfolios/:id/publish
// @access  Private
const publishPortfolio = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (portfolio) {
    portfolio.settings.isPublished = true;
    const updatedPortfolio = await portfolio.save();
    res.json({
      message: "Portfolio published successfully",
      portfolio: updatedPortfolio,
    });
  } else {
    res.status(404);
    throw new Error("Portfolio not found or unauthorized access");
  }
});


// @desc    Create a new portfolio from template
// @route   POST /api/portfolios/create-from-template
// @access  Private
const createPortfolioFromTemplate = asyncHandler(async (req, res) => {
  const { templateId, title } = req.body;
  const user = await User.findById(req.user._id);

  // Check template exists
  const template = await Template.findById(templateId);
  if (!template) {
    res.status(404);
    throw new Error("Template not found");
  }

  // Check if user can create portfolio based on subscription
  const userPortfolios = await Portfolio.find({ userId: req.user._id });

  // Free users can only have 1 published portfolio
  if (user.subscription.plan === "free") {
    const publishedPortfolios = userPortfolios.filter(
      (p) => p.settings.isPublished
    );
    if (publishedPortfolios.length >= 1) {
      res.status(403);
      throw new Error(
        "Free users can only have 1 published portfolio. Upgrade to Premium for unlimited portfolios."
      );
    }
  }

  // Check if user can use premium template
  if (template.isPremium && user.subscription.plan === "free") {
    res.status(403);
    throw new Error(
      "This is a premium template. Upgrade to access premium templates."
    );
  }

  // Generate unique slug
  let baseSlug = title
    ? title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-*|-*$/g, "")
    : "portfolio";
  let slug = baseSlug;
  let counter = 1;

  while (await Portfolio.findOne({ userId: req.user._id, slug: slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Auto-fill data from user profile
  const autoFilledData = generateAutoFillData(user, template);

  const portfolio = new Portfolio({
    userId: req.user._id,
    templateId,
    title: title || `My ${template.name} Portfolio`,
    slug,
    customData: autoFilledData,
    customStyling: {
      colors: template.customizationOptions.colors[0]
        ? {
            primary: template.customizationOptions.colors[0],
            secondary: template.customizationOptions.colors[1] || "#ffffff",
          }
        : {},
      fonts: {
        heading: template.customizationOptions.fonts[0] || "Inter",
        body: template.customizationOptions.fonts[0] || "Inter",
      },
      spacing: { section: "normal", element: "normal" }, // Default values
    },
    seoSettings: {
      title: `${user.fullName || user.username} - Portfolio`,
      description:
        user.bio ||
        `Professional portfolio of ${user.fullName || user.username}`,
      keywords: user.professionalInfo.skills || [],
    },
    activeSections: template.sections.map((s) => s.id), // Initialize with all template sections active
  });

  const createdPortfolio = await portfolio.save();

  // Increment template download count
  template.downloads = (template.downloads || 0) + 1;
  await template.save();

  res.status(201).json(createdPortfolio);
});

// Helper function to auto-fill data from user profile
const generateAutoFillData = (user, template) => {
  const autoData = {};

  template.sections.forEach((section) => {
    switch (section.type) {
      case "hero":
        autoData.hero = {
          name: user.fullName || user.username,
          title: user.professionalInfo.title || "Professional",
          description:
            user.bio ||
            `Welcome to my portfolio. I'm ${user.fullName || user.username}.`,
          profileImage: user.profilePicture || "",
          email: user.email,
          location: user.location || "",
          socialLinks: user.socialLinks || {},
        };
        break;

      case "about":
        autoData.about = {
          description: user.bio || "",
          skills: user.professionalInfo.skills || [],
          experience: user.professionalInfo.experience || "",
          education: user.professionalInfo.education || [],
          phone: user.phone || "",
          location: user.location || "",
          website: user.website || "",
        };
        break;

      case "contact":
        autoData.contact = {
          email: user.email,
          phone: user.phone || "",
          location: user.location || "",
          socialLinks: user.socialLinks || {},
          website: user.website || "",
        };
        break;

      case "projects":
        autoData.projects = []; // User will need to add projects manually
        break;

      case "skills":
        autoData.skills =
          user.professionalInfo.skills.map((s) => ({
            skillName: s,
            proficiency: "intermediate",
          })) || [];
        break;

      case "experience":
        autoData.experience = user.professionalInfo.experience || [];
        break;

      case "education":
        autoData.education = user.professionalInfo.education || [];
        break;

      case "certifications":
        autoData.certifications = user.professionalInfo.certifications || [];
        break;

      default:
        autoData[section.type] = {}; // Initialize other sections as empty objects
    }
  });

  return autoData;
};

// @desc    Get user's portfolios with template info
// @route   GET /api/portfolios/my-portfolios
// @access  Private
const getMyPortfolios = asyncHandler(async (req, res) => {
  const portfolios = await Portfolio.find({ userId: req.user._id })
    .populate("templateId", "name thumbnail category isPremium")
    .sort({ updatedAt: -1 });

  res.json(portfolios);
});

// @desc    Check if user has used a template
// @route   GET /api/portfolios/template-usage/:templateId
// @access  Private
const checkTemplateUsage = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findOne({
    userId: req.user._id,
    templateId: req.params.templateId,
  });

  res.json({
    hasUsed: !!portfolio,
    portfolioId: portfolio ? portfolio._id : null,
  });
});

// @desc    Publish/Unpublish portfolio with free user limits
// @route   POST /api/portfolios/:id/toggle-publish
// @access  Private
const togglePublishPortfolio = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!portfolio) {
    res.status(404);
    throw new Error("Portfolio not found");
  }

  const user = await User.findById(req.user._id);

  // If trying to publish
  if (!portfolio.settings.isPublished) {
    // Check free user limits
    if (user.subscription.plan === "free") {
      const publishedPortfolios = await Portfolio.find({
        userId: req.user._id,
        "settings.isPublished": true,
        _id: { $ne: portfolio._id }, // Exclude the current portfolio if it was already published
      });

      if (publishedPortfolios.length >= 1) {
        // Unpublish the existing published portfolio(s) for free user
        await Portfolio.updateMany(
          { userId: req.user._id, "settings.isPublished": true },
          { "settings.isPublished": false }
        );
      }
    }

    portfolio.settings.isPublished = true;
    portfolio.isDraft = false; // Mark as not a draft once published
    portfolio.publishedAt = new Date(); // Set published date
  } else {
    portfolio.settings.isPublished = false;
  }

  const updatedPortfolio = await portfolio.save();
  res.json({
    message: `Portfolio ${updatedPortfolio.settings.isPublished ? "published" : "unpublished"} successfully`,
    portfolio: updatedPortfolio,
  });
});

// @desc    Update portfolio sections, styling, and content
// @route   PUT /api/portfolios/:id/customize
// @access  Private
const customizePortfolio = asyncHandler(async (req, res) => {
  const {
    customData,
    customStyling,
    activeSections,
    title,
    slug,
    seoSettings,
    settings,
  } = req.body;

  const portfolio = await Portfolio.findOne({
    _id: req.params.id,
    userId: req.user._id,
  }).populate("templateId");

  if (!portfolio) {
    res.status(404);
    throw new Error("Portfolio not found");
  }

  // Update basic portfolio info
  if (title !== undefined) portfolio.title = title;
  if (seoSettings !== undefined)
    portfolio.seoSettings = { ...portfolio.seoSettings, ...seoSettings };
  if (settings !== undefined)
    portfolio.settings = { ...portfolio.settings, ...settings };

  // Handle slug change with uniqueness check if provided
  if (slug !== undefined && slug !== portfolio.slug) {
    const newSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-*|-*$/g, "");
    const slugExists = await Portfolio.findOne({
      userId: req.user._id,
      slug: newSlug,
      _id: { $ne: portfolio._id },
    });
    if (slugExists) {
      res.status(400);
      throw new Error(
        "This custom URL is already in use by another of your portfolios."
      );
    }
    portfolio.slug = newSlug;
  }

  // Validate that active sections are available in template
  if (activeSections !== undefined) {
    const templateSectionIds = portfolio.templateId.sections.map((s) => s.id);
    const invalidSections = activeSections.filter(
      (sId) => !templateSectionIds.includes(sId)
    );

    if (invalidSections.length > 0) {
      res.status(400);
      throw new Error(
        `Invalid sections provided: ${invalidSections.join(", ")}. These sections are not part of the selected template.`
      );
    }

    portfolio.activeSections = activeSections;
  }

  // Merge customData deeply
  if (customData) {
    // For arrays, replace. For objects, merge.
    for (const key in customData) {
      if (Array.isArray(customData[key])) {
        portfolio.customData[key] = customData[key];
      } else if (
        typeof customData[key] === "object" &&
        customData[key] !== null
      ) {
        portfolio.customData[key] = {
          ...portfolio.customData[key],
          ...customData[key],
        };
      } else {
        portfolio.customData[key] = customData[key];
      }
    }
  }

  // Merge customStyling deeply
  if (customStyling) {
    for (const key in customStyling) {
      if (
        typeof customStyling[key] === "object" &&
        customStyling[key] !== null
      ) {
        portfolio.customStyling[key] = {
          ...portfolio.customStyling[key],
          ...customStyling[key],
        };
      } else {
        portfolio.customStyling[key] = customStyling[key];
      }
    }
  }

  portfolio.isDraft = true; // Mark as draft until explicitly published again
  const updatedPortfolio = await portfolio.save();
  res.json(updatedPortfolio);
});

// @desc    Duplicate portfolio
// @route   POST /api/portfolios/:id/duplicate
// @access  Private
const duplicatePortfolio = asyncHandler(async (req, res) => {
  const originalPortfolio = await Portfolio.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!originalPortfolio) {
    res.status(404);
    throw new Error("Portfolio not found");
  }

  // Generate unique slug for duplicate
  let baseSlug = `${originalPortfolio.slug}-copy`;
  let slug = baseSlug;
  let counter = 1;

  while (await Portfolio.findOne({ userId: req.user._id, slug: slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const duplicatedPortfolio = new Portfolio({
    userId: req.user._id,
    templateId: originalPortfolio.templateId,
    title: `${originalPortfolio.title} (Copy)`,
    slug,
    customData: originalPortfolio.customData,
    customStyling: originalPortfolio.customStyling,
    seoSettings: originalPortfolio.seoSettings,
    activeSections: originalPortfolio.activeSections,
    settings: {
      ...originalPortfolio.settings,
      isPublished: false, // Duplicates start as unpublished
      customDomain: "", // Clear custom domain for duplicate
    },
    isDraft: true,
    version: 1, // Reset version for new duplicate
  });

  const savedPortfolio = await duplicatedPortfolio.save();
  res.status(201).json(savedPortfolio);
});

// @desc    Admin: Get aggregate portfolio statistics
// @route   GET /api/portfolios/stats
// @access  Private/Admin
const getPortfolioStats = asyncHandler(async (req, res) => {
  console.log(
    "[PortfolioController] getPortfolioStats: Starting to fetch portfolio stats."
  );
  const totalPortfolios = await Portfolio.countDocuments();
  const publishedPortfolios = await Portfolio.countDocuments({
    "settings.isPublished": true,
  });
  const draftPortfolios = await Portfolio.countDocuments({
    "settings.isPublished": false,
  });

  const totalViewsResult = await Portfolio.aggregate([
    {
      $group: {
        _id: null,
        totalViews: { $sum: "$stats.views" },
      },
    },
  ]);
  const totalViews =
    totalViewsResult.length > 0 ? totalViewsResult[0].totalViews : 0;

  const averageViews =
    totalPortfolios > 0 ? (totalViews / totalPortfolios).toFixed(2) : 0;

  // - Most popular portfolios (e.g., top 3 by views):
  const mostViewedPortfolios = await Portfolio.find({})
    .sort({ "stats.views": -1 })
    .limit(3)
    .select("title slug stats.views userId") // IMPORTANT: Select userId here
    .populate('userId', 'username'); // IMPORTANT: Populate userId to get username


  // - Portfolios by template (e.g., count portfolios for each template)
  const portfoliosByTemplate = await Portfolio.aggregate([
    { $group: { _id: "$templateId", count: { $sum: 1 } } },
    {
      $lookup: {
        from: "templates",
        localField: "_id",
        foreignField: "_id",
        as: "templateInfo",
      },
    },
    { $unwind: "$templateInfo" },
    {
      $project: { _id: 0, templateName: "$templateInfo.name", count: "$count" },
    },
    { $sort: { count: -1 } },
  ]);

  res.json({
    totalPortfolios,
    publishedPortfolios,
    draftPortfolios,
    totalViews,
    averageViews,
    mostViewedPortfolios, // This will now have populated userId objects
    portfoliosByTemplate,
  });
});


// @desc    Get portfolio analytics
// @route   GET /api/portfolios/:id/analytics
// @access  Private
const getPortfolioAnalytics = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findOne({ _id: req.params.id, userId: req.user._id });

  if (!portfolio) {
    res.status(404);
    throw new Error('Portfolio not found or unauthorized access');
  }

  // Ensure analytics are enabled for this portfolio
  if (!portfolio.settings.analytics) {
    res.status(403).json({ message: 'Analytics are disabled for this portfolio.' });
    return;
  }

  // --- Enhanced Analytics Data ---
  // For a real-world analytics, you'd likely:
  // 1. Have a separate analytics collection/service for raw visit logs (IP, timestamp, referrer, page)
  // 2. Aggregate that data for daily, weekly, monthly views
  // 3. Track unique visitors more robustly (e.g., using a cookie/session ID)

  // For this implementation, we'll simulate some historical data or use existing 'stats' fields
  // Assume 'stats.views' is overall views. We can build a simple daily view aggregation.

  // Simulate daily views for the last 30 days (example)
  const today = new Date();
  const dailyViewsData = [];
  // Dummy data for demonstration. In real app, pull from detailed logs.
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dailyViewsData.push({
      date: date.toISOString().split('T')[0], // YYYY-MM-DD
      views: Math.floor(Math.random() * 50) + 10 // Random views between 10 and 60
    });
  }

  res.json({
    portfolioId: portfolio._id,
    title: portfolio.title,
    currentStats: {
      views: portfolio.stats.views || 0,
      uniqueVisitors: portfolio.stats.uniqueVisitors || 0,
      lastViewed: portfolio.stats.lastViewed,
      shares: portfolio.stats.shares || 0,
      contactForms: portfolio.stats.contactForms || 0,
    },
    // Simulated historical data
    historicalViews: dailyViewsData, // Example: views over last 30 days
    // Add other metrics as needed:
    // popularPages: [],
    // trafficSources: [],
  });
});

// @desc    Admin: Get any public portfolio by slug (for admin viewing)
// @route   GET /api/portfolios/admin/public/:username/:slug
// @access  Private/Admin
const getAdminPublicPortfolioBySlug = asyncHandler(async (req, res) => {
  const { username, slug } = req.params;
  
  console.log(`[AdminPublicPortfolio] Attempting to fetch for username: '${username}', slug: '${slug}' (Admin view)`);

  const user = await User.findOne({ username });
  if (!user) {
    console.warn(`[AdminPublicPortfolio] User not found for username: '${username}'`);
    res.status(404);
    throw new Error('User not found for this portfolio');
  }

  console.log(`[AdminPublicPortfolio] Found user ID: '${user._id}' for username: '${username}'`);

  const queryCriteria = {
    userId: user._id,
    slug: slug,
    'settings.isPublished': true
  };
  console.log(`[AdminPublicPortfolio] Querying for portfolio with criteria: ${JSON.stringify(queryCriteria)}`);

  const portfolio = await Portfolio.findOne(queryCriteria).populate('templateId');

  if (portfolio) {
    console.log(`[AdminPublicPortfolio] Portfolio found: '${portfolio.title}' (ID: ${portfolio._id})`);
    // NOTE: For admin view, you might not want to increment views, or keep it separate.
    // For simplicity, we'll skip incrementing views for admin's direct public view.
    res.json(portfolio);
  } else {
    console.warn(`[AdminPublicPortfolio] Portfolio NOT found for user ID: '${user._id}', slug: '${slug}', and published status.`);
    res.status(404);
    throw new Error('Public portfolio not found for this user or not published');
  }
});



module.exports = {
  getUserPortfolios, // Kept for consistency, but my-portfolios is preferred
  createPortfolio, // Kept for consistency, but createPortfolioFromTemplate is preferred
  getPortfolioById,
  getPublicPortfolioBySlug,
  updatePortfolio, // Kept for consistency, but customizePortfolio is preferred
  deletePortfolio,
  publishPortfolio, // Kept for consistency, but togglePublishPortfolio is preferred
  // New enhanced methods
  createPortfolioFromTemplate,
  getMyPortfolios,
  checkTemplateUsage,
  togglePublishPortfolio,
  customizePortfolio,
  duplicatePortfolio,
  getPortfolioStats,
  getPortfolioAnalytics,
  getAdminPublicPortfolioBySlug,
};
