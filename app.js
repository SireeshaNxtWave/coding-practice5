const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// GET list of movies
app.get("/movies/", async (request, response) => {
  const getMoviesListQuery = `
        SELECT 
            movie_name AS movieName
        FROM
            movie
        ORDER BY
            movie_id;`;
  const dbResponse = await db.all(getMoviesListQuery);
  response.send(dbResponse);
});

// POST the movie data
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { movieId, directorId, movieName, leadActor } = movieDetails;
  const postMovieDetailsQuery = `
        INSERT INTO
            movie (director_id, movie_name, lead_actor)
        VALUES(
            ${directorId},
            '${movieName}',
            '${leadActor}'
        );`;
  await db.run(postMovieDetailsQuery);
  response.send("Movie Successfully Added");
});

// GET movie details by id
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieByID = `
        SELECT * FROM movie
        WHERE movie_id = ${movieId};`;
  const dbResponse = await db.get(getMovieByID);
  const result = {
    movieId: dbResponse.movie_id,
    directorId: dbResponse.director_id,
    movieName: dbResponse.movie_name,
    leadActor: dbResponse.lead_actor,
  };
  response.send(result);
});

//UPDATE movie details by id
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
        UPDATE
            movie
        SET 
            director_id = ${directorId},
            movie_name = '${movieName}',
            lead_actor = '${leadActor}'
        WHERE movie_id = ${movieId};`;
  //console.log(updateMovieQuery);
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// DELETE movie by id
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
            DELETE FROM movie
            WHERE movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//GET directors by id
app.get("/directors/", async (request, response) => {
  const getDirectorsListQuery = `
            SELECT * FROM director
            ORDER BY director_id;`;
  const dbResponse = await db.all(getDirectorsListQuery);

  const result = dbResponse.map(function (eachItem) {
    return {
      directorId: eachItem.director_id,
      directorName: eachItem.director_name,
    };
  });
  response.send(result);
});

// GET movie name by director id
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieNameQuery = `
            SELECT movie_name AS movieName
            FROM movie
            WHERE director_id = ${directorId};`;
  const dbResponse = await db.all(getMovieNameQuery);
  response.send(dbResponse);
});

module.exports = app;
