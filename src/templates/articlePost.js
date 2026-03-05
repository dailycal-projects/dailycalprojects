import React from "react";
import { graphql, Link } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

import Layout from "../components/layout";
import SEO from "../components/seo";
import ArticleFooter from "../components/articleFooter";
import { ScopeInjector } from "../components/scopeInjector";

import logo from "../images/dclogoblack.png";

const ArticlePost = ({ data, location, children }) => {
  const { frontmatter } = data.mdx;
  const theme = useTheme();

  const {
    bylineName,
    bylineUrl,
  } = frontmatter;

  const image = getImage(frontmatter.featuredImage);
  const socialImage = frontmatter.featuredImage
    ? frontmatter.featuredImage.childImageSharp.resize
    : null;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pt: 10,
        px: 2,
      }}
    >
      {/* Top bar */}
      <Link to="/" style={{ textDecoration: "none" }}>
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: 50,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "background.default",
            borderBottom: "1px solid #D3D3D3",
            zIndex: 9999,
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="The Daily Californian"
            sx={{ height: 20, mt: "25px" }}
          />
        </Box>
      </Link>

      <Layout localImages={frontmatter.embeddedImages}>
        <SEO
          title={frontmatter.title}
          description={frontmatter.subhead}
          image={socialImage}
          pathname={location.pathname}
        />

        {/* Header */}
        <Box
          sx={{
            maxWidth: 640,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h3" component="h1">
            {frontmatter.title}
          </Typography>

          <Typography variant="h5" color="text.secondary">
            {frontmatter.subhead}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ mt: 2 }}>
          {frontmatter.date}
        </Typography>

        {/* Hero Image */}
        {!frontmatter.hideHeroImage && image && (
          <Box sx={{ maxWidth: 640, mt: 3 }}>
            <GatsbyImage image={image} />

            <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
              <em>{frontmatter.imageCaption1}</em>
            </Typography>

            <Typography variant="body2" sx={{ mt: 1 }}>
              {frontmatter.imageAttribution}
            </Typography>
          </Box>
        )}

        {/* Article Body */}
        <Box
          sx={{
            fontFamily: "Georgia, serif",
            fontSize: "1.0625rem",
            maxWidth: 640,
            mt: 4,
          }}
        >
          {(bylineName && bylineUrl) && (
            <Typography variant="body2" sx={{ mb: 3 }}>
              By{" "}
              {bylineName.map((author, i) => {
                const url = bylineUrl[i];
                const isLast = i === bylineName.length - 1;
                const isSecondToLast = i === bylineName.length - 2;

                return (
                  <React.Fragment key={i}>
                    <Box
                      component="a"
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      sx={{
                        color: "primary.main",
                        textDecoration: "underline",
                      }}
                    >
                      {author}
                    </Box>

                    {bylineName.length > 2 &&
                      !isLast &&
                      !isSecondToLast &&
                      ", "}
                    {isSecondToLast ? " & " : ""}
                  </React.Fragment>
                );
              })}
            </Typography>
          )}

          <ScopeInjector scope={{ localImages: frontmatter.embeddedImages }}>
            {children}
          </ScopeInjector>
        </Box>

        <ArticleFooter about={frontmatter.aboutStory} />
      </Layout>
    </Box>
  );
};

export const pageQuery = graphql`
  query($slug: String!) {
    mdx(fields: { slug: { eq: $slug } }) {
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        title
        bylineName
        bylineUrl
        subhead
        aboutStory
        hideHeroImage
        featuredImage {
          childImageSharp {
            resize(width: 1200) {
              src
              height
              width
            }
            gatsbyImageData(width: 750)
          }
        }
        imageAttribution
        imageCaption1
        embeddedImages {
          childImageSharp {
            gatsbyImageData
          }
        }
      }
    }
  }
`;

export default ArticlePost;