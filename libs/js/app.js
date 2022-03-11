// Global Variables

//let wikipedia_fg;
let mymap = L.map("mapid", 3);
let country_code_global = "";
let currency_code_global = "";
let country_name;
let lat;
let lng;
let countrycapital = [];

let terrain = L.tileLayer(
  "https://{s}.tile.jawg.io/jawg-terrain/{z}/{x}/{y}{r}.png?access-token=JVg3LrVoy8EKxwL0gQrT16EFQLE87bgaOeatKm1iKyHZcUKuTevrzBQdBH1Fvdp2",
  {
    attribution:
      '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }
);

let street = L.tileLayer(
  "https://tile.jawg.io/jawg-streets/{z}/{x}/{y}.png?access-token=JVg3LrVoy8EKxwL0gQrT16EFQLE87bgaOeatKm1iKyHZcUKuTevrzBQdBH1Fvdp2",
  {
    attribution:
      '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }
);

let sunny = L.tileLayer(
  "https://tile.jawg.io/jawg-sunny/{z}/{x}/{y}.png?access-token=JVg3LrVoy8EKxwL0gQrT16EFQLE87bgaOeatKm1iKyHZcUKuTevrzBQdBH1Fvdp2",
  {
    attribution:
      '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }
);

let dark = L.tileLayer(
  "https://tile.jawg.io/jawg-dark/{z}/{x}/{y}.png?access-token=JVg3LrVoy8EKxwL0gQrT16EFQLE87bgaOeatKm1iKyHZcUKuTevrzBQdBH1Fvdp2",
  {
    attribution:
      '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }
);
let Thunderforest_MobileAtlas = L.tileLayer(
  "https://{s}.tile.thunderforest.com/mobile-atlas/{z}/{x}/{y}.png?apikey=339c028f6f034fdcb519c37173c414ef",
  {
    attribution:
      '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    apikey: "339c028f6f034fdcb519c37173c414ef",
    maxZoom: 22,
  }
);

let purple_thunderForest = L.tileLayer(
  "https://{s}.tile.thunderforest.com/pioneer/{z}/{x}/{y}.png?apikey={apikey}",
  {
    attribution:
      '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    apikey: "c7c156b13b1044b88c9cb21cb8a265de",
    maxZoom: 22,
  }
);

purple_thunderForest.addTo(mymap);

let baseMaps = {
  ThunderForest: purple_thunderForest,
  Terrain: terrain,
  Street: street,
  Sunny: sunny,
  Dark: dark,
  "Mobile Atlas": Thunderforest_MobileAtlas,
};

L.control.layers(baseMaps).addTo(mymap);

// Main AJAX & jQuery Code
$(document).ready(() => {
  get_country_codes();
  get_user_location();
});

function get_country_codes() {
  $.ajax({
    url: "libs/php/getCountriesCode.php?",
    type: "GET",
    success: function (json) {
      let countries = JSON.parse(json);
      let option = "";
      for (country of countries) {
        option +=
          '<option value="' + country[1] + '">' + country[0] + "</option>";
      }
      $("#country").html(option);
    },
  });
}

function get_user_location() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const { latitude } = position.coords;
        const { longitude } = position.coords;
        // const coords = [latitude, longitude];
        lat = latitude;
        lng = longitude;
        $.ajax({
          url:
            "libs/php/getCountryCodeFromLatLng.php?lat=" +
            latitude +
            "&lng=" +
            longitude +
            "&username=pdodia23",
          type: "GET",
          success: function (result) {
            const country_code = result.data.countryCode;
            $("#country").val(country_code).trigger("change");
          },
        });
      },
      function () {
        alert("Could not get your position!");
      }
    );
  }
}

function get_country_border(country_code) {
  $.ajax({
    url: "libs/php/getAllCountriesBorders.php",
    type: "GET",
    data: {
      country_code: country_code,
    },
    success: function (result) {
      json = JSON.parse(result);
      updateMap(json.type, json.coordinates, false);
    },
  });
}

