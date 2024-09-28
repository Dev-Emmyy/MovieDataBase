import React, { Fragment, useEffect, useState } from "react";
import Noimg from "./no img.jpg";
import "../DetailsStyles/details.css";
import axios from "axios";
import { useParams } from "react-router-dom";
import movieTrailer from "movie-trailer";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function Details() {
  const [moviesDetails, setMoviesDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cast, setCast] = useState([]);
  const { id } = useParams();
  const Api = `https://api.themoviedb.org/3/movie/${id}`;
  const Images = "https://image.tmdb.org/t/p/w500";
  const ApiKey = "47440337c6b528a0103650d276133e76";
  const profileImagePath = "https://image.tmdb.org/t/p/w200";

  const backgroundStyle = `${moviesDetails ? `${Images}${moviesDetails.poster_path}` : Noimg}`;

  const DetailsCall = async () => {
    const data = await axios.get(Api, {
      params: {
        api_key: ApiKey,
      },
    });
    const results = data.data;
    setMoviesDetails(results);
  };

  const fetchCast = async () => {
    const castData = await axios.get(`https://api.themoviedb.org/3/movie/${id}/credits`, {
      params: {
        api_key: ApiKey,
      },
    });
    const castResults = castData.data.cast.slice(0, 8); // Limiting to top 8 cast members
    setCast(castResults);
  };

  useEffect(() => {
    DetailsCall();
    fetchCast(); // Fetch cast when component mounts
  }, [id]);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000); // Reduced time for quicker skeleton display
  }, []);

  const [video, setVideo] = useState("");

  function handleSearch() {
    movieTrailer(moviesDetails?.title || "")
      .then((res) => {
        const urlParams = new URLSearchParams(new URL(res).search);
        setVideo(urlParams.get("v"));
      })
      .catch((error) => console.log(error));
  }

  useEffect(() => {
    handleSearch();
  }, [moviesDetails]);

  return (
    <Fragment>
      {loading ? (
        <SkeletonTheme color="#202020" highlightColor="#444">
          <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
            <Skeleton height={500} width={300} />
            <div style={{ flex: 1 }}>
              <Skeleton width={`60%`} height={40} />
              <Skeleton width={`40%`} height={30} />
              <Skeleton width={`30%`} height={30} />
              <Skeleton width={`80%`} height={20} count={5} />
              <div style={{ marginTop: "20px" }}>
                <Skeleton height={30} width={`40%`} />
                <Skeleton height={150} width={150} style={{ borderRadius: "50%" }} />
              </div>
            </div>
          </div>
        </SkeletonTheme>
      ) : (
        <Fragment>
          <div
            style={{
              backgroundImage: `url(${backgroundStyle})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              height: "1000px",
              backgroundPosition: "left calc((50vw - 170px) - 340px) top",
            }}
          >
            <div id="details_container">
              <div>
                <img
                  src={moviesDetails ? `${Images}${moviesDetails.poster_path}` : Noimg}
                  alt="imgDetails"
                />
              </div>
              <div id="container_content">
                <h1>{moviesDetails ? moviesDetails.original_title : ""}</h1>
                <h3>
                  Rating:{" "}
                  {moviesDetails && moviesDetails.vote_average ? (
                    <>
                      <span style={{ color: "orange" }}>{moviesDetails.vote_average.toFixed(1)}</span>
                      <span style={{ color: "#ff206e" }}>/10</span>
                    </>
                  ) : (
                    "N/A"
                  )}
                </h3>
                <h3>
                  {moviesDetails ? moviesDetails.release_date : ""}.{" "}
                  <span>
                    {moviesDetails ? moviesDetails.genres[0].name : ""},{" "}
                    {moviesDetails ? moviesDetails.genres[1]?.name : ""}
                  </span>
                </h3>
                <h2>
                  Status: <span>{moviesDetails ? moviesDetails.status : ""}</span>
                </h2>
                <em>{moviesDetails ? moviesDetails.tagline : ""}</em>

                <div id="container_overview">
                  <h1>Overview</h1>
                  <h3>{moviesDetails ? moviesDetails.overview : ""}</h3>
                </div>

                <div id="collections">
                  <img
                    src={moviesDetails ? `${Images}${moviesDetails.production_companies[0].logo_path}` : Noimg}
                    alt="imgDetails"
                  />
                  <h3 id="collections_one">
                    {moviesDetails ? moviesDetails.production_companies[0].name : ""}
                  </h3>
                  <h3 id="collections_two">
                    {moviesDetails ? moviesDetails.production_countries[0].name : ""}
                  </h3>
                </div>

                <div id="cast" style={{ marginTop: "20px" }}>
                  <h1>Cast</h1>
                  <div className="cast-container">
                    {cast.map((actor) => (
                      <div key={actor.id} className="cast-member">
                        <img
                          src={actor.profile_path ? `${profileImagePath}${actor.profile_path}` : Noimg}
                          alt={actor.name}
                          style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                          className="cast-img"
                        />
                        <div className="cast-info">
                          <strong>{actor.name}</strong>
                          <p>as {actor.character}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Fragment>
      )}
    </Fragment>
  );
}

export default Details;
