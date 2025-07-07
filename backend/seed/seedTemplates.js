const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const Template = require('../models/Template');
const User = require('../models/User');
const connectDB = require('../config/db');

connectDB();

const seedTemplates = async () => {
  try {
    // Create a default admin user for template creation
    let adminUser = await User.findOne({ email: 'admin@portfoliohub.com' });
    
    if (!adminUser) {
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@portfoliohub.com',
        password: 'admin123',
        fullName: 'Admin User',
        isAdmin: true,
      });
    }

    // Clear existing templates
    await Template.deleteMany({});

    const templates = [
      // ========================================
      // FREE TEMPLATES (Simple, Basic Features)
      // ========================================
      {
        name: 'Simple Developer',
        slug: 'simple-developer',
        category: 'developer',
        isPremium: false,
        price: 0,
        thumbnail: 'https://repository-images.githubusercontent.com/616351992/41fb4d77-8bcc-4f2f-a5af-56c0e41e07c4',
        previewImages: [
          'https://repository-images.githubusercontent.com/616351992/41fb4d77-8bcc-4f2f-a5af-56c0e41e07c4'
        ],
        sections: [
          {
            id: 'hero',
            type: 'hero',
            fields: ['name', 'title', 'description'],
            layout: 'centered',
            styling: { 
              textAlign: 'center', 
              bgColor: '#ffffff',
              textColor: '#333333'
            },
            isRequired: true
          },
          {
            id: 'about',
            type: 'about',
            fields: ['description'],
            layout: 'single-column',
            styling: { 
              bgColor: '#f8f9fa',
              textColor: '#333333'
            },
            isRequired: false
          },
          {
            id: 'projects',
            type: 'projects',
            fields: ['title', 'description', 'githubUrl'],
            layout: 'simple-list',
            styling: { 
              bgColor: '#ffffff',
              textColor: '#333333'
            },
            isRequired: true
          },
          {
            id: 'contact',
            type: 'contact',
            fields: ['email'],
            layout: 'centered',
            styling: { 
              bgColor: '#f8f9fa',
              textColor: '#333333'
            },
            isRequired: true
          }
        ],
        customizationOptions: {
          colors: ['#ffffff', '#f8f9fa', '#333333'], // Very limited colors
          fonts: ['Arial', 'Helvetica'], // Basic fonts only
          layouts: ['centered', 'single-column'] // Limited layouts
        },
        tags: ['developer', 'simple', 'basic', 'free'],
        createdBy: adminUser._id
      },
      {
        name: 'Basic Portfolio',
        slug: 'basic-portfolio',
        category: 'designer',
        isPremium: false,
        price: 0,
        thumbnail: 'https://weandthecolor.com/wp-content/uploads/2020/09/A-modern-and-fresh-portfolio-template-for-Adobe-InDesign.jpg',
        previewImages: [
          'https://weandthecolor.com/wp-content/uploads/2020/09/A-modern-and-fresh-portfolio-template-for-Adobe-InDesign.jpg'
        ],
        sections: [
          {
            id: 'hero',
            type: 'hero',
            fields: ['name', 'title'],
            layout: 'simple-header',
            styling: { 
              textAlign: 'left', 
              bgColor: '#ffffff',
              textColor: '#000000'
            },
            isRequired: true
          },
          {
            id: 'portfolio',
            type: 'portfolio',
            fields: ['title', 'image'],
            layout: 'simple-grid',
            styling: { 
              columns: 2, // Fixed 2 columns
              bgColor: '#ffffff'
            },
            isRequired: true
          },
          {
            id: 'contact',
            type: 'contact',
            fields: ['email', 'phone'],
            layout: 'simple-contact',
            styling: { 
              bgColor: '#f5f5f5',
              textColor: '#000000'
            },
            isRequired: true
          }
        ],
        customizationOptions: {
          colors: ['#ffffff', '#f5f5f5', '#000000', '#666666'], // Limited color palette
          fonts: ['Arial', 'Times New Roman'], // Basic fonts
          layouts: ['simple-header', 'simple-grid'] // Very limited layouts
        },
        tags: ['designer', 'basic', 'simple', 'free'],
        createdBy: adminUser._id
      },

      // ========================================
      // PREMIUM TEMPLATES (Advanced, Highly Customizable)
      // ========================================
      {
        name: 'Pro Developer Studio',
        slug: 'pro-developer-studio',
        category: 'developer',
        isPremium: true,
        price: 29,
        thumbnail: 'https://cdn.shortpixel.ai/spai/q_glossy+ret_img+to_auto/peterdraw.studio/wp-content/uploads/2021/12/Luxe-Modern-Personal-Portfolio-Website-Hero-Image.png',
        previewImages: [
          'https://cdn.shortpixel.ai/spai/q_glossy+ret_img+to_auto/peterdraw.studio/wp-content/uploads/2021/12/Luxe-Modern-Personal-Portfolio-Website-Hero-Image.png'
        ],
        sections: [
          {
            id: 'hero',
            type: 'hero',
            fields: ['name', 'title', 'description', 'profileImage', 'ctaText', 'backgroundVideo', 'socialLinks'],
            layout: 'fullscreen-animated',
            styling: { 
              overlay: 'gradient', 
              animation: 'typewriter',
              particles: true,
              parallax: true,
              bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            },
            isRequired: true
          },
          {
            id: 'about',
            type: 'about',
            fields: ['description', 'skills', 'experience', 'achievements', 'timeline', 'personalImage', 'stats'],
            layout: 'interactive-timeline',
            styling: { 
              animation: 'slideInLeft',
              skillBars: 'animated',
              counterAnimation: true,
              scrollTrigger: true
            },
            isRequired: false
          },
          {
            id: 'projects',
            type: 'projects',
            fields: ['title', 'description', 'image', 'gallery', 'technologies', 'liveUrl', 'githubUrl', 'caseStudy', 'category'],
            layout: 'interactive-showcase',
            styling: { 
              hover: 'advanced-3d',
              filter: 'isotope',
              lightbox: true,
              masonry: true,
              loadMore: true
            },
            isRequired: true
          },
          {
            id: 'skills',
            type: 'skills',
            fields: ['skillName', 'proficiency', 'category', 'icon', 'yearsExperience'],
            layout: 'interactive-bars',
            styling: {
              chartType: 'radar', // radar, bar, circular
              animation: 'progressive',
              grouping: 'category'
            },
            isRequired: false
          },
          {
            id: 'experience',
            type: 'experience',
            fields: ['company', 'position', 'duration', 'description', 'technologies', 'achievements', 'logo'],
            layout: 'vertical-timeline',
            styling: {
              timelineStyle: 'modern',
              animation: 'fadeInUp',
              hover: 'expand'
            },
            isRequired: false
          },
          {
            id: 'testimonials',
            type: 'testimonials',
            fields: ['name', 'role', 'company', 'testimonial', 'avatar', 'rating', 'linkedinUrl'],
            layout: 'carousel-3d',
            styling: { 
              autoplay: true, 
              dots: true,
              navigation: 'arrows',
              effect: '3d-coverflow',
              pauseOnHover: true
            },
            isRequired: false
          },
          {
            id: 'blog',
            type: 'blog',
            fields: ['title', 'excerpt', 'image', 'publishDate', 'readTime', 'tags', 'url'],
            layout: 'masonry-cards',
            styling: { 
              columns: 3, 
              hover: 'lift-rotate',
              lazyLoad: true,
              infinite: true
            },
            isRequired: false
          },
          {
            id: 'services',
            type: 'services',
            fields: ['title', 'description', 'icon', 'price', 'features', 'ctaText'],
            layout: 'pricing-cards',
            styling: {
              cardStyle: 'glassmorphism',
              hover: 'scale-glow',
              pricing: 'toggle'
            },
            isRequired: false
          },
          {
            id: 'contact',
            type: 'contact',
            fields: ['email', 'phone', 'location', 'socialLinks', 'contactForm', 'map', 'availability', 'calendar'],
            layout: 'split-with-map',
            styling: { 
              bgColor: '#1a1a1a', 
              textColor: '#ffffff',
              formStyle: 'modern',
              mapStyle: 'dark',
              particles: true
            },
            isRequired: true
          }
        ],
        customizationOptions: {
          colors: [
            '#667eea', '#764ba2', '#f093fb', '#f5576c', // Gradients
            '#4facfe', '#00f2fe', '#43e97b', '#38f9d7', // More gradients
            '#667eea', '#764ba2', '#f093fb', '#f5576c', // Solid colors
            '#1a1a1a', '#ffffff', '#f8f9fa', '#343a40'  // Neutrals
          ],
          fonts: [
            'Inter', 'Poppins', 'Roboto', 'Montserrat', // Modern fonts
            'Source Sans Pro', 'Open Sans', 'Lato', 'Nunito', // Web fonts
            'JetBrains Mono', 'Fira Code', 'Source Code Pro' // Code fonts
          ],
          layouts: [
            'fullscreen', 'split-screen', 'centered', 'offset', 'sidebar',
            'masonry', 'grid', 'carousel', 'timeline', 'cards',
            'hero-overlay', 'parallax', 'fixed-header', 'sticky-nav'
          ]
        },
        tags: ['developer', 'premium', 'advanced', 'interactive', 'animated', 'modern'],
        createdBy: adminUser._id
      },
      {
        name: 'Luxury Creative Studio',
        slug: 'luxury-creative-studio',
        category: 'designer',
        isPremium: true,
        price: 39,
        thumbnail: 'https://marketplace.canva.com/EAGGr0aHXDg/2/0/1600w/canva-pink-bold-modern-creative-portfolio-presentation-te1AiwXONs0.jpg',
        previewImages: [
          'https://marketplace.canva.com/EAGGr0aHXDg/2/0/1600w/canva-pink-bold-modern-creative-portfolio-presentation-te1AiwXONs0.jpg'
        ],
        sections: [
          {
            id: 'hero',
            type: 'hero',
            fields: ['name', 'title', 'tagline', 'heroImage', 'scrollIndicator', 'logo', 'videoBackground'],
            layout: 'parallax-fullscreen',
            styling: { 
              parallax: true, 
              overlay: 'gradient-animated',
              animation: 'typewriter-glitch',
              mouseFollow: true,
              cursorEffect: 'magnetic'
            },
            isRequired: true
          },
          {
            id: 'about',
            type: 'about',
            fields: ['description', 'philosophy', 'awards', 'experience', 'photo', 'signature', 'journey'],
            layout: 'storytelling-scroll',
            styling: { 
              scroll: 'reveal-complex',
              typography: 'large-artistic',
              imageEffects: 'ken-burns',
              textAnimation: 'word-by-word'
            },
            isRequired: true
          },
          {
            id: 'portfolio',
            type: 'portfolio',
            fields: ['title', 'category', 'image', 'gallery', 'description', 'client', 'year', 'tools', 'awards'],
            layout: 'fullscreen-gallery',
            styling: { 
              navigation: 'smooth-magnetic',
              zoom: 'advanced-lightbox',
              filter: 'isotope-3d',
              transition: 'liquid',
              preloader: 'custom'
            },
            isRequired: true
          },
          {
            id: 'process',
            type: 'process',
            fields: ['step', 'title', 'description', 'icon', 'duration', 'deliverables'],
            layout: 'interactive-flow',
            styling: { 
              animation: 'progressive-draw',
              interaction: 'hover-morph',
              connections: 'animated-lines',
              numbers: 'countup'
            },
            isRequired: false
          },
          {
            id: 'clients',
            type: 'clients',
            fields: ['name', 'logo', 'testimonial', 'project', 'industry', 'collaboration'],
            layout: 'logo-showcase-3d',
            styling: { 
              scroll: 'infinite-smooth',
              hover: 'testimonial-popup',
              logoFilter: 'grayscale-hover',
              arrangement: 'spiral'
            },
            isRequired: false
          },
          {
            id: 'awards',
            type: 'awards',
            fields: ['title', 'organization', 'year', 'category', 'image', 'description'],
            layout: 'trophy-display',
            styling: {
              displayStyle: '3d-shelf',
              animation: 'golden-glow',
              hover: 'certificate-modal'
            },
            isRequired: false
          },
          {
            id: 'services',
            type: 'services',
            fields: ['title', 'description', 'icon', 'price', 'duration', 'process', 'portfolio'],
            layout: 'service-cards-luxury',
            styling: {
              cardStyle: 'glassmorphism-gold',
              hover: 'luxury-lift',
              pricing: 'elegant-display'
            },
            isRequired: false
          },
          {
            id: 'contact',
            type: 'contact',
            fields: ['email', 'phone', 'socialLinks', 'contactForm', 'availability', 'consultation', 'location'],
            layout: 'elegant-split',
            styling: { 
              bgColor: '#000000',
              animation: 'fadeIn-luxury',
              formStyle: 'minimal-luxury',
              contactCards: 'floating'
            },
            isRequired: true
          }
        ],
        customizationOptions: {
          colors: [
            // Luxury gradients
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            // Solid luxury colors
            '#000000', '#ffffff', '#C9A96E', '#F4E4BC', // Gold theme
            '#2C3E50', '#34495E', '#E8F4FD', '#BDC3C7', // Blue-grey theme
            '#8E44AD', '#9B59B6', '#F8C471', '#F7DC6F'  // Purple-gold theme
          ],
          fonts: [
            // Luxury typography
            'Playfair Display', 'Cormorant Garamond', 'Crimson Text', // Serif luxury
            'Montserrat', 'Raleway', 'Lato', 'Source Sans Pro',        // Sans-serif modern
            'Dancing Script', 'Great Vibes', 'Pacifico',               // Script fonts
            'Oswald', 'Bebas Neue', 'Anton'                            // Display fonts
          ],
          layouts: [
            // Advanced layouts
            'fullscreen-immersive', 'split-diagonal', 'asymmetric-grid',
            'masonry-complex', 'carousel-3d', 'modal-overlay',
            'sticky-sections', 'horizontal-scroll', 'parallax-layers',
            'magazine-style', 'portfolio-showcase', 'interactive-timeline'
          ]
        },
        tags: ['designer', 'premium', 'luxury', 'animated', 'interactive', 'creative', 'artistic'],
        createdBy: adminUser._id
      }
    ];

    await Template.insertMany(templates);
    console.log('✅ Templates seeded successfully!');
    console.log('📋 Created:');
    console.log('   - 2 FREE templates (Simple, basic customization)');
    console.log('   - 2 PREMIUM templates (Advanced, highly customizable)');
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding templates:', error);
    process.exit(1);
  }
};

seedTemplates();