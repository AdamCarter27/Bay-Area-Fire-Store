import { Hero } from "@/components/home/Hero";
import { FeaturedCollection } from "@/components/home/FeaturedCollection";
import { CustomWorkDeck } from "@/components/home/CustomWorkDeck";
import { CollectionsTeaser } from "@/components/home/CollectionsTeaser";
import { StoryStrip } from "@/components/home/StoryStrip";

export default function Home() {
  return (
    // -mt pulls the hero flush under the transparent header (= header height, 71px).
    <div className="relative -mt-[71px]">
      <Hero />
      <div className="relative z-10 bg-paper">
        <FeaturedCollection />
        <CustomWorkDeck />
        <CollectionsTeaser />
        <StoryStrip />
      </div>
    </div>
  );
}
