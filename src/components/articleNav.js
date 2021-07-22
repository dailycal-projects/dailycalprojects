import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { GatsbyImage } from 'gatsby-plugin-image';
import { styles } from '../styles/customTheme';

const ArticleNav = ({
  classes,
}) => {
  const meta = { url: 'google.com', 'share-tweet': 'google.com', caption: 'ne' };
  return (
    <nav title="navigation">
      <div id="global-header">
        <div id="global-branding">
          <div className="navbar-dc-logo">
            <a href="http://www.dailycal.org/" title="The Daily Californian" target="_top">
              <GatsbyImage
                className="navbar-brand"
                image="http://projects.dailycal.org/images/masthead.png"
                alt={meta.caption}
              />
            </a>
          </div>
        </div>

        <ul className="nav navbar-nav navbar-right">
          <li>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(meta.url)}`}>
              <i className="fa fa-facebook" />
            </a>
          </li>
          <li>
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(meta.url)}&amp;via=dailycal&amp;text=${encodeURIComponent(meta.share_tweet)}`}>
              <i className="fa fa-twitter" />
            </a>
          </li>
        </ul>

      </div>
    </nav>
  );
};
export default withStyles(styles)(ArticleNav);
