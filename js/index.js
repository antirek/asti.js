
//required Promise support

//version 0.0.6

var ASTI = function (object) {

  var socket;
  var url = object.url || null;
  var identity = null;
  var sessionid = null;

  if (!url) throw new Error('no url in ASTI params');

  var addScript = function (callback) {
    var script = document.createElement('script');
    script.setAttribute('src', url + '/socket.io/socket.io.js');
    script.onload = callback;
    document.body.appendChild(script);
  };

  var checkSocket = function () {    
    if (!socket.connected) {
      throw new Error('No socket.io connection');
    };
  };

  var setOnError = function (cb) {
    socket.on('error', cb);
  };

  var connect = function () {
    return new Promise(function (resolve, reject) {
      if (!identity) { reject('no identity'); }

      if (socket && socket.connected) { 
        resolve(); 
      } else {
        addScript(function () {
          socket = io(url);

          setOnError(function (error) {
              reject(error);
          });

          var connectListener = function () {
            sessionid = 'session-' + actionid();
            socket.emit('identity', {identity: identity, sessionid: sessionid});
            resolve();
          };

          socket.on('connect', connectListener);
          setTimeout(function () {
            reject(new Error('No socket.io connection'));
          },10000);
        });
      }      
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

  var call = function (request, handlers) {
    checkSocket();
    if (!request) {var request = {};}
    request.actionid = actionid();

    var listenerOnAnswer1SideRemoved = true, listenerOnAnswer2SideRemoved = true, listener1, listener2;

    if (handlers.onAnswer1Side) {
      listener1 = new eventListener(request.actionid, function (response) {
        socket.removeEventListener('answer1', listener1);
        listenerOnAnswer1SideRemoved = true;
        handlers.onAnswer1Side(response.data);
      });
      listenerOnAnswer1SideRemoved = false;
      socket.on('answer1', listener1);
    }

    if (handlers.onAnswer2Side) {
      listener2 = new eventListener(request.actionid, function (response) {
      socket.removeEventListener('answer2', listener2);
        listenerOnAnswer2SideRemoved = true;
        handlers.onAnswer2Side(response.data);
      });
      listenerOnAnswer2SideRemoved = false;
      socket.on('answer2', listener2);
    }

    setTimeout(function () {
      if (!listenerOnAnswer1SideRemoved) { socket.removeEventListener(listener1); }
      if (!listenerOnAnswer2SideRemoved) { socket.removeEventListener(listener2); }
    }, 120000);

    return new Promise(function (resolve, reject) {
      var listener = new eventListener(request.actionid, function (response) {        
        socket.removeEventListener('call', listener);
        resolve(response.data);
      });
      socket.on('call', listener);
      socket.emit('call', request);
      setTimeout(function() { reject('call ' + actionid + ' timeout exceed'); }, 10000);
    });

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

  var setIdentity = function (object) {
    identity = object.identity;
    return this;
  };

  return {
    setIdentity: setIdentity,
    connect: connect,
    call: call,
    agent: agent,
    queue: queue
  };

};