app.config(['$routeProvider',
  function($routeProvider) {
     $routeProvider.
         when('/', {
          templateUrl: '/static/partials/home.html',
          controller: 'homeCtrl',
          resolve: {
            names: function(nameService){
              return nameService.getNames();
            }
          }
        }).
         when('/play/:id', {
          templateUrl: '/static/partials/play.html',
          controller: 'gameCtrl',
          resolve: {
            currentGame: function(gameService, $route){
              return gameService.getGame($route.current.params.id);
            }
          }
        }).
         when('/newgame', {
           templateUrl: '/static/partials/newgame.html',
           controller: 'NewGameCtrl',
         }).
        otherwise({
          redirectTo: '/'
        });
    }
])
