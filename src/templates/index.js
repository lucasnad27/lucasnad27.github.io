import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'
import SEO from '../components/seo'
import Layout from '../components/layout'
import Note from '../components/note'
import Navigation from '../components/navigation'

const Index = ({ data, pageContext: { nextPagePath, previousPagePath } }) => {
  const {
    allMarkdownRemark: { edges: notes },
  } = data

  return (
    <>
      <SEO />
      <Layout>
        {notes.map(({ node }) => {
          const {
            id,
            excerpt: autoExcerpt,
            frontmatter: {
              title,
              date,
              path,
              author,
              coverImage,
              excerpt,
              tags,
            },
          } = node

          return (
            <Note
              key={id}
              title={title}
              date={date}
              path={path}
              author={author}
              coverImage={coverImage}
              tags={tags}
              excerpt={excerpt || autoExcerpt}
            />
          )
        })}

        <Navigation
          previousPath={previousPagePath}
          previousLabel="Newer notes"
          nextPath={nextPagePath}
          nextLabel="Older notes"
        />
      </Layout>
    </>
  )
}

Index.propTypes = {
  data: PropTypes.object.isRequired,
  pageContext: PropTypes.shape({
    nextPagePath: PropTypes.string,
    previousPagePath: PropTypes.string,
  }),
}

export const notesQuery = graphql`
  query($limit: Int!, $skip: Int!) {
    allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "//notes//" } }
      sort: { fields: [frontmatter___date], order: DESC }
      limit: $limit
      skip: $skip
    ) {
      edges {
        node {
          id
          excerpt
          frontmatter {
            title
            date(formatString: "DD MMMM YYYY")
            path
            author
            excerpt
            tags
            coverImage {
              childImageSharp {
                fluid(maxWidth: 800) {
                  ...GatsbyImageSharpFluid
                }
              }
            }
          }
        }
      }
    }
  }
`

export default Index
