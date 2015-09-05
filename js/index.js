
// AMI for browser

var AMI = function (url) {

  var socket;

  var addScript = function (callback) {
    var script = document.createElement('script');
    script.setAttribute('src', url + '/socket.io/socket.io.js');
    script.onload = callback;
    document.body.appendChild(script);
  };

  var checkSocket = function () {
    if (!socket) {
      throw new Error('No socket.io conection');
    };
  };

  var connect = function () {
    addScript(function(){
      socket = io(url);
    });
  };

  var subscribe = function (object) {
    checkSocket();
    socket.emit('subscribe', object);

    var handler = function (data) {
      console.log(data);
    };

    socket.on('agentcalled', handler);
    socket.on('agentconnect', handler);
    socket.on('agentcomplete', handler);
    socket.on('agentdump', handler);
    socket.on('agentringnoanswer', handler);
  };

  var unsibscribe = function (object) {
    checkSocket();
    socket.emit('unsibscribe', object);
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
    connect: connect,
    subscribe: subscribe,
    unsibscribe: unsibscribe
  };

};