
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

    socket.on('agentcalled', object.onAgentCalled || function () {});    
    socket.on('agentconnect', object.onAgentConnect || function () {});
    socket.on('agentcomplete', object.onAgentComplete || function () {});
    socket.on('agentdump', object.onAgentDump || function () {});
    socket.on('agentringnoanswer', object.onAgentRingNoAnswer || function () {});

    socket.on('agentlogin', object.onAgentLogin || function () {});
    socket.on('agentlogoff', object.onAgentLogoff || function () {});
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

  return {
    call: call,    
    subscribeAgentEvents: subscribeAgentEvents,
    unsubscribeAgentEvents: unsubscribeAgentEvents,
    connect: connect
  };

};