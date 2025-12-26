from flask import Flask, render_template, request, jsonify 
import requests
import pandas as pd 
from sklearn.feature_extraction.text import TfidfVectorizer 
from sklearn.metrics.pairwise import cosine_similarity 
import numpy as np 
 
app = Flask(__name__) 
 
# TMDB API Configuration 
TMDB_API_KEY = 'f2588ae6dfe22f982556b0f0cd41bd41'  # Get from https://www.themoviedb.org/ 
TMDB_BASE_URL = 'https://api.themoviedb.org/3' 
IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500' 
 
# Load movie dataset for recommendations 
def load_movie_data(): 
    """Load and prepare movie data for ML recommendations""" 
    try: 
        movies_df = pd.read_csv('movies.csv')  # You can download from MovieLens 
        return movies_df 
    except: 
        return None 
 
# Initialize recommendation system 
class MovieRecommender: 
    def __init__(self): 
        self.movies_df = load_movie_data() 
        if self.movies_df is not None: 
            self.tfidf = TfidfVectorizer(stop_words='english') 
            self.tfidf_matrix = self.tfidf.fit_transform(self.movies_df['genres'].fillna('')) 
            self.cosine_sim = cosine_similarity(self.tfidf_matrix, self.tfidf_matrix) 
     
    def get_recommendations(self, movie_id, num_recommendations=10): 
        """Get movie recommendations using content-based filtering""" 
        try: 
            idx = self.movies_df[self.movies_df['id'] == movie_id].index[0] 
            sim_scores = list(enumerate(self.cosine_sim[idx])) 
            sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True) 
            sim_scores = sim_scores[1:num_recommendations+1] 
            movie_indices = [i[0] for i in sim_scores] 
            return self.movies_df.iloc[movie_indices]['id'].tolist() 
        except: 
            return [] 
 
recommender = MovieRecommender() 
 
# Routes 
@app.route('/') 
def home(): 
    """Home page with movie categories""" 
    return render_template('index.html') 
 
@app.route('/api/movies/categories') 
def get_categories(): 
    """Get movies by different categories""" 
    categories = { 
        'trending': f'{TMDB_BASE_URL}/trending/movie/week?api_key={TMDB_API_KEY}', 
        'popular': f'{TMDB_BASE_URL}/movie/popular?api_key={TMDB_API_KEY}', 
        'top_rated': f'{TMDB_BASE_URL}/movie/top_rated?api_key={TMDB_API_KEY}', 
        'action': 
f'{TMDB_BASE_URL}/discover/movie?api_key={TMDB_API_KEY}&with_genres=28', 
        'comedy': 
f'{TMDB_BASE_URL}/discover/movie?api_key={TMDB_API_KEY}&with_genres=35', 
        'horror': 
f'{TMDB_BASE_URL}/discover/movie?api_key={TMDB_API_KEY}&with_genres=27', 
        'romance': 
f'{TMDB_BASE_URL}/discover/movie?api_key={TMDB_API_KEY}&with_genres=10749', 
        'sci_fi': 
f'{TMDB_BASE_URL}/discover/movie?api_key={TMDB_API_KEY}&with_genres=878' 
    } 
     
    results = {} 
    mock_movies = [
        {'id': 1, 'title': '', 'poster_path': None, 'vote_average': 8.5, 'release_date': '2024-01-01'},
        {'id': 2, 'title': '', 'poster_path': None, 'vote_average': 7.8, 'release_date': '2024-02-01'},
        {'id': 3, 'title': '', 'poster_path': None, 'vote_average': 7.2, 'release_date': '2024-03-01'},
        {'id': 4, 'title': '', 'poster_path': None, 'vote_average': 8.0, 'release_date': '2024-04-01'},
        {'id': 5, 'title': '', 'poster_path': None, 'vote_average': 7.5, 'release_date': '2024-05-01'},
    ]
    
    # Quick network check: if TMDB is unreachable, return mock data immediately
    try:
        test_resp = requests.get(categories['trending'], timeout=1)
        if test_resp.status_code != 200:
            raise Exception('TMDB not responding')
    except Exception:
        for category in categories.keys():
            results[category] = mock_movies
        return jsonify(results)

    # If TMDB is reachable, fetch per-category with short timeout
    for category, url in categories.items(): 
        try:
            response = requests.get(url, timeout=2)
            if response.status_code == 200: 
                results[category] = response.json()['results'][:10]
            else:
                results[category] = mock_movies
        except:
            # Fallback to mock data for this category
            results[category] = mock_movies

    return jsonify(results) 
 
@app.route('/api/search') 
def search_movies(): 
    """Search movies by title""" 
    query = request.args.get('q', '') 
    if not query: 
        return jsonify({'error': 'Please provide a search query'}), 400 
     
    url = f'{TMDB_BASE_URL}/search/movie?api_key={TMDB_API_KEY}&query={query}' 
    try:
        response = requests.get(url, timeout=2)
        print(f"Search URL: {url}")
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200: 
            return jsonify(response.json()) 
        else:
            print(f"API error: {response.text}")
            return jsonify({'error': f'TMDB API error: {response.status_code}', 'details': response.text}), response.status_code
    except Exception as e:
        print(f"Search error: {str(e)}")
        # Fallback to mock search results
        mock_results = {
            'results': [
                {
                    'id': 27205,
                    'title': f'Movie: {query}',
                    'poster_path': None,
                    'vote_average': 7.5,
                    'release_date': '2024-01-01'
                }
            ]
        }
        return jsonify(mock_results), 200 
 
@app.route('/api/movie/<int:movie_id>') 
def get_movie_details(movie_id): 
    """Get detailed information about a specific movie""" 
    # Get movie details 
    movie_url = f'{TMDB_BASE_URL}/movie/{movie_id}?api_key={TMDB_API_KEY}&append_to_response=videos,credits' 
    response = requests.get(movie_url, timeout=2)
    if response.status_code == 200: 
        movie_data = response.json()
        return jsonify(movie_data) 
    return jsonify({'error': 'Movie not found'}), 404 
 
@app.route('/api/recommendations/<int:movie_id>') 
def get_recommendations(movie_id): 
    """Get ML-based movie recommendations""" 
    # Try ML recommendations first 
    ml_recommendations = recommender.get_recommendations(movie_id) 
     
    # Fallback to TMDB recommendations 
    url = f'{TMDB_BASE_URL}/movie/{movie_id}/recommendations?api_key={TMDB_API_KEY}' 
    response = requests.get(url, timeout=2) 
     
    if response.status_code == 200: 
        tmdb_recs = response.json()['results'][:10] 
        return jsonify({'recommendations': tmdb_recs}) 
     
    return jsonify({'recommendations': []}) 
 
@app.route('/movie/<int:movie_id>') 
def movie_page(movie_id): 
    """Movie detail page""" 
    return render_template('movie.html', movie_id=movie_id) 
 
if __name__ == '__main__': 
    app.run(debug=True) 
