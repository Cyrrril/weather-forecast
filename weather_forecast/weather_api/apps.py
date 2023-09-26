from django.apps import AppConfig
from django.conf import settings
import os
import pickle
import pandas as pd
from sklearn.preprocessing import LabelEncoder


class Process:
    # #region = {}
    # country = {}
    # state = {}
    city = {}
    mapping = {}

    def __init__(self, df) -> None:
        df = df.drop_duplicates()
        df = df.fillna("Not Specified")
        df = df[(df['Year'] != 200) & (df['Year'] != 201) & (df['Day'] != 0)]
        df = df[(df['AvgTemperature'] >= -58) & (df['Year'] < 2020)]

        le = LabelEncoder()

        df["Region"] = le.fit_transform(df["Region"])
        # self.region = dict(zip(le.classes_, range(len(le.classes_))))
        df["Country"] = le.fit_transform(df["Country"])
        # self.country = dict(zip(le.classes_, range(len(le.classes_))))
        df["State"] = le.fit_transform(df["State"])
        # self.state = dict(zip(le.classes_, range(len(le.classes_))))
        df["CityEncoded"] = le.fit_transform(df["City"])

        df = df.drop_duplicates(subset="City")

        def mapping_city(x):
            return {"city": x["City"], "value": x["CityEncoded"]}

        df["MappingCity"] = df.apply(mapping_city, axis=1)

        self.city = df["MappingCity"].to_numpy()

        df.set_index("CityEncoded", inplace=True)

        def mapping(x):
            return [x["Region"], x["Country"], x["State"]]

        df["Mapping"] = df.apply(mapping, axis=1)
        self.mapping = df["Mapping"].to_dict()


class WeatherApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "weather_api"
    MODEL_FILE = os.path.join(settings.MODELS, "xgbr_model.pkl")
    model = pickle.load(open(MODEL_FILE, "rb"))
    DATASET = os.path.join(settings.DATA, "city_temperature.csv")
    # df = pd.read_csv(DATASET)
    process = Process(pd.read_csv(DATASET))
    mapping = process.mapping
    cities = process.city
