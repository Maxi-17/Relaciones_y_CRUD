const path = require('path');
const db = require('../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const { all } = require('../routes/moviesRoutes');


//Aqui tienen una forma de llamar a cada uno de los modelos
// const {Movies,Genres,Actor} = require('../database/models');

//Aquí tienen otra forma de llamar a los modelos creados

const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;


const moviesController = {
    'list': (req, res) => {
        db.Movie.findAll()
            .then(movies => {
                res.render('moviesList.ejs', {movies})
            })
    },
    'detail': (req, res) => {
        db.Movie.findByPk(req.params.id)
            .then(movie => {
                res.render('moviesDetail.ejs', {movie});
            });
    },
    'news': (req, res) => {
        db.Movie.findAll({
            order: [
                ['release_date', 'DESC']
            ],
            limit: 5
        })
            .then(movies => {
                res.render('newestMovies', {movies});
            });
    },
    'recomended': (req, res) => {
        db.Movie.findAll({
            where: {
                rating: {[db.Sequelize.Op.gte]: 8}
            },
            order: [
                ['rating', 'DESC']
            ]
        })
            .then(movies => {
                res.render('recommendedMovies.ejs', {movies});
            });
    },
    //Aqui dispongo las rutas para trabajar con el CRUD

    add: function (req, res) {
        Genres.findAll()
            .then(result => {
                console.log(result);
                res.render("moviesAdd", {allGenres: result})
            })
    },
    create: function (req, res) {
        const {title, rating, awards, release_date, length, genre_id } = req.body

        db.Movie.create({
            title: title,
            rating: rating,
            awards: awards,
            release_date: release_date,
            length: length,
            genre_id: genre_id
        })
        res.redirect("/movies")
    },
    edit: function (req, res) {

        const dateFormat = function (date) {
            const year = date.getFullYear()
            let month = date.getMonth()
            month < 10 ? month = "0" + month : month
            let day = date.getDay()
            day < 10 ? day = "0" + day : day
            const newFormat = `${year}-${month}-${day}`
            return newFormat
        }

        const {id} = req.params

        const moviePromise = db.Movie.findByPk(id)
        const genrePromise = db.Genre.findAll()

        Promise.all([moviePromise, genrePromise])

            .then(([Movie, allGenres]) => {
                const anio = dateFormat(Movie.release_date)
                res.render("moviesEdit", { Movie, allGenres, anio })
            })
    },
    update: function (req, res) {
        const id = req.params.id
        const {title, rating, awards, release_date, length, genre_id} = req.body
        db.Movie.update({
            title: title,
            rating: rating,
            awards: awards,
            release_date: release_date,
            length: length,
            genre_id: genre_id
        },{
            where: { id: req.params.id}
        })

        res.redirect("/movies/detail/" + id)

    },
    deleted: function (req, res){
        Movies.findByPk(req.params.id)
            .then(Movie => {
                res.render('moviesDelete', {Movie});
            })
    },
    destroy: function (req, res){
        Movies.destroy({
            where: {
                id: req.params.id
            }
        })
        res.redirect('/movies');
    }
}

module.exports = moviesController;