import { useEffect, useRef, useState } from "react";
import StarRating from "./StartRating";
const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0).toFixed(2);

const key = 86597136;

// App
export default function App() {
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [watched, setWatched] = useState([
    ...JSON.parse(localStorage.getItem("WatchedList")),
  ]);
  const [movies, setMovies] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  function handleSelcetMovie(id) {
    console.log(selectedId);
    setSelectedId((selectedId) => (selectedId === id ? null : id));
  }
  function handleCloseDetails() {
    setSelectedId(null);
  }
  function handleAddToWatchedList(movie) {
    localStorage.setItem("WatchedList", JSON.stringify([...watched, movie]));
    setWatched(JSON.parse(localStorage.getItem("WatchedList")));
    setSelectedId(null);
  }
  function handleRemoveFromWatchedList(e, movie) {
    e.stopPropagation();
    localStorage.setItem(
      "WatchedList",
      JSON.stringify(watched.filter((m) => m.imdbID !== movie.imdbID))
    );
    setWatched(JSON.parse(localStorage.getItem("WatchedList")));
  }
  useEffect(
    function () {
      async function fetchMovies() {
        try {
          setisLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${key}&s=${query}`
          );

          if (!res.ok) {
            throw new Error("Somethings went wrong with fetching movies");
          }
          const data = await res.json();
          if (data.Respond === "False") {
            throw new Error("Can't find any movie with that name");
          }
          setMovies(data.Search);
        } catch (err) {
          setError(err.message);
        } finally {
          setisLoading(false);
        }
      }
      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }
      fetchMovies();
    },
    [searchQuery]
  );
  function handleSearchSubmit(e) {
    e.preventDefault();
    setSearchQuery((q) => query);
  }
  return (
    <>
      <NavBar>
        <Search
          setQuery={setQuery}
          query={query}
          onSearch={handleSearchSubmit}
        />
        <NumResult movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList
              onSelectMovie={handleSelcetMovie}
              movies={movies}
              selectedId={selectedId}
            />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              key={selectedId}
              onCloseMovie={handleCloseDetails}
              selectedId={selectedId}
              onAddToList={handleAddToWatchedList}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                onSelectMovie={handleSelcetMovie}
                onDeleteMovie={handleRemoveFromWatchedList}
                watched={watched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

// Main

function Main({ children }) {
  return <main className="main">{children}</main>;
}

// NavBar

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}
function Search({ query, setQuery, onSearch }) {
  const inputEl = useRef(null);
  // useEffect(() => {
  //   if (document.activeElement === inputEl.current) return;
  //   function callBack(e) {
  //     if (e.code === "Enter") {
  //       inputEl.current.focus();
  //       setQuery("");
  //     }
  //   }
  //   document.addEventListener("keydown", callBack);
  //   return () => document.removeEventListener("keydown", callBack);
  // }, [setQuery]);
  return (
    <form onSubmit={onSearch}>
      <input
        className="search"
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        ref={inputEl}
      />
    </form>
  );
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function NumResult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

//Box

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

// ListBox

function MovieList({ movies, onSelectMovie, selectedId }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          key={movie.imdbID}
          movie={movie}
          selectedId={selectedId}
          onSelectMovie={onSelectMovie}
        />
      ))}
    </ul>
  );
}
function Movie({ movie, onSelectMovie, selectedId }) {
  return (
    <li
      className={selectedId === movie.imdbID ? "selected" : ""}
      onClick={() => onSelectMovie(movie.imdbID)}
    >
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

//WatchedBox

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
function WatchedMoviesList({ watched, onDeleteMovie, onSelectMovie }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          onSelectMovie={onSelectMovie}
          onDeleteMovie={onDeleteMovie}
          key={movie.imdbID}
          movie={movie}
        />
      ))}
    </ul>
  );
}
function WatchedMovie({ movie, onDeleteMovie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button onClick={(e) => onDeleteMovie(e, movie)} className="btn-delete">
          <div className="svg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#000000"
              version="1.1"
              id="Layer_1"
              width="800px"
              height="800px"
              viewBox="0 0 70 70"
            >
              <g>
                <g>
                  <path d="M18.041,14.021c1.013,0,2.021,0.385,2.79,1.153l14.196,14.142l14.142-14.142c0.77-0.769,1.778-1.152,2.791-1.152    c1.024,0,2.053,0.394,2.839,1.18c1.563,1.562,1.574,4.082,0.027,5.63L40.685,34.973l14.142,14.196    c1.547,1.547,1.535,4.068-0.026,5.631c-0.785,0.785-1.813,1.178-2.839,1.178c-1.013,0-2.022-0.383-2.792-1.152L35.027,40.63    L20.831,54.825c-0.769,0.77-1.778,1.154-2.791,1.154c-1.024,0-2.054-0.395-2.839-1.18c-1.563-1.563-1.574-4.084-0.027-5.631    l14.197-14.196L15.174,20.831c-1.547-1.547-1.533-4.068,0.027-5.63C15.987,14.415,17.016,14.021,18.041,14.021 M18.041,10.021    L18.041,10.021c-2.138,0-4.151,0.835-5.667,2.351c-3.12,3.121-3.132,8.185-0.028,11.287l11.363,11.319L12.346,46.339    c-3.105,3.107-3.092,8.172,0.028,11.289c1.514,1.516,3.526,2.352,5.666,2.352c2.126,0,4.121-0.826,5.62-2.326l11.362-11.361    l11.313,11.355c1.505,1.504,3.5,2.33,5.626,2.33c2.138,0,4.15-0.834,5.666-2.35c3.12-3.121,3.132-8.184,0.027-11.287    L46.336,34.978L57.654,23.66c3.104-3.106,3.092-8.17-0.028-11.287c-1.514-1.516-3.526-2.351-5.666-2.351    c-2.124,0-4.119,0.825-5.618,2.323l-11.32,11.319L23.654,12.34C22.162,10.847,20.166,10.022,18.041,10.021L18.041,10.021z" />
                </g>
                <g>
                  <path d="M50.7,21.714c-0.256,0-0.512-0.098-0.707-0.293c-0.391-0.391-0.391-1.023,0-1.414l2.121-2.121    c0.391-0.391,1.023-0.391,1.414,0s0.391,1.023,0,1.414l-2.121,2.121C51.212,21.617,50.956,21.714,50.7,21.714z" />
                </g>
                <g>
                  <path d="M40.801,31.614c-0.256,0-0.512-0.098-0.707-0.293c-0.391-0.391-0.391-1.023,0-1.414l7.07-7.07    c0.391-0.391,1.023-0.391,1.414,0s0.391,1.023,0,1.414l-7.07,7.07C41.313,31.516,41.057,31.614,40.801,31.614z" />
                </g>
              </g>
            </svg>
          </div>
        </button>
      </div>
    </li>
  );
}

// Details Box

function MovieDetails({ selectedId, onCloseMovie, onAddToList, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [userRating, setUserRating] = useState("");

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAdd() {
    const newMovie = {
      title,
      poster,
      imdbID: selectedId,
      year,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ")[0]),
      userRating,
    };
    onAddToList(newMovie);
  }
  useEffect(function () {
    async function fetchDetails() {
      try {
        setIsLoading(true);
        // setError("");
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${key}&i=${selectedId}`
        );

        if (!res.ok) {
          throw new Error("Somethings went wrong with getting movie daata");
        }
        const data = await res.json();
        if (data.Respond === "False") {
          throw new Error("Can't find any movie with that id");
        }
        console.log(data);
        setMovie(data);
      } catch (err) {
        // setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDetails();
  }, []);
  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="800px"
                height="800px"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M4 12L10 6M4 12L10 18M4 12H14.5M20 12H17.5"
                  stroke="#1C274C"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {isWatched ? (
                <p>
                  you have watched this video and rated it {watchedUserRating}
                </p>
              ) : (
                <>
                  <StarRating
                    maxRating={10}
                    size={28}
                    onSetRating={setUserRating}
                    fontSize={18}
                  />
                  <button onClick={handleAdd} className="btn-add">
                    +Add to watched list
                  </button>
                </>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}
// Messages

function Loader() {
  return (
    <div className="loader">
      <p>Loading...</p>
    </div>
  );
}
function ErrorMessage({ message }) {
  return (
    <div className="error">
      <p>{message}</p>
    </div>
  );
}
