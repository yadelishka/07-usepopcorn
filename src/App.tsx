import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useKey } from "./useKey";
import { useLocalStorageState } from "./useLocalStorageState";
import { useMovies } from "./useMovies";

export interface Movie {
  title: string;
  year: string;
  poster: string;
  imdbID: string;
  imdbRating?: number;
  runtime?: string;
  plot?: string;
  released?: string;
  actors?: string;
  director?: string;
  genre?: string;
}

interface WatchedMovie extends Movie {
  userRating: number;
  countRatingDecisions: number;
}

export function mapMovies(data: unknown): Movie[] {
  console.log(data);
  if (typeof data == "object" && data && Array.isArray(data))
    return data.map((movieFromServer) => {
      const movie: Movie = {
        title: "",
        year: "",
        poster: "",
        imdbID: "",
      };
      if (
        "Title" in movieFromServer &&
        typeof movieFromServer.Title === "string"
      ) {
        movie.title = movieFromServer.Title;
      }
      if (
        "Year" in movieFromServer &&
        typeof movieFromServer.Year === "string"
      ) {
        movie.year = movieFromServer.Year;
      }
      if (
        "Poster" in movieFromServer &&
        typeof movieFromServer.Poster === "string"
      ) {
        movie.poster = movieFromServer.Poster;
      }
      if (
        "imdbID" in movieFromServer &&
        typeof movieFromServer.imdbID === "string"
      ) {
        movie.imdbID = movieFromServer.imdbID;
      }
      console.log(movie);
      return movie;
    });
  return [];
}

const average = (arr: number[]) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "7ce41dfb";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { movies, isLoading, error } = useMovies(query);

  const [watched, setWatched] = useLocalStorageState([], "watched");

  function handleSelectMovie(id: string) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie: WatchedMovie) {
    setWatched((watched: WatchedMovie[]) => [...watched, movie]);
  }

  function handleDeleteWatched(id: string) {
    setWatched((watched: WatchedMovie[]) =>
      watched.filter((movie) => movie.imdbID !== id)
    );
  }

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults moviesCount={movies.length} />
      </NavBar>

      <Main>
        <Box>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <p className="error">
      <span>⛔️</span> {message}
    </p>
  );
}

function NavBar({ children }: { children: React.ReactNode }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
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

function Search({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (query: string) => void;
}) {
  const inputEl = useRef<HTMLInputElement>(null);

  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) return;
    if (inputEl.current) inputEl.current.focus();
    setQuery("");
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function NumResults({ moviesCount }: { moviesCount: number }) {
  return (
    <p className="num-results">
      Found <strong>{moviesCount}</strong> results
    </p>
  );
}

function Main({ children }: { children: React.ReactNode }) {
  return <main className="main">{children}</main>;
}

function Box({ children }: { children: React.ReactNode }) {
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

/*
function WatchedBox() {
  const [watched, setWatched] = useState(tempWatchedData);
  const [isOpen2, setIsOpen2] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>

      {isOpen2 && (
        <>
          <WatchedSummary watched={watched} />
          <WatchedMoviesList watched={watched} />
        </>
      )}
    </div>
  );
}
*/

function MovieList({
  movies,
  onSelectMovie,
}: {
  movies: Movie[];
  onSelectMovie: (id: string) => void;
}) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function Movie({
  movie,
  onSelectMovie,
}: {
  movie: Movie;
  onSelectMovie: (id: string) => void;
}) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.year}</span>
        </p>
      </div>
    </li>
  );
}

interface MovieDetailsProps {
  selectedId: string;
  onCloseMovie: () => void;
  onAddWatched: (movie: WatchedMovie) => void;
  watched: WatchedMovie[];
}

