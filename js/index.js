
var ASTI = function (url) {

  var socket;

  var addScript = function (callback) {
    var script = document.createElement('script');
    script.setAttribute('src', url + '/socket.io/socket.io.js');
    script.onload = callback;
    document.body.appendChild(script);
  };

  var checkSocket = function () {
    if (!socket) {
      throw new Error('No socket.io connection');
    };
  };

  var connect = function (callback) {
    addScript(function () {
      socket = io(url);
      callback();
    });
  };

  var subscribeAgentEvents = function (object) {
    checkSocket();
    socket.emit('subscribeAgentEvents', {agent: object.agent});

    var handler = function (data, cb) {
      if (data && data.agent && data.agent == object.agent) {
        cb(data.event);
      };
    };

    socket.on('agentcalled', function (evt) { handler(evt, object.onAgentCalled || function () {})});
    socket.on('agentconnect', function (evt) { handler(evt, object.onAgentConnect || function () {})});
    socket.on('agentcomplete', function (evt) { handler(evt, object.onAgentComplete || function () {})});
    socket.on('agentringnoanswer', function (evt) { handler(evt, object.onAgentRingNoAnswer || function () {})});
  };

  var unsubscribeAgentEvents = function (object) {
    checkSocket();
    socket.emit('unsubscribeAgentEvents', object);
  };

  var call = function (channel, context, exten, variable) {
    var r = [
      url,
      '/call',
      '?',
      'channel=' + channel,
      '&',
      'context=' + context,
      '&',
      'exten=' + exten,
      '&',
      'variable=' + variable
    ].join('');
    return fetch(r);
  };


  var agent = {
    subscribe: subscribeAgentEvents,
    unsubscribe: unsubscribeAgentEvents,
  };

  return {
    call: call,
    agent: agent,
    connect: connect
  };

};