//= require jquery
//= require jquery_ujs
//= require websocket_rails/main
//= require angular
//= require_tree ./lib
//= require_tree .

window.Ang = angular.module('xben', ['angular-carousel']);


/*=== Application
==============================================================================================*/
window.App = (function () {

  var SOCKET_ENDPOINT = window.location.host + '/websocket';

  var App = function () {
    this.current_user_id = +(window.location.search.match(/\buser_id=(\d+)/) || [])[1];
    this.other_user_id = 3 - this.current_user_id;

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

    this.channel.bind('user:' + this.current_user_id, function (data) {
      this.$window.trigger(data.event, data.args);
    }.bind(this));
  };

  var toArray = function (a) {
    return Array.prototype.slice.call(a);
  };

  $$.log = function () {
    var args = toArray(arguments);
    args.unshift(this.current_user_id);
    this.channel.trigger('console.log', args);
  };

  $$.trigger = function () {
    var args = toArray(arguments);
    var event = args.shift();
    this.$window.trigger(event, args);
  };

  $$.on = function (event, callback) {
    this.$window.on(event, callback);
  };

  $$.triggerToOther = function () {
    var args = toArray(arguments);
    var event = args.shift();
    this.channel.trigger('user:' + this.other_user_id, { event: event, args: args });
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
    this.isAccepted = false;
  };

  $$._events = function () {
    App.channel.bind('deal.request', function (food) {
      if (food.user_id != App.current_user.id) return;

      this.mine = food;

      if (this.others) {
        this.accept();
      } else {
        App.trigger('deal.request', food);
      }
    }.bind(this));

    App.channel.bind('deal.accept', function (foods) {
      if (this.isAccepted) return;
      this.isAccepted = true;

      App.trigger('deal.accept', foods);
    }.bind(this));
  };

  $$.request = function (food) {
    this.others = food;
    App.channel.trigger('deal.request', food);
  };

  $$.accept = function (food) {
    App.channel.trigger('deal.accept', [this.others, this.mine]);
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

  var NUM_HIST = 5;
  var PIN_MODE = parseInt('11111110', 2);
  var TICK_INTERVAL = 350;

  var ARD_SIG_RESET        = 0;  // 初期化
  var ARD_SIG_DEAL_REQUEST = 1;  // はなれた場所で欲しい「おかず」リクエスト
  var ARD_SIG_DEAL_ACCEPT  = 2;  // はなれた場所で交換承認
  var ARD_SIG_APPROACH     = 3;  // 出逢う
  var ARD_SIG_LIKE         = 4;  // うまいね！ボタンを押す


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

    App.on('deal.request', function (e, food) {
      this.sendToArduino(ARD_SIG_DEAL_REQUEST);
    }.bind(this));

    App.on('deal.accept', function (e, foods) {
      this.sendToArduino(ARD_SIG_DEAL_ACCEPT);
    }.bind(this));

    App.on('arduino.reset', function () {
      this.sendToArduino(ARD_SIG_RESET);
    }.bind(this));

    /*
    $(document).on('touchmove', function (e) {
      e = e.originalEvent;
      App.log(e.pageX, e.pageY);
    });
    */

    App.channel.bind('food.update_likes_count', function (food) {
      if (food.user_id != App.current_user_id) {
        this.sendToArduino(ARD_SIG_LIKE);
      }
    }.bind(this));
  };

  $$.connected = function () {
    App.log('connected to konashi');
  };

  $$.disconnected = function () {
    clearInterval(this.timer);
  };

  $$.ready = function () {
    this.k.pinModeAll(PIN_MODE);
    this.k.uartBaudrate(this.k.KONASHI_UART_RATE_9K6);
    this.k.uartMode(this.k.KONASHI_UART_ENABLE);

    this.timer = setInterval(this._tick.bind(this), TICK_INTERVAL);
  };

  $$._tick = function () {
    this.k.signalStrengthReadRequest();
  };

  $$.sendToArduino = function (signal) {
    this.k.uartWrite(String(signal).charCodeAt(0));
    this.k.uartWrite('\n'.charCodeAt(0));
  };

  $$.updatePioInput = function (data) {
    App.log('pio input: ', data);

    switch (data) {
      case 1:
        this.inserted();
        break;
      case 0:
        this.ejected();
        break;
    }
  };

  $$.updateSignalStrength = function (strength) {
    strength *= -1;

    this.signalSMA.add(strength);

    var avg = this.signalSMA.getAverage() | 0;
    var isNear = avg < 65;

    // App.log(JSON.stringify({ raw: strength, avg: avg }));

    if (isNear != this.isNear) {
      this.isNear = isNear;

      if (this.isNear) {
        this.sendToArduino(ARD_SIG_APPROACH);
        App.trigger('other_user.near');
      } else {
        App.trigger('other_user.far');
      }
    }
  };

  $$.inserted = function () {
    App.triggerToOther('piece.inserted');
  };

  $$.ejected = function () {
    App.triggerToOther('piece.ejected');
  };

  return Konashi;

})();


