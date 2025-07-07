const mongoose = require('mongoose');

const templateSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['developer', 'designer', 'photographer', 'writer', 'architect', 'artist', 'other'],
    },
    isPremium: {
      type: Boolean,
      required: true,
      default: false,
    },
    price: {
      type: Number,
      required: function() { return this.isPremium; }, // Required only if premium
      default: 0,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    previewImages: [{
      type: String,
    }],
    sections: [{
      id: { type: String, required: true },
      type: { type: String, required: true }, // hero, projects, skills, contact, etc.
      fields: [{ type: String }], // List of data fields this section uses (e.g., 'title', 'description', 'imageUrl')
      layout: { type: String }, // e.g., 'layout-A', 'layout-B' for that specific section
      styling: { type: Object }, // JSON object for default styling specific to this section
      isRequired: { type: Boolean, default: false }, // Cannot be removed by user
      isRemovable: { type: Boolean, default: true }, // Can be removed by user
      isRepeatable: { type: Boolean, default: false }, // Can add multiple instances of this section
      defaultContent: { type: Object }, // Default content for this section when added
    }],
    customizationOptions: {
      colors: [{ type: String }], // List of suggested colors/gradients (hex, rgba, linear-gradient)
      fonts: [{ type: String }], // List of suggested font families (Google Fonts or common web fonts)
      layouts: [{ type: String }], // List of overall template layout options
      spacing: [{ type: String }], // List of spacing options ('tight', 'normal', 'relaxed')
      animations: [{ type: String }], // List of animation types ('fade', 'slide', 'zoom')
      sectionStyles: [{ // Specific styling presets for sections
        sectionType: String,
        presetName: String,
        styles: Object, // e.g., { background: 'dark', textAlignment: 'left' }
      }]
    },
    tags: [{
      type: String,
    }],
    isActive: { // Admin can deactivate templates
      type: Boolean,
      default: true,
    },
    downloads: { // How many times this template has been used to create a portfolio
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Template = mongoose.model('Template', templateSchema);

module.exports = Template;