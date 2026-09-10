// A & W FENCING QUIZ FUNNEL - CONFIG
// Resolve images from this file so production routes and nested VS Code
// Live Preview URLs use the same assets without path-specific configuration.
const A_W_ASSET_BASE = new URL("./assets/", document.currentScript.src).href;

window.CONFIG = {
  businessName: "A & W Fencing",
  tagline: "Professional Fencing for Charlotte",
  phone: "+1 (704) 771-1901",
  businessHours: "Call to schedule your free estimate",
  logoUrl: `${A_W_ASSET_BASE}logo.webp`,
  logoAlt: "A & W Fencing logo",
  logoWidth: 512,
  logoHeight: 460,

  colors: {
    primary: "#083462",
    primaryDark: "#052746",
    primaryLight: "#3B6A93",
    bg: "#F6F8FB",
    surface: "#FFFFFF",
    text: "#172033",
    textMuted: "#667085",
    border: "#D6DEE8",
    success: "#16845B",
    landerGradFrom: "#F7FAFC",
    landerGradTo: "#DDE8F2"
  },
  headingFont: "Sora",
  bodyFont: "Inter",

  // Funnel presentation is controlled here rather than in the page markup.
  // /a = lander plus proof, /b = lander only, /c = questions immediately.
  // /d = ZIP verification, project type, fence type, then the lead form.
  // /e = project type, fence type, then the lead form with an unverified ZIP.
  variants: {
    a: { name: "Lander + proof", showLander: true, showProof: true },
    b: { name: "Lander only", showLander: true, showProof: false },
    c: { name: "Direct to questions", showLander: false, showProof: false },
    d: {
      name: "ZIP-first short form",
      showLander: false,
      showProof: false,
      zipFirst: true,
      questionIds: ["project_type", "fence_type"]
    },
    e: {
      name: "Simple short form",
      showLander: false,
      showProof: false,
      questionIds: ["project_type", "fence_type"],
      implicitConsent: true,
      questionOverrides: {
        project_type: {
          options: [
            { label: "New fence", icon: "panels-top-left" },
            { label: "Repair", icon: "wrench" },
            { label: "Replace", icon: "refresh-cw" }
          ]
        }
      }
    }
  },

  // Route /d compares the visitor's five-digit ZIP against this comma-separated
  // list. Add or remove ZIPs here without changing the funnel code.
  zipVerification: {
    allowedZipCodes: "27013, 27020, 27028, 27054, 27055, 28006, 28012, 28016, 28021, 28023, 28025, 28027, 28031, 28032, 28033, 28034, 28036, 28037, 28039, 28052, 28054, 28056, 28071, 28072, 28075, 28077, 28078, 28080, 28081, 28083, 28086, 28088, 28090, 28092, 28097, 28098, 28101, 28104, 28105, 28107, 28115, 28117, 28120, 28124, 28125, 28127, 28134, 28137, 28138, 28144, 28146, 28147, 28159, 28164, 28166, 28168, 28202, 28203, 28204, 28205, 28206, 28207, 28208, 28209, 28210, 28211, 28212, 28213, 28214, 28215, 28216, 28217, 28223, 28226, 28227, 28244, 28246, 28254, 28262, 28269, 28270, 28273, 28274, 28277, 28278, 28280, 28281, 28282, 28284, 28285, 28287, 28601, 28602, 28609, 28610, 28612, 28613, 28625, 28634, 28636, 28637, 28650, 28658, 28660, 28673, 28677, 28678, 28682, 28689",
    eyebrow: "First, let's check your area",
    headline: "What's your project ZIP code?",
    subtext: "Enter the ZIP code where the fence project will take place.",
    label: "Enter your Zip Code",
    details: [
      "Serving Charlotte & Surrounding Areas",
      "Residential, commercial & agricultural fencing",
      "Free estimates with no obligation"
    ],
    placeholder: "5-digit ZIP code",
    ctaLabel: "Check Availability",
    invalidMessage: "Enter a valid five-digit ZIP code.",
    unavailableMessage: "That ZIP is outside our current service list. Call us if your project is nearby."
  },

  defaultQuestionIds: ["fence_type", "property_type", "top_priority", "timeline", "budget"],

  featureStrip: [
    { label: "Family-Owned", icon: "users" },
    { label: "Local NC Team", icon: "map-pin" },
    { label: "Licensed & Insured", icon: "badge-check" }
  ],

  lander: {
    badge: "Free Fence Estimate - No Obligation",
    serviceArea: "Serving Charlotte & Surrounding Areas",
    headline: "Plan Your New Fence in 60 Seconds",
    subheadline: "Tell us what your property needs and A & W Fencing will help you choose the right fence for privacy, security, safety, and curb appeal.",
    highlights: [
      "Residential · Commercial · Agricultural",
      "Wood · Vinyl · Aluminum · Chain Link",
      "Free Estimates · Financing Available"
    ],
    ctaLabel: "Get My Free Estimate",
    crewImageUrl: `${A_W_ASSET_BASE}fencing-hero-960.webp`,
    crewImageSrcSet: `${A_W_ASSET_BASE}fencing-hero-960.webp 960w, ${A_W_ASSET_BASE}fencing-hero-1440.webp 1440w`,
    crewImageAlt: "Wood privacy fence beside a landscaped home",
    trustNote: "Straightforward planning. Professional installation."
  },

  gallery: {
    eyebrow: "Fence options",
    headline: "Find the Right Fit for Your Property",
    subheadline: "Explore the fencing styles and project types offered by A & W Fencing.",
    items: [
      { title: "Wood Privacy Fencing", location: "Residential", image: `${A_W_ASSET_BASE}projects/wood-fence-640.webp`, imageSrcSet: `${A_W_ASSET_BASE}projects/wood-fence-640.webp 640w, ${A_W_ASSET_BASE}projects/wood-fence-1280.webp 1280w`, alt: "Wood privacy fence along a green lawn" },
      { title: "Vinyl & PVC Fencing", location: "Low maintenance", image: `${A_W_ASSET_BASE}projects/vinyl-fence-640.webp`, imageSrcSet: `${A_W_ASSET_BASE}projects/vinyl-fence-640.webp 640w, ${A_W_ASSET_BASE}projects/vinyl-fence-1280.webp 1280w`, alt: "Vinyl fence along a landscaped yard" },
      { title: "Aluminum Fencing", location: "Pool & property safety", image: `${A_W_ASSET_BASE}projects/aluminum-fence-640.webp`, imageSrcSet: `${A_W_ASSET_BASE}projects/aluminum-fence-640.webp 640w, ${A_W_ASSET_BASE}projects/aluminum-fence-1280.webp 1280w`, alt: "Black aluminum fence beside a lawn" },
      { title: "Ornamental Gates", location: "Access & curb appeal", image: `${A_W_ASSET_BASE}projects/ornamental-gate-640.webp`, imageSrcSet: `${A_W_ASSET_BASE}projects/ornamental-gate-640.webp 640w, ${A_W_ASSET_BASE}projects/ornamental-gate-1280.webp 1280w`, alt: "Decorative metal driveway gate" },
      { title: "Farm & Agricultural", location: "Land & livestock", image: `${A_W_ASSET_BASE}projects/farm-fence-640.webp`, imageSrcSet: `${A_W_ASSET_BASE}projects/farm-fence-640.webp 640w, ${A_W_ASSET_BASE}projects/farm-fence-1280.webp 1280w`, alt: "Farm-style fence around an open green space" },
      { title: "Chain-Link Fencing", location: "Residential & commercial", image: `${A_W_ASSET_BASE}projects/chain-link-fence-640.webp`, imageSrcSet: `${A_W_ASSET_BASE}projects/chain-link-fence-640.webp 640w, ${A_W_ASSET_BASE}projects/chain-link-fence-1280.webp 1280w`, alt: "Chain-link fence installation" }
    ]
  },

  // Show the verified rating summary without inventing customer quotes.
  reviews: {
    enabled: true,
    eyebrow: "Customer reviews",
    headline: "Local Fencing Experience",
    subheadline: "A & W Fencing is rated 5.0 from two published customer reviews.",
    rating: "5.0",
    reviewCount: 2,
    items: []
  },

  questions: [
    {
      id: "project_type",
      question: "What type of fence project are you looking to get done?",
      type: "button-list",
      options: [
        { label: "New fence", icon: "panels-top-left" },
        { label: "Repair / replace", icon: "wrench" }
      ]
    },
    {
      id: "fence_type",
      progress: "Question 1 of 5",
      question: "What style of fence are you interested in?",
      type: "image-grid",
      options: [
        { label: "Wood privacy fence", icon: "hammer", image: `${A_W_ASSET_BASE}projects/wood-fence-640.webp` },
        { label: "Vinyl / PVC fence", icon: "panels-top-left", image: `${A_W_ASSET_BASE}projects/vinyl-fence-640.webp` },
        { label: "Aluminum / ornamental fence", icon: "shield-check", image: `${A_W_ASSET_BASE}projects/aluminum-fence-640.webp` },
        { label: "Chain link / agricultural fence", icon: "store", image: `${A_W_ASSET_BASE}projects/chain-link-fence-640.webp` }
      ]
    },
    {
      id: "property_type",
      progress: "Question 2 of 5",
      question: "What type of property is this for?",
      type: "button-list",
      options: [
        { label: "Residential", icon: "house" },
        { label: "Commercial", icon: "building-2" },
        { label: "Farm / agricultural", icon: "hammer" },
        { label: "Not sure yet", icon: "search" }
      ]
    },
    {
      id: "top_priority",
      progress: "Question 3 of 5",
      question: "What matters most for this project?",
      type: "button-list",
      options: [
        { label: "Privacy", icon: "panels-top-left" },
        { label: "Security", icon: "shield-check" },
        { label: "Curb appeal", icon: "sparkles" },
        { label: "Pets / pool safety", icon: "house" }
      ]
    },
    {
      id: "timeline",
      progress: "Question 4 of 5",
      question: "When would you like to begin?",
      type: "button-list",
      options: [
        { label: "As soon as possible", icon: "zap" },
        { label: "Within 1 month", icon: "calendar-days" },
        { label: "Within 3 months", icon: "calendar-clock" },
        { label: "Just researching", icon: "search" }
      ]
    },
    {
      id: "budget",
      progress: "Question 5 of 5",
      question: "What investment range are you considering?",
      type: "button-list",
      options: [
        { label: "Under $5,000", icon: "wallet" },
        { label: "$5,000 - $10,000", icon: "banknote" },
        { label: "$10,000 - $20,000", icon: "circle-dollar-sign" },
        { label: "$20,000+", icon: "badge-dollar-sign" }
      ]
    }
  ],

  form: {
    eyebrow: "Almost done!",
    headline: "Where should we send your free estimate details?",
    subtext: "Submit your project details and our team will follow up about your free estimate.",
    zipPlaceholder: "ZIP code",
    fields: [
      { name: "name", placeholder: "First & last name", type: "text", required: true },
      { name: "email", placeholder: "Email address", type: "email", required: true },
      { name: "phone", placeholder: "Phone number", type: "tel", required: true }
    ],
    ctaLabel: "Request My Free Estimate",
    privacyText: "We respect your privacy. No spam, ever."
  },

  thankYou: {
    headline: "Your request is in!",
    body: "Our team received your project details and will follow up about your free estimate.",
    callPrompt: "Prefer to talk now? Call A & W Fencing:",
    callLabel: "Call (704) 771-1901"
  },

  clarityId: "ydufwdgd3z",
  metaPixelId: "2105161930386830",
  tracking: {
    eventPrefix: "quiz",
    metaFunnelStepEvent: "FunnelStep",
    metaLeadEvent: "Lead"
  },
  webhookUrl: "https://hook.eu2.make.com/5vfvj8q3idb1qianqmtdulemt1qmwbsa",
  smsConsentText: "I agree to receive calls and SMS messages from {businessName} about my estimate request. Message & data rates may apply. Reply STOP to unsubscribe or HELP for help.",
  implicitConsentText: "By clicking submit, you agree to receive calls and SMS messages from {businessName} about your estimate request. Message & data rates may apply. Reply STOP to unsubscribe or HELP for help.",
  footerLinks: [
    { label: "Call (704) 771-1901", href: "tel:+17047711901" }
  ]
};
