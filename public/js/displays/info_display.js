
function InfoDisplay(routeData, userStatus, mapHandler) {
  this.routeData = routeData;
  this.userStatus = userStatus;
  this.mapHandler = mapHandler;

  this.stopLocations = {};
  this.count = 0;

  this.callbacks = {};
}


InfoDisplay.prototype.setUpEditability = function() {
  if (this.userStatus.isDriver && this.userStatus.view != "rider") {

    var me = this;

    this.originDisplay = new LocationDisplay("originText", "origin", this.mapHandler);
    this.originDisplay.addListener('valueChanged', function(newValue) {
        me.routeData.origin = newValue;
        me.valueChanged("origin", newValue, true);
    });

    this.destinationDisplay = new LocationDisplay("destinationText", "destination", this.mapHandler);
    this.destinationDisplay.addListener('valueChanged', function(newValue) {
        me.routeData.destination = newValue;
        me.valueChanged("destination", newValue, true);
    });

    this.seatsDisplay = new SeatsDisplay("seatsText", "seats");
    this.seatsDisplay.addListener('valueChanged', function(newValue) {
        me.routeData.seats = newValue;
        me.valueChanged("seats", newValue, false);
    });

    this.dateDisplay = new DateDisplay("dateText", "date");
    this.dateDisplay.addListener('valueChanged', function(newValue) {
        me.routeData.date = newValue;
        me.valueChanged("date", newValue, false);
    });

    this.timeDisplay = new TimeDisplay("timeText", "time");
    this.timeDisplay.addListener('valueChanged', function(newValue) {
      me.routeData.date = newValue;
      me.valueChanged("time", newValue, false);
    });

  }
}

InfoDisplay.prototype.errorMessageFromEditable = function(id, newValue){
  if (id == "seats" && newValue != "" + parseInt(newValue)) { return "Please enter a number for the number of people you can take"; }
  if (id == "date" && newValue.split('/').length != 3) { return "Please enter a valid date"; }
  if (id == "time" && newValue == "") { return "Please enter the time you are leaving"; }

  return "";
}

InfoDisplay.prototype.ridersChanged = function() {
  var seatsLeft = this.routeData.seats - this.routeData.confirmedRiders.length;
  this.seatsDisplay.ridersChanged(seatsLeft);
  if (seatsLeft <= 0) {
    $("#rideIsFull").show();
  }
  else {
    $("#rideIsFull").hide();
  }
}


// "private" functions that call callbacks after specific events occur
InfoDisplay.prototype.valueChanged = function(name, value, mapChanged) {
  if (this.callbacks.valueChanged) { this.callbacks.valueChanged(name, value, mapChanged); }
  else { console.log("Warning. valueChanged callback undefined"); }
}

InfoDisplay.prototype.addListener = function(event, cb) {
  this.callbacks[event] = cb;
}
