function Stops(stops, mapHandler) {
  this.stops = stops;
  this.mapHandler = mapHandler;
  this.stopLocations = [];

  this.callbacks = {};
}


Stops.prototype.setUpStops = function() {
  var me = this;
  $('#addStopButton').click(function() {
    me.addStop();
  })


  var stopsDiv = $('#stops');
  this.count = this.stops.length;

  for (var i = 0; i < this.count; i++) {
    var div = $('<div></div>');

    if (data.isDriver && data.view != "rider") {
      var cancel = $('<i class="material-icons clickable" style="padding-right:10px; font-size:18px">remove_circle</i>');
      var stop = $('<span style="font-size:18px" class="">' + this.stops[i] + '</span>');

      var me = this;
      var toRemove = i;
      cancel.click(function() {
          me.removeStop(toRemove);
      });
    } else {
      var cancel = '';
      var stop = $('<span style="margin-left: 22px; font-size:18px">' + this.stops[i] + '</span>');
    }

    this.stopLocations[i] = div;

    div.attr('id', 'stop' + i);

    div.append(cancel);
    div.append(stop);

    stopsDiv.append(div);
  }
}


Stops.prototype.addStop = function() {
  var stops = $('#stops');
  var id = "stop" + this.count;
  console.log("id", id);

  var div = $('<div></div>');
  var cancel = $('<i class="material-icons clickable" style="padding-right:10px; font-size: 18px">remove_circle</i>');
  var stop = $('<input id="origin-input" name="origin" class="stop-input controls"' +
         'type="text" placeholder="Enter a stop..." onPaste=""' +
         'onkeydown="if (event.keyCode == 13) { return false;}"' +
         ' style="margin-left: 0px !important; padding-left: 0px !important">');

  var toRemove = this.count;
  var me = this;
  cancel.click(function() {
    me.removeStop(toRemove);
  });

  div.attr('id', id);

  div.append(cancel);
  div.append(stop);

  stops.append(div);
  this.stopLocations[this.count] = div;

  var autocomplete = new google.maps.places.Autocomplete(stop[0], {placeIdOnly: true});
  var c = this.count;
  mapHandler.bindAutocompleteToMap(autocomplete);

  var me = this;
  autocomplete.addListener('place_changed', function() {
    me.stopChanged(c);
  });

  stop.focus();
  this.count++;
}

Stops.prototype.removeStop = function(i) {
  this.stopLocations[i].remove();
  delete this.stopLocations[i];
  this.stopsChanged(this.stopLocations);
}


Stops.prototype.stopChanged = function(i) {
  var stopDiv = $('#stop' + i);

  var div = $('<div></div>');
  var newLocation = stopDiv.find('input').val();

  if (data.isDriver && data.view != "rider") {
    var cancel = $('<i class="material-icons clickable" style="padding-right:10px; font-size:18px">remove_circle</i>');
    var stop = $('<span style="font-size:18px">' + newLocation + '</span>');

    var toRemove = i;
    var me = this;
    cancel.click(function() {
      me.removeStop(toRemove);
    })
  } else {
    var cancel = '<i class="material-icons" style="padding-right:10px; font-size:18px">remove_circle</i>';
    var stop = $('<span style="font-size:18px">' + newLocation + '</span>');
  }

  div.attr('id', 'stop' + i);

  div.append(cancel);
  div.append(stop);

  this.stopLocations[i] = div;
  stopDiv.replaceWith(div);

  this.stopsChanged(this.stopLocations);
}


Stops.prototype.getStops = function() {
  var strings = this.stopLocations.map(function(stop) {
    return stop.find('span').html();
  }).filter(function(stop) {
    return stop;
  });

  return strings;
}

// "private" functions that call callbacks after specific events occur
Stops.prototype.stopsChanged = function(stops) {
  var strings = stops.map(function(stop) {
    return stop.find('span').html();
  }).filter(function(stop) {
    return stop;
  });

  console.log("s", strings, stops, this.count);

  if (this.callbacks.valueChanged) { this.callbacks.valueChanged(strings); }
  else { console.log("Warning. valueChanged callback undefined"); }
}

Stops.prototype.addListener = function(event, cb) {
  this.callbacks[event] = cb;
}
