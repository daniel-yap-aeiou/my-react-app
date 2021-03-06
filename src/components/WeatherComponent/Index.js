import React, { useState, useEffect, useReducer } from "react";
import { Spinner } from "react-bootstrap";
import KEY from "./key";
import { withRouter } from "react-router-dom";
import "./Index.css";
import Modal from "./Modal";
import { useUtilContext } from "../../contexts/UtilContext";

let initialState = {
  weatherList: [],
  forecastList: {},
  cityList: [],
  enteredCity: []
};

const actionTypes = {
  SET_WEATHER: "set-weather-items",
  SET_FORECAST: "set-forecast-items",
  SET_CITY: "set-city-items",
  SET_ENTERED_CITY: "set-entered-city-items"
};

const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_WEATHER:
      return {
        ...state,
        weatherList: action.payload,
      };
    case actionTypes.SET_FORECAST:
      return {
        ...state,
        forecastList: action.payload,
      };
    case actionTypes.SET_CITY:
      return {
        ...state,
        cityList: action.payload,
      };
    case actionTypes.SET_ENTERED_CITY:
      return {
        ...state,
        enteredCity: action.payload,
      };
    default:
      throw new Error();
  }
};

function Index(props) {
  const utilContext = useUtilContext();

  const [city, setState] = useState("");
  const [msg, setMsg] = useState("");
  const [spinnerClassName, setSpinnerClassName] = useState("hide");

  const [state, dispatch] = useReducer(reducer, initialState);

  const handleInputChange = (e) => {
    const v = e.target.value;
    setState((pv) => (pv = v));
  };

  const closeForecastModal = () => {
    const modal = document.getElementById("forecastModal");
    modal.style.display = "none";
    dispatch({
      payload: {},
      type: actionTypes.SET_FORECAST,
    });
  };

  const loadForecast = (e, city) => {
    e.preventDefault();

    if (city === undefined || city === null || city === "") return false;

    const foundItem = state.cityList.find(
      (s) => s.id === city.toLocaleLowerCase()
    );

    if (foundItem) {
      const coord = foundItem.coord;
      const part = "minutely,hourly";
      const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${coord.lat}&lon=${coord.lon}&exclude=${part}&appid=${KEY}&units=metric`;

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          if (data.daily) {
            let forecast_1 = [];
            let count = 0;
            let newDate = new Date();

            data.daily.map((d) => {
              const { temp, weather } = d;
              const icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${weather[0]["icon"]}.svg`;

              forecast_1.push({ count, temp, weather, icon, date: newDate });
              count++;
            });

            dispatch({
              payload: { location: foundItem.location, forecast: forecast_1 },
              type: actionTypes.SET_FORECAST,
            });

            const modal = document.getElementById("forecastModal");
            modal.style.display = "block";
          }
        })
        .catch(() => {
          setMsg(
            (prevValue) => (prevValue = "Please search for a valid city 😩")
          );
          setSpinnerClassName((pv) => (pv = "hide"));
        });
    }
  };

  const handleOnSubmitViaClick = () => {
    if (city === undefined || city === "") return false;

    if (state.enteredCity && state.enteredCity.includes(city.toLocaleLowerCase())) {
      setMsg(
        (prevValue) => (prevValue = "You already know the weather for " + city)
      );
      setSpinnerClassName((pv) => (pv = "hide"));
      setState((pv) => pv = "");
      return false;
    }

    setSpinnerClassName((pv) => (pv = ""));

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${KEY}&units=metric`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const { main, name, sys, weather, coord } = data;
        const icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${weather[0]["icon"]}.svg`;

        let wl = state.weatherList;
        wl.push({
          main,
          name,
          sys,
          weather,
          coord,
          icon,
          city: city.toLocaleLowerCase(),
        });

        dispatch({
          payload: wl,
          type: actionTypes.SET_WEATHER,
        });

        setSpinnerClassName((pv) => (pv = "hide"));

        let enteredCity = state.enteredCity;
        enteredCity.push(city.toLocaleLowerCase())

        dispatch({
          payload: enteredCity,
          type: actionTypes.SET_ENTERED_CITY,
        });

        if (
          state.cityList.findIndex((s) => s.id === city.toLocaleLowerCase()) ===
          -1
        ) {
          let cl = state.cityList;
          cl.push({
            id: city.toLocaleLowerCase(),
            coord,
            location: name + ", " + sys.country,
          });

          dispatch({
            payload: cl,
            type: actionTypes.SET_CITY,
          });
        }
      })
      .catch(() => {
        setMsg(
          (prevValue) => (prevValue = "Please search for a valid city 😩")
        );
        setSpinnerClassName((pv) => (pv = "hide"));
      });

    setMsg((prevValue) => (prevValue = ""));
    setState((prevValue) => (prevValue = ""));
  };

  useEffect(() => {
    utilContext.hideLoader();
  
    initialState = {
      weatherList: [],
      forecastList: {},
      cityList: [],
      enteredCity: []
    };
  }, []);

  useEffect(() => {
    setState((prevValue) => (prevValue = "melbourne,au"));
    setTimeout(() => {
      if (document.getElementById("weatherSubmitButton"))
      {
        document.getElementById("weatherSubmitButton").click();
      }
    }, 200);

    return () => {
      
    };
  }, []);

  return (
    <div className="container">
      <div className="row">
        <div className="col-lg-12">
          <form className="">
            <input
              type="text"
              placeholder="Search for a city"
              className="form-control"
              value={city}
              onChange={handleInputChange}
            />
            <br />
            <button
              id="weatherSubmitButton"
              type="button"
              className="btn btn-primary"
              onClick={handleOnSubmitViaClick}
            >
              Submit
            </button>
            <Spinner animation="border" className={spinnerClassName} />
            &nbsp;<span className="msg">{msg}</span>
          </form>

          <section className="ajax-section">
            <div className="container">
              <Modal
                closeModal={closeForecastModal}
                data={state.forecastList}
              />

              <div className="cities row">
                {state.weatherList
                  ? state.weatherList.map((wl) => {
                      return (
                        <div
                          className="col-lg-3 col-md-3 col-sm-3 col-xs-3 city"
                          key={wl.name + "," + wl.sys.country}
                        >
                          <h2
                            className="city-name"
                            data-name={wl.name + "," + wl.sys.country}
                          >
                            <span>{wl.name}</span>
                            <sup>{wl.sys.country}</sup>
                          </h2>
                          <div className="city-temp">
                            {Math.round(wl.main.temp)}
                            <sup>°C</sup>
                          </div>
                          <figure>
                            <img
                              className="city-icon"
                              src={wl.icon}
                              alt={wl.weather[0]["description"]}
                            />
                            <figcaption>
                              {wl.weather[0]["description"]}
                            </figcaption>
                          </figure>
                          <div>
                            <button
                              className="btn btn-dark"
                              onClick={(e) =>
                                loadForecast(e, wl.city.toLocaleLowerCase())
                              }
                            >
                              Forecast
                            </button>
                          </div>
                        </div>
                      );
                    })
                  : ""}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default withRouter(Index);
