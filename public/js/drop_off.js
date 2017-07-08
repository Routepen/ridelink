function DropOff(address, userStatus) {
  this.callbacks = {};

  this.userStatus = userStatus;

  this.container = $("#dropOffContainer");
  this.text = this.container.find("#dropOffText");
  this.editable = this.container.find("#dropOffTextEditable");
  this.pickUpInput = $("#pac-input");
  this.dropOffInput = $("#dropoff-input");
  this.cancelRequestButton = $('#cancelRequestButton');
  this.addressSpan = $('#riderPickUpLocation');
  this.confirmButton = $("#requestRideButtonConfirm");

  this.setAddress(address);
}

DropOff.prototype.show = function() {
  this.container.show();
  // if (!this.userStatus.isRider) {
    this.editable.show();
    this.text.show();
    console.log("showing", this.text);
  // }
  // else {
  //   this.editable.show();
  //   this.text.show();
  // }

  console.log(this.editable, this.text, "Fasdfasdfas")
  this.updateDisplay();

  this.pickUpAutocomplete = new google.maps.places.Autocomplete(this.pickUpInput[0],
     {placeIdOnly: true});

   this.dropOffAutocomplete = new google.maps.places.Autocomplete(this.dropOffInput[0],
      {placeIdOnly: true});


  var me = this;
  this.pickUpAutocomplete.addListener('place_changed', function() {
      me.dropOffInputted(me.pickUpAutocomplete);
  });

  this.confirmButton.click(function() {
    me.dropOffInputted(me.pickUpAutocomplete);
  });

  $("#requestRideButtonCancel").click(function() {
    var input = me.pickUpInput;
    input.val("");
    input.focus();
    input[0].selectionStart = input[0].selectionEnd = input.val().length;
  });

  this.cancelRequestButton.click(function() {
    me.cancelRiderRequest();
    me.cancelRequestButton.button("loading");
    me.pickUpInput.val("");
  });

  $("#requestRideButton").click(function() {
    me.requestRideButtonClicked();
  });
}

DropOff.prototype.setAddress = function(address) {
  this.address = address || "";
  this.addressSpan.html(this.address);
}



DropOff.prototype.hide = function() {

}


DropOff.prototype.updateDisplay = function() {
  if (this.userStatus.isRider) {
    this.text.show();
    this.editable.hide();
  }
  else {
    this.editable.show();
    this.text.hide();
  }
  this.cancelRequestButton.button("loading");// needed for some reason
  this.cancelRequestButton.button("reset");

  this.confirmButton.button("loading");
  this.confirmButton.button("reset");
}

// "private" functions that call callbacks after specific events occur
DropOff.prototype.dropOffInputted = function(autocomplete) {
  this.dropOffInput.focus();
  return;
  if (this.callbacks.dropOffInputted) { this.callbacks.dropOffInputted(autocomplete); }
  else { console.log("Warning. dropOffInputted callback undefined"); }
}

DropOff.prototype.requestRideButtonClicked = function() {
  if (this.dropOffAutocomplete.getPlace() && this.pickUpAutocomplete.getPlace()) {
    if (this.callbacks.requestRideButtonClicked) {
      this.callbacks.requestRideButtonClicked(this.pickUpAutocomplete, this.dropOffAutocomplete);
    }
    else { console.log("Warning. requestRideButtonClicked callback undefined"); }
  }
}

DropOff.prototype.cancelRiderRequest = function() {
  if (this.callbacks.cancelRiderRequest) { this.callbacks.cancelRiderRequest(); }
  else { console.log("Warning. cancelRiderRequest callback undefined"); }
}

DropOff.prototype.addListener = function(event, cb) {
  this.callbacks[event] = cb;
}
