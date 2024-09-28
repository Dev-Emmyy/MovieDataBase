import React, { Fragment, useEffect, useState, useContext } from "react";
import { Container } from "./Navbar";
import { AiFillPlayCircle } from "react-icons/ai";
import Noimg from "./no img.jpg";
import "../Styles/Video.css";
import axios from 'axios';
import { Link } from "react-router-dom";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Custom Alert component
const CustomAlert = ({ message, onClose }) => (
  <div style={{
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>
    <span>{message}</span>
    <button onClick={onClose} style={{
      background: 'none',
      border: 'none',
      color: '#721c24',
      cursor: 'pointer',
      fontSize: '18px'
    }}>×</button>
  </div>
);

// Skeleton Component for Movie Card
const MovieSkeleton = () => {
  return (
    <div className="container">
      <SkeletonTheme color="#202020" highlightColor="#444">
        <div style={{ position: "relative" }}>
          <Skeleton height={300} width={200} />
          <div style={{ position: "absolute", top: "10px", left: "10px" }}>
            <Skeleton circle={true} height={40} width={40} />
          </div>
        </div>
        <Skeleton width={200} height={24} style={{ marginTop: "10px" }} />
        <Skeleton width={150} height={20} />
      </SkeletonTheme>
    </div>
  );
};

function Movies({ id }) {
  const { toggle, inputValue } = useContext(Container);
  const input = inputValue;
  const Shown = input ? "search" : "discover";
  const [loading, setLoading] = useState(true);
  const [moviesData, setMoviesData] = useState([]);
  const [error, setError] = useState(null);

  const Api = `https://api.themoviedb.org/3/${Shown}/movie`;
  const Images = "https://image.tmdb.org/t/p/w500";

  useEffect(() => {
    const MovieCall = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await axios.get(Api, {
          params: {
            api_key: "47440337c6b528a0103650d276133e76",
            query: input,
          },
        });

        if (data.results.length === 0) {
          setError("No movies found. Please try a different search.");
          setMoviesData([]);
          return;
        }

        const moviesWithReleaseDates = await Promise.all(
          data.results.map(async (movie) => {
            try {
              const releaseData = await axios.get(
                `https://api.themoviedb.org/3/movie/${movie.id}/release_dates`,
                {
                  params: { api_key: "47440337c6b528a0103650d276133e76" },
                }
              );
              const releaseDate = releaseData.data.results?.[0]?.release_dates?.[0]?.release_date || 'N/A';
              return { ...movie, releaseDate };
            } catch (error) {
              console.error(`Error fetching release date for movie ${movie.id}:`, error);
              return { ...movie, releaseDate: 'N/A' };
            }
          })
        );

        setMoviesData(moviesWithReleaseDates);
      } catch (error) {
        console.error("Error fetching movie data:", error);
        if (error.response && error.response.status === 401) {
          setError("Authentication failed. Please check your API key.");
        } else if (error.message === "Network Error") {
          setError("Network error. Please check your internet connection.");
        } else {
          setError("An error occurred while fetching movies. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    MovieCall();
  }, [input, Api]);

  return (
    <Fragment>
      {loading ? (
        <div className={toggle ? "mainBgColor" : "secondaryBgColor"}>
          {/* Show 8 skeletons while loading */}
          <div className="movie_container">
            {[...Array(8)].map((_, index) => (
              <MovieSkeleton key={index} />
            ))}
          </div>
        </div>
      ) : (
        <div className={toggle ? "mainBgColor" : "secondaryBgColor"}>
          {error && (
            <CustomAlert 
              message={error} 
              onClose={() => setError(null)}
            />
          )}
          <div className="movie_container">
            {moviesData.map((movie) => (
              <Link to={`/${movie.id}`} key={movie.id} style={{ textDecorationLine: "none" }}>
                <div className="container">
                  <AiFillPlayCircle color="green" fontSize={40} id="playicon" />
                  <img src={movie.poster_path ? `${Images}${movie.poster_path}` : Noimg} alt="movie poster" />
                  <h4
                    id={movie.title.length < 28 ? "" : "smallertext"}
                    className={toggle ? "mainColor" : "secondaryColor"}
                  >
                    {movie.title} ({new Date(movie.releaseDate).getFullYear()})
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </Fragment>
  );
}

export default Movies;
