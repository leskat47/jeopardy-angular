var app = angular.module('gameApp', ['angularModalService', 'ngRoute', 'ngCookies'])

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
    var logIn = function(confirmUser, usr, pw) {
        data = {"user": usr, "pw": pw}
        $http.post("login", JSON.stringify(data)).success(function(response){
            console.log("response data " + response);

            confirmUser(response);
        });
    };
    return {
        logIn: logIn
    }
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
      }
    ])

  .controller('homeCtrl', ['$scope', '$log', '$location', '$cookies', '$http', 'ModalService', 'names', 'login',
    function($scope, $log, $location, $cookies, http, ModalService, names, login) {
    $scope.names = names.names;
    $scope.log = "Log In";
    $cookies.put("loggedIn", false);
    $log.log($cookies.get("loggedIn"));

    $scope.auth = function(user, pw){
        login.logIn(function(logInStatus){
            $cookies.put("loggedIn", logInStatus);
        }, user, pw);
        if (login === "true") {
         $scope.log = "Log Out";  
        } else {
          alert("Your username or password were incorrect. Try again.");
        }
    };

    logout = function($http){
        $cookies.put("loggedIn", false);
        $scope.log = "Log In";
    }

    $scope.getAuth = function(){
      if ($cookies.get("loggedIn") === "false") {

      // show login modal
        ModalService.showModal({
            templateUrl: 'static/partials/loginform.html',
            controller: "ModalController",
            scope: $scope,
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(data) {
              $scope.auth(data.user, data.pw);
            });
        });
      } else {
        logout();
      }
    }
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