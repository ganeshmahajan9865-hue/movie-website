const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'; 
 
// Load movies on page load 
document.addEventListener('DOMContentLoaded', () => { 
    loadCategories(); 
    setupSearch(); 
}); 
 
async function loadCategories() { 
    try { 
        const response = await fetch('/api/movies/categories'); 
        const categories = await response.json(); 
         
        for (const [category, movies] of Object.entries(categories)) { 
            displayMovies(movies, category); 
        } 
    } catch (error) { 
        console.error('Error loading categories:', error); 
    } 
} 
 
function displayMovies(movies, containerId) { 
    const container = document.getElementById(containerId); 
    if (!container) return; 
     
    container.innerHTML = ''; 
     
    movies.forEach(movie => { 
        const movieCard = createMovieCard(movie); 
        container.appendChild(movieCard); 
    }); 
} 
 
function createMovieCard(movie) { 
    const card = document.createElement('div'); 
    card.className = 'movie-card'; 
    card.onclick = () => window.location.href = `/movie/${movie.id}`; 
     
    const posterPath = movie.poster_path  
        ? `${IMAGE_BASE_URL}${movie.poster_path}`  
        : 'https://via.placeholder.com/200x300?text=No+Image'; 
     
    card.innerHTML = ` 
        <img src="${posterPath}" alt="${movie.title}"> 
        <div class="movie-info"> 
            <h3>${movie.title}</h3> 
            <p class="rating">
 ⭐
 ${movie.vote_average ? movie.vote_average.toFixed(1) : 
'N/A'}</p> 
            <p>${movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}</p> 
        </div> 
    `; 
     
    return card; 
} 
 
function setupSearch() { 
    const searchInput = document.getElementById('searchInput'); 
    const searchBtn = document.getElementById('searchBtn'); 
     
    searchBtn.addEventListener('click', performSearch); 
    searchInput.addEventListener('keypress', (e) => { 
        if (e.key === 'Enter') { 
            performSearch(); 
        } 
    }); 
} 
 
async function performSearch() { 
    const query = document.getElementById('searchInput').value.trim(); 
    if (!query) return; 
     
    try { 
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`); 
        const data = await response.json(); 
         
        const searchResults = document.getElementById('searchResults'); 
        const searchResultsContainer = document.getElementById('searchResultsContainer'); 
         
        searchResults.style.display = 'block'; 
        searchResultsContainer.innerHTML = ''; 
         
        if (data.results && data.results.length > 0) { 
            data.results.forEach(movie => { 
                const movieCard = createMovieCard(movie); 
                searchResultsContainer.appendChild(movieCard); 
            }); 
             
            // Scroll to results 
            searchResults.scrollIntoView({ behavior: 'smooth' }); 
        } else { 
            searchResultsContainer.innerHTML = '<p>No movies found.</p>'; 
        } 
    } catch (error) { 
        console.error('Search error:', error); 
    } 
}