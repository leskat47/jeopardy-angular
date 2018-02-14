app.service('game', function($http){
  var addName = function(name){
    var data = {"name": name}
    $http.post('gameName', JSON.stringify(data)).success(function(response){
      console.log(response);
    })
  };
  var addCategory = function(name){
    var data = {"name": name}
    $http.post('categoryName', JSON.stringify(data)).success(function(response){
      console.log(response);
    })
  };
  var addQuestion = function(cat, amt, q, a){
    var data = {cat: cat,
                amt: amt,
                q: q,
                a: a
              }
    $http.post('gameQuestion', JSON.stringify(data)).success(function(response){
      console.log(response)
    })
  };
  return {
    addName: addName,
    addCategory: addCategory,
    addQuestion: addQuestion
  }
})
app.controller('NewGameCtrl', ['$scope', '$log', '$cookies', '$http', 'ModalService', 'login', 'game',
  function($scope, $log, $cookies, http, ModalService, names, login, game) {
    $scope.gameTitle = "";
    $scope.categories = {};
    for (var i=0; i < 6; i++) {
      $scope.categories[i] = {};
      for (var j = 100; j < 600; j +=100) {
        $scope.categories[i][j] = "add a question";
      }
    }
    $scope.getTitle = function(){
      ModalService.showModal({
        templateUrl: 'static/partials/newgamename.html',
        controller: 'ModalController',
        scope: $scope,
      }).then(function(modal){
        modal.element.modal();
        modal.close.then(function(name){
          if (!name){
            $scope.getTitle();
          }
          $scope.gameTitle = name;
        })
      })
    };
    $scope.addQuestion = function(cat, loc) {
      ModalService.showModal({
        templateUrl: 'static/partials/addquestion.html',
        controller: 'ModalController',
        scope: $scope,
      }).then(function(modal){
        modal.element.modal();
        modal.close.then(function(result){
          $scope.categories[cat][loc] = [result[0], result[1]];
          console.log( $scope )
        })
      })
    };
  }
]);
