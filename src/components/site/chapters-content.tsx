import chapters from "@/content/chapters.json";
import { ChapterCard } from "./chapter-card";
import { PageBanner } from "./page-banner";
export function ChaptersContent() {
  return (
    <>
      <PageBanner
        eyebrow={<>The Federation</>}
        label="Chapters"
        title={<>Eight chapters, threaded by a single meridian of justice.</>}
        description={
          <>
            Each chapter is rooted in its own legal culture and answerable to a
            shared charter. Together they form one Forum a client can trust
            across continents.
          </>
        }
        path="/chapters"
      />

      <section className="sec chapters" id="chapters">
        <div className="wrap">
          <div className="grid">
            {chapters.map((chapter, index) => (
              <ChapterCard key={chapter.code} chapter={chapter} index={index} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
