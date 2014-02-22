var stream = require('stream');
var util = require('util');

// Give our module a stream interface
util.inherits(Timer,stream);

 // Export it
module.exports=Timer;


/**
 * Creates a new Timer Object
 *
 * @property {Boolean} readable Whether the device emits data
 * @property {Boolean} writable Whether the data can be actuated
 *
 * @property {Number} G - the channel of this device
 * @property {Number} V - the vendor ID of this device
 * @property {Number} D - the device ID of this device
 *
 * @property {Function} write Called when data is received from the cloud
 *
 * @fires data - Emit this when you wish to send data to the cloud
 */
function Timer(data, log) {

  var self = this;
  this.log = log;

  // This device will emit data
  this.readable = true;
  // This device can be actuated
  this.writeable = true;

  this.G = "timer"+data.name; // G is a string a represents the channel
  this.V = 0; // 0 is Ninja Blocks' device list
  this.D = 2000; // 2000 is a generic Ninja Blocks sandbox device
  this.name = data.name;

  // the actual counter
  this.start = data.start == null ? Date.now() : new Date(data.start).getTime();

  // send timer every minute
  this._interval = setInterval(self.send.bind(this), 60000);

  this.write = function(data) {
    if (typeof data == 'string') {
      try {
        data = parseInt(data);
      } catch(e) {}
    }
    if (typeof data != 'number' || isNaN(data) ) {
      self.log.error('Timer [%s] Tried to set timer with a non-number : %s', self.name, data);
      return;
    }

    self.log.info('Timer [%s] Setting timer to : %d', self.name, data);
    self.start = Date.now() - (data * 60000);
    self.send(); // ensure the data is set immediately in the cloud
  };
}

Timer.prototype.send = function() {
  var minutes = Math.round((Date.now()-this.start)/60000);
  this.log.debug('Timer [%s] minutes elapsed %d', this.name, minutes);
  this.emit('data', minutes);
}

Timer.prototype.deregister = function() {
  this.log.debug('Timer [%s] stopping schedule', this.name);
  clearInterval(this._interval);
}

Timer.prototype.toJSON = function() {
  return {
    name:this.name,
    start:this.start
  };
}
