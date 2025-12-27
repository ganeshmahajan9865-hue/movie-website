import { TMDB_API_KEY, TMDB_BASE, IMAGE_BASE_URL } from "./config.js";

const categories = {
  trending: `${TMDB_BASE}/trending/movie/week?api_key=${TMDB_API_KEY}`,
  popular: `${TMDB_BASE}/movie/popular?api_key=${TMDB_API_KEY}`,
  top_rated: `${TMDB_BASE}/movie/top_rated?api_key=${TMDB_API_KEY}`,
  action: `${TMDB_BASE}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=28`,
  comedy: `${TMDB_BASE}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=35`,
  horror: `${TMDB_BASE}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=27`,
  romance: `${TMDB_BASE}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=10749`,
  sci_fi: `${TMDB_BASE}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=878`,
};

document.addEventListener("DOMContentLoaded", () => {
  loadCategories();
  setupSearch();
});

async function loadCategories() {
  for (const [containerId, url] of Object.entries(categories)) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      displayMovies(data.results || [], containerId);
    } catch (e) {
      console.error("Category load failed:", containerId, e);
    }
  }
}

function displayMovies(movies, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  movies.forEach((m) => container.appendChild(createMovieCard(m)));
}

function createMovieCard(movie) {
  const card = document.createElement("div");
  card.className = "movie-card";

  // Use querystring routing that works on GitHub Pages
  card.onclick = () => (window.location.href = `movie.html?id=${movie.id}`);

  const posterPath = movie.poster_path
    ? `${IMAGE_BASE_URL}${movie.poster_path}`
    : "https://via.placeholder.com/200x300?text=No+Image";

  card.innerHTML = `
    <img src="${posterPath}" alt="${movie.title || "Movie"}">
    <div class="movie-info">
      <h3>${movie.title || "Untitled"}</h3>
      <p class="rating">${movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}</p>
      <p>${movie.release_date ? movie.release_date.substring(0,4) : "N/A"}</p>
    </div>
  `;
  return card;
}

function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  searchBtn.addEventListener("click", performSearch);
  searchInput.addEventListener("keypress", (e) => e.key === "Enter" && performSearch());
}

async function performSearch() {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) return;

  const url = `${TMDB_BASE}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
  // TMDB search endpoint looks like this. [web:38]

  try {
    const res = await fetch(url);
    const data = await res.json();

    const searchResults = document.getElementById("searchResults");
    const searchResultsContainer = document.getElementById("searchResultsContainer");

    searchResults.style.display = "block";
    searchResultsContainer.innerHTML = "";

    const results = data.results || [];
    if (results.length) {
      results.forEach((m) => searchResultsContainer.appendChild(createMovieCard(m)));
      searchResults.scrollIntoView({ behavior: "smooth" });
    } else {
      searchResultsContainer.innerHTML = "<p>No movies found.</p>";
    }
  } catch (e) {
    console.error("Search error:", e);
  }
}
