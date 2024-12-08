const { DataTypes, sequelize } = require('./../lib/index');
const { user } = require('./user.model');
const { movie } = require('./movie.model');

let like = sequelize.define('like', {
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'user',
      key: 'id',
    },
  },
  movieId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'movie',
      key: 'id',
    },
  },
});

user.belongsToMany(movie, { through: like });
movie.belongsToMany(user, { through: like });

module.exports = { like };
