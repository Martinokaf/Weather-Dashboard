var apiKey = 'b58bacb147a83d70b06990c27651af94';
var today = $('#today');
var forecast = $('#forecast');
var cityInput = $("#search-input");

// Check local storage for existing forecast data
for (let key in localStorage) {
    if (key.indexOf(":forecast") !== -1) {
        renderHistory(key.replace(":forecast", ""));
    }
}

// Displays city info
$("#search-button").on("click", function (event) {
    event.preventDefault();
    
    let cityName = cityInput.val().trim();
    if (!cityName) {
        // Show an error message or prevent further execution
        return;
    }

    let currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&units=metric&q=${cityName}`;
    let forecastWeatherURL = `https://api.openweathermap.org/data/2.5/forecast?appid=${apiKey}&units=metric&q=${cityName}`;

    let cityDoesNotExistInLocalStorage = localStorage.getItem(cityName + ":forecast") === null;

    // Start fetching data
    Promise.all([fetch(currentWeatherURL), fetch(forecastWeatherURL)])
        .then(function ([currentResponse, forecastResponse]) {
            return Promise.all([currentResponse.json(), forecastResponse.json()]);
        })
        .then(function ([currentData, forecastData]) {
            // Store data in local storage
            localStorage.setItem(cityName + ":currentWeather", JSON.stringify(currentData));
            localStorage.setItem(cityName + ":forecast", JSON.stringify(forecastData));

            // Display city information after storing data
            displayCityInfo(cityName);

            // Render history if city does not exist in local storage
            if (cityDoesNotExistInLocalStorage) {
                renderHistory(cityName);
            }
        })
        .catch(function (error) {
            // Handle errors
            console.error('Error fetching data:', error);
        });
});

// This function first codes the logic for the search history button i.e. when it is clicked the data is printed to the screen.
// It then appends it to the search history area of the web page
function renderHistory(cityName) {
    let button = $("<button>").addClass("mb-3").text(cityName).on("click", function () {
        displayCityInfo(cityName);
    });
    $("#history").append(button);
}

// This creates the clear history button, which clears the local storage 
$("#clear").on("click", function () {
    localStorage.clear();
    $("#forecast").text("");
    $("#today").text("");
    $("#forecast-header").text("");
    $("#history").text("");
    $("#search-input").val("")
});

// This function is getting data from the local storage and printing it to the screen, using the functions created below it
function displayCityInfo(cityName) {
    printCurrentWeather(cityName, JSON.parse(localStorage.getItem(cityName + ":currentWeather")));
    futureForecast(JSON.parse(localStorage.getItem(cityName + ":forecast")));
}

// This function prints the current weather to the screen and creates the HTML dynamically
function printCurrentWeather(cityName, data) {
    let localUnixTime = data.dt + data.timezone; // The UNIX time is based on GMT. The timezone data is the number of seconds away from GMT so needs to be added to the UNIX time to generate the correct local time
    let currentTime = dayjs.unix(localUnixTime).format("dddd DD MMMM HH:mm");
    let currentWeatherDiv = $("<div>").addClass("border border-secondary border-4 rounded-end-pill");
    let currentWeatherHeader = $("<h2>").text(cityName + ", " + data.sys.country + ", " + currentTime);
    let currentWeatherIconCode = data.weather[0].icon;
    let currentWeatherIcon = $("<img>").attr("src", "https://openweathermap.org/img/wn/" + currentWeatherIconCode + "@2x.png");
    let currentWeatherDescription = $("<p>").addClass("description").text(data.weather[0].description);
    let currentTemp = $("<p>").text("Temperature: " + data.main.temp + " °C");
    let currentWind = $("<p>").text("Wind Speed: " + data.wind.speed + " metres/second");
    let currentHumidity = $("<p>").text("Humidity: " + data.main.humidity + "%");
    currentWeatherDiv.append(currentWeatherHeader, currentWeatherIcon, currentWeatherDescription, currentTemp, currentWind, currentHumidity);
    today.html(currentWeatherDiv);
}

// This function prints the 5-day forecast to the screen and creates the HTML dynamically
function futureForecast(data) {
    $("#forecast").text("");
    $("#forecast-header").text("5-day forecast:");
    console.log(data.list);
    for (let i = 7; i < data.list.length; i += 8) {
        let forecastWeatherDiv = $("<div>").addClass("col-2 me-4 border border-secondary border-4 rounded");
        let localUnixTime = data.list[i].dt;
        let forecastDate = dayjs.unix(localUnixTime).format("DD/MM/YY");
        let forecastWeatherHeader = $("<h4>").addClass("text-center").text(forecastDate);
        let forecastWeatherIconCode = data.list[i].weather[0].icon;
        let forecastWeatherIcon = $("<img>").addClass("mx-auto d-block").attr("src", "https://openweathermap.org/img/wn/" + forecastWeatherIconCode + "@2x.png");
        let forecastWeatherDescription = $("<p>").addClass("description").text(data.list[i].weather[0].description);
        let forecastTemp = $("<p>").text("Temp: " + data.list[i].main.temp + " °C");
        let forecastWind = $("<p>").text("Wind: " + data.list[i].wind.speed + " m/s");
        let forecastHumidity = $("<p>").text("Humidity: " + data.list[i].main.humidity + "%");
        forecastWeatherDiv.append(forecastWeatherHeader, forecastWeatherIcon, forecastWeatherDescription, forecastTemp, forecastWind, forecastHumidity);
        $("#forecast").append(forecastWeatherDiv);
    }
}

