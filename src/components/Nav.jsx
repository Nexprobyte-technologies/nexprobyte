import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, NavLink, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Home", to: "/", ord: "01" },
  { label: "About", to: "/about", ord: "02" },
  {
    id: "services-products",
    label: "What We Do",
    ord: "03",
    isDropdown: true,
    activePrefixes: ["/services"],
    sections: [
      {
        title: "Services",
        items: [
          { label: "All Services", to: "/services", icon: "⚡" },
          { label: "Website Development", to: "/services/website-development", icon: "🌐" },
          { label: "Mobile App Development", to: "/services/mobile-app-development", icon: "📱" },
          { label: "Application Development", to: "/services/application-development", icon: "💻" },
          { label: "UI/UX Design", to: "/services/ui-ux-design", icon: "🎨" },
          { label: "Branding & Identity", to: "/services/branding-identity", icon: "✨" },
          { label: "Digital Marketing & SEO", to: "/services/digital-marketing", icon: "🚀" },
        ],
      },
      {
        title: "Our Products",
        items: [
          { label: "GO Drive", href: "#", icon: "💾", isExternal: true },
          { label: "Download Android App", href: "#", icon: "📲", isExternal: true },
          { label: "Visit Site", href: "#", icon: "🔗", isExternal: true },
        ],
      },
    ],
  },
  {
    id: "careers-blog",
    label: "Resources",
    ord: "04",
    isDropdown: true,
    activePrefixes: ["/careers", "/blog"],
    sections: [
      {
        title: "Careers",
        items: [
          {
            label: "Explore Opportunities",
            to: "/careers",
            icon: "💼",
            subtext: "Open tech roles & engineering positions",
          },
          {
            label: "Apply for a Role",
            to: "/careers",
            icon: "🚀",
            subtext: "Join our Coimbatore digital team",
          },
        ],
      },
      {
        title: "Blog & Insights",
        items: [
          {
            label: "Tech & Case Studies",
            to: "/blog",
            icon: "📰",
            subtext: "Articles, insights & industry stories",
          },
          {
            label: "Digital Trends",
            to: "/blog",
            icon: "💡",
            subtext: "SEO, AI & Modern Web Development",
          },
        ],
      },
    ],
  },
  { label: "Contact", to: "/contact", ord: "05" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState({});
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "night");
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [open]);

  // Close mobile menu & dropdowns on route changes
  useEffect(() => {
    setOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const toggleMobileGroup = (id) => {
    setMobileExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <>
      <header className={`nav ${scrolled ? "is-scrolled" : ""}`}>
        <div className="wrap nav-inner">
          <motion.span
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link to="/" className="logo" onClick={() => setOpen(false)}>
              <img
                src="/images/nxtpro-logo.png"
                alt="Nexprobyte"
                className="logo-img"
              />
            </Link>
          </motion.span>

          {/* Desktop Navigation */}
          <nav className="nav-links" aria-label="Main">
            {NAV_ITEMS.map((item, i) =>
              item.isDropdown ? (
                <motion.span
                  key={item.id}
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.05 * i + 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div
                    className={`nav-dropdown-wrapper ${activeDropdown === item.id ? "is-open" : ""}`}
                    onMouseEnter={() => setActiveDropdown(item.id)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      className={`nav-link nav-dropdown-btn ${
                        item.activePrefixes?.some((p) => location.pathname.startsWith(p))
                          ? "is-active"
                          : ""
                      }`}
                      aria-expanded={activeDropdown === item.id}
                      type="button"
                      onClick={() =>
                        setActiveDropdown((curr) => (curr === item.id ? null : item.id))
                      }
                    >
                      {item.label}
                      <span className={`nav-caret ${activeDropdown === item.id ? "is-open" : ""}`}>
                        ▼
                      </span>
                    </button>

                    <AnimatePresence>
                      {activeDropdown === item.id && (
                        <motion.div
                          className={`nav-dropdown ${
                            item.sections.length > 1 ? "nav-dropdown--wide" : ""
                          }`}
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        >
                          {item.sections.map((sec, sIdx) => (
                            <div key={sec.title || sIdx} className="nav-dropdown-section">
                              {sec.title && (
                                <div className="nav-dropdown-section-title">{sec.title}</div>
                              )}
                              <div className="nav-dropdown-items-group">
                                {sec.items.map((sub) =>
                                  sub.isExternal ? (
                                    <a
                                      key={sub.label}
                                      href={sub.href}
                                      className="nav-dropdown-link"
                                      onClick={() => setActiveDropdown(null)}
                                    >
                                      <div className="nav-dropdown-link-left">
                                        <span className="nav-dropdown-icon">{sub.icon}</span>
                                        <div>
                                          <span className="nav-dropdown-label">{sub.label}</span>
                                          {sub.subtext && (
                                            <span className="nav-dropdown-subtext">
                                              {sub.subtext}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <span className="arr">→</span>
                                    </a>
                                  ) : (
                                    <Link
                                      key={sub.label}
                                      to={sub.to}
                                      className="nav-dropdown-link"
                                      onClick={() => setActiveDropdown(null)}
                                    >
                                      <div className="nav-dropdown-link-left">
                                        <span className="nav-dropdown-icon">{sub.icon}</span>
                                        <div>
                                          <span className="nav-dropdown-label">{sub.label}</span>
                                          {sub.subtext && (
                                            <span className="nav-dropdown-subtext">
                                              {sub.subtext}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <span className="arr">→</span>
                                    </Link>
                                  )
                                )}
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.span>
              ) : (
                <motion.span
                  key={item.to}
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.05 * i + 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}
                  >
                    {item.label}
                  </NavLink>
                </motion.span>
              )
            )}
          </nav>

          {/* Right Hamburger / CTA Area */}
          <div className="nav-right">
            <Link to="/contact" className="btn btn-solid nav-cta-btn">
              Get in Touch <span className="arr">→</span>
            </Link>
            <button
              className="menu-btn"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              type="button"
            >
              <span className="menu-btn-icon">
                <span className="bar"></span>
                <span className="bar"></span>
              </span>
              <span className="menu-btn-label">Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fullscreen Navigation Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="mobile-menu-panel"
              initial={{ y: "-100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Mobile Header Top */}
              <div className="mobile-menu-head">
                <Link to="/" className="logo" onClick={() => setOpen(false)}>
                  <img
                    src="/images/nxtpro-logo.png"
                    alt="Nexprobyte"
                    className="logo-img"
                  />
                </Link>
                <button
                  type="button"
                  className="mobile-menu-close"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  <span>✕</span>
                  <span style={{ fontSize: 13, fontWeight: 700, marginLeft: 6 }}>Close</span>
                </button>
              </div>

              {/* Mobile Scrollable Menu Links */}
              <div className="mobile-menu-body">
                <nav className="mobile-nav-list">
                  {NAV_ITEMS.map((item, i) => (
                    <motion.div
                      key={item.label}
                      className="mobile-nav-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 + i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {item.isDropdown ? (
                        <div className="mobile-product-group">
                          <button
                            type="button"
                            className="mobile-link mobile-product-btn"
                            onClick={() => toggleMobileGroup(item.id)}
                          >
                            <span>
                              <span className="ord">{item.ord}</span>
                              {item.label}
                            </span>
                            <span
                              className={`mobile-caret ${mobileExpanded[item.id] ? "is-open" : ""}`}
                            >
                              {mobileExpanded[item.id] ? "−" : "+"}
                            </span>
                          </button>

                          <AnimatePresence>
                            {mobileExpanded[item.id] && (
                              <motion.div
                                className="mobile-sub"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                              >
                                {item.sections.map((sec, sIdx) => (
                                  <div key={sec.title || sIdx} style={{ marginBottom: 12 }}>
                                    {sec.title && (
                                      <div
                                        style={{
                                          fontSize: 11,
                                          fontWeight: 700,
                                          letterSpacing: "0.08em",
                                          textTransform: "uppercase",
                                          color: "var(--accent)",
                                          marginBottom: 6,
                                        }}
                                      >
                                        {sec.title}
                                      </div>
                                    )}
                                    {sec.items.map((sub) =>
                                      sub.isExternal ? (
                                        <a
                                          key={sub.label}
                                          href={sub.href}
                                          className="mobile-sub-link"
                                          onClick={() => setOpen(false)}
                                        >
                                          <span style={{ marginRight: 6 }}>{sub.icon}</span>
                                          <span>{sub.label}</span>
                                          <span className="arr">→</span>
                                        </a>
                                      ) : (
                                        <Link
                                          key={sub.label}
                                          to={sub.to}
                                          className="mobile-sub-link"
                                          onClick={() => setOpen(false)}
                                        >
                                          <span style={{ marginRight: 6 }}>{sub.icon}</span>
                                          <span>{sub.label}</span>
                                          <span className="arr">→</span>
                                        </Link>
                                      )
                                    )}
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <NavLink
                          to={item.to}
                          className={({ isActive }) =>
                            `mobile-link ${isActive ? "is-active" : ""}`
                          }
                          onClick={() => setOpen(false)}
                        >
                          <span className="ord">{item.ord}</span>
                          {item.label}
                        </NavLink>
                      )}
                    </motion.div>
                  ))}
                </nav>

                {/* Mobile Bottom CTA & Quick Contacts */}
                <div className="mobile-menu-footer">
                  <Link
                    to="/contact"
                    className="btn btn-solid mobile-cta-btn"
                    onClick={() => setOpen(false)}
                  >
                    Get a quote <span className="arr">→</span>
                  </Link>

                  <div className="mobile-contacts-row">
                    <a href="tel:+919500042426" className="mobile-contact-pill">
                      📞 +91 95000 42426
                    </a>
                    <a href="mailto:info@nexprobyte.com" className="mobile-contact-pill">
                      ✉️ info@nexprobyte.com
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}