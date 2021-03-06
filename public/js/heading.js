function heading(user, userStatus, routeData) {
  this.callbacks = {};

  this.user = user;
  this.userStatus = userStatus;
  this.routeData = routeData;

  this.setUpHeading();
}

heading.prototype.setUpHeading = function() {
  if (this.user && (!this.userStatus.isDriver || this.userStatus.view == "rider")) {

    this.dropOff = new DropOff(this.routeData.dropOffs[this.user._id], this.userStatus);
    this.dropOff.show();

    var me = this;
    this.dropOff.addListener('dropOffInputted', function(autocomplete) {
      me.dropOffInputted(autocomplete);
    });

    this.dropOff.addListener('requestRideButtonClicked', function(pickUpAutocomplete, dropOffAutocomplete) {
      me.requestRideButtonClicked(pickUpAutocomplete, dropOffAutocomplete);
    });

    this.dropOff.addListener('cancelRiderRequest', function() {
      me.cancelRiderRequest();
    });

  }

  var me = this;
  $('#showPostLink').click(function() {
    me.showPostClicked();
  });
}

heading.prototype.onUserStatusChanged = function() {
  if (this.dropOff) {
    console.log(this.routeData.dropOffs, this.user._id);
    this.dropOff.setAddress(this.routeData.dropOffs[this.user._id]);
    this.dropOff.updateDisplay();
  }
}

heading.prototype.riderLocationChanged = function() {
  var userId = this.user._id;
  if (userId == routeData.driver._id) {
    alert("You can't sign up for your own ride");
    return;
  }

  var editable = $('#dropOffTextEditable');
  var address = editable.find('input').val();

  $('#riderDropOff').html(address);
  $('#confirmAddRider').modal('show');
}


// "private" functions that call callbacks after specific events occur
heading.prototype.dropOffInputted = function(autocomplete) {
  if (this.callbacks.dropOffInputted) { this.callbacks.dropOffInputted(autocomplete); }
  else { console.log("Warning. dropOffInputted callback undefined"); }
}

heading.prototype.requestRideButtonClicked = function(pickUpAutocomplete, dropOffAutocomplete) {
  if (this.callbacks.requestRideButtonClicked) {
    this.callbacks.requestRideButtonClicked(pickUpAutocomplete, dropOffAutocomplete);
  }
  else { console.log("Warning. requestRideButtonClicked callback undefined"); }
}

heading.prototype.cancelRiderRequest = function() {
  if (this.callbacks.cancelRiderRequest) { this.callbacks.cancelRiderRequest(); }
  else { console.log("Warning. cancelRiderRequest callback undefined"); }
}

heading.prototype.showPostClicked = function() {
  if (this.callbacks.showPostClicked) { this.callbacks.showPostClicked(); }
  else { console.log("Warning. cancelRiderRequest callback undefined"); }
}

heading.prototype.addListener = function(event, cb) {
  this.callbacks[event] = cb;
}
