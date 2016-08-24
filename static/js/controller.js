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
            otherwise({
              redirectTo: '/'
            });
            // TODO: create a service, Auth that checks for log in
            // when('/login', {
            // templateURL: 'static/partials/login.html',
            //  resolve: {
            //     "check": function (Auth, $location) {
            //         Auth.isLoggedIn(function (response) {
            //             console.log(response);
            //             if (response) {
            //                 $location.path('/'); //redirect user to home.
            //             }
            //         });
            //     }
            // }
            // })
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
    $scope.game = currentGame;
    $scope.$log = $log;
    $scope.player1 = {'name': 'Player 1', 'score': 0, 'bet': 0};
    $scope.player2 = {'name': 'Player 2', 'score': 0, 'bet': 0};
    $scope.showOption = true;
    $scope.questionsDone = 0;
    $scope.FinalJeopardy = false;
    $scope.finalRespond1 = true;
    $scope.finalRespond2 = true;
    $scope.winner = '';

	$scope.title = 'Jeopardy!';
	$scope.showQuestion = function(QandA) {
		$log.log(QandA);
	};
    $scope.round = currentGame;

    $scope.finaljeopardy = {
        'question': 'A style guide for python, its acronym is PEP',
        'answer': 'What are Python Enhancement Proposals?'
    };

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