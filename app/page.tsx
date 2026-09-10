"use client";

import { useCallback, useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import SideNav from "@/components/SideNav";
import CommandPalette from "@/components/CommandPalette";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Education from "@/components/Education";
import Research from "@/components/Research";
import Log from "@/components/Log";
import Projects from "@/components/Projects";
import Results from "@/components/Results";
import Stack from "@/components/Stack";
import RepoIndex from "@/components/RepoIndex";
import ToyProjects from "@/components/ToyProjects";
import Hobbies from "@/components/Hobbies";
import Footer from "@/components/Footer";

export default function Page() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable;
      if (typing) return;
      if (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <TopBar onOpenPalette={openPalette} />
      <SideNav />
      <main>
        <Hero />
        <About />
        <Education />
        <Research />
        <Log />
        <Projects />
        <Results />
        <Stack />
        <RepoIndex />
        <ToyProjects />
        <Hobbies />
      </main>
      <Footer />
      <CommandPalette open={paletteOpen} onClose={closePalette} />
    </>
  );
}
