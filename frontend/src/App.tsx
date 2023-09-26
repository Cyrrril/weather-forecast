import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import dayjs, { Dayjs } from "dayjs";
import axios from "axios";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

interface Data {
  city: string;
  value: number;
}

function App() {
  const currDate = new Date();
  const [cities, setCities] = useState([] as Array<Data>);
  const [date, setDate] = React.useState<Dayjs | null>(
    dayjs(
      `${currDate.getFullYear()}-${
        currDate.getMonth() + 1
      }-${currDate.getDate()}`
    )
  );
  const [value, setValue] = useState({
    label: "Select a city",
    value: -1,
  });
  const [inputValue, setInputValue] = useState("");
  const [prediction, setPrediction] = useState<number>();
  const [emoji, setEmoji] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);

  const getCities = async () => {
    const { data } = await axios.get<Array<Data>>(
      "http://localhost:8000/get-cities/"
    );
    setCities(data);
  };

  const autoCompleteOptions = [];

  for (const city of cities) {
    autoCompleteOptions.push({ label: city.city, value: city.value });
  }

  useEffect(() => {
    getCities();
  }, []);

  useEffect(() => {
    if (prediction) {
      if (prediction < 50) {
        setEmoji("🥶 ❄️");
      } else if (prediction < 75) {
        setEmoji("☁️ 🍃 / 🌦️ ☔️");
      } else {
        setEmoji("🥵 ☀️");
      }
      setShow(true);
    }
  }, [prediction]);

  const predict = async () => {
    setShow(false);
    const formatDate = date?.format("YYYY-MM-DD").split("-");
    if (formatDate) {
      const month = formatDate[1];
      const day = formatDate[2];
      const year = formatDate[0];

      const body = {
        city: value.value,
        month: month,
        day: day,
        year: year,
      };
      try {
        const { data } = await axios.post(
          "http://localhost:8000/prediction/",
          body
        );
        setPrediction(data.Temperature);
      } catch (error) {
        setError("Please select a city !");
        setVisible(true);
        setTimeout(() => setVisible(false), 2500);
      }
    }
  };

  return (
    <>
      <div className={`toast ${visible ? "visible" : ""}`}>
        <div className="toast-body">
          {error}
        </div>
      </div>
      <div key={prediction} className={`prediction ${show ? "show" : ""}`}>
        <span className="emoji">{emoji}</span>
        Temperature prediction is {prediction?.toFixed(2)}°F
      </div>
      <div className="container">
        <Autocomplete
          disablePortal
          id="combo-box-demo"
          value={value}
          onChange={(event: any, newValue: any) => {
            setValue(newValue);
          }}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          //groupBy={option => option.label[0]}
          options={autoCompleteOptions}
          sx={{ width: 300 }}
          renderInput={params => <TextField {...params} label="City" />}
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Controlled picker"
            value={date}
            onChange={newDate => setDate(newDate)}
          />
          <button className="button" onClick={predict}>
            Predict
          </button>
        </LocalizationProvider>
      </div>
    </>
  );
}

export default App;
