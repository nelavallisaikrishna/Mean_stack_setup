'use strict';

var App = angular.module('app', ['ui.router', 'appIndex','xeditable','ui.bootstrap','ngMaterial','ngMaterialDateRangePicker']);

App.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/app/home");

    $stateProvider
        .state('app', {
            url: "/app",
            abstract: true
        })
}]);
App.controller('appCtrl', function ($scope,Auth,$rootScope,CartService,$state,$window,LocationService, Common) {

    if('serviceWorker' in navigator) {
        console.log('service worker is supported');
    } else {
        console.warn('user denied the permission');
    }
//check if push messaging supported or not
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
    }else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
       // var notification = new Notification("Hi there!");
    }else if (Notification.permission !== "denied") {
        Notification.requestPermission(function (permission) {
            // If the user accepts, let's create a notification
            if (permission === "granted") {
                var notification = new Notification("Hi there!");
            }
        });
    }

    $scope.states = [];
    LocationService.getAreaList(function (result) {
        $scope.states = result.list;
        Common.getAreaName(function(res){
            if(res){
                $scope.areaName = res;
            }
        })
    });
    $scope.onSelect = function ($item, $model, $label) {
        $scope.$item = $item;
        $scope.areaName = $model;
        $scope.$label = $label;
        Common.storeAreaName($model, function (result) {
            $scope.errorMsg = '';
        });
    };

    Auth.checkSession();
    $rootScope.cartCount = 0;
    $scope.user = Auth.getUser();
    if($scope.user){
        Auth.getUserByEmailService($scope.user,function(err,result){
            if(result){
                $scope.user = result;
                $rootScope.tokens = result.tokens;
            }
        });
        CartService.getCartData('ITEM_DETAILS',function(result){
            if(result){
                console.log('result ITEM_DETAILS : ',JSON.stringify(result));
                $rootScope.cartCount = result.items.length;
                console.log('$rootScope.cartCount ',JSON.stringify($rootScope.cartCount));
            }
        });

    }else{
        if(!$scope.cartData){
            $scope.cartData = {};
        }
        $scope.cartData.items = CartService.getOfflineCart();
        $rootScope.cartCount = $scope.cartData.items.length;
        console.log('one ');
    }
    $scope.logoutFunction = function(){
        console.log('logoutFunction');
        Auth.logoutUser(function (result) {
            console.log('Logout');
            $state.go('app.home');
        })
    }
});

App.config(['$qProvider', function ($qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
}]);

App.run(function(editableOptions) {
    editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});