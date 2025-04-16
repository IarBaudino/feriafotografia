import About from "@/components/About/About";
import Editions from "@/components/Editions/Editions";
import Hero from "@/components/Hero/Hero";
import Calls from "@/components/Calls/Calls";
import Exhibitions from "@/components/Exibitions/Exhibitions";
import Team from "@/components/Team/Team";
import Contact from "@/components/Contact/Contact";
import SectionDivider from "@/components/ui/SectionDivider";

export default function Home() {
  return (
    <main>
      <Hero />
      <SectionDivider fromColor="#3757b1" toColor="#f4f3ee" />
      <About />
      <SectionDivider fromColor="#f4f3ee" toColor="#3757b1" />
      <Editions />
      <SectionDivider fromColor="#3757b1" toColor="#f4f3ee" />
      <Exhibitions />
      <SectionDivider fromColor="#f4f3ee" toColor="#3757b1" />
      <Calls />
      <SectionDivider fromColor="#3757b1" toColor="#f4f3ee" />
      <Team />
      <SectionDivider fromColor="#f4f3ee" toColor="#3757b1" />
      <Contact />
    </main>
  );
}
