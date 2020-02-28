import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'gatsby'
import Img from 'gatsby-image'
import Navigation from './navigation'
import { toKebabCase } from '../helpers'

import style from '../styles/note.module.css'

const Note = ({
  title,
  date,
  path,
  coverImage,
  author,
  excerpt,
  tags,
  html,
  previousNote,
  nextNote,
}) => {
  const previousPath = previousNote && previousNote.frontmatter.path
  const previousLabel = previousNote && previousNote.frontmatter.title
  const nextPath = previousNote && nextNote.frontmatter.path
  const nextLabel = nextNote && nextNote.frontmatter.title

  return (
    <div className={style.note}>
      <div className={style.noteContent}>
        <h1 className={style.title}>
          {excerpt ? <Link to={path}>{title}</Link> : title}
        </h1>
        <div className={style.meta}>
          {date} {author && <>— Written by {author}</>}
          {tags ? (
            <div className={style.tags}>
              {tags.map(tag => (
                <Link to={`/tag/${toKebabCase(tag)}/`} key={toKebabCase(tag)}>
                  <span className={style.tag}>#{tag}</span>
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        {coverImage && (
          <Img
            fluid={coverImage.childImageSharp.fluid}
            className={style.coverImage}
          />
        )}

        {excerpt ? (
          <>
            <p>{excerpt}</p>
            <Link to={path} className={style.readMore}>
              Read more →
            </Link>
          </>
        ) : (
          <>
            <div dangerouslySetInnerHTML={{ __html: html }} />
            <Navigation
              previousPath={previousPath}
              previousLabel={previousLabel}
              nextPath={nextPath}
              nextLabel={nextLabel}
            />
          </>
        )}
      </div>
    </div>
  )
}

Note.propTypes = {
  title: PropTypes.string,
  date: PropTypes.string,
  path: PropTypes.string,
  coverImage: PropTypes.object,
  author: PropTypes.string,
  excerpt: PropTypes.string,
  html: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  previousNote: PropTypes.object,
  nextNote: PropTypes.object,
}

export default Note
