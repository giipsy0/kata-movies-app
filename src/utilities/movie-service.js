import { format } from 'date-fns'

export default class MovieService {
  constructor() {
    this.apiBase = 'https://api.themoviedb.org/3'
    this.guest_session_id = null
  }

  getResources = async (searching = '', page = 1) => {
    const { results: ratedResults } = await this.getRatedMovies()

    const res = await fetch(
      `${this.apiBase}/search/movie/?query=${searching}&page=${page}&api_key=${process.env.REACT_APP_API_KEY}`
    )
    if (!res.ok) {
      throw new Error(res.status)
    }
    const body = await res.json()
    function getDifference(array1, array2) {
      return array1.map((object1) => {
        const withVote = array2.find((object2) => object1.title === object2.title)
        return withVote !== undefined ? withVote : object1
      })
    }
    const data = await getDifference(body.results, ratedResults)
    return { total_results: body.total_results, page: body.page, results: data }
  }

  _transformMovieData = ({ release_date, overview, ...movieData }) => {
    const trimText = (text) => text.slice(0, 120).split(' ').slice(0, -1).join(' ')
    const trimmedDesc = trimText(overview)
    const formattedDate = release_date ? format(new Date(release_date), 'MMMM d, yyyy') : null

    return {
      id: movieData.id,
      title: movieData.original_title,
      releaseDate: formattedDate,
      description: trimmedDesc,
      posterPath: movieData.poster_path,
      genreIds: movieData.genre_ids,
      voteAverage: movieData.vote_average,
      rating: movieData.rating,
    }
  }

  createGuestSession = async () => {
    const res = await fetch(`${this.apiBase}/authentication/guest_session/new?api_key=${process.env.REACT_APP_API_KEY}`)
    if (!res.ok) {
      throw new Error(res.status)
    }
    const body = await res.json()
    this.guest_session_id = body.guest_session_id
  }

  getRatedMovies = async () => {
    const res = await fetch(
      `${this.apiBase}/guest_session/${this.guest_session_id}/rated/movies?api_key=${process.env.REACT_APP_API_KEY}`
    )
    if (!res.ok) {
      throw new Error(res.status)
    }
    const body = await res.json()
    return body
  }

  rateMovie = async (rateValue, movieId) => {
    const res = await fetch(
      `${this.apiBase}/movie/${movieId}/rating?api_key=${process.env.REACT_APP_API_KEY}&guest_session_id=${this.guest_session_id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: rateValue }),
      }
    )
    const body = await res.json()
    return body
  }

  getGenres = async () => {
    const res = await fetch(`${this.apiBase}/genre/movie/list?api_key=${process.env.REACT_APP_API_KEY}&language=en-US`)
    const body = await res.json()
    return body
  }
}
