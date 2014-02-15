var util = require('util');
var stream = require('stream');
var _ = require('underscore');
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

  // map with timer_name: timer_object
  this.timers = _.object(_.map(opts.timers||{}, function(data, key){
    data.name = key;
    return [key, new Timer(data, self.log)];
  }));
  opts.timers = this.timers;

  app.once('client::up',function(){
    _.each(self.timers, function(timer, name){
      self.registerTimer(timer);
    });
  });
};

Driver.prototype.addTimer = function(name) {
  var self = this;
  this.log.info("Creating timer '%s'", name);
  var timer = new Timer({name: name, start: Date.now()}, self.log);
  self.timers[name] = timer;
  self.opts.timers[name] = timer;
  self.save();
  process.nextTick(function() {
    self.registerTimer(timer);
  });
}

Driver.prototype.removeTimer = function(name) {
  var self = this;
  this.log.info("Removing timer '%s'", name);
  self.timers[name].deregister();
  delete self.timers[name];
  delete self.opts.timers[name];
  self.save();
}

Driver.prototype.registerTimer = function(timer) {
  this.log.info("Registering timer '%s'", timer.name);
  this.emit('register', timer);
  // send the data asap
  process.nextTick(function() {
    timer.send();
  });
}

/**
 * Called when config data is received from the cloud
 * @param  {Object} config Configuration data
 */
Driver.prototype.config = function(rpc,cb) {

  var self = this;

  if (!rpc) {
    var timersOptions = _.map(this.timers, function(data){ return {name: data.name, value: data.name}; });
    if (timersOptions.length == 0) {
      timersOptions = [{ "name": "No timers", "value": "", "selected": true}];
    } else {
      timersOptions[0].selected = true;
    }
    return cb(null, {
        "contents":[
          { "type": "input_field_text", "field_name": "name", "value": 'timer', "label": "Timer name", "placeholder": "timer", "required": true},
          { "type": "submit", "name": "Add", "rpc_method": "addTimer" },
          { "type": "input_field_select", "field_name": "timer_remove", "label": "Timer to remove", "options": timersOptions, "required": false },
          { "type": "submit", "name": "Remove", "rpc_method": "removeTimer" }
        ]
      });
  }

  switch (rpc.method) {
    case 'addTimer':

      var name = rpc.params.name;
      self.addTimer(name);

      cb(null, {
        "contents": [
          { "type":"paragraph", "text":"Successfully saved." },
          { "type":"close", "text":"Close" }
        ]
      });
      break;

    case 'removeTimer':

      var name = rpc.params.timer_remove;
      if (name != "") {
        self.removeTimer(name);
      }

      cb(null, {
        "contents": [
          { "type":"paragraph", "text":"Successfully removed." },
          { "type":"paragraph", "text":"Important: you will still need to manually delete the timers from your dashboard." },
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
