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
function Timer(name, driver) {

  var self = this;
  this.log = driver.log;

  // This device will emit data
  this.readable = true;
  // This device can be actuated
  this.writeable = true;

  this.G = "timer"+name; // G is a string a represents the channel
  this.V = 0; // 0 is Ninja Blocks' device list
  this.D = 2000; // 2000 is a generic Ninja Blocks sandbox device
  this.name = name + " Timer";

  // the actual counter
  this.timer = Date.now();

  var sendTimer = function() {
    var minutes = Math.round((Date.now()-self.timer)/60000);
    self.log.debug('Timer [%s] minutes elapsed %d', name, minutes);
    self.emit('data', minutes);
  }

  // send timer now and every minute
  sendTimer();
  this._interval = setInterval(sendTimer, 60000);

  this.write = function(data) {
    if (typeof data == 'string') {
      try {
        data = parseInt(data);
      } catch(e) {}
    }
    if (typeof data != 'number' || isNaN(data) ) {
      self.log.error('Timer [%s] Tried to set timer with a non-number : %s', name, data);
      return;
    }

    self.log.debug('Timer [%s] Setting timer to : %d', name, data);
    self.timer = Date.now() - (data * 60000);
    sendTimer(); // ensure the data is set immediately in the cloud
  };
}
