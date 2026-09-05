import React, { lazy, Suspense, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Nav } from "./Nav.jsx";
import { Footer } from "./Footer.jsx";
import { GSAPScrollEngine } from "../hooks/useGSAPScroll.jsx";
import { useSEO } from "../hooks/useSEO.js";

const Nexi = lazy(() => import("./Nexi.jsx").then((m) => ({ default: m.Nexi })));
const Cursor = lazy(() => import("./Cursor.jsx").then((m) => ({ default: m.Cursor })));
const CallButton = lazy(() =>
  import("./CallButton.jsx").then((m) => ({ default: m.CallButton }))
);

const EASE = [0.22, 1, 0.36, 1];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

// Defer non-critical UI (AI assistant + custom cursor) until after first paint.
function useDeferredMount(delay = 1200) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), delay);
    const onIdle =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(() => setReady(true), { timeout: 2600 })
        : null;
    return () => {
      clearTimeout(t);
      if (onIdle) window.cancelIdleCallback(onIdle);
    };
  }, [delay]);
  return ready;
}

function DeferredExtras() {
  const ready = useDeferredMount();
  if (!ready) return null;
  return (
    <Suspense fallback={null}>
      <GSAPScrollEngine />
      <Nexi />
      <CallButton />
      <Cursor />
    </Suspense>
  );
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
      <DeferredExtras />
    </>
  );
}