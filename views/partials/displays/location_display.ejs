function LocationDisplay(id, name, mapHandler) {
  this.id = id;
  this.name = name;
  this.mapHandler = mapHandler;

  this.callbacks = {};

  this.setUpEditablity();
}

LocationDisplay.prototype.setUpEditablity = function() {
  var textSelector = '#' + this.id;
  var spanSelector = textSelector + '>span';
  var editableSelector = textSelector + "Editable";

  var text = $(textSelector);
  var span = $(spanSelector);
  var editable = $(editableSelector);
  var input = editable.find('input');

  span.click(function() {
    text.hide();

    editable.show();
    input.focus();
    input[0].selectionStart = input[0].selectionEnd = input.val().length;
  });


  var confirmButton = $(textSelector + "ButtonConfirm");
  var cancelButton =  $(textSelector + "ButtonCancel");

  cancelButton.click(function() {

    input.val(span.html().trim());

    editable.hide();
    text.show();
  });

  var autocomplete = new google.maps.places.Autocomplete(input[0], {placeIdOnly: true});
  this.mapHandler.bindAutocompleteToMap(autocomplete);

  var me = this;
  autocomplete.addListener('place_changed', function() {
    var location = autocomplete.getPlace().name;

    me.locationChanged(location);

    span.html(location);
    input.val(location);

    editable.hide();
    text.show();
  });

  confirmButton.click(function() {
    var location = input.val();

    me.locationChanged(location);

    span.html(location);
    input.val(location);

    editable.hide();
    text.show();
  });

}


// "private" functions that call callbacks after specific events occur
LocationDisplay.prototype.locationChanged = function(location) {
  if (this.callbacks.valueChanged) { this.callbacks.valueChanged(location); }
  else { console.log("Warning. valueChanged callback undefined"); }
}

LocationDisplay.prototype.addListener = function(event, cb) {
  this.callbacks[event] = cb;
}
