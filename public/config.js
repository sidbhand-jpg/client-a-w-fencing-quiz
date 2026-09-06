// A & W FENCING QUIZ FUNNEL - CONFIG
// Resolve images from this file so production routes and nested VS Code
// Live Preview URLs use the same assets without path-specific configuration.
const A_W_ASSET_BASE = new URL("./assets/", document.currentScript.src).href;

window.CONFIG = {
  businessName: "A & W Fencing",
  tagline: "Professional Fencing for Lake Norman",
  phone: "+1 (704) 771-1901",
  businessHours: "Call to schedule your free estimate",
  logoUrl: `${A_W_ASSET_BASE}logo.png`,
  logoAlt: "A & W Fencing logo",

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
  variants: {
    a: { name: "Lander + proof", showLander: true, showProof: true },
    b: { name: "Lander only", showLander: true, showProof: false },
    c: { name: "Direct to questions", showLander: false, showProof: false }
  },

  lander: {
    badge: "Free Fence Estimate - No Obligation",
    headline: "Plan Your New Fence in 60 Seconds",
    subheadline: "Tell us what your property needs and A & W Fencing will help you choose the right fence for privacy, security, safety, and curb appeal.",
    bulletPoints: [
      "Residential, commercial, and agricultural fencing",
      "Wood, vinyl, aluminum, and chain-link options",
      "Serving Lake Norman and surrounding counties"
    ],
    ctaLabel: "Get My Free Estimate",
    crewImageUrl: `${A_W_ASSET_BASE}fencing-hero.jpg`,
    crewImageAlt: "Wood privacy fence beside a landscaped home",
    trustNote: "Straightforward planning. Professional installation."
  },

  gallery: {
    eyebrow: "Fence options",
    headline: "Find the Right Fit for Your Property",
    subheadline: "Explore the fencing styles and project types offered by A & W Fencing.",
    items: [
      { title: "Wood Privacy Fencing", location: "Residential", image: `${A_W_ASSET_BASE}projects/wood-fence.jpg`, alt: "Wood privacy fence along a green lawn" },
      { title: "Vinyl & PVC Fencing", location: "Low maintenance", image: `${A_W_ASSET_BASE}projects/vinyl-fence.jpg`, alt: "Vinyl fence along a landscaped yard" },
      { title: "Aluminum Fencing", location: "Pool & property safety", image: `${A_W_ASSET_BASE}projects/aluminum-fence.jpg`, alt: "Black aluminum fence beside a lawn" },
      { title: "Ornamental Gates", location: "Access & curb appeal", image: `${A_W_ASSET_BASE}projects/ornamental-gate.jpg`, alt: "Decorative metal driveway gate" },
      { title: "Farm & Agricultural", location: "Land & livestock", image: `${A_W_ASSET_BASE}projects/farm-fence.jpg`, alt: "Farm-style fence around an open green space" },
      { title: "Chain-Link Fencing", location: "Residential & commercial", image: `${A_W_ASSET_BASE}projects/chain-link-fence.jpg`, alt: "Chain-link fence installation" }
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
      id: "fence_type",
      progress: "Question 1 of 5",
      question: "What type of fencing project do you need?",
      type: "image-grid",
      options: [
        { label: "Wood privacy fence", icon: "hammer", image: `${A_W_ASSET_BASE}projects/wood-fence.jpg` },
        { label: "Vinyl / PVC fence", icon: "panels-top-left", image: `${A_W_ASSET_BASE}projects/vinyl-fence.jpg` },
        { label: "Aluminum / ornamental fence", icon: "shield-check", image: `${A_W_ASSET_BASE}projects/aluminum-fence.jpg` },
        { label: "Chain link / agricultural fence", icon: "store", image: `${A_W_ASSET_BASE}projects/chain-link-fence.jpg` }
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
    subtext: "Submit your project details and our estimate assistant will call within the next few minutes.",
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
    body: "Be on the lookout for a call from our estimate assistant in the next few minutes.",
    callPrompt: "Prefer to talk now? Call A & W Fencing:",
    callLabel: "Call (704) 771-1901"
  },

  clarityId: "ydufwdgd3z",
  metaPixelId: "",
  tracking: {
    eventPrefix: "quiz",
    metaFunnelStepEvent: "FunnelStep",
    metaLeadEvent: "Lead"
  },
  webhookUrl: "",
  leadRouterUrl: "https://houzflow-lead-router.houzflow.workers.dev/api/quiz-lead",
  leadProfile: "a_w_fencing",
  smsConsentText: "I agree to receive calls and SMS messages from {businessName} about my estimate request, including an immediate call from its automated AI assistant. Message & data rates may apply. Reply STOP to unsubscribe or HELP for help.",
  footerLinks: [
    { label: "A & W Fencing Website", href: "https://www.a-wfencing.com/" },
    { label: "Call (704) 771-1901", href: "tel:+17047711901" }
  ]
};
