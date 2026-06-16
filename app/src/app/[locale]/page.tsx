import { setRequestLocale } from "next-intl/server";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ConsoleEasterEgg } from "@/components/ConsoleEasterEgg";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/sections/Hero";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { Stack } from "@/components/sections/Stack";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <ThemeProvider>
      <ConsoleEasterEgg />
      <Nav />
      <main>
        <Hero />
        <SelectedWork />
        <Stack />
        <About />
        <Contact />
      </main>
      <Footer />
    </ThemeProvider>
  );
}
