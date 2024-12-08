const { DataTypes, sequelize } = require('./../lib/index');

let movie = sequelize.define('movie', {
  title: DataTypes.STRING,
  director: DataTypes.STRING,
  genre: DataTypes.STRING,
  year: DataTypes.INTEGER,
  summary: DataTypes.TEXT,
});

module.exports = { movie };
