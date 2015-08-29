
// AMI for browser

var AMI = function (url) {

  var call = function (channel, context, exten, variable) {
    var r = [
      url,
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
  }

  return {
    call: call
  };
};