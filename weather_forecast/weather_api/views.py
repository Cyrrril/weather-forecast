import numpy as np
import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from .apps import *
from .serializers import CitySerializer
from .models import City


class Prediction(APIView):
    def post(self, request):
        data = request.data

        model = WeatherApiConfig.model

        mapping = WeatherApiConfig.mapping
        cities = WeatherApiConfig.cities

        city = data["city"]

        x_dict = {
                "Region": [mapping[city][0]], 
                "Country": [mapping[city][1]], 
                "State": [mapping[city][2]], 
                "City": [city],
                "Month": [data["month"]],
                "Day": [data["day"]],
                "Year": [data["year"]]
            }
        
        X = pd.DataFrame.from_dict(x_dict).to_numpy()

        temperature_prediction = model.predict(X)

        return Response({ "Temperature" : temperature_prediction[0] }, status= 200)

class GetCities(APIView):
    def get(self, request):
        if request.method == "GET":
            cities = WeatherApiConfig.cities

            return Response(cities)
        
        return Response({"error": "not allowed"})