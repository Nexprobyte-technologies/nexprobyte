import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Nav } from "./Nav.jsx";
import { Footer } from "./Footer.jsx";
import { Nexi } from "./Nexi.jsx";
import { Cursor } from "./Cursor.jsx";
import { GSAPScrollEngine } from "../hooks/useGSAPScroll.jsx";
import { useSEO } from "../hooks/useSEO.js";

const EASE = [0.22, 1, 0.36, 1];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

export function Layout() {
  const { pathname } = useLocation();
  useSEO();

  return (
    <>
      <ScrollToTop />
      <Nav />
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        <Outlet />
      </motion.main>
      <Footer />
      <GSAPScrollEngine />
      <Nexi />
      <Cursor />
    </>
  );
}