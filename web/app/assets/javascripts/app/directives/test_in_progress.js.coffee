window.ChaiBioTech.ngApp

.directive 'testInProgress', [
  'Status'
  (Status) ->
    restrict: 'EA'
    scope: {
      test: '='
    }
    replace: true
    templateUrl: 'app/views/directives/test-in-progress.html'
    link: ($scope) ->

      Status.fetch().then (data) ->
        $scope.data = data
]