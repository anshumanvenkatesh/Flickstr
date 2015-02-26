/**
 * Created by Anshuman V on 2/12/2015.
 */

/**
  * main module of the app
  * @ module mainMod
*/
var myapp = angular.module('mainMod', ['ui.router']);

/*--------------------Routes--------------------------*/

myapp.config(function($stateProvider, $urlRouterProvider, $httpProvider) {



    $stateProvider

    // HOME STATES AND NESTED VIEWS ========================================
        .state('home', {
        url: '/home',
        templateUrl: 'templates/partial-home.html',
        controller: 'mainCtrl'
    })

    // ABOUT PAGE AND MULTIPLE NAMED VIEWS =================================

    .state('reco', {
        url: '/reco',
        templateUrl: 'templates/partial-reco.html',
        controller: 'recoCtrl'
    })

    .state('main', {
        url: '/main',
        templateUrl: 'templates/partial-main.html',
        controller: 'mainCtrl'
    });

    $urlRouterProvider.otherwise('/home');

});

/*              Controllers                */

myapp.controller('mainCtrl', ['$scope', '$state', '$http', 'recoService', '$window', function($scope, $state, $http, recoService, $window) {
    $scope.msg = "Angular Working!";
    $scope.movies = [];


    // --------------------------------  Delete Movies -------------------------------------------- //
    /**

* This function deletes movie with a specific id from the database
* @method $scope.omdbclick
* @param {String} id The movie id to be deleted
* @return {Boolean} Returns true on success
*/
    $scope.mov_del = function(id) {
            $http.delete('/listmovies/' + id)
                .success(function() {
                  $window.location.reload();
                });

    }        

    // GETTING A LIST OF MOVIES :   

    $http.get('/listmovies')
        .success(function(data) {
            $scope.movies = data;
        })

    $scope.mainClick = function() {
        $state.go('main');

        //console.log($scope);
    };

    $scope.callOmdb = function(title) {
        var _url = "http://www.omdbapi.com/?t=";
        var url_ = "&y=&plot=short&r=json";
        var fin_movie = title.split(' ').join('+');
        var fin_url = _url + fin_movie + url_;
    };


    $scope.tempMovies = {};

    /**

* This function fetches movie details from www.omdb.com 
* @method $scope.omdbclick
* 
* @return {Boolean} Returns true on success
*/
    $scope.omdbclick = function() {
        console.log("Here");
        //----------------------    Fetching from Omdb ---------------------------//
        var movie_str = $scope.tempMovies.title,
        _url = "http://www.omdbapi.com/?t=";
        var url_ = "&y=&plot=short&r=json";
        var fin_movie = movie_str.split(' ').join('+');        
        var fin_url = _url + fin_movie + url_;
        
        $http.get(fin_url)
            .success(function(data) {
                $scope.tempMovies.desc = data.Plot;
                $scope.tempMovies.poster = data.Poster || "not found";
                console.log("poster", $scope.tempMovies.poster);
                if ($scope.tempMovies.poster === "N/A") {                    
                    $scope.tempMovies.poster = "http://offtherecordsports.com/wp-content/uploads/2013/07/CurtisMarsh.png";
                }
                $scope.tempMovies.genre = data.Genre;
            })
            .error(function() {
                console.log("Something wrong with omdb");
            });

        //------------------------------------------------------------------------//
    };
    $scope.reset = function() {
        $scope.tempMovies = {};
        $scope.tempMovies.poster = "n/a";
    };

    // --------------------  Submit a movie  ------------------------------------- //

    
    /**

* This function pushes the movie alongwith the details to the databse
* @method $scope.moviesubmit
* 
* @return {Boolean} Returns true on success
*/

    $scope.moviesubmit = function() {
        $scope.movies.push($scope.tempMovies);

        $http.post('/listmovies/create', {
                title: $scope.tempMovies.title,
                desc: $scope.tempMovies.desc,
                comments: $scope.tempMovies.comments,
                poster: $scope.tempMovies.poster,
                genre: $scope.tempMovies.genre
            })
            .success(function(data) {
                //console.log($scope.movies);
                $scope.tempMovies = {};
                //console.log("Server hit ---------------", data);
                //$state.go('home');
                //$state.go('main');
                $window.location.reload();
                // console.log("came here");
                $scope.tempMovies = {};
                $scope.tempMovies.poster = null;
            })
            .error(function() {
                console.log("Something went awry!");
            })
    };



    // -------------------------------  Recommend feature  --------------------------- //


    $scope.recommended = [];

    /**

* This function fetches recommendations for the movies in the database
* @method $scope.recommend
* 
* @return {Boolean} Returns true on success
*/

    $scope.recommend = function() {
         
        console.log("scope.recommended", $scope.recommended);


        // --------------------------------  Using tastekid api  -------------------------- //
        var _url = "http://www.tastekid.com/api/similar?q=";
        var url = "";
        var _movie = ""; 


        $scope.movies.forEach(function(movie) {
            //console.log("movie: ", movie);
            _movie += movie['title'].split(' ').join('+') + '%2C+';
            console.log(_movie);
        });

        url = _url + _movie + "k=84829-Flickr-NE5MLZO9";

        // --------------------------  Calling omdb for rec movie info --------------------------//

        $http.get(url)
            .success(function(data) {
                console.log(url);
                var results = data['Similar']['Results'];
                console.log(results);
                results.forEach(function(result) {

                    var temp_recom = {};
                    // --------------------------  Calling omdb for rec movie info --------------------------//
                    temp_recom.title = result['Name'];
                    var movie_str = result['Name'],
                        _url = "http://www.omdbapi.com/?t=";
                    var url_ = "&y=&plot=short&r=json";
                    var fin_movie = movie_str.split(' ').join('+');
                    var fin_url = _url + fin_movie + url_;

                    $http.get(fin_url)
                        .success(function(data) {
                            temp_recom.desc = data.Plot;
                            temp_recom.poster = data.Poster;
                            temp_recom.genre = data.Genre;
                            console.log("temp_recom.", temp_recom);

                            // -------------        Pushing Reccomended movies to recoService ---------------//

                            recoService.setter(temp_recom);

                            // ---------------------------------------------------------------------------- //

                        })
                        .error(function() {
                            console.log("Something went wrong while fetching omdb data for recomendations");


                        });

                    $state.go('reco');
                    // --------------------------------------------------------------------------------- //
                });

            });
    };
}]);

/**
* This service is used for passing data from controller to the recoCtrl controller
*
*/

myapp.service('recoService', function() {
    var fac = {};
    fac.rec_movies = [];
    return {
        getter: function() {            
          return fac.rec_movies;
        },
        setter: function(arr) {
            temp = arr;
            console.log("Array", arr);
            fac.rec_movies.push(arr);
            console.log("rec_movies", fac.rec_movies);
        }
    }
});

/**
* This controller is used to show the recommended movies to the user
*
*/

myapp.controller('recoCtrl', ['$scope', '$http', 'recoService', function($scope, $http, recoService) {
    console.log("recoService.getter()", recoService.getter());
    $scope._recomp = recoService.getter();
}]);
