//= require jquery
//= require jquery_ujs
//= require websocket_rails/main
//= require angular
//= require_tree ./lib
//= require_tree .

window.Ang = angular.module('xben', []);


/*=== Application
==============================================================================================*/
window.App = (function () {

  var SOCKET_ENDPOINT = window.location.host + '/websocket';

  var App = function () {
    this.dispatcher = new WebSocketRails(SOCKET_ENDPOINT);
    this.channel = this.dispatcher.subscribe('main');
    this.$window = $(window);

    this._events();
  };

  var $$ = App.prototype;

  $$._events = function () {
    this.channel.bind('console.log', function (data) {
      console.log('console.log', data);
    });

    this.channel.bind('user.update_color', function (data) {
      console.log('user.update_color', data);
    });
  };

  var toArray = function (a) {
    return Array.prototype.slice.call(a);
  };

  $$.log = function () {
    this.channel.trigger('console.log', toArray(arguments));
  };

  $$.trigger = function () {
    var args = toArray(arguments);
    var event = args.shift();
    this.$window.trigger(event, args);
  };

  $$.on = function (event, callback) {
    this.$window.on(event, callback);
  };

  return new App();

})();


/*=== Deal
==============================================================================================*/
window.Deal = (function () {

  var Deal = function () {
    this.reset();
    this._events();
  };

  var $$ = Deal.prototype;

  $$.reset = function (food) {
    this.others = null;
    this.mine = null;
    this.isConcluded = false;
  };

  $$._events = function () {
    App.channel.bind('deal.request', function (food) {
      if (food.user_id != App.current_user.id) return;

      this.mine = food;

      if (this.others) {
        this.conclude();
      } else {
        App.trigger('deal.request', food);
      }
    }.bind(this));

    App.channel.bind('deal.conclude', function (foods) {
      if (this.isConcluded) return;
      this.isConcluded = true;

      App.trigger('deal.conclude', foods);
    }.bind(this));
  };

  $$.request = function (food) {
    this.others = food;
    App.channel.trigger('deal.request', food);
  };

  $$.conclude = function (food) {
    App.channel.trigger('deal.conclude', [this.others, this.mine]);
  };

  return new Deal();

})();


/*=== Simple moving average
==============================================================================================*/
window.SMA = (function () {

  var SMA = function (num) {
    this._hasData = false;

    this.num = num;
    this.buffer = Array.apply(null, Array(this.num));
  };

  var $$ = SMA.prototype;

  $$.reset = function(data) {
    if (data == null) {
      data = 0;
    }

    this.buffer = this.buffer.map(function () { return data });
  };

  $$.getAverage = function (ary) {
    var sum = this.buffer.reduce(function (a, b) { return a + b });

    return sum / this.num;
  };

  $$.add = function (data) {
    if (this._hasData) {
      this.buffer.unshift(data);
      this.buffer.length = this.num;
    } else {
      this.reset(data);
      this._hasData = true;
    }
  };

  return SMA;

})();


/*=== Konashi
==============================================================================================*/
window.Konashi = (function () {

  var NUM_HIST = 4;
  var PIN_MODE = parseInt('11111110', 2);
  var TICK_INTERVAL = 350;

  var Konashi = function (id) {
    this.id = id;
    this.k = window.k;
    this.timer = null;

    this.signalSMA = new SMA(NUM_HIST);
    this.isNear = false;

    this._events();

    this.k.findWithName(this.id);
  };

  var $$ = Konashi.prototype;

  $$._events = function () {
    this.k.connected(this.connected.bind(this));
    this.k.disconnected(this.disconnected.bind(this));
    this.k.ready(this.ready.bind(this));
    this.k.updateSignalStrength(this.updateSignalStrength.bind(this));
    this.k.updatePioInput(this.updatePioInput.bind(this));
  };

  $$.connected = function () {
    App.log('connected to konashi');
  };

  $$.disconnected = function () {
    clearInterval(this.timer);
  };

  $$.ready = function () {
    this.k.pinModeAll(PIN_MODE);

    this.timer = setInterval(this._tick.bind(this), TICK_INTERVAL);
  };

  $$._tick = function () {
    this.k.signalStrengthReadRequest();
  };

  $$.updatePioInput = function (data) {
    App.log('pio input: ', data);

    switch (data) {
      case 3:
        // contacting
        break;
      case 2:
        // not contacting
        break;
    }
  };

  $$.updateSignalStrength = function (strength) {
    strength *= -1;

    this.signalSMA.add(strength);

    var avg = this.signalSMA.getAverage() | 0;
    var isNear = avg < 70;

    // App.log({ raw: strength, avg: avg });

    if (isNear != this.isNear) {
      this.isNear = isNear;

      if (this.isNear) {
        App.log('near');
        this.k.digitalWrite(this.k.PIO1, this.k.HIGH);
      } else {
        App.log('far');
        this.k.digitalWrite(this.k.PIO1, this.k.LOW);
      }
    }
  };

  return Konashi;

})();


/*=== Main
==============================================================================================*/
Ang.controller('MainController', function ($scope, $http) {

  $http.get('/api/user').success(function (data) {
    App.current_user = data.user;
    $scope.current_user = App.current_user;

    new Konashi(data.the_other_user.konashi_id);
  });

  $http.get('/api/foods').success(function (data) {
    $scope.foods = data.foods;
  });

  $scope.select = function (food) {
    $scope.selected = food;
    $scope.deals = [food, null];

    Deal.request(food);
  };

  $scope.disselect = function () {
    $scope.selected = null;
  };

  App.on('deal.request', function (e, food) {
    alert(food.user.name + 'さんが、' + food.name + 'を食べたいと言っています！');
  });

  App.on('deal.conclude', function (e, foods) {
    console.log(foods);

    $scope.$apply(function () {
      $scope.deals = foods;
      $scope.dealConcluded = true;
      $scope.initCommentsView();
    });
  });

  $scope.initCommentsView = function () {
    $scope.comments = [];
    $scope.newComment = {};

    $http.get('/api/foods/' + $scope.selected.id + '/food_comments').success(function (data) {
      console.log(data);
      $scope.comments = data.food_comments;
    });
  };

  $scope.like = function (id) {
    $http.post('/api/foods/' + id + '/like');
  };

  $scope.createComment = function () {
    $.post('/api/foods/' + $scope.selected.id + '/food_comments', {
      food_comment: $scope.newComment
    }).done(function (data) {
      $scope.$apply(function () {
        $scope.newComment.body = '';
      });
    });
  };

  App.channel.bind('food_comment.create', function (comment) {
    $scope.$apply(function () {
      if (
        $scope.selected.user_id != comment.user_id
        && $scope.current_user.id != comment.user_id
      ) return;

      $scope.comments.push(comment);
    });
  });

  App.channel.bind('food.update_likes_count', function (food) {
    $scope.$apply(function () {
      $scope.deals.forEach(function (f) {
        if (f.id == food.id) {
          f.likes_count = food.likes_count;
        }
      });
    });
  });

});
