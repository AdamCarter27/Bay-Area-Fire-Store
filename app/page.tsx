import { Hero } from "@/components/home/Hero";
import { FeaturedCollection } from "@/components/home/FeaturedCollection";
import { CustomWorkDeck } from "@/components/home/CustomWorkDeck";
import { CollectionsTeaser } from "@/components/home/CollectionsTeaser";
import { FeatureDepartmentSection } from "@/components/home/FeatureDepartment";
import { StoryStrip } from "@/components/home/StoryStrip";
import { Slideshow } from "@/components/home/Slideshow";

export default function Home() {
  return (
    // -mt pulls the hero flush under the transparent header (= header height, 71px).
    <div className="relative -mt-[71px]">
      <Hero />
      <div className="relative z-10 bg-paper">
        <Slideshow />
        <FeaturedCollection />
        <CustomWorkDeck />
        <CollectionsTeaser />
        <FeatureDepartmentSection />
        <StoryStrip />
      </div>
    </div>
  );
}
