from django.urls import path
from . import views

urlpatterns = [
    path('prediction/', views.Prediction.as_view(), name = "prediction"),
    path("get-cities/", views.GetCities.as_view(), name = "get-cities"),
]
