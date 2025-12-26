const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'; 
 
document.addEventListener('DOMContentLoaded', () => { 
    loadMovieDetails(); 
    loadRecommendations(); 
}); 
 
async function loadMovieDetails() { 
    try { 
        const response = await fetch(`/api/movie/${movieId}`); 
        const movie = await response.json(); 
         
        displayMovieDetails(movie); 
        displayTrailer(movie.videos); 
    } catch (error) { 
        console.error('Error loading movie details:', error); 
    } 
} 
 
function displayMovieDetails(movie) { 
    const container = document.getElementById('movieDetails'); 
     
    const posterPath = movie.poster_path  
        ? `${IMAGE_BASE_URL}${movie.poster_path}`  
        : 'https://via.placeholder.com/300x450?text=No+Image'; 
     
    const genres = movie.genres  
        ? movie.genres.map(g => `<span class="genre-tag">${g.name}</span>`).join('')  
        : ''; 
     
    container.innerHTML = ` 
        <img src="${posterPath}" alt="${movie.title}" class="movie-poster"> 
        <div class="movie-info-details"> 
            <h1>${movie.title}</h1> 
            <p class="tagline">${movie.tagline || ''}</p> 
            <div class="movie-meta"> 
                <div class="meta-item"> 
                    <strong>Rating</strong> 
                    <span>
 ⭐
 ${movie.vote_average ? movie.vote_average.toFixed(1) : 
'N/A'}/10</span> 
                </div> 
                <div class="meta-item"> 
                    <strong>Release Date</strong> 
                    <span>${movie.release_date || 'N/A'}</span> 
                </div> 
                <div class="meta-item"> 
                    <strong>Runtime</strong> 
                    <span>${movie.runtime ? movie.runtime + ' min' : 'N/A'}</span> 
                </div> 
            </div> 
            <div class="genres">${genres}</div> 
            <p class="overview">${movie.overview || 'No overview available.'}</p> 
        </div> 
    `; 
} 
 
function displayTrailer(videos) { 
    const videoPlayer = document.getElementById('videoPlayer'); 
     
    if (videos && videos.results && videos.results.length > 0) { 
        const trailer = videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube'); 
         
        if (trailer) { 
            videoPlayer.innerHTML = ` 
                <iframe  
                    src="https://www.youtube.com/embed/${trailer.key}"  
                    frameborder="0"  
                    allowfullscreen> 
                </iframe> 
            `; 
        } else { 
            videoPlayer.innerHTML = '<p>No trailer available.</p>'; 
        } 
    } else { 
        videoPlayer.innerHTML = '<p>No trailer available.</p>'; 
    } 
} 
 
async function loadRecommendations() { 
    try { 
        const response = await fetch(`/api/recommendations/${movieId}`); 
        const data = await response.json(); 
         
        const container = document.getElementById('recommendations'); 
        container.innerHTML = ''; 
         
        if (data.recommendations && data.recommendations.length > 0) { 
            data.recommendations.forEach(movie => { 
                const movieCard = createMovieCard(movie); 
                container.appendChild(movieCard); 
            }); 
        } else { 
            container.innerHTML = '<p>No recommendations available.</p>'; 
        } 
    } catch (error) { 
        console.error('Error loading recommendations:', error); 
    } 
} 
 
function createMovieCard(movie) { 
    const card = document.createElement('div'); 
    card.className = 'movie-card'; 
    card.onclick = () => { 
        window.location.href = `/movie/${movie.id}`; 
        window.scrollTo(0, 0); 
    }; 
     
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