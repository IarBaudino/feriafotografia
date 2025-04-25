import About from "@/components/About/About";
import Calls from "@/components/Calls/Calls";
import Team from "@/components/Team/Team";
import Contact from "@/components/Contact/Contact";
import Hero from "@/components/Hero/Hero";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Calls />
      <Team />
      <Contact />
    </main>
  );
}
