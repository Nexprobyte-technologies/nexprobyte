import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, NavLink, useLocation } from "react-router-dom";

const LINKS = [
  { label: "Home", to: "/", ord: "01" },
  { label: "About", to: "/about", ord: "02" },
  { label: "Services", to: "/services", ord: "03" },
  {
    label: "Our Product",
    ord: "04",
    product: true,
    sub: [
      { label: "GO Drive", href: "#" },
      { label: "Download Android App", href: "#" },
      { label: "Visit Site", href: "#" },
    ],
  },
  { label: "Careers", to: "/careers", ord: "05" },
  { label: "Blog", to: "/blog", ord: "06" },
  { label: "Contact", to: "/contact", ord: "07" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [mobileProductOpen, setMobileProductOpen] = useState(false);
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

  // Close mobile menu on route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

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
                src="/assets/nxtpro.jpg.jpeg"
                alt="Nexprobyte"
                className="logo-img"
              />
            </Link>
          </motion.span>

          {/* Desktop Navigation */}
          <nav className="nav-links" aria-label="Main">
            {LINKS.map((l, i) =>
              l.product ? (
                <motion.span
                  key={l.label}
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.05 * i + 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div
                    className={`nav-product ${productOpen ? "is-open" : ""}`}
                    onClick={() => setProductOpen((v) => !v)}
                    onMouseEnter={() => setProductOpen(true)}
                    onMouseLeave={() => setProductOpen(false)}
                  >
                    <button className="nav-link" aria-expanded={productOpen} type="button">
                      {l.label}
                    </button>

                    <AnimatePresence>
                      {productOpen && (
                        <motion.div
                          className="nav-dropdown"
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        >
                          {l.sub.map((s) => (
                            <a
                              key={s.label}
                              href={s.href}
                              className="nav-dropdown-link"
                              onClick={() => setProductOpen(false)}
                            >
                              <span>{s.label}</span>
                              <span className="arr">→</span>
                            </a>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.span>
              ) : (
                <motion.span
                  key={l.to}
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.05 * i + 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <NavLink
                    to={l.to}
                    className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}
                  >
                    {l.label}
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
                    src="/assets/nxtpro.jpg.jpeg"
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
                  {LINKS.map((l, i) => (
                    <motion.div
                      key={l.label}
                      className="mobile-nav-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 + i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {l.product ? (
                        <div className="mobile-product-group">
                          <button
                            type="button"
                            className="mobile-link mobile-product-btn"
                            onClick={() => setMobileProductOpen((prev) => !prev)}
                          >
                            <span>
                              <span className="ord">{l.ord}</span>
                              {l.label}
                            </span>
                            <span className={`mobile-caret ${mobileProductOpen ? "is-open" : ""}`}>
                              {mobileProductOpen ? "−" : "+"}
                            </span>
                          </button>

                          <AnimatePresence>
                            {mobileProductOpen && (
                              <motion.div
                                className="mobile-sub"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                              >
                                {l.sub.map((s) => (
                                  <a
                                    key={s.label}
                                    href={s.href}
                                    className="mobile-sub-link"
                                    onClick={() => setOpen(false)}
                                  >
                                    <span>{s.label}</span>
                                    <span className="arr">→</span>
                                  </a>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <NavLink
                          to={l.to}
                          className={({ isActive }) =>
                            `mobile-link ${isActive ? "is-active" : ""}`
                          }
                          onClick={() => setOpen(false)}
                        >
                          <span className="ord">{l.ord}</span>
                          {l.label}
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