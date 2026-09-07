import React from "react";
import { Hero } from "../components/Hero.jsx";
import { Marquee } from "../components/Marquee.jsx";
import { Values } from "../components/Values.jsx";
import { Services } from "../components/Services.jsx";
import { ServicesShowcase } from "../components/ServicesShowcase.jsx";
import { Industries } from "../components/Industries.jsx";
import { Callout } from "../components/Callout.jsx";
import { Packages } from "../components/Packages.jsx";
import { Portfolio } from "../components/Portfolio.jsx";
import { Testimonial } from "../components/Testimonial.jsx";
import { CTA } from "../components/CTA.jsx";
import { InternationalClients } from "../components/InternationalClients.jsx";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee dark />
      <Values />
      <Services />
      <ServicesShowcase />
      <InternationalClients />
      <Industries />
      <Marquee parallax />
      <Callout />
      <Packages />
      <Portfolio />
      <Testimonial />
      <CTA />
    </>
  );
}