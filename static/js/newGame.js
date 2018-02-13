app.controller('NewGameCtrl', ['$scope', '$log', '$cookies', '$http', 'ModalService', 'login',
  function($scope, $log, $cookies, http, ModalService, names, login) {
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
          $scope.question = result[0];
          $scope.answer = result[1];
        })
      })
    };
  }
]);
