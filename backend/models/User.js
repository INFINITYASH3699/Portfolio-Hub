const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      default: '',
    },
    profilePicture: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    socialLinks: {
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
    },
    professionalInfo: {
      title: { type: String, default: '' },
      company: { type: String, default: '' },
      experience: { type: String, default: '' },
      skills: [{ type: String }],
      education: [{
        degree: String,
        institution: String,
        startDate: Date,
        endDate: Date,
        description: String,
      }],
      certifications: [{
        name: String,
        issuer: String,
        issueDate: Date,
        credentialUrl: String,
      }],
      awards: [{
        name: String,
        issuer: String,
        year: Number,
      }],
      languages: [{
        name: String,
        proficiency: { type: String, enum: ['basic', 'conversational', 'fluent', 'native'] },
      }]
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'premium'],
        default: 'free',
      },
      status: {
        type: String,
        enum: ['active', 'inactive', 'canceled', 'trial'],
        default: 'active',
      },
      expiresAt: {
        type: Date,
        default: null,
      },
      stripeCustomerId: { type: String, default: '' },
      stripeSubscriptionId: { type: String, default: '' },
    },
    preferences: {
      theme: { type: String, default: 'system' },
      language: { type: String, default: 'en' },
      notifications: {
        email: { type: Boolean, default: true },
        app: { type: Boolean, default: true },
        marketing: { type: Boolean, default: false },
      },
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;