import { TMDB_API_KEY, TMDB_BASE, IMAGE_BASE_URL } from "./config.js";

const movieId = new URLSearchParams(location.search).get("id");

document.addEventListener("DOMContentLoaded", () => {
  if (!movieId) return;
  loadMovieDetails();
  loadRecommendations();
});

async function loadMovieDetails() {
  try {
    // append_to_response=videos is a common TMDB pattern to include videos in one call. [web:35]
    const res = await fetch(`${TMDB_BASE}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=videos`);
    const movie = await res.json();
    displayMovieDetails(movie);
    displayTrailer(movie.videos);
  } catch (e) {
    console.error("Error loading movie details:", e);
  }
}

async function loadRecommendations() {
  try {
    const res = await fetch(`${TMDB_BASE}/movie/${movieId}/recommendations?api_key=${TMDB_API_KEY}`);
    const data = await res.json();
    const container = document.getElementById("recommendations");
    container.innerHTML = "";

    const list = data.results || [];
    container.innerHTML = list.length ? "" : "<p>No recommendations available.</p>";
    list.forEach((m) => container.appendChild(createMovieCard(m)));
  } catch (e) {
    console.error("Error loading recommendations:", e);
  }
}

function displayMovieDetails(movie) {
  const container = document.getElementById("movieDetails");
  const posterPath = movie.poster_path
    ? `${IMAGE_BASE_URL}${movie.poster_path}`
    : "https://via.placeholder.com/300x450?text=No+Image";

  const genres = movie.genres ? movie.genres.map(g => `<span class="genre-tag">${g.name}</span>`).join("") : "";

  container.innerHTML = `
    <img src="${posterPath}" alt="${movie.title}" class="movie-poster">
    <div class="movie-info-details">
      <h1>${movie.title || "Untitled"}</h1>
      <p class="tagline">${movie.tagline || ""}</p>
      <div class="movie-meta">
        <div class="meta-item"><strong>Rating</strong><span>${movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}/10</span></div>
        <div class="meta-item"><strong>Release Date</strong><span>${movie.release_date || "N/A"}</span></div>
        <div class="meta-item"><strong>Runtime</strong><span>${movie.runtime ? movie.runtime + " min" : "N/A"}</span></div>
      </div>
      <div class="genres">${genres}</div>
      <p class="overview">${movie.overview || "No overview available."}</p>
    </div>
  `;
}

function displayTrailer(videos) {
  const videoPlayer = document.getElementById("videoPlayer");
  const items = videos?.results || [];
  const trailer = items.find(v => v.type === "Trailer" && v.site === "YouTube");
  videoPlayer.innerHTML = trailer
    ? `<iframe src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>`
    : "<p>No trailer available.</p>";
}

function createMovieCard(movie) {
  const card = document.createElement("div");
  card.className = "movie-card";
  card.onclick = () => (window.location.href = `movie.html?id=${movie.id}`);

  const posterPath = movie.poster_path
    ? `${IMAGE_BASE_URL}${movie.poster_path}`
    : "https://via.placeholder.com/200x300?text=No+Image";

  card.innerHTML = `
    <img src="${posterPath}" alt="${movie.title}">
    <div class="movie-info">
      <h3>${movie.title || "Untitled"}</h3>
      <p class="rating">${movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}</p>
      <p>${movie.release_date ? movie.release_date.substring(0,4) : "N/A"}</p>
    </div>
  `;
  return card;
}
