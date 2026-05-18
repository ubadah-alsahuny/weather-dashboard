import {useEffect, useRef, useState} from "react";

import './App.css';

import ClearDay from "@meteocons/svg-static/fill/clear-day.svg";
import ClearNight from "@meteocons/svg-static/fill/clear-night.svg";
import CloudyDay from "@meteocons/svg-static/fill/cloudy.svg";
import SnowyDay from "@meteocons/svg-static/fill/snow.svg";
import RainyDay from "@meteocons/svg-static/fill/rain.svg";
import StormyDay from "@meteocons/svg-static/fill/thunderstorms.svg";

interface WeatherInfo {
    number: number;
    startTime: string;
    name: string;
    isDaytime: boolean;
    temperature: number;
    shortForecast: string;
    detailedForecast: string;
}

function analyzeWeatherCondition(forecast: string): string {
    const text = forecast.toLowerCase();

    if (text.includes("thunderstorm")) { return "thunderstorm"; }
    if (text.includes("rain") || text.includes("shower") || text.includes("drizzle")) { return "rainy"; }
    if (text.includes("snow") || text.includes("blizzard") || text.includes("flurry")) { return "snowy"; }
    if (text.includes("cloudy") || text.includes("overcast")) { return "cloudy"; }
    if (text.includes("sunny")) { return "sunny"; }
    if (text.includes("clear")) { return "clear"; }
    return "unknown";
}

const WEATHER_ICONS: Record<string, { label: string; icon: string }> = {
    sunny: { label: "sunny", icon: ClearDay },
    clear: { label: "clear", icon: ClearNight},
    cloudy: { label: "cloudy", icon: CloudyDay },
    snowy: { label: "snowy", icon: SnowyDay },
    rainy: { label: "rainy", icon: RainyDay },
    thunderstorm: { label: "stormy", icon: StormyDay },
}

function App() {

    const [celsius, setCelsius] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [weather, setWeather] = useState<WeatherInfo[]>([]);
    const [daytime, setDaytime] = useState(true);

    const BASE_URL = "https://api.weather.gov/gridpoints";

    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        const fetchForWeather = async () => {
            abortControllerRef.current?.abort();
            abortControllerRef.current = new AbortController();

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`${BASE_URL}/TOP/10,80/forecast`,
                    {signal: abortControllerRef.current?.signal});

                if (!response.ok) {
                    throw new Error(`Server responded with this message: ${response.status}`);
                }

                const data = await response.json();
                setWeather(data.properties.periods);
                setLoading(false);
            } catch (error: any) {
                if (error.name === "AbortError") {
                    return;
                }
                setError(error.message || "An unexpected error occurred.");
                setLoading(false);
            }
        }

        fetchForWeather();
    }, []);

    return (
        <div className='screenSettings'>
            <div className='titleBox'>
                <h1 style={{color: "#111015", padding: '0.5rem', textAlign: 'center'}}>
                    Weather Dashboard
                </h1>
            </div>

            {loading ?
                <p className="loadingText">Loading...</p>
                :
                error ?
                    <div style={{width: '100%', placeItems: 'center'}}>
                        <p style={{width: '50%', textAlign: 'justify'}}>
                            We're very sorry; it seems like an error had occurred while fetching for forecast data. You
                            can refresh the page, or try again later.
                        </p>

                        <br/>

                        <p style={{width: '50%', textAlign: 'center', fontSize: '1.5rem'}}>
                            {error}
                        </p>
                    </div>
                    :
                    <div>
                        <ul className='listStyle'>
                            {weather.map((weatherData) => {
                                const dateObject = new Date(weatherData.startTime);
                                const formattedDate = dateObject.toLocaleDateString("en-US", {
                                    month: "short", day: "numeric"
                                })

                                const weatherCondition = analyzeWeatherCondition(weatherData.shortForecast);
                                const specifiedWeatherCondition = WEATHER_ICONS[weatherCondition];
                                if (weatherData.isDaytime == daytime) {
                                    return <li key={weatherData.number} className="weatherCard"
                                            weather-data={weatherData.detailedForecast}>
                                            <div style={{textAlign: 'center', height: '3rem'}}>
                                                <p style={{lineHeight: 1}}>
                                                    {weatherData.name}
                                                </p>

                                                <p style={{fontSize: '0.875rem', opacity: '0.5'}}>
                                                    {formattedDate}
                                                </p>
                                            </div>

                                            <div>
                                                <div>
                                                    <img src={specifiedWeatherCondition.icon} alt={"weather-condition"}
                                                         width="64" height="64"/>
                                                </div>
                                            </div>

                                            <div style={{display: 'flex', height: '3rem'}}>
                                                <p style={{fontSize: '2rem'}}>
                                                    {celsius ?
                                                        // Mathematically rounding the double number to only accept 1 digit after the period
                                                        Math.round(((weatherData.temperature - 32) * (5 / 9)) * 10.0) / 10.0
                                                        :
                                                        weatherData.temperature}
                                                </p>°{celsius ? "" : "F"}
                                            </div>
                                        </li>
                                }
                            })}
                        </ul>
                        <br/>
                        <div className='controlButtons'>
                            <button
                                onClick={() => {
                                    setCelsius(!celsius)
                                }}>
                                {celsius ? "Change to Fahrenheit" : "Change to Celsius"}
                            </button>
                            <button
                                onClick={() => {
                                    setDaytime(!daytime)
                                }}>
                                {daytime ? "See Nighttime forecast" : "See Daytime forecast"}
                            </button>
                        </div>
                    </div>
            }
        </div>
    )
}

export default App
