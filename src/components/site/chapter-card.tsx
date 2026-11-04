export interface Chapter {
  code: string;
  name: string;
  description: string;
  city: string;
}
export function ChapterCard({
  chapter,
  index,
}: {
  chapter: Chapter;
  index: number;
}) {
  return (
    <article className={`chap reveal${index % 4 ? ` d${index % 4}` : ""}`}>
      <div className="flag">{chapter.code}</div>
      <h3>{chapter.name}</h3>
      <p>{chapter.description}</p>
      <div className="city">
        <i className="dot" />
        {chapter.city}
      </div>
      <div className="line" />
    </article>
  );
}
