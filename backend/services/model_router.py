from backend.services.sentiment_service import predict_sentiment
from backend.services.fake_news_service import predict_fake_news
from backend.services.movie_service import get_recommendations, get_genre_recommendations
from backend.services.parkinsons_service import predict_parkinsons


def route_model(model_name, input_data):
    if model_name == "sentiment":
        return predict_sentiment(input_data)

    elif model_name == "fake_news" or model_name == "fake-news":
        return predict_fake_news(input_data)

    elif model_name == "movie":
        title = input_data.get("title")
        genre = input_data.get("genre")

        if title:
            results = get_recommendations(title)
            return {
                "model": "movie",
                "input": title,
                "recommendations": results
            }

        elif genre:
            results = get_genre_recommendations(genre)
            return {
                "model": "movie",
                "input": genre,
                "recommendations": results
            }

        else:
            return {"error": "title or genre is required"}, 400
    
    elif model_name == "parkinsons":
        result = predict_parkinsons(input_data)
        return {
            "model": "parkinsons",
            "input": input_data,
            "prediction": result["prediction"],
            "confidence": result["confidence"]
        }


    else:
        return {"error": "Invalid model"}