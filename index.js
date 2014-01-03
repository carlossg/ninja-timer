var util = require('util');
var stream = require('stream');
var Timer = require('./lib/timer')

// Give our module a stream interface
util.inherits(Driver,stream);

/**
 * Called when our client starts up
 * @constructor
 *
 * @param  {Object} opts Saved/default module configuration
 * @param  {Object} app  The app event emitter
 * @param  {String} app.id The client serial number
 *
 * @property  {Function} save When called will save the contents of `opts`
 * @property  {Function} config Will be called when config data is received from the cloud
 *
 * @fires register - Emit this when you wish to register a device (see Device)
 * @fires config - Emit this when you wish to send config data back to the cloud
 */
function Driver(opts,app) {

  var self = this;
  this.log = app.log;
  this.opts = opts;

  opts.timers = opts.timers || {};

  app.once('client::up',function(){
    self.save();

    var keys = Object.keys(opts.timers);
    for (var i=0; i<keys.length; i++) {
      var name = keys[i];
      self.addTimer(name);
    }
  });
};

Driver.prototype.addTimer = function(name) {
  this.log.info("Registering timer '%s'", name);
  this.emit('register', new Timer(name, this));
}

/**
 * Called when config data is received from the cloud
 * @param  {Object} config Configuration data
 */
Driver.prototype.config = function(rpc,cb) {

  var self = this;

  if (!rpc) {
    return cb(null, {
        "contents":[
          { "type": "input_field_text", "field_name": "name", "value": 'timer', "label": "Timer name", "placeholder": "timer", "required": true},
          { "type": "submit", "name": "Add", "rpc_method": "addTimer" }
        ]
      });
  }

  switch (rpc.method) {
    case 'addTimer':

      var name = rpc.params.name;
      self.opts.timers[name] = {}; // hashmap instead of array in case we want to add more properties there

      self.save();
      self.addTimer(name);

      cb(null, {
        "contents": [
          { "type":"paragraph", "text":"Successfully saved." },
          { "type":"close", "text":"Close" }
        ]
      });

      break;
    default:
      log('Unknown rpc method', rpc.method, rpc);
  }
};

// Export it
module.exports = Driver;
