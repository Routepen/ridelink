function TextDisplay(id, name) {
  this.id = id;
  this.name = name;

  this.callbacks = {};

  this.setUpEditablity();
}

TextDisplay.prototype.setUpEditablity = function() {
  var textSelector = '#' + this.id;
  var spanSelector = textSelector + '>span';
  var editableSelector = textSelector + "Editable";

  this.text = $(textSelector);
  this.span = $(spanSelector);
  this.editable = $(editableSelector);
  this.input = this.editable.find('input');

  var me = this;
  this.span.click(function() {
    me.text.hide();

    me.editable.show();
    me.input.focus();
    me.input[0].selectionStart = me.input[0].selectionEnd = me.input.val().length;
  });


  this.confirmButton = $(textSelector + "ButtonConfirm");
  this.cancelButton =  $(textSelector + "ButtonCancel");

  this.cancelButton.click(function() {

    me.input.val(me.span.html().trim());

    me.editable.hide();
    me.text.show();
  });


  this.confirmButton.click(function() {
    me.confirm();
  });

  this.input.keypress(function(e) {
    if(e.which == 13) {
      me.confirm();
    }
  });

}

TextDisplay.prototype.confirm = function() {
  var textVal = this.input.val();

  this.textChanged(textVal);

  this.span.html(textVal);
  this.input.val(textVal);

  this.editable.hide();
  this.text.show();
}



// "private" functions that call callbacks after specific events occur
TextDisplay.prototype.textChanged = function(text) {
  if (this.callbacks.valueChanged) { this.callbacks.valueChanged(text); }
  else { console.log("Warning. valueChanged callback undefined"); }
}

TextDisplay.prototype.addListener = function(event, cb) {
  this.callbacks[event] = cb;
}
