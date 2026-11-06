import { PageBanner } from "./page-banner";
export function LeadershipContent() {
  return (
    <>
      <PageBanner
        eyebrow={<>Governance</>}
        label="Leadership"
        title={<>Led by a founding bench, governed by charter.</>}
        description={
          <>
            GLF is directed by a Central Council, a bench of chapter presidents
            and an advisory body of senior counsel, a structure built for
            accountability across borders.
          </>
        }
        path="/leadership"
      />

      <section className="sec" id="leadership">
        <div className="spine"></div>
        <div className="wrap">
          <div className="gov">
            <article className="gov-card reveal">
              <div className="tier">The Presidency</div>
              <h3>Office of the Chairman</h3>
              <ul>
                <li>Chairman</li>
                <li>Deputy President</li>
                <li>Secretary-General</li>
                <li>Treasurer &amp; Registrar</li>
              </ul>
            </article>
            <article className="gov-card reveal d1">
              <div className="tier">The Bench</div>
              <h3>Chapter Presidents</h3>
              <ul>
                <li>President, UK Chapter</li>
                <li>President, USA Chapter</li>
                <li>President, Pakistan Chapter</li>
                <li>President, Saudi Arabia Chapter</li>
                <li>President, Canada Chapter</li>
                <li>President, Turkey Chapter</li>
                <li>President, EU Chapter</li>
                <li>President, UAE Chapter</li>
              </ul>
            </article>
            <article className="gov-card reveal d2">
              <div className="tier">Advisory</div>
              <h3>Council of Benchers</h3>
              <ul>
                <li>Senior Counsel &amp; King's Counsel</li>
                <li>Committee on Human Rights</li>
                <li>Committee on Legal Education</li>
                <li>Committee on Ethics &amp; Standards</li>
              </ul>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
