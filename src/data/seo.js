// Central site configuration for SEO.
// Change SITE_URL when the production domain is live.
export const SITE = {
  name: "Nexprobyte Technologies",
  shortName: "Nexprobyte",
  url: "https://nexprobyte.com",
  tagline: "Digital Marketing & Software Company in Coimbatore",
  email: "info@nexprobyte.com",
  phone: "+919500042426",
  address:
    "1st Floor, Nanjiammal Complex, Above City Bakery, Maniyakarampalayam, Coimbatore, Tamil Nadu 641006",
  city: "Coimbatore",
  state: "Tamil Nadu",
  country: "India",
  geo: { lat: "10.9994", lng: "76.9687" },
};

// Per-route SEO. Each route can override title/description/keywords.
export const SEO_BY_PATH = {
  "/": {
    title: "Nexprobyte — Digital Marketing & Software Company in Coimbatore",
    description:
      "Nexprobyte Technologies is a digital marketing agency and software development company in Coimbatore. Web development, SEO, social media marketing, app development & AI automation.",
    keywords:
      "digital marketing agency Coimbatore, software company Coimbatore, web development company Coimbatore, digital marketing services Tamil Nadu",
  },
  "/about": {
    title: "About Us — Nexprobyte, Software & Digital Marketing Company Coimbatore",
    description:
      "Learn about Nexprobyte Technologies — a Coimbatore-based software development and digital marketing company helping startups and SMEs grow online.",
    keywords: "about Nexprobyte, software company Coimbatore, digital marketing agency Coimbatore",
  },
  "/services": {
    title: "Our Services — Web Development, SEO & Digital Marketing Coimbatore",
    description:
      "Explore Nexprobyte services: website development, application development, mobile apps, digital marketing, SEO and social media marketing in Coimbatore.",
    keywords:
      "web development services Coimbatore, digital marketing services, SEO services, software services Coimbatore",
  },
  "/services/seo-services": {
    title: "SEO Services Coimbatore — Improve Rankings & Traffic | Nexprobyte",
    description:
      "Professional SEO services in Coimbatore. Technical SEO, on-page optimisation, keyword research, local SEO and link building to grow your organic traffic.",
    keywords:
      "SEO services Coimbatore, link building agency, backlink building services, SEO company Coimbatore, local SEO Coimbatore",
  },
  "/services/digital-marketing": {
    title: "Digital Marketing Company Coimbatore — Growth Marketing | Nexprobyte",
    description:
      "Data-driven digital marketing company in Coimbatore. Google & Meta ads, landing page funnels, CRO and automation that deliver measurable ROI.",
    keywords:
      "digital marketing company Coimbatore, performance marketing Coimbatore, google ads agency Coimbatore, online marketing Coimbatore",
  },
  "/services/social-media-marketing": {
    title: "Social Media Marketing Coimbatore — Brand Growth | Nexprobyte",
    description:
      "Social media marketing services in Coimbatore. Content strategy, reels, community management and paid social that build your brand.",
    keywords: "social media marketing Coimbatore, smm agency Coimbatore, instagram marketing Coimbatore",
  },
  "/blog": {
    title: "Blog — Digital Marketing & Web Insights | Nexprobyte Coimbatore",
    description:
      "Insights on SEO, web development, digital marketing and business growth from the Nexprobyte team in Coimbatore.",
    keywords: "digital marketing blog, SEO tips, web development insights, business blog Coimbatore",
  },
  "/careers": {
    title: "Careers — Join Nexprobyte, Software & Marketing Company Coimbatore",
    description:
      "Browse open careers at Nexprobyte Technologies Coimbatore — frontend developer, WordPress, UI/UX, digital marketing specialist and SEO analyst roles.",
    keywords: "jobs Coimbatore, software company careers Coimbatore, digital marketing jobs Coimbatore",
  },
  "/contact": {
    title: "Contact Us — Nexprobyte, Digital Agency & Software Company Coimbatore",
    description:
      "Get in touch with Nexprobyte Technologies Coimbatore for web development, SEO, digital marketing and software solutions. Call or email us today for a free consultation.",
    keywords:
      "contact Nexprobyte, digital marketing agency Coimbatore contact, software company Coimbatore contact",
  },
};
