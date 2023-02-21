/* eslint-disable react/destructuring-assignment */
import { Col, Image, Rate } from 'antd'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import Context from '../context/context'
import './movie-card.css'

export default class MovieCard extends Component {
  constructor() {
    super()
    this.state = {
      currentRating: null,
    }
    this.imgBase = 'https://image.tmdb.org/t/p/w500'

    this.onMovieRateHandler = (value) => {
      const { movieId, onMovieRate } = this.props
      onMovieRate(value, movieId).then(() => this.setState({ currentRating: value }))
    }
    this.returnGenres = (genres) => {
      const { title } = this.props
      return genres.map(({ id, name }) => {
        if (this.props.genreIds.find((genreId) => genreId === id)) {
          return (
            <span key={`${title}-${id}`} className="genre">
              {name}
            </span>
          )
        } else {
          return null
        }
      })
    }
    this.ratedCircleColor = (voteAverage) => {
      return voteAverage > 7 ? '#66E900' : voteAverage > 5 ? '#E9D100' : voteAverage > 3 ? '#E97E00' : 'E90000'
    }
  }

  render() {
    const { title, imgPath, description, releaseDate, voteAverage, rating } = this.props
    const imgLink = this.imgBase + imgPath
    const image = imgPath ? <Image width="100%" src={imgLink} alt={title} /> : null

    return (
      <Col xs={24} md={12}>
        <div className="single-movie">
          <div className="single-movie__img">{image}</div>
          <div className="single-movie__info">
            <div className="single-movie__header">
              <h5 className="single-movie__title">{title}</h5>
              <div className="single-movie__date">{releaseDate}</div>
              <div className="single-movie__genres">
                <Context.Consumer>{(genres) => this.returnGenres(genres)}</Context.Consumer>
              </div>
            </div>
            <div className="single-movie__description">
              <p>{description}</p>
            </div>
            <Rate
              className="single-movie__stars"
              count={10}
              value={rating ? rating : this.state.currentRating}
              onChange={(value) => this.onMovieRateHandler(value)}
            />
          </div>
          <div style={{ borderColor: this.ratedCircleColor(voteAverage) }} className="single-movie__rate">
            {voteAverage.toFixed(1)}
          </div>
        </div>
      </Col>
    )
  }
}

MovieCard.propTypes = {
  movieId: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  voteAverage: PropTypes.number.isRequired,
}
