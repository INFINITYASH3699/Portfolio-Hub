// backend/models/Portfolio.js (ensure this is correct and complete)
const mongoose = require('mongoose');

const portfolioSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Template',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    activeSections: [{
      type: String,
    }],
    customData: {
      hero: { type: Object, default: {} },
      about: { type: Object, default: {} },
      projects: { type: Array, default: [] },
      skills: { type: Array, default: [] },
      experience: { type: Array, default: [] },
      education: { type: Array, default: [] },
      contact: { type: Object, default: {} },
      testimonials: { type: Array, default: [] },
      services: { type: Array, default: [] },
      blog: { type: Array, default: [] },
    },
    customStyling: {
      colors: {
        primary: { type: String, default: '#6366f1' },
        secondary: { type: String, default: '#8b5cf6' },
        accent: { type: String, default: '#10b981' },
        background: { type: String, default: '#ffffff' },
        text: { type: String, default: '#1f2937' },
        muted: { type: String, default: '#6b7280' }
      },
      fonts: {
        heading: { type: String, default: 'Inter' },
        body: { type: String, default: 'Inter' },
        accent: { type: String, default: 'Inter' }
      },
      spacing: {
        section: { type: String, enum: ['tight', 'normal', 'relaxed', 'loose'], default: 'normal' },
        element: { type: String, enum: ['tight', 'normal', 'relaxed'], default: 'normal' }
      },
      animations: {
        enabled: { type: Boolean, default: true },
        type: { type: String, enum: ['fade', 'slide', 'zoom', 'none'], default: 'fade' },
        duration: { type: String, enum: ['fast', 'normal', 'slow'], default: 'normal' }
      },
      layout: {
        containerWidth: { type: String, enum: ['narrow', 'normal', 'wide', 'full'], default: 'normal' },
        sectionAlignment: { type: String, enum: ['left', 'center', 'right'], default: 'center' }
      }
    },
    seoSettings: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      keywords: [{ type: String }],
      ogImage: { type: String, default: '' },
      customMeta: { type: Object, default: {} }
    },
    settings: {
      isPublished: { type: Boolean, default: false },
      customDomain: { type: String, default: '' },
      password: { type: String, default: '' },
      analytics: { type: Boolean, default: true },
      allowComments: { type: Boolean, default: false },
      showBranding: { type: Boolean, default: true },
      customCSS: { type: String, default: '' }
    },
    stats: {
      views: { type: Number, default: 0 },
      uniqueVisitors: { type: Number, default: 0 },
      lastViewed: { type: Date },
      shares: { type: Number, default: 0 },
      contactForms: { type: Number, default: 0 }
    },
    version: { type: Number, default: 1 },
    isDraft: { type: Boolean, default: true },
    publishedAt: { type: Date },
    lastEditedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
  }
);

portfolioSchema.index({ userId: 1, slug: 1 }, { unique: true });

portfolioSchema.pre('save', function(next) {
  this.lastEditedAt = new Date();
  if (this.settings.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

module.exports = Portfolio;