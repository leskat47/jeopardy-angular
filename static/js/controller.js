var app = angular.module('gameApp', ['angularModalService', 'ngRoute'])

  .factory('nameService', function($http){
    return {
      getNames: function(){
        return $http.get("gamenames.json").then(function (response) {
            return response.data;
        });
      }
    };
  })

  .factory('gameService', function($http){
    return {
      getGame: function(gameNumber){
        return $http.get("/gamedata.json/" + gameNumber).then(function (response) {
            return response.data;
        });
      }
    };
  })

  .service('login', function($http) {
    this.logIn = function(name, pw){
        // server request will go here, return not in db, pw wrong, or logged in
        return "Logged In";
    };
  })

  .service('loginStatus', function($http) {
    this.checkLogin = function(){
        // server request to see if user is in session
        // should this be a cookie??
        return true;
    };
  })

  .config(['$routeProvider',
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
            // TODO: create a service, Auth that checks for log in
            // FIXME: no errors but html not showing
            when('/login', {
              templateURL: 'static/partials/login.html',
              resolve: {
                "check": ["loginStatus", function (loginStatus, $location) {
                    loginStatus.checkLogin(function (response) {
                        console.log(response);
                        if (response) {
                          alert("You are already logged in.");
                          $location.path('/'); //redirect user to home.
                        }
                    });
                }]
              }
            }).
            otherwise({
              redirectTo: '/'
            });
      }
    ])

  .controller('homeCtrl', ['$scope', '$log', 'ModalService', 'names',
    function($scope, $log, ModalService, names) {
    $scope.names = names.names;
    $log.log(names);
    // TODO: on selection of a game, get the game data? How would this get passed to the next route and controller?
  }])

  .controller('gameCtrl', ['$scope', '$log', 'ModalService', 'currentGame',
    function($scope, $log, ModalService, currentGame) {
    $scope.$log = $log;

    // Initial variables
    $scope.title = 'Jeopardy!';
    $scope.player1 = {'name': 'Player 1', 'score': 0, 'bet': 0};
    $scope.player2 = {'name': 'Player 2', 'score': 0, 'bet': 0};
    $scope.round = currentGame["categories"];
    $scope.finaljeopardy = {
        'question': currentGame.finalQ,
        'answer': currentGame.finalA
    };

    // Control display of final jeopardy 
    $scope.questionsDone = 0;
    $scope.FinalJeopardy = false;
    $scope.winner = '';
    $scope.$watch("FinalJeopardy", function() {
      if ($scope.FinalJeopardy === true) {
        $scope.showBetting();
      }
    });

    // Control display of dollar screens
    $scope.showOption = true;

    // Splash screen on page load
    $scope.init = function(){
        ModalService.showModal({
            templateUrl: 'static/partials/splash.html',
            controller: 'ModalController',
            scope: $scope,
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
            });
        });
    };

    $scope.loss = function(player, dollars) {
        player.score -= Number(dollars);
        $log.log(player.name + " " + player.score);
    };

    $scope.finalloss = function(player) {
        player.score -= Number(player.bet);
        $log.log(player.name + " " + player.score);
    };

    $scope.finalright = function(player) {
        player.score += Number(player.bet);
        $log.log(player.name + " " + player.score);
    };

    $scope.bet = function(player1bet, player2bet) {
        $scope.player1.bet = Number(player1bet);
        $scope.player2.bet = Number(player2bet);
        $log.log($scope.player1);
        $log.log($scope.player2);
    };



  // MODAL WINDOWS /////////////////////////////////////////

	$scope.showQ = function(QandA, dollars) {
        $scope.questionsDone++;
        ModalService.showModal({
            templateUrl: 'static/partials/question.html',
            controller: "ModalController",
            scope: $scope,
        }).then(function(modal) {
            modal.element.modal();
            $scope.currentQ = Object.keys(QandA)[0];
            $scope.currentA = QandA[$scope.currentQ];
            $scope.dollars = dollars;
            // Disable buttons after selected
            $scope.wrong1 = false;
            $scope.wrong2 = false;

            modal.close.then(function(player) {
                player.score += Number(dollars);
                $scope.showA();
            });
        });
    };

    $scope.showA = function() {
        ModalService.showModal({
            templateUrl: 'static/partials/answer.html',
            controller: "ModalController",
            scope: $scope,
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
                $log.log($scope.questionsDone);
                if ($scope.questionsDone === 30) {
                    $scope.FinalJeopardy = true;
                }
            });
        });
    };

    $scope.showBetting = function(){
        ModalService.showModal({
            templateUrl: 'static/partials/bettingfinal.html',
            controller: 'ModalController',
            scope: $scope,
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
                $log.log(result);
                $scope.showFinal();
            });
        });
    };

    $scope.showFinal = function(){
        ModalService.showModal({
            templateUrl: 'static/partials/finaljeopardyQ.html',
            controller: 'ModalController',
            scope: $scope,
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
                $scope.showFinalA();
            });
        });
    };

    $scope.showFinalA = function() {
        ModalService.showModal({
            templateUrl: 'static/partials/finalanswer.html',
            controller: 'ModalController',
            scope: $scope,
        }).then(function(modal){
            modal.element.modal();
            modal.close.then(function(result) {
                if ($scope.player1.score > $scope.player2.score){
                    $scope.winner = "Player 1";
                } else if ($scope.player1.score === $scope.player2.score){
                    $scope.winner = "Tie";
                }else {
                    $scope.winner = "Player 2";
                }
                $scope.showWinner();
            });
        });
    };

    $scope.showWinner = function(){
        ModalService.showModal({
            templateUrl: 'static/partials/winner.html',
            controller: 'ModalController',
            scope: $scope,
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
            });
        });
    };

	}])

  .controller('ModalController', function($scope, close) {
  
   $scope.close = function(result) {
      close(result, 500); // close, but give 500ms for bootstrap to animate
   };

});