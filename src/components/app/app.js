/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react'
import { Pagination } from 'antd'
import { Offline } from 'react-detect-offline'

import './app.css'
import MovieList from '../movie-list/movie-list'
import Header from '../header'
import MovieService from '../../utilities/movie-service'
import Context from '../context/context'

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      status: '',
      data: null,
      page: 1,
      searchQuery: null,
      total_results: 0,
    }
    this.movieService = new MovieService()

    this.onSearch = (query) => {
      if (query === '') {
        this.setState({ data: null, status: '' })
        return
      }
      const promise = new Promise((resolve) => {
        this.setState({ status: 'loading', searchQuery: query })
        resolve(this.movieService.getResources(query))
      })
      promise
        .then(({ results, total_results, page }) => {
          return {
            results: results.map(this.movieService._transformMovieData),
            total_results,
            page,
          }
        })
        .then(({ results, total_results, page }) => {
          this.setState({
            data: results ? results : [],
            status: 'success',
            total_results,
            page,
          })
        })
        .catch(() => {
          this.setState({ status: 'error' })
        })
    }

    this.onPaginationChange = (page) => {
      const promise = new Promise((resolve) => {
        this.setState({ status: 'loading' })
        resolve(this.movieService.getResources(this.state.searchQuery, page))
      })
      promise
        .then(({ results, page, total_results }) => ({
          results: results.map(this.movieService._transformMovieData),
          page,
          total_results,
        }))
        .then(({ results, page, total_results }) => {
          this.setState({
            data: results,
            status: 'success',
            page,
            total_results,
          })
        })
        .catch(() => {
          this.setState({ status: 'error' })
        })
    }

    this.onMovieRate = async (value, movieId) => {
      this.movieService.rateMovie(value, movieId)
    }

    this.onRatedTab = () => {
      this.setState({ status: 'loading' })
      this.movieService
        .getRatedMovies()
        .then(({ results, page, total_results }) => {
          const newRes = results.map(this.movieService._transformMovieData)
          this.setState({
            data: newRes,
            page,
            total_results,
            status: 'success',
          })
        })
        .catch(() => {
          this.setState({ status: 'error' })
        })
    }
  }

  componentDidMount() {
    this.movieService
      .createGuestSession()
      .then(() => this.movieService.getGenres())
      .then(({ genres }) => {
        this.setState({ genres })
      })
      .catch(() => {
        this.setState({ status: 'error' })
      })
  }

  render() {
    const { status, data } = this.state

    const showPagination =
      status === '' ? null : (
        <Pagination
          className="pagination"
          current={this.state.page}
          onChange={(num) => this.onPaginationChange(num)}
          total={this.state.total_results}
          pageSize={20}
          showSizeChanger={false}
          showLessItems
          showQuickJumper={false}
          showTotal={false}
          hideOnSinglePage
        />
      )

    return (
      <div className="app">
        <Header
          onEdit={this.onEdit}
          editInput={this.editInput}
          searchQuery={this.searchQuery}
          onSearch={this.onSearch}
          onRatedTab={this.onRatedTab}
        />
        <Context.Provider value={this.state.genres}>
          <MovieList data={data} status={status} onMovieRate={this.onMovieRate} />
        </Context.Provider>
        {showPagination}
        <Offline>You are currently offline</Offline>
      </div>
    )
  }
}
