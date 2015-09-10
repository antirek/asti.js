
//required Promise support


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

  var connect = function () {
    return new Promise(function (resolve, reject) {
      addScript(function () {
        socket = io(url);
        resolve();
      });
    });
  };

  var subscribeAgentEvents = function (object) {
    checkSocket();
    socket.emit('agent:subscribe', {agent: object.agent});

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
    socket.emit('agent:unsubscribe', object);
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

  var queueList = function (request) {
    if (!request) {var request = {};}
    request.actionid = actionid();
    return new Promise(function (resolve, reject) {
      var listener = new eventListener(request.actionid, function (response) {
        socket.removeEventListener('queue:list', listener);
        resolve(response.data);
      });
      socket.on('queue:list', listener);
      socket.emit('queue:list', request);
      setTimeout(function () { reject("queueList timeout exceed")}, 10000);
    });
  };

  var actionid = function () {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (var i = 0; i < 10; i++)
          text += possible.charAt(Math.floor(Math.random() * possible.length));
      return text;
  };

  var eventListener = function (actionid, callback) {
    return function (response) {
      if (response.actionid == actionid) {callback(response);}
    }
  };

  var queueMembers = function (request) {
    if (!request) {var request = {};}
    request.actionid = actionid();
    return new Promise(function (resolve, reject) {
      var listener = new eventListener(request.actionid, function (response) {
        socket.removeEventListener('queue:members', listener);
        resolve(response.data);
      });
      socket.on('queue:members', listener);
      socket.emit('queue:members', request);
      setTimeout(function() { reject ("queueMembers timeout exceed")}, 10000);
    });
  };

  var queue = {
    list: queueList,
    members: queueMembers
  };

  return {
    call: call,
    agent: agent,
    connect: connect,
    queue: queue
  };

};