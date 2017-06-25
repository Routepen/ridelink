function JoinRide() {
  this.callbacks = {};
  this.modal = $("#confirmAddRider");
  this.confirmButton = $("#joinRideButtonConfirm");

  var me = this;
  this.confirmButton.click(function() {
    me.joinRideClicked($('#sel1').val());
  });
}

JoinRide.prototype.show = function() {
  this.modal.modal('show');
}

JoinRide.prototype.hide = function() {
  this.modal.modal('hide');
}

JoinRide.prototype.grayOutButton = function() {
  this.confirmButton.button("loading");
}

JoinRide.prototype.restoreButton = function() {
  this.confirmButton.button("reset");
}

// "private" functions that call callbacks after specific events occur
JoinRide.prototype.joinRideClicked = function(baggage) {
  if (this.callbacks.joinRideClicked) { this.callbacks.joinRideClicked(baggage); }
  else { console.log("Warning. joinRideClicked callback undefined"); }
}

JoinRide.prototype.addListener = function(event, cb) {
  this.callbacks[event] = cb;
}
