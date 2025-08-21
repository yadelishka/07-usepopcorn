import { useState, useEffect } from "react";
import { mapMovies, Movie } from "./App";

const KEY = "7ce41dfb";

function isErrorWithMessage(
  err: unknown
): err is { message: string; name?: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof err.message === "string"
  );
}

export function useMovies(query: string) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      //   callback?.();

      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");

          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );

          if (!res.ok)
            throw new Error("Something went wrong with fetching movies");

          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie not found");

          setMovies(mapMovies(data.Search));
          setError("");
        } catch (err) {
          if (isErrorWithMessage(err) && err.name !== "AbortError") {
            console.log(err.message);
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }

      if (query.length < 3) {
        setMovies([] as Movie[]);
        setError("");
        return;
      }

      fetchMovies();

      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return { movies, isLoading, error };
}
