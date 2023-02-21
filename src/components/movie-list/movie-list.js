/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable react/jsx-fragments */
import { Alert, Row, Spin } from 'antd'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import MovieCard from '../movie-card'
import './movie-list.css'

export default class MoviesList extends Component {
  constructor(props) {
    super(props)
    this.renderCards = () => {
      const { data, onMovieRate } = this.props

      return data.map(({ id, title, description, posterPath, releaseDate, genreIds, voteAverage, rating }) => {
        return (
          <MovieCard
            key={id}
            title={title}
            description={description}
            imgPath={posterPath}
            releaseDate={releaseDate}
            genreIds={genreIds}
            voteAverage={voteAverage}
            onMovieRate={onMovieRate}
            movieId={id}
            rating={rating}
          />
        )
      })
    }
  }

  render() {
    const { status, data } = this.props
    if (data !== null && data.length === 0) {
      return (
        <React.Fragment>
          <Alert
            message="Movies results: 0"
            description="No movies were found within your search, try another"
            type="info"
            showIcon
          />
        </React.Fragment>
      )
    }
    switch (status) {
      case 'error':
        return <Alert message="Something went wrong" description="Can't get movies" type="error" showIcon />
      case 'loading':
        return <Spin size="large" />
      case 'success':
        return (
          <Row gutter={[32, 32]} className="movies-list">
            {this.renderCards()}
          </Row>
        )
      default:
        return
    }
  }
}
MoviesList.defaultProps = {
  data: null,
  status: 0,
  onMovieRate: () => {},
}

MoviesList.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      releaseDate: PropTypes.string,
      voteAverage: PropTypes.number.isRequired,
      rating: PropTypes.number,
      genres: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number.isRequired,
          name: PropTypes.string.isRequired,
        })
      ),
    })
  ),
  status: PropTypes.string,
  onMovieRate: PropTypes.func,
}