function MovieDetails({
  selectedId,
  onCloseMovie,
  onAddWatched,
  watched,
}: MovieDetailsProps) {
  const [movie, setMovie] = useState<Movie>({
    title: "",
    year: "",
    poster: "",
    runtime: "",
    imdbRating: 0,
    plot: "",
    released: "",
    actors: "",
    imdbID: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);

  const countRef = useRef(0);

  useEffect(
    function () {
      if (userRating) countRef.current++;
    },
    [userRating]
  );

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  const {
    title,
    year,
    poster,
    runtime,
    imdbRating,
    plot,
    released,
    actors,
    director,
    genre,
  } = movie;

  // if (imdbRating > 8) return <p>Greatest ever!</p>;
  // if (imdbRating > 8) [isTop, setIsTop] = useState(true);

  // const [isTop, setIsTop] = useState(imdbRating > 8);
  // console.log(isTop);
  // useEffect(
  //   function () {
  //     setIsTop(imdbRating > 8);
  //   },
  //   [imdbRating]
  // );

  const isTop = Number(imdbRating) > 8;
  console.log(isTop);

  // const [avgRating, setAvgRating] = useState(0);

  function handleAdd() {
    const newWatchedMovie: WatchedMovie = {
      imdbID: selectedId,
      title: title ?? "",
      year: year ?? "",
      poster: poster ?? "",
      imdbRating: Number(imdbRating),
      runtime: runtime ? runtime.split(" ").at(0) ?? "0" : "0",
      userRating: Number(userRating),
      countRatingDecisions: countRef.current,
    };

    onAddWatched(newWatchedMovie);
    onCloseMovie();

    // setAvgRating(Number(imdbRating));
    // setAvgRating((avgRating) => (avgRating + userRating) / 2);
  }

  useKey("Escape", onCloseMovie);

  function mapMovieDetails(data: any): Movie {
    return {
      title: typeof data.Title === "string" ? data.Title : "",
      year: typeof data.Year === "string" ? data.Year : "",
      poster: typeof data.Poster === "string" ? data.Poster : "",
      imdbID: typeof data.imdbID === "string" ? data.imdbID : "",
      imdbRating:
        typeof data.imdbRating === "string"
          ? Number(data.imdbRating)
          : typeof data.imdbRating === "number"
          ? data.imdbRating
          : undefined,
      runtime: typeof data.Runtime === "string" ? data.Runtime : "",
      plot: typeof data.Plot === "string" ? data.Plot : "",
      released: typeof data.Released === "string" ? data.Released : "",
      actors: typeof data.Actors === "string" ? data.Actors : "",
      director: typeof data.Director === "string" ? data.Director : "",
      genre: typeof data.Genre === "string" ? data.Genre : "",
    };
  }

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        const data = await res.json();
        setMovie(mapMovieDetails(data));
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      return function () {
        document.title = "usePopcorn";
        // console.log(`Clean up effect for movie ${title}`);
      };
    },
    [title]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
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

          {/* <p>{avgRating}</p> */}

          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {Number(userRating) > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You rated with movie {watchedUserRating} <span>⭐️</span>
                </p>
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

function WatchedSummary({ watched }: { watched: WatchedMovie[] }) {
  const avgImdbRating = average(
    watched
      .map((movie) => movie.imdbRating)
      .filter((rating): rating is number => typeof rating === "number")
  );
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(
    watched
      .map((movie) => {
        if (typeof movie.runtime === "string") {
          const num = Number(movie.runtime.match(/\d+/)?.[0]);
          return isNaN(num) ? 0 : num;
        }
        if (typeof movie.runtime === "number") return movie.runtime;
        return 0;
      })
      .filter(
        (runtime): runtime is number =>
          typeof runtime === "number" && !isNaN(runtime)
      )
  );

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
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({
  watched,
  onDeleteWatched,
}: {
  watched: WatchedMovie[];
  onDeleteWatched: (id: string) => void;
}) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({
  movie,
  onDeleteWatched,
}: {
  movie: WatchedMovie;
  onDeleteWatched: (id: string) => void;
}) {
  return (
    <li>
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

        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
