const { paginate } = require('gatsby-awesome-pagination')
const { forEach, uniq, filter, not, isNil, flatMap } = require('rambdax')
const path = require('path')
const { toKebabCase } = require('./src/helpers')

const pageTypeRegex = /src\/(.*?)\//
const getType = node => node.fileAbsolutePath.match(pageTypeRegex)[1]

const pageTemplate = path.resolve(`./src/templates/page.js`)
const indexTemplate = path.resolve(`./src/templates/index.js`)
const tagsTemplate = path.resolve(`./src/templates/tags.js`)

exports.createPages = ({ actions, graphql, getNodes }) => {
  const { createPage } = actions
  const allNodes = getNodes()

  return graphql(`
    {
      allMarkdownRemark(
        sort: { fields: [frontmatter___date], order: DESC }
        limit: 1000
      ) {
        edges {
          node {
            frontmatter {
              path
              title
              tags
            }
            fileAbsolutePath
          }
        }
      }
      site {
        siteMetadata {
          notesPerPage
        }
      }
    }
  `).then(result => {
    if (result.errors) {
      return Promise.reject(result.errors)
    }

    const {
      allMarkdownRemark: { edges: markdownPages },
      site: { siteMetadata },
    } = result.data

    const sortedPages = markdownPages.sort((pageA, pageB) => {
      const typeA = getType(pageA.node)
      const typeB = getType(pageB.node)

      return (typeA > typeB) - (typeA < typeB)
    })

    const notes = allNodes.filter(
      ({ internal, fileAbsolutePath }) =>
        internal.type === 'MarkdownRemark' &&
        fileAbsolutePath.indexOf('/notes/') !== -1,
    )

    // Create notes index with pagination
    paginate({
      createPage,
      items: notes,
      component: indexTemplate,
      itemsPerPage: siteMetadata.notesPerPage,
      pathPrefix: '/',
    })

    // Create each markdown page and note
    forEach(({ node }, index) => {
      const previous = index === 0 ? null : sortedPages[index - 1].node
      const next =
        index === sortedPages.length - 1 ? null : sortedPages[index + 1].node
      const isNextSameType = getType(node) === (next && getType(next))
      const isPreviousSameType =
        getType(node) === (previous && getType(previous))

      createPage({
        path: node.frontmatter.path,
        component: pageTemplate,
        context: {
          type: getType(node),
          next: isNextSameType ? next : null,
          previous: isPreviousSameType ? previous : null,
        },
      })
    }, sortedPages)

    // Create tag pages
    const tags = filter(
      tag => not(isNil(tag)),
      uniq(flatMap(note => note.frontmatter.tags, notes)),
    )

    forEach(tag => {
      const notesWithTag = notes.filter(
        note =>
          note.frontmatter.tags && note.frontmatter.tags.indexOf(tag) !== -1,
      )

      paginate({
        createPage,
        items: notesWithTag,
        component: tagsTemplate,
        itemsPerPage: siteMetadata.notesPerPage,
        pathPrefix: `/tag/${toKebabCase(tag)}`,
        context: {
          tag,
        },
      })
    }, tags)

    return {
      sortedPages,
      tags,
    }
  })
}

exports.sourceNodes = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
    type MarkdownRemark implements Node {
      frontmatter: Frontmatter!
    }

    type Frontmatter {
      title: String!
      author: String
      date: Date! @dateformat
      path: String!
      tags: [String!]
      excerpt: String
      coverImage: File @fileByRelativePath
    }
  `
  createTypes(typeDefs)
}
