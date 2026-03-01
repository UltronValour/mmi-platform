import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import csr_matrix


class MovieRecommender:
    def __init__(self, df, feature_matrix):
        self.df = df.reset_index(drop=True)
        self.feature_matrix = feature_matrix
        self.title_index = {
            title.lower(): idx for idx, title in enumerate(df["title"])
        }

    def _find_index(self, title):
        key = title.lower().strip()
        if key in self.title_index:
            return self.title_index[key]
        for stored_title, idx in self.title_index.items():
            if key in stored_title:
                return idx
        return None

    def recommend(self, title, n=5, language=None, min_votes=100):
        idx = self._find_index(title)
        if idx is None:
            raise ValueError(f"Movie '{title}' not found.")

        movie_vec = self.feature_matrix[idx]
        sim_scores = cosine_similarity(movie_vec, self.feature_matrix).flatten()
        sim_scores[idx] = -1

        ranked = np.argsort(sim_scores)[::-1]
        results = self.df.loc[ranked].copy()
        results["similarity"] = sim_scores[ranked]

        results = results[results["vote_count"] >= min_votes]
        if language:
            results = results[results["original_language"] == language]

        cols = [c for c in ["title", "genres", "vote_average", "vote_count", "year", "similarity", "overview"] if c in results.columns]
        top = results.head(n)[cols].reset_index(drop=True)
        top.index += 1
        return top

    def recommend_by_genre(self, genre, n=10, min_votes=50):
        genre = genre.lower().strip()
        def genre_match(g):
            if isinstance(g, list):
                return any(genre == item.lower() for item in g)
            if isinstance(g, str):
                return genre in g.lower()
            return False
        mask = self.df["genres"].apply(genre_match)
        results = self.df[mask & (self.df["vote_count"] >= min_votes)]
        results = results.sort_values(
            ["vote_average", "vote_count"], ascending=False
        )
        cols = [c for c in ["title", "genres", "vote_average", "vote_count", "year"] if c in results.columns]
        top = results.head(n)[cols].reset_index(drop=True)
        top.index += 1
        return top

    def similar_to_multiple(self, titles, n=10):
        indices = []
        for t in titles:
            idx = self._find_index(t)
            if idx is not None:
                indices.append(idx)

        if not indices:
            raise ValueError("None of the provided titles were found.")

        seed_vecs = self.feature_matrix[indices]
        avg_vec = csr_matrix(seed_vecs.mean(axis=0))
        sim_scores = cosine_similarity(avg_vec, self.feature_matrix).flatten()
        for i in indices:
            sim_scores[i] = -1

        ranked = np.argsort(sim_scores)[::-1]
        results = self.df.loc[ranked].copy()
        results["similarity"] = sim_scores[ranked]
        cols = [c for c in ["title", "genres", "vote_average", "vote_count", "year", "similarity"] if c in results.columns]
        top = results.head(n)[cols].reset_index(drop=True)
        top.index += 1
        return top