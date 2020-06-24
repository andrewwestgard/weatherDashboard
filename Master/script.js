//All code will be ready run when the page is rendered
$(document).ready(function() {
  //eventListner for the search button 
    //will find the  search value in the search value id
  $("#search-button").on("click", function() {
    var searchValue = $("#search-value").val();
    
    // clear input box
      //sets the search value back to an empty stringt
    $("#search-value").val("");
    //makes a querry for the weather
    searchWeather(searchValue);
  });

    //Searches the weather for the city searched by the user
  $(".history").on("click", "li", function() {
    //Store the text
    searchWeather($(this).text());
  });

    //Creates the city search history tab on the left side of the page
  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    //appends it to the page
    $(".history").append(li);
  }

  //main search function that searches and grabs info from the API
  function searchWeather(searchValue) {
    $.ajax({
      type: "GET",
      //The API url and the API key to get the weather map information
      url: "http://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=08bce3851a2504c6cadfe41faa8bc8ac&units=imperial",
      //returns the data in JSON 
      dataType: "json",
      //if the query is successful in finding the specified weather data for the city.
      success: function(data) {
        // create history link for this search
        if (history.indexOf(searchValue) === -1) {
          history.push(searchValue);
          window.localStorage.setItem("history", JSON.stringify(history));
          //appending and creating the content and links for the history section above
          makeRow(searchValue);
        }
        
        // clear any old content
        $("#today").empty();

        // create html content for current weather
          //Referencing the various return data that the API brings back and setting it equal to a variable
        //City Title
        var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
        //Card the data cits in
        var card = $("<div>").addClass("card");
        //Wind Speed
        var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
        //Humidity
        var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
        //Temperature 
        var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
        //Body copy
        var cardBody = $("<div>").addClass("card-body");
        //IMG 
        var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png");

        // merge and add to page
        //Adds the title above the card div
        title.append(img);
        //appends tbe main content into the cardBody div
        cardBody.append(title, temp, humid, wind);
        //appends the card body to the page
        card.append(cardBody);
        //appends todays date 
        $("#today").append(card);

        // call follow-up api endpoints
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
        getHourlyForecast(data.coord.lat, data.coord.lon);
      }
    
    });
  }
  
  function getForecast(searchValue) {
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=08bce3851a2504c6cadfe41faa8bc8ac&units=imperial",
      dataType: "json",
      success: function(data) {
        // overwrite any existing content with title and empty row
        $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a bootstrap card
            var col = $("<div>").addClass("col-md-2");
            var card = $("<div>").addClass("card bg-primary text-white");
            var body = $("<div>").addClass("card-body p-2");

            var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());

            var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");

            var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
            var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");

            // merge together and put on page
            col.append(card.append(body.append(title, img, p1, p2)));
            $("#forecast .row").append(col);
          }
        }
      }
    });
  }

  function getUVIndex(lat, lon) {
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/uvi?appid=08bce3851a2504c6cadfe41faa8bc8ac&lat=" + lat + "&lon=" + lon,
      dataType: "json",
      success: function(data) {
        var uv = $("<p>").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);
        
        // change color depending on uv value
        if (data.value < 3) {
          btn.addClass("btn-success");
        }
        else if (data.value < 7) {
          btn.addClass("btn-warning");
        }
        else {
          btn.addClass("btn-danger");
        }
        
        $("#today .card-body").append(uv.append(btn));
      }
    });
  }

  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  if (history.length > 0) {
    searchWeather(history[history.length-1]);
  }

  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }


  // function getHourlyForecast(lat, lon) {
  //   $.ajax({
  //     type: "GET",
  //     url: "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&appid=08bce3851a2504c6cadfe41faa8bc8ac",
  //     dataType: "json",
  //     success: function (data) {
  //       console.log(data);
  //       // for (var i = 0; i< 5; i++) {

  //       // }
  //     }
  //   })
  // }
});

function getHourlyForecast(lat, lon) {
  $.ajax({
    type: "GET",
    url: "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&appid=08bce3851a2504c6cadfe41faa8bc8ac&units=imperial",
    dataType: "json",
    success: function (data) {
      console.log(data);
      $('#hourlyForecast').html("<h4 class=\"mt-3\">5-Hour Forecast:</h4>").append("<div class=\"row\">");
      var hour = moment().startOf("hour");
      console.log(hour);
      //gives us all 5 temps
      for (let i = 0; i < 5; i++) {
        var currentHourTemp = data.hourly[i].temp;
        console.log(hour)

        console.log(currentHourTemp);
        //Creates a row and columns for our values
        var col = $('<div>').addClass('col-md-2');
        var card = $('<div>').addClass("card bg-primary text-white");
        var body = $("<div>").addClass("card-body p-2");
        
       

        var title = $("<h5>").addClass("card-title").text(hour.add(1, 'h').format("h a"));
        console.log(title);

        var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.hourly[i].weather[0].icon + ".png");

        var p1 = $("<p>").addClass("card-text").text("Temp: " + currentHourTemp + " °F");


        col.append(card.append(body.append(title, img, p1,)));
        $("#hourlyForecast .row").append(col);
      }
      
    }
  })};

//WHAT TO DISPLAY IN OUR 5 HOUR FORECAST
  //1. Temp
  //2. The weather img
              // create html elements for a bootstrap card
              // var col = $("<div>").addClass("col-md-2");
              // var card = $("<div>").addClass("card bg-primary text-white");
              // var body = $("<div>").addClass("card-body p-2");
  
              // var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
  
              // var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
  
              // var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
              // var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");
  
              // // merge together and put on page
              // col.append(card.append(body.append(title, img, p1, p2)));
              // $("#forecast .row").append(col);