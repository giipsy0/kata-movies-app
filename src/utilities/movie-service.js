export default class MovieService {
  constructor() {
    this.apiBase = 'https://api.themoviedb.org/3';
    this._apiKey = 'a917d30ab508abf87a2c86f826a7e2c0';
  }

  fetchNewGuestSession = async () => {
    const query = `${this.apiBase}/authentication/guest_session/new?api_key=${this._apiKey}`;

    const res = await fetch(query)
      .then((data) => data.json())
      .catch((err) => {
        throw new Error(`Received: ${err}`);
      });
    return res.guest_session_id;
  };

  putSessionIdInLocalStorage = (data) => {
    try {
      localStorage.setItem("sessionId", JSON.stringify(data));
    } catch (e) {
      throw Error(e);
    }
  };

  createNewGuestSession = async () => {
    if (JSON.parse(localStorage.getItem("sessionId"))) {
      return;
    }

    const newGuestSession = await this.fetchNewGuestSession();
    this.putSessionIdInLocalStorage(newGuestSession);

    return JSON.parse(localStorage.getItem("sessionId"));
  };

  rateMovie = (movieId, rating) => {
    const ratingData = {
      value: rating,
    };

    let sessionId = JSON.parse(localStorage.getItem("sessionId"));

    if (!sessionId) {
      sessionId = this.createNewGuestSession();
    }

    const selectFetch = `${this.apiBase}/movie/${movieId}/rating?api_key=${this._apiKey}&guest_session_id=${sessionId}`;

    fetch(selectFetch, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify(ratingData),
    })
      .then((data) => data.json())
      .catch((err) => {
        throw new Error(`Received "${err}"`);
      });
  };

  getResource = async (url) => {
    const res = await fetch(`${this.apiBase}${url}`);
    if (!res.ok) {
      throw new Error(`Could not fetch <<${res.url}>>. Received status: <<${res.status}>>`);
    }
    return res;
  };

  getGenres = async () => {
    try {
      const res = await this.getResource(`/genre/movie/list?api_key=${this._apiKey}`);
      return await res.json();
    } catch (err) {
      throw new Error(`Received "${err}"`);
    }
  };

  getSearchedMovies = async (page = 1, query) => {
    try {
      const res = await this.getResource(`/search/movie?api_key=${this._apiKey}&query=${query}&page=${page}`);
      return await res.json();
    } catch (err) {
      throw new Error(`Received "${err}"`);
    }
  };

  getPopularMovies = async (page = 1) => {
    try {
      const res = await this.getResource(`/movie/popular?api_key=${this._apiKey}&page=${page}`);
      return await res.json();
    } catch (err) {
      throw new Error(`Received "${err}"`);
    }
  };

  getRatedMovies = async (page = 1) => {
    let sessionId = JSON.parse(localStorage.getItem("sessionId"));

    if (!sessionId) {
      try {
        sessionId = await this.createNewGuestSession();
      } catch (err) {
        throw new Error("Guest Session is not received.", err);
      }
    }

    try {
      const res = await this.getResource(
        `/guest_session/${sessionId}/rated/movies?api_key=${this._apiKey}&page=${page}`
      );
      return await res.json();
    } catch (err) {
      throw new Error(`Received "${err}"`);
    }
  };

  getMoviesWithRating = (promisedArrays) => {
    return this._transformMoviesData(promisedArrays);
  };

  fetchPopularMoviesAndRatingArrays = async (page = 1) => {
    return await Promise.all([
      this.trimFetch(this.multipleFetch(this.getPopularMovies, page)),
      this.getRatedMovies(),
    ]).catch((err) => {
      throw new Error(`Received "${err}"`);
    });
  };

  fetchSearchedMoviesAndRatingArrays = async (page = "", query) => {
    if (!query) return;
    return await Promise.all([
      this.trimFetch(this.multipleFetch(this.getSearchedMovies, page, query)),
      this.getRatedMovies(),
    ]).catch((err) => {
      throw new Error(`Received "${err}"`);
    });
  };

  fetchAllRatedMovies = async (page = 1) => {
    try {
      return await this.trimFetch(this.multipleFetch(this.getRatedMovies, page));
    } catch (err) {
      throw new Error(`Received "${err}"`);
    }
  };

  _transformMoviesData = async (rawArrays) => {
    if (!rawArrays) return;

    const newArrays = await rawArrays.then((data) => {
      return data;
    });

    if (!newArrays) return;

    const [arr1, arr2] = newArrays;

    if (arr2.results.length === 0) {
      return {
        page: arr1.page,
        results: arr1.results,
        total_pages: `${arr1.total_pages > 500 ? 500 : arr1.total_pages}`,
        total_results: `${arr1.total_results > 10000 ? 10000 : arr1.total_results}`,
      };
    }
    const newEmptyArray = arr1.results.map((element) => {
      arr2.results.map((el) => {
        if (element.id === el.id) {
          element.rating = el["rating"];
        }
        return element;
      });
      return element;
    });
    return {
      page: arr1.page,
      results: newEmptyArray,
      total_pages: `${arr1.total_pages > 500 ? 500 : arr1.total_pages}`,
      total_results: `${arr1.total_results > 10000 ? 10000 : arr1.total_results}`,
    };
  };

  multipleFetch = (func, page = "", query = "") => {
    const newPageNumber = Math.ceil(page / 10);

    let pageArray = [];
    let promiseArray = [];
    for (let i = 0; i < 3; i++) {
      const arrayItem = 3 * newPageNumber - i;
      pageArray.unshift(arrayItem);
    }
    pageArray.forEach((page) => {
      promiseArray.push(func(page, query));
    });
    return Promise.all(promiseArray).then((values) => {
      const [array1, array2, array3] = values;
      const fullResultsArray = [...array1.results, ...array2.results, ...array3.results];

      const createNewObject = {
        page,
        results: fullResultsArray,
        total_pages: `${array1.total_pages > 500 ? 500 : array1.total_pages}`,
        total_results: `${array1.total_results > 10000 ? 10000 : array1.total_results}`,
      };

      return createNewObject;
    });
  };

  trimFetch = async (fullArray) => {
    const trimmedArray = await fullArray.then((fullResultsArray) => {
      let page = fullResultsArray.page;
      const newArray = [...fullResultsArray.results];
      const pageText = page.toString();
      let pageSliced = 10;
      if (pageText % 10 !== 0) {
        pageSliced = pageText % 10;
      }
      const newShortArray = newArray.slice(pageSliced * 6 - 6, pageSliced * 6);

      const createNewObject = {
        page,
        results: newShortArray,
        total_pages: `${fullResultsArray.total_pages > 500 ? 500 : fullResultsArray.total_pages}`,
        total_results: `${fullResultsArray.total_results > 10000 ? 10000 : fullResultsArray.total_results}`,
      };
      return createNewObject;
    });
    return trimmedArray;
  };
}
