function table(table, routeData) {
  this.table = table;
  this.routeData = routeData;

  this.callbacks = {};

  this.setUpTable();
}

table.prototype.setUpTable = function() {
  console.log("setting up table");
  var table = this.table;
  var routeData = this.routeData;
  var me = this;


  if (routeData.confirmedRiders.length + routeData.riders.length == 0) {
    //$(table).hide();
    $('#tableMessage').html("No riders have signed up yet");
    $('#tableMessage').show();
  }
  else {
    //$(table).show();
    $('#tableMessage').html("");
    $('#tableMessage').hide();
  }

  var tbody = $("#riderTable");
  tbody.html("");

  routeData.confirmedRiders.forEach(function(rider, i) {
    var rider = routeData.confirmedRiders[i];
    var color = "green", title="confirmed";
    var status = "";

    if (routeData.riderStatus[rider._id].paid) {
      status="Paid";
    }
    else {
      if (routeData.requireInitialDeposit) {
        status="Awaiting payment";
      }
      else {
        status = "Confirmed";
      }
    }

    var tr = $('<tr class="riderElement" id="rider' + rider._id + '"></tr>');

    var td1 = $("<td> " + (i+1) + " </td>");
    var td2 = $("<td><a href='#' onclick='javascript:mapHandler.userClicked(\"" + rider._id + "\"); return false;'>" + rider.facebook.name + "</a></td>");
    var td3 = me.getTdElement(rider, status);
    console.log('td3', td3);
    var td4 = $('<td> ' + routeData.riderStatus[rider._id].baggage + '</td>');

    tr.append(td1);
    tr.append(td2);
    tr.append(td3);
    tr.append(td4);

    tbody.append(tr);

  });

  routeData.confirmedRiders.forEach(function(rider) {
    if (data.isDriver && data.view != "rider") {
      if (status != "Paid") {
        me.initializeTdElement(rider, status);
      }
    }
  });


  var waitlisted = routeData.confirmedRiders.length >= routeData.seats;
  if (waitlisted && routeData.riders.length > 0) {
    tbody = $("#waitlistRiderTable");
    tbody.html("");
    $('#waitListTable').show();
  }
  else {
    $('#waitListTable').hide();
  }

  routeData.riders.forEach(function(rider, i) {
    var status = "Ride Requested"

    var tr = $('<tr class="riderElement" id="rider' + rider._id + '"></tr>');

    var td1 = $("<td> " + (i+1) + " </td>");
    var td2 = $("<td><a href='#' onclick='javascript:mapHandler.userClicked(\"" + rider._id + "\"); return false;'>" + rider.facebook.name + "</a></td>");
    var td3 = me.getTdElement(rider, status, waitlisted);
    console.log('td3', td3);
    var td4 = $('<td> ' + routeData.riderStatus[rider._id].baggage + '</td>');

    tr.append(td1);
    tr.append(td2);
    tr.append(td3);
    tr.append(td4);

    tbody.append(tr);
  });

  if (data.isDriver && data.view != "rider") {
    routeData.riders.forEach(function(rider) {
      if (routeData.confirmedRiders.length < routeData.seats) { me.initializeTdElement(rider, status); }
    });
  }
}

table.prototype.getTdElement = function(rider, status, waitlisted) {

  var clickable = false;

  var innerButton = "", button2 = "";
  var cancelButton =
    $('<button type="button" class="btn btn-default btn-xs editable-cancel" style="margin-left: 10px")">' +
      'Cancel' +
    '</button>');

  var me = this;
  cancelButton.click(function() {
    me.restoreTdElement(rider._id);
  });

  if ((status == "Awaiting payment" && routeData.requireInitialDeposit) || (status == "Confirmed" && !routeData.requireInitialDeposit && !waitlisted)) {
    clickable = true;
    innerButton =
    $('<button type="button" class="btn btn-primary btn-xs editable-submit">' +
      'Remove Rider' +
    '</button>');

    innerButton.click(function() {
      innerButton.button("loading");
      me.removeRiderClicked(rider._id);
    })
  }
  if (status == "Ride Requested" && !waitlisted) {
    clickable = true;
    innerButton = $('<button class="btn btn-success btn-xs">Confirm</button>');

    innerButton.click(function() {
      innerButton.button("loading");
      me.confirmRiderClicked(rider._id);
    });
  }

  var spanClass = data.isDriver && data.view != "rider" ? "editableInput" : "";
  if (!clickable) { spanClass = ""; }

  if (!routeData.requireInitialDeposit && status == "Awaiting payment") {
    button2 =
    '<button class="btn btn-success btn-xs" style="margin-right: 10px;" onclick="javascript:markPaid(\'' + rider._id + '\', this)">Rider Paid</button>'
  }

  var div = $('<div class="form-inline editableform"></div>');
  var div2 = $('<div id="tr' + rider._id + 'TextEditable" style="display:none"></div>');

  var button2_ = $(button2);
  var innerButton_ = innerButton;
  var cancelButton_ = cancelButton;

  div2.append(button2_);
  div2.append(innerButton_);
  div2.append(cancelButton_);

  var div3 = $('<div id="tr' + rider._id + 'Text"></div>');

  div3.append($('<span class=' + spanClass + ' aria-hidden="true">' + status + '</span>'));

  div.append(div2);
  div.append(div3);

  var td = $("<td></td>");
  td.append(div);

  return td;

  // return '<div class="form-inline editableform">' +
  //   '<div id="tr' + rider._id + 'TextEditable" style="display:none">' +
  //     button2 +
  //     innerButton +
  //     cancelButton +
  //   '</div>' +
  //
  //   '<div id="tr' + rider._id + 'Text" style="">' +
  //     '<span class=' + spanClass + ' aria-hidden="true">' + status + '</span>' +
  //   '</div>' +
  // '</div>';
}

table.prototype.restoreTdElement = function(riderId) {
  var editable = $('#tr' + riderId + "TextEditable");
  var text = $('#tr' + riderId + "Text");

  text.show();
  editable.hide();
}

table.prototype.initializeTdElement = function(rider, status) {
  var divId = 'tr' + rider._id + 'Text';
  var editableId = divId + 'Editable';
  $('#' + divId + '>span').click(function() {
    $('#' + divId).hide();
    $('#' + editableId).show();
  });
}


table.prototype.hightlightInTable = function(riderId) {
  $("#riderTable").find("tr").each(function(i, elem) {
    if (elem.id == "rider" + riderId) {
      $(elem).addClass("highlighted");
    }
    else {
      $(elem).removeClass("highlighted");
    }
  });
}

table.prototype.unHighlightTable = function() {
  $("#riderTable").find("tr").each(function(i, elem) {
    $(elem).removeClass("highlighted");
  });
}

// "private" functions that call callbacks after specific events occur
table.prototype.confirmRiderClicked = function(riderId) {
  if (this.callbacks.confirmRiderClicked) { this.callbacks.confirmRiderClicked(riderId); }
  else { console.log("Warning. confirmRiderClicked callback undefined"); }
}

table.prototype.removeRiderClicked = function(riderId) {
  if (this.callbacks.removeRiderClicked) { this.callbacks.removeRiderClicked(riderId); }
  else { console.log("Warning. removeRiderClicked callback undefined"); }
}

table.prototype.addListener = function(event, cb) {
  this.callbacks[event] = cb;
}
