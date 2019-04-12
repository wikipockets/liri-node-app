require("dotenv").config();
var fs = require("fs");
var keys = require("./keys.js");
var request = require('request');
var Spotify = require('node-spotify-api');
var spotify = new Spotify(keys.spotify);

var cmd = process.argv[2];
var arg = process.argv[3];

// concert-this
// spotify-this-song
// movie-this
// do-what-it-says

function switchCase() {

  switch (cmd) {

    case 'concert-this':
      bandsInTown(arg);
      break;

    case 'spotify-this-song':
      spotSong(arg);
      break;

    case 'movie-this':
      movieInfo(arg);
      break;

    case 'do-what-it-says':
      getRandom();
      break;

    default:
      logIt("Invalid Instruction");
      break;

  }
};

function bandsInTown(arg) {

  if (cmd === 'concert-this') {
    var movieName = "";
    for (var i = 3; i < process.argv.length; i++) {
      movieName += process.argv[i];
    }
    console.log(movieName);
  } else {
    movieName = arg;
  }


  var queryUrl = "https://rest.bandsintown.com/artists/" + movieName + "/events?app_id=codingbootcamp";


  request(queryUrl, function (error, response, body) {

    if (!error && response.statusCode === 200) {

      var JS = JSON.parse(body);
      for (i = 0; i < JS.length; i++) {
        var dTime = JS[i].datetime;
        var month = dTime.substring(5, 7);
        var year = dTime.substring(0, 4);
        var day = dTime.substring(8, 10);
        var dateForm = month + "/" + day + "/" + year

        logIt("Date: " + dateForm);
        logIt("Name: " + JS[i].venue.name);
        logIt("City: " + JS[i].venue.city);
        if (JS[i].venue.region !== "") {
          logIt("Country: " + JS[i].venue.region);
        }
        logIt("Country: " + JS[i].venue.country);
        logIt("\n---------------------------------------------------\n");

      }
    }
  });
}

function spotSong(arg) {

  var searchTrack;
  if (arg === undefined) {
    searchTrack = "The Sign ace of base";
  } else {
    searchTrack = arg;
  }

  spotify.search({
    type: 'track',
    query: searchTrack
  }, function (error, data) {
    if (error) {
      logIt('Error occurred: ' + error);
      return;
    } else {
      logIt("\n---------------------------------------------------\n");
      logIt("Artist: " + data.tracks.items[0].artists[0].name);
      logIt("Song: " + data.tracks.items[0].name);
      logIt("Preview: " + data.tracks.items[3].preview_url);
      logIt("Album: " + data.tracks.items[0].album.name);
      logIt("\n---------------------------------------------------\n");

    }
  });
};

function movieInfo(arg) {

  var findMovie;
  if (arg === undefined) {
    findMovie = "Mr. Nobody";
  } else {
    findMovie = arg;
  };

  var queryUrl = "http://www.omdbapi.com/?t=" + findMovie + "&y=&plot=short&apikey=trilogy";

  request(queryUrl, function (err, res, body) {
    var bodyOf = JSON.parse(body);
    if (!err && res.statusCode === 200) {
      logIt("\n---------------------------------------------------\n");
      logIt("Title: " + bodyOf.Title);
      logIt("Release Year: " + bodyOf.Year);
      logIt("IMDB Rating: " + bodyOf.imdbRating);
      logIt("Rotten Tomatoes Rating: " + bodyOf.Ratings[1].Value);
      logIt("Country: " + bodyOf.Country);
      logIt("Language: " + bodyOf.Language);
      logIt("Plot: " + bodyOf.Plot);
      logIt("Actors: " + bodyOf.Actors);
      logIt("\n---------------------------------------------------\n");
    }
  });
};

function getRandom() {
  fs.readFile('random.txt', "utf8", function (error, data) {

    if (error) {
      return logIt(error);
    }

    var dataArr = data.split(",");

    if (dataArr[0] === "spotify-this-song") {
      var songcheck = dataArr[1].trim().slice(1, -1);
      spotSong(songcheck);
    } else if (dataArr[0] === "concert-this") {
      if (dataArr[1].charAt(1) === "'") {
        var dLength = dataArr[1].length - 1;
        var data = dataArr[1].substring(2, dLength);
        console.log(data);
        bandsInTown(data);
      } else {
        var bandName = dataArr[1].trim();
        console.log(bandName);
        bandsInTown(bandName);
      }

    } else if (dataArr[0] === "movie-this") {
      var movie_name = dataArr[1].trim().slice(1, -1);
      movieInfo(movie_name);
    }

  });

};

function logIt(dataToLog) {

  console.log(dataToLog);

  fs.appendFile('log.txt', dataToLog + '\n', function (err) {

    if (err) return logIt('Error logging data to file: ' + err);
  });
}

switchCase();