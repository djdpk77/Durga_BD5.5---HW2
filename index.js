const express = require('express');
const { resolve } = require('path');

const app = express();
let { sequelize } = require('./lib/index');
let { movie } = require('./models/movie.model');
const { user } = require('./models/user.model');
const { like } = require('./models/like.model');
let { Op } = require('@sequelize/core');

app.use(express.json());

let movieData = [
  {
    title: 'Inception',
    director: 'Christopher Nolan',
    genre: 'Sci-Fi',
    year: 2010,
    summary:
      'A skilled thief is given a chance at redemption if he can successfully perform an inception.',
  },
  {
    title: 'The Godfather',
    director: 'Francis Ford Coppola',
    genre: 'Crime',
    year: 1972,
    summary:
      'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
  },
  {
    title: 'Pulp Fiction',
    director: 'Quentin Tarantino',
    genre: 'Crime',
    year: 1994,
    summary:
      'The lives of two mob hitmen, a boxer, a gangster, and his wife intertwine in four tales of violence and redemption.',
  },
  {
    title: 'The Dark Knight',
    director: 'Christopher Nolan',
    genre: 'Action',
    year: 2008,
    summary:
      'When the menace known as the Joker emerges, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
  },
  {
    title: 'Forrest Gump',
    director: 'Robert Zemeckis',
    genre: 'Drama',
    year: 1994,
    summary:
      'The presidencies of Kennedy and Johnson, the Vietnam War, and other events unfold from the perspective of an Alabama man with an IQ of 75.',
  },
];

app.get('/seed_db', async (req, res) => {
  try {
    await sequelize.sync({ force: true });

    await movie.bulkCreate(movieData);

    await user.create({
      username: 'moviefan',
      email: 'moviefan@gmail.com',
      password: 'password123',
    });

    res.status(200).json({ message: 'Database seeding successfull' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/movies', async (req, res) => {
  try {
    let movies = await movie.findAll();
    res.status(200).json({ movies });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/users', async (req, res) => {
  try {
    let users = await user.findAll();
    return res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/likes', async (req, res) => {
  try {
    let likes = await like.findAll();
    return res.status(200).json({ likes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Function to handle the liking process
async function likeMovie(data) {
  let newLike = await like.create({
    userId: data.userId,
    movieId: data.movieId,
  });

  return { message: 'Movie liked successfully', newLike };
}

//Endpoint 1: Like a Movie
app.get('/users/:id/like', async (req, res) => {
  try {
    let userId = parseInt(req.params.id);
    let movieId = parseInt(req.query.movieId);
    let response = await likeMovie({ userId, movieId });

    return res.status(200).json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Function to handle the disliking process
async function dislikeMovie(data) {
  let count = await like.destroy({
    where: {
      userId: data.userId,
      movieId: data.movieId,
    },
  });

  if (count === 0) return {};

  return { message: 'Movie disliked successfully' };
}

//Endpoint 2: Dislike a Movie
app.get('/users/:id/dislike', async (req, res) => {
  try {
    let userId = parseInt(req.params.id);
    let movieId = parseInt(req.query.movieId);
    let response = await dislikeMovie({ userId, movieId });

    if (!response.message)
      return res
        .status(404)
        .json({ message: 'This movie is not in your liked list' });

    return res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Function to handle fetching liked movies
async function getAllLikedMovies(userId) {
  let movieIds = await like.findAll({
    where: {
      userId: userId,
    },
    attributes: ['movieId'],
  });

  let movieRecords = [];

  for (let i = 0; i < movieIds.length; i++) {
    movieRecords.push(movieIds[i].movieId);
  }

  let likedMovies = await movie.findAll({
    where: { id: { [Op.in]: movieRecords } },
  });

  return { likedMovies };
}

//Endpoint 3: Get All Liked Movies
app.get('/users/:id/liked', async (req, res) => {
  try {
    let userId = parseInt(req.params.id);
    let response = await getAllLikedMovies(userId);

    return res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
