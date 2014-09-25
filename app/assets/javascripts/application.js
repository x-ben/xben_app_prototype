//= require jquery
//= require jquery_ujs
//= require websocket_rails/main
//= require_tree .


var dispatcher = new WebSocketRails('localhost:3000/websocket');
dispatcher.trigger('comments.create', {});

var channel = dispatcher.subscribe('cb');
channel.bind('ks.test', function(data) {
  console.log(data);
});