$(window).load(function () {
  $(".loader-bg").fadeOut(6000);
});
function changeToCountry(country_code) {
  if (country_code == "") return;
  countrycapital.marker_capital = [];
  countrycapital.marker_cities = [];
  countrycapital.marker_airports = [];
  countrycapital.marker_webcams = [];
  country_name = $("#country option:selected").text().replace(/ /g, "");
  country_code_global = country_code;
  get_country_border(country_code);
  getCountryInfo(country_code);
  getExchangeRate(country_code);
  getWeatherInfo(country_code);
  getTimezone(country_code);
  getCovidInfo(country_code);
  getNews(country_code);
  getHoliday(country_code);
  getVideos(country_name);
  getFlag(country_code);
  getMapMarkers(country_code);
}

function getCountryInfo(country) {
  $.ajax({
    url: "libs/php/getCountryInfo.php",
    type: "GET",
    dataType: "json",
    data: {
      country: country,
    },
    success: function (result) {
      if (result.status.name == "ok") {
        var area = result.data.area;
        var name = result.data.name;
        var capitalCity = result.data.capital;
        var continent = result.data.region;
        var currencyCode = result.data.currencies[0].code;
        var languagesdata = result.data.languages;
        var languages = "";
        for (let i = 0; i < languagesdata.length; i++) {
          if (i == 0) {
            languages += languagesdata[i].name;
          } else {
            languages += "," + languagesdata[i].name;
          }
        }
        var population = result.data.population;
        currency_code_global = currencyCode;
        lat = result.data.latlng[0];
        lng = result.data.latlng[1];
        document.getElementById("countryInfoName").innerHTML = name;
        document.getElementById("countryInfoCapital").innerHTML = capitalCity;
        document.getElementById("countryInfoPopulation").innerHTML = `${(
          population / 1000000
        ).toFixed(1)} M`;
        document.getElementById("countryInfoArea").innerHTML = `${Math.floor(
          area
        )
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
        document.getElementById("countryInfoLanguage").innerHTML = languages;
        document.getElementById(
          "countryInfoCurrencyCode"
        ).innerHTML = `${currencyCode}`;
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(JSON.stringify(jqXHR));
      console.log(JSON.stringify(textStatus));
      console.log(JSON.stringify(errorThrown));
    },
  });
}

function getExchangeRate(country_code) {
  $.ajax({
    url: "libs/php/getExchangeRate.php",
    type: "GET",
    dataType: "json",
    data: {},

    success: function (result) {
      if (result.status.name == "ok") {
        var exchangeRate = result.data.rates[currency_code_global];
        document.getElementById(
          "countryInfoExchange"
        ).innerHTML = `${exchangeRate.toFixed(3)}`;
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(JSON.stringify(jqXHR));
      console.log(JSON.stringify(textStatus));
      console.log(JSON.stringify(errorThrown));
    },
  });
}

function getWeatherInfo(country) {
  $.ajax({
    url: "libs/php/getWeather.php",
    type: "GET",
    dataType: "json",
    data: {
      lat: lat,
      lng: lng,
    },
    success: function (result) {
      if (result.status.name == "ok") {
        const days = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",

          "Thursday",
          "Friday",
          "Saturday",
        ];
        var htmldata = "";
        htmldata +=
          '<table class="table"><thead><tr><th scope="col" colspan="4" class="weatherHead">Today</th></tr</thead><tbody class="weatherTable">';
        htmldata +=
          '<tr><td><i class=""></i></td><th scope="row"></th><td id="currentTemp">' +
          Math.floor(result.data.current.temp - 273.15) +
          '°C</td><td rowspan="3" class="weatherbground"><img src="http://openweathermap.org/img/wn/' +
          result.data.current.weather[0].icon +
          '@2x.png" id="weatherIcon"class="weatherIcon"alt="Tomorrow Weather Icon"/></td></tr>';
        htmldata +=
          '<tr><td><i class=""></i></td><th scope="row"></th><td id="description">' +
          result.data.current.weather[0].description +
          "</td></tr>";
        htmldata +=
          '<tr><td><i class=""></i></td><th scope="row"></th><td id="min">' +
          Math.floor(result.data.daily[0].temp.min - 273.15) +
          "°C" +
          "</td></tr>";
        htmldata +=
          '<tr><td><i class=""></i></td><th scope="row"></th><td id="max">' +
          Math.floor(result.data.daily[0].temp.max - 273.15) +
          "°C" +
          "</td></tr>";
        htmldata +=
          '<tr><td><i class=""></i></td><th scope="row"></th><td id="windSpeed">' +
          result.data.current.wind_speed +
          "mph" +
          "</td></tr>";
        htmldata += "</tbody></table>";

        for (let i = 0; i < 5; i++) {
          const d = result.data.daily[i].dt;

          const day = days[new Date(d * 1000).getDay()];

          htmldata +=
            '<table class="table"><thead><tr><th scope="col" colspan="4" class="weatherHead">' +
            day +
            '</th></tr</thead><tbody class="weatherTable">';
          htmldata +=
            '<tr><td><i class=""></i></td><th scope="row"></th><td id="tomorrowTemp">' +
            Math.floor(result.data.daily[i].temp.day - 273.15) +
            "°C" +
            '</td><td rowspan="3" class="weatherbground"><img src="http://openweathermap.org/img/wn/' +
            result.data.daily[i].weather[0].icon +
            '@2x.png" id="tomorrowIcon"class="weatherIcon"alt="Tomorrow Weather Icon"/></td></tr>';
          htmldata +=
            '<tr><td><i class=""></i></td><th scope="row"></th><td id="windSpeed">' +
            result.data.daily[i]["wind_speed"] +
            "mph";
          ("</td></tr>");
          htmldata +=
            '<tr><td><i class=""></i></td><th scope="row"></th><td id="description">' +
            result.data.daily[i].weather[0].description +
            "</td></tr>";
          htmldata +=
            '<tr><td><i class=""></i></td><th scope="row"></th><td id="min">' +
            Math.floor(result.data.daily[i].temp.min - 273.15) +
            "°C" +
            "</td></tr>";
          htmldata +=
            '<tr><td><i class=""></i></td><th scope="row"></th><td id="max">' +
            Math.floor(result.data.daily[i].temp.max - 273.15) +
            "°C" +
            "</td></tr>";
          htmldata += "</tbody></table>";
        }
        $("#weather_update").html(htmldata);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(JSON.stringify(jqXHR));
      console.log(JSON.stringify(textStatus));
      console.log(JSON.stringify(errorThrown));
    },
  });
}

function getTimezone(country) {
  $.ajax({
    url: "libs/php/getTimezone.php",
    type: "GET",
    dataType: "json",
    data: {
      lat: lat,
      lng: lng,
    },
    success: function (result) {
      if (result.status.name == "ok") {
        timezone = result.data.timezoneId;
        timeOffset = result.data.dstOffset;
        document.getElementById("countryInfoTimezone").innerHTML = timezone;
        document.getElementById("countryInfoOffset").innerHTML = timeOffset;
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(JSON.stringify(jqXHR));
      console.log(JSON.stringify(textStatus));
      console.log(JSON.stringify(errorThrown));
    },
  });
}

function getRESTCountryInfo(country) {
  $.ajax({
    url: "libs/php/getRESTCountryInfo.php",
    type: "GET",
    dataType: "json",
    data: {
      alpha3: country,
    },
    success: function (result) {
      if (result.status.name == "ok") {
        country.currencyCode = result[0].currencies[0].code;

        country.currencyName = result[0].currencies[0].name;
        console.log(country.currencyName);
        country.currencySymbol = result.data[0].currencies[0].symbol;
        console.log(country.currencySymbol);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(JSON.stringify(jqXHR));
      console.log(JSON.stringify(textStatus));
      console.log(JSON.stringify(errorThrown));
    },
  });
}

function getCovidInfo(country) {
  $.ajax({
    url: "libs/php/getCovidInfo.php",
    type: "GET",
    dataType: "json",
    data: {
      code: country,
    },
    success: function (result) {
      if (result.status.name == "ok") {
        document.getElementById("totalCases").innerHTML =
          result.data.data.latest_data.confirmed
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        document.getElementById("totalDeaths").innerHTML =
          result.data.data.latest_data.deaths
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        document.getElementById("totalRecovered").innerHTML =
          result.data.data.latest_data.recovered
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        document.getElementById("newCases").innerHTML =
          result.data.data.timeline[0].new_confirmed
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        document.getElementById("newDeaths").innerHTML =
          result.data.data.timeline[0].new_deaths
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        document.getElementById("newRecovered").innerHTML =
          result.data.data.timeline[0].new_recovered
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        document.getElementById("3mCases").innerHTML =
          result.data.data.timeline[90].confirmed
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        document.getElementById("3mDeaths").innerHTML =
          result.data.data.timeline[90].deaths
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        document.getElementById("3mRecovered").innerHTML =
          result.data.data.timeline[90].recovered
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        document.getElementById("6mCases").innerHTML =
          result.data.data.timeline[180].confirmed
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        document.getElementById("6mDeaths").innerHTML =
          result.data.data.timeline[180].deaths
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        document.getElementById("6mRecovered").innerHTML =
          result.data.data.timeline[180].recovered
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(JSON.stringify(jqXHR));
      console.log(JSON.stringify(textStatus));
      console.log(JSON.stringify(errorThrown));
    },
  });
}

function getNews(country) {
  $.ajax({
    url: "libs/php/getNews.php",
    type: "GET",
    dataType: "json",
    data: {
      country: country,
    },
    success: function (result) {
      if (result.status.name == "ok") {
        const data = result.data.articles;
        var htmldata = "";
        document.getElementById(
          "Modal4Title"
        ).innerHTML = `Latest Top News Stories for ${country}`;

        if (data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            htmldata +=
              '<div class="card float-left m-3" style="width: 20rem;"> <img class="card-img-top" src="' +
              data[i].urlToImage +
              '" alt="News Image"> <div class="card-body" style="color: #000;"> <h5 class="card-title">' +
              data[i].author +
              '</h5> <p class="card-text style="color: #000;"">' +
              data[i].title +
              '</p> <a href="' +
              data[i].url +
              '" target="_blank" class="btn btn-primary">Details</a> </div> </div>';
          }

          $("#news_data").html(htmldata);
        }
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(JSON.stringify(jqXHR));
      console.log(JSON.stringify(textStatus));
      console.log(JSON.stringify(errorThrown));
    },
  });
}

const flag = document.querySelector("#flag-container img");

function getFlag(country) {
  $.ajax({
    url: "libs/php/getFlag.php",
    type: "GET",
    dataType: "json",
    data: {
      country: country,
    },
    success: function (result) {
      if (result.status.name == "ok") {
        flag.src = result.data[0].flags.png;
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(JSON.stringify(jqXHR));
      console.log(JSON.stringify(textStatus));
      console.log(JSON.stringify(errorThrown));
    },
  });
}

function getHoliday(country) {
  $.ajax({
    url: "libs/php/getPublicHoliday.php",
    type: "GET",
    dataType: "json",
    data: {
      country: country,
    },
    success: function (result) {
      if (result.status.name == "ok") {
        for (
          let i = 0;
          i < result["data"]["response"]["holidays"].length;
          i++
        ) {
          if (
            result["data"]["response"]["holidays"][i]["type"][0] ===
            "National holiday"
          ) {
            const data = result.data.response.holidays;
            var htmldata = "";
            document.getElementById(
              "Modal6Title"
            ).innerHTML = `Holidays For ${country_name}`;

            if (data.length > 0) {
              for (let i = 0; i < data.length; i++) {
                htmldata +=
                  `<p class="holidayHeading">${
                    data[i].name
                  }<span class="holidayDate">${Date.parse(
                    data[i]["date"]["iso"]
                  ).toDateString()}</span></p>` +
                  `<p class="holidayDescription">${data[i].description}</p><br>`;
              }

              $("#holiday_data").html(htmldata);
            }
          }
        }
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(JSON.stringify(jqXHR));
      console.log(JSON.stringify(textStatus));
      console.log(JSON.stringify(errorThrown));
    },
  });
}

const video = document.querySelector("#video-container video");

function getVideos(country_name) {
  $.ajax({
    url: "libs/php/getVideos.php",
    type: "GET",
    dataType: "json",
    data: {
      country: country_name,
    },
    success: function (result) {
      if (result.status.name == "ok") {
        for (let i = 0; i < result.data.videos.length; i++) {
          video.src = result.data.videos[0].video_files[0].link;
        }
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(JSON.stringify(jqXHR));
      console.log(JSON.stringify(textStatus));
      console.log(JSON.stringify(errorThrown));
    },
  });
}

function getMapMarkers(country) {
  $.ajax({
    url: "libs/php/mapMarkers/getMapCapital.php",
    type: "GET",
    dataType: "json",
    data: {
      country: country,
    },
    success: function (result) {
      if (result.status.name == "ok") {
        countrycapital.marker_capital = [
          result["data"]["geonames"]["0"]["name"],
          result["data"]["geonames"]["0"]["population"],
          result["data"]["geonames"]["0"]["lat"],
          result["data"]["geonames"]["0"]["lng"],
        ];
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(JSON.stringify(jqXHR));
      console.log(JSON.stringify(textStatus));
      console.log(JSON.stringify(errorThrown));
    },
  });

  $.ajax({
    url: "libs/php/mapMarkers/getMapCities.php",
    type: "GET",
    dataType: "json",
    data: {
      country: country,
    },
    success: function (result) {
      if (result.status.name == "ok") {
        for (let i = 0; i < result["data"]["geonames"].length; i++) {
          countrycapital.marker_cities.push([
            result["data"]["geonames"][i]["name"],
            result["data"]["geonames"][i]["population"],
            result["data"]["geonames"][i]["lat"],
            result["data"]["geonames"][i]["lng"],
          ]);
        }
      }
    },

    error: function (jqXHR, textStatus, errorThrown) {
      console.log(JSON.stringify(jqXHR));
      console.log(JSON.stringify(textStatus));
      console.log(JSON.stringify(errorThrown));
    },
  });

  // wikipedia_fg = new L.FeatureGroup();
  // mymap.addLayer(wikipedia_fg);

  $.ajax({
    url: "libs/php/mapMarkers/getMapAirports.php",
    type: "GET",
    dataType: "json",
    data: {
      country: country_code_global,
    },
    success: function (result) {
      if (result.status.name == "ok") {
        for (let i = 0; i < result["data"]["geonames"].length; i++) {
          countrycapital.marker_airports.push([
            result["data"]["geonames"][i]["name"],
            result["data"]["geonames"][i]["lat"],
            result["data"]["geonames"][i]["lng"],
          ]);
        }
      }
    },

    error: function (jqXHR, textStatus, errorThrown) {
      console.log(JSON.stringify(jqXHR));
      console.log(JSON.stringify(textStatus));
      console.log(JSON.stringify(errorThrown));
    },
  });

  $.ajax({
    url: "libs/php/mapMarkers/getWebcams.php",
    type: "GET",
    dataType: "json",
    data: {
      country: country_code_global,
    },
    success: function (result) {
      if (result.status.name == "ok") {
        for (let i = 0; i < result["data"]["result"]["webcams"].length; i++) {
          countrycapital.marker_webcams.push([
            result["data"]["result"]["webcams"][i]["location"]["latitude"],
            result["data"]["result"]["webcams"][i]["location"]["longitude"],
            result["data"]["result"]["webcams"][i]["location"]["city"],
            result["data"]["result"]["webcams"][i]["location"]["country"],
            result["data"]["result"]["webcams"][i]["player"]["day"]["embed"],
          ]);
        }
      }
    },

    error: function (jqXHR, textStatus, errorThrown) {
      console.log(JSON.stringify(jqXHR));
      console.log(JSON.stringify(textStatus));
      console.log(JSON.stringify(errorThrown));
    },
  });
}

//flag

function findAvgLatLng(country) {
  // Call to JSON file
  $.ajax({
    type: "GET",
    url: "libs/js/json/countryInfo.json",
    data: {},
    dataType: "json",
    success: function (data) {
      let alpha2 = country.iso_a2;

      for (let i = 0; i < data.length; i++) {
        let jsonalpha2 = data[i]["Alpha-2 code"];
        let latAvg = data[i]["Latitude"];
        let lngAvg = data[i]["Longitude"];

        if (alpha2 == jsonalpha2) {
          country.lat = latAvg;
          country.lng = lngAvg;
        }
      }
    },
  });
}

L.easyButton({
  position: "topleft",
  id: "countryBtn",
  states: [
    {
      icon: "none",
      stateName: "unchecked",
      title: "Show Country Information",
      onClick: function (btn, map) {
        $("#countryInfoModal").modal("show");

        $(".close").click(function () {
          $("#countryInfoModal").modal("hide");
        });

        document.getElementById(
          "Modal1Title"
        ).innerHTML = `${country_name} Information`;

        document.getElementById(
          "Modal1Title"
        ).innerHTML = `${country_name} Information`;
      },
    },
    {
      icon: "&#x238C;",
      stateName: "checked",
      onClick: function (btn, map) {
        btn.state("unchecked");
      },
    },
  ],
}).addTo(mymap);

L.easyButton({
  id: "weatherBtn",
  states: [
    {
      icon: "none",
      stateName: "unchecked",
      title: "Show Weather Forecast",
      onClick: function (btn, map) {
        $("#weatherModal").modal("show");

        $(".close").click(function () {
          $("#weatherModal").modal("hide");
        });

        document.getElementById(
          "Modal2Title"
        ).innerHTML = `Weather Forecast for ${country_name}`;
      },
    },
    {
      icon: "&#x238C;",
      stateName: "checked",
      onClick: function (btn, map) {
        btn.state("unchecked");
      },
    },
  ],
}).addTo(mymap);

L.easyButton({
  id: "covidBtn",
  states: [
    {
      icon: "none",
      stateName: "unchecked",
      title: "Show COVID-19 Country Statistics",
      onClick: function (btn, map) {
        $("#covidModal").modal("show");

        $(".close").click(function () {
          $("#covidModal").modal("hide");
        });

        document.getElementById(
          "Modal3Title"
        ).innerHTML = `COVID-19 Statistics for ${country_name}`;
      },
    },
    {
      icon: "&#x238C;",
      stateName: "checked",
      onClick: function (btn, map) {
        btn.state("unchecked");
      },
    },
  ],
}).addTo(mymap);

L.easyButton({
  id: "newsBtn",
  states: [
    {
      icon: "none",
      stateName: "unchecked",
      title: "Show Top Country News",
      onClick: function (btn, map) {
        $("#newsModal").modal("show");

        $(".close").click(function () {
          $("#newsModal").modal("hide");
        });
      },
    },
    {
      icon: "&#x238C;",
      stateName: "checked",
      onClick: function (btn, map) {
        btn.state("unchecked");
      },
    },
  ],
}).addTo(mymap);

L.easyButton({
  position: "topleft",
  id: "flagBtn",
  states: [
    {
      icon: "none",
      stateName: "unchecked",
      title: "Show Country Flag",
      onClick: function (btn, map) {
        $("#flagModal").modal("show");

        $(".close").click(function () {
          $("#flagModal").modal("hide");
        });

        document.getElementById(
          "Modal7Title"
        ).innerHTML = `${country_name} Flag`;

        document.getElementById(
          "Modal7Title"
        ).innerHTML = `${country_name} Flag`;
      },
    },
    {
      icon: "&#x238C;",
      stateName: "checked",
      onClick: function (btn, map) {
        btn.state("unchecked");
      },
    },
  ],
}).addTo(mymap);

L.easyButton({
  position: "topleft",
  id: "videoBtn",
  states: [
    {
      icon: "none",
      stateName: "unchecked",
      title: "Show Country Videos",
      onClick: function (btn, map) {
        $("#videoModal").modal("show");

        $(".close").click(function () {
          $("#videoModal").modal("hide");
        });

        document.getElementById(
          "Modal8Title"
        ).innerHTML = `${country_name} Video`;

        document.getElementById(
          "Modal8Title"
        ).innerHTML = `${country_name} Video`;
      },
    },
    {
      icon: "&#x238C;",
      stateName: "checked",
      onClick: function (btn, map) {
        btn.state("unchecked");
      },
    },
  ],
}).addTo(mymap);

L.easyButton({
  id: "holidayBtn",
  states: [
    {
      icon: "none",
      stateName: "unchecked",
      title: "National Holidays",
      onClick: function (btn, map) {
        $("#holidayModal").modal("show");

        $(".close").click(function () {
          $("#holidayModal").modal("hide");
        });
      },
    },
    {
      icon: "&#x238C;",
      stateName: "checked",
      onClick: function (btn, map) {
        btn.state("unchecked");
      },
    },
  ],
}).addTo(mymap);

var markerClusters = L.markerClusterGroup();

var MapIcon = L.Icon.extend({
  options: {
    iconSize: [30, 30],
    popupAnchor: [0, -20],
  },
});

function capitalDisable() {
  capitalBtn.disable();
}

var capitalBtn = L.easyButton({
  position: "topleft",
  id: "capital",
  states: [
    {
      icon: "none",
      stateName: "unchecked",
      title: "Show Capital City",
      onClick: function (btn, map) {
        var countryCapitalIcon = L.Icon.extend({
          options: {
            iconSize: [45, 45],
            popupAnchor: [0, -20],
          },
        });

        var capitalIcon = new countryCapitalIcon({
          iconUrl: "libs/icons/capital.png",
        });

        var m = L.marker(
          new L.LatLng(
            countrycapital.marker_capital[2],
            countrycapital.marker_capital[3]
          ),
          { icon: capitalIcon }
        ).bindPopup(`
            <b>Capital City: </b> ${countrycapital.marker_capital[0]} <br>
            <b>Population: </b> ${(
              countrycapital.marker_capital[1] / 1000000
            ).toFixed(1)} M
            `);
        markerClusters.addLayer(m);

        mymap.addLayer(markerClusters);

        capitalDisable();
      },
    },
    {
      icon: "none",
      stateName: "checked",
      onClick: function (btn, map) {
        btn.state("unchecked");
      },
    },
  ],
}).addTo(mymap);

function cityDisable() {
  cityBtn.disable();
}

var cityBtn = L.easyButton({
  position: "topleft",
  id: "cities",
  states: [
    {
      icon: "none",
      stateName: "unchecked",
      title: "Show Top 25 Cities",
      onClick: function (btn, map) {
        var cityIcon = new MapIcon({ iconUrl: "libs/icons/place.png" });

        for (i = 0; i < countrycapital.marker_cities.length; i++) {
          var m = L.marker(
            new L.LatLng(
              countrycapital.marker_cities[i][2],
              countrycapital.marker_cities[i][3]
            ),
            { icon: cityIcon }
          ).bindPopup(`
                        <b>City:</b> ${countrycapital.marker_cities[i][0]} <br> 
                        <b>Population: </b> ${countrycapital.marker_cities[i][1]
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} 
                    `);
          markerClusters.addLayer(m);
          console.log(countrycapital.marker_cities);
        }

        mymap.addLayer(markerClusters);

        cityDisable();
      },
    },
    {
      icon: "none",
      stateName: "checked",
      onClick: function (btn, map) {
        btn.state("unchecked");
      },
    },
  ],
}).addTo(mymap);

function airportsDisable() {
  airportsBtn.disable();
}

function webcamsDisable() {
  webcamsBtn.disable();
}

var airportsBtn = L.easyButton({
  position: "topleft",
  id: "airports",
  states: [
    {
      icon: "none",
      stateName: "unchecked",
      title: "Show Airports",
      onClick: function (btn, map) {
        var airportIcon = new MapIcon({ iconUrl: "libs/icons/airport.png" });

        for (i = 0; i < countrycapital.marker_airports.length; i++) {
          var m = L.marker(
            new L.LatLng(
              countrycapital.marker_airports[i][1],
              countrycapital.marker_airports[i][2]
            ),
            { icon: airportIcon }
          ).bindPopup(`${countrycapital.marker_airports[i][0]}`);
          markerClusters.addLayer(m);
          console.log(countrycapital.marker_airports);
        }

        mymap.addLayer(markerClusters);

        airportsDisable();
      },
    },
    {
      icon: "none",
      stateName: "checked",
      onClick: function (btn, map) {
        btn.state("unchecked");
      },
    },
  ],
}).addTo(mymap);

var webcamsBtn = L.easyButton({
  position: "topleft",
  id: "webcams",
  states: [
    {
      icon: "none",
      stateName: "unchecked",
      title: "Show Webcams",
      onClick: function (btn, map) {
        var webcamIcon = new MapIcon({ iconUrl: "libs/icons/camera.png" });

        for (i = 0; i < countrycapital.marker_webcams.length; i++) {
          var m = L.marker(
            new L.LatLng(
              countrycapital.marker_webcams[i][0], //lat
              countrycapital.marker_webcams[i][1], //long
              countrycapital.marker_webcams[i][2], //city
              countrycapital.marker_webcams[i][3], //country
              countrycapital.marker_webcams[i][4] //day video
            ),
            { icon: webcamIcon }
          )
            .bindPopup(`<iframe src="${countrycapital.marker_webcams[i][4]}" loading="auto" allowfullscreen="true" controls style="width:250px; height:140px;border-radius:10px;"></iframe><br><br>
      <h6 class="webcamText">${countrycapital.marker_webcams[i][2]}<br> ${countrycapital.marker_webcams[i][3]}</h6><br>
      
    `);
          markerClusters.addLayer(m);
        }

        mymap.addLayer(markerClusters);

        webcamsDisable();
      },
    },
    {
      icon: "none",
      stateName: "checked",
      onClick: function (btn, map) {
        btn.state("unchecked");
      },
    },
  ],
}).addTo(mymap);

L.easyButton({
  position: "topleft",
  id: "reset",
  states: [
    {
      icon: "none",
      stateName: "unchecked",
      title: "Reset Icons",
      onClick: function (btn, map) {
        get_country_border(country_code_global);
      },
    },
    {
      icon: "&#x238C;",
      stateName: "checked",
      onClick: function (btn, map) {
        btn.state("unchecked");
      },
    },
  ],
}).addTo(mymap);

function updateMap(type, coordinates, borderChange) {
  capitalBtn.enable();
  cityBtn.enable();

  airportsBtn.enable();
  webcamsBtn.enable();

  markerClusters = L.markerClusterGroup();

  mymap.eachLayer(function (layer) {
    if (layer != purple_thunderForest) {
      mymap.removeLayer(layer);
    }
  });

  border = new L.geoJSON(
    {
      type: type,
      coordinates: coordinates,
    },
    {
      style: {
        color: "#301934",
      },
    }
  ).addTo(mymap);

  var bound = border.getBounds();
  mymap.fitBounds(border.getBounds());

  const east = bound.getEast();
  const west = bound.getWest();
  const north = bound.getNorth();
  const south = bound.getSouth();
  //get_nearby_wikipedia(east, west, north, south);
}

// function get_nearby_wikipedia(east, west, north, south) {
//   wikipedia_fg.clearLayers();
//   $.ajax({
//     url: "libs/php/wikiSearch.php",
//     type: "GET",
//     data: {
//       east: east,
//       west: west,
//       north: north,
//       south: south,
//     },
//     success: function (result) {
//       const data = result.data.geonames;

//       var cityIcon = new MapIcon({ iconUrl: "libs/icons/wiki.png" });
//       for (let i = 0; i < data.length; i++) {
//         const marker = L.marker([data[i].lat, data[i].lng], {
//           icon: cityIcon,
//         }).bindPopup(
//           `<p id="wikiTitle">${data[i].title}</p>` +
//             "<br>" +
//             `<p id="wikiSummary">${data[i].summary}</p>` +
//             "</b><br><a class='wikiLink' href='https://" +
//             data[i].wikipediaUrl +
//             "' target='_blank'>Read More &#8594;</a>"
//         );
//         mymap.addLayer(marker);
//       }
//     },
//   });
// }