/*=== Models
==============================================================================================*/
var Model = function () {

  var _cache = {};

  var Model = function () {};

  Model.save = function (attrs) {
    var obj = _cache[attrs.id] || new this();
    _cache[attrs.id] = obj;

    for (var key in attrs) {
      obj[key] = attrs[key];
    }

    return obj;
  };

  Model.find = function (id) {
    return _cache[id];
  };

  Model.all = function (id) {
    return _cache;
  };

  return Model;

};

window.User = Model();
window.Food = Model();


/*=== Main
==============================================================================================*/
Ang.controller('MainController', function ($scope, $http, $timeout) {

  var timer = null;

  $scope.state = 'initial';

  $http.get('/api/user').success(function (data) {
    App.current_user = User.save(data.user);
    $scope.current_user = App.current_user;

    var otherUser = User.save(data.the_other_user);
    new Konashi(otherUser.konashi_id);
  });

  $http.get('/api/foods').success(function (data) {
    $scope.foods = data.foods.map(function (food) {
      return Food.save(food);
    });
  });

  $scope.select = function (food) {
    food = Food.save(food);

    $scope.selected = food;
    $scope.deals = [food, null];

    Deal.request(food);
    $scope.state = 'selected';
  };

  $scope.back = function () {
    Deal.reset();
    App.trigger('arduino.reset');
    $scope.selected = null;
    $scope.state = 'initial';

    if (timer != null) {
      resetTimeout(timer);
    }
  };

  $scope.isState = function (state) {
    return state == $scope.state;
  };

  App.on('deal.request', function (e, food) {
    $scope.$apply(function () {
      $scope.request = food;
    });

    $timeout(function () {
      $scope.request = null;
    }, 5000);
    // alert(food.user.name + 'さんが、' + food.name + 'を食べたいと言っています！');
  });

  App.on('deal.accept', function (e, foods) {
    foods = foods.map(function (food) {
      return Food.save(food);
    });

    console.log(foods);

    $scope.$apply(function () {
      $scope.deals = [$scope.selected, foods[+(foods[0] == $scope.selected)]];
    });
  });

  $scope.pop = 4;

  var uv = null;

  $scope.like = function (id) {
    $http.post('/api/foods/' + id + '/like');
    $scope.flag = !$scope.flag;

    $timeout(function () {
      $scope.flag = false;
    }, 100);

    $timeout(function () {
      $scope.pop = 4;
    }, 1000);

    $scope.pop = ($scope.pop + 1) % 3;


    if (!uv) {
      uv = document.getElementById('umaineVoice');
    }

    setTimeout(function () {
      uv.play();
    }, 16);
  };

  App.channel.bind('food.update_likes_count', function (food) {
    $scope.$apply(function () {
      console.log(Food.save(food));
    });
  });

  App.on('piece.inserted', function () {
    App.log('inserted');

    $scope.$apply(function () {
      $scope.state = 'done';
    });
  });

  App.on('piece.ejected', function () {
    App.log('ejected');

    $scope.$apply(function () {
      $scope.state = 'ejected';
    });
  });

  App.on('other_user.near', function () {
    App.log('near');

    $scope.$apply(function () {
      User.save({
        id: App.other_user_id,
        is_near: true
      });
    });
  });

  App.on('other_user.far', function () {
    App.log('far');

    $scope.$apply(function () {
      User.save({
        id: App.other_user_id,
        is_near: false
      });
    });
  });

});




