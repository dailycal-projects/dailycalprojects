import { assetBase } from "../host";
import { strings } from "../strings";

/** The Daily Californian wordmark bar, as on the story template on data.dailycal.org, over the finder. The
 * wordmark goes to the site's front page. */
export function Banner() {
  return (
    <header className="topbar">
      <a href={strings.banner.home}>
        <img src={`${assetBase}dailycal-wordmark.webp`} alt={strings.banner.masthead} />
      </a>
    </header>
  );
}
