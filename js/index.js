
//required Promise support

//version 0.0.3

var ASTI = function (object) {

  var socket;
  var url = object.url || null;
  if (!url) throw new Error('no url in ASTI params');

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

    socket.on('agentcalled', function (evt) { handler(evt, object.onAgentCalled || function () {}) });
    socket.on('agentconnect', function (evt) { handler(evt, object.onAgentConnect || function () {}) });
    socket.on('agentcomplete', function (evt) { handler(evt, object.onAgentComplete || function () {}) });
    socket.on('agentringnoanswer', function (evt) { handler(evt, object.onAgentRingNoAnswer || function () {}) });
  };

  var unsubscribeAgentEvents = function (object) {
    checkSocket();
    socket.emit('agent:unsubscribe', object);
  };

  var call = function (params) {
    var prepare = function (options) {
      return new Promise(function (resolve, reject) {

      if (!options.channel) reject(new Error('no channel'));
      if (!options.context) reject(new Error('no context'));
      if (!options.exten) reject(new Error('no exten'));
      if (!options.variable) options.variable = '';

      var r = [
        url,
        '/call',
        '?',
        'channel=' + options.channel,
        '&',
        'context=' + options.context,
        '&',
        'exten=' + options.exten,
        '&',
        'variable=' + options.variable
        ].join('');

        resolve(r);
      });
    };

    return prepare(params).then(fetch);
  };


  var agent = {
    subscribe: subscribeAgentEvents,
    unsubscribe: unsubscribeAgentEvents,
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

  var pass = function (socket, request, evt) {
    if (!request) {var request = {};}
    request.actionid = actionid();
    return new Promise(function (resolve, reject) {
      var listener = new eventListener(request.actionid, function (response) {
        socket.removeEventListener(evt, listener);
        resolve(response.data);
      });
      socket.on(evt, listener);
      socket.emit(evt, request);
      setTimeout(function() { reject (evt + " timeout exceed")}, 10000);
    });
  };

  var queueList = function (request) {    
    return pass(socket, request, 'queue:list');
  };

  var queueMembers = function (request) {
    return pass(socket, request, 'queue:members');
  };

  var queue = {
    list: queueList,
    members: queueMembers
  };

  return {
    connect: connect,
    call: call,
    agent: agent,
    queue: queue
  };

};