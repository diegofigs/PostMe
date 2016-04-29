var app = angular.module('postMe', []);

app.controller('MainCtrl', ['$scope', function ($scope) {
	$scope.test = 'Hello World!';
	$scope.posts = [
		{title: 'post 1', upvotes: 5},
		{title: 'post 2', upvotes: 2},
		{title: 'post 3', upvotes: 5},
		{title: 'post 4', upvotes: 10},
		{title: 'post 5', upvotes: 9}
	];
	$scope.addPost = function(){
		if(!$scope.title | $scope.title === ''){return; }
		$scope.posts.push({title: $scope.title, upvotes: 0});
		$scope.title = ''
	};
	$scope.incrementUpvotes = function(post){
		post.upvotes += 1;
	};
}]);