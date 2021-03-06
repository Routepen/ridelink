function http(routeData) {
  this.routeId = routeData._id;
  this.callbacks = {};
}

http.prototype.confirmRider = function(riderId, routeData, callback) {
  var post = {
    userId: riderId,
    routeId: routeData._id
  };

  var me = this;
  $.post("/route/confirmrider", post, function(data, textStatus) {
    callback(data, textStatus);
  });
}

http.prototype.addRider = function(userId, pickUpAddress, dropOffAddress, baggage, callback) {
  var data = {
    routeId: this.routeId,
    pickUpAddress: pickUpAddress,
    dropOffAddress: dropOffAddress,
    baggage: baggage
  };

  console.log("sending", data);

  var me = this;
  $.post("/route/addrider", data, (data, text) => {
    callback();
  });
}

http.prototype.searchAddRider = function(routeId, userId, pickUpAddress, dropOffAddress, baggage, email, callback) {
  var data = {
    routeId: routeId,
    userId: userId,
    pickUpAddress: pickUpAddress,
    dropOffAddress: dropOffAddress,
    baggage: baggage,
    email: email
  };

  console.log("sending", data);

  var me = this;
  $.post("/route/searchAddRider", data, (data, text) => {
    callback();
  });
}

http.prototype.removeRider = function(riderId, routeData, callback) {
  var post = {
    userId: riderId,
    routeId: routeData._id
  };

  var me = this;
  $.post("/route/removerider", post, function(data, textStatus) {
    callback();
  });
}

http.prototype.removeRiderEntirely = function(riderId, routeIds, callback) {
  var post = {
    userId: riderId,
    routeIds: routeIds
  };

  var me = this;
  $.post("/route/removeriderentirely", post, function(data, textStatus) {
    callback();
  });
}


http.prototype.cancelRiderRequest = function(routeData, callback) {
  var post = {
    routeId: routeData._id
  };

  $.post("/route/cancelrequest", post, function(data, textStatus) {
    callback();
  });
}

http.prototype.updateRoute = function(name, value, mapChanged, distance, callback) {
  var data = {
    routeId: this.routeId,
    updating: name,
    distance: distance
  }
  data[name] = value;

  $.post("/route/update", data, function(data, result) {
    if (callback) { callback(data, result); }
  });
}


http.prototype.requestNotifications = function(origin, destination, dateRange, confirmedEmail, cb) {
  var data = {
    dateRange: dateRange,
    origin: origin,
    destination: destination,
    confirmedEmail: confirmedEmail
  };

  console.log("sending", data);
  $.post("/route/requestnotifications", data, function(data, textStatus) {
    console.log("got", data, textStatus);
    cb(data, textStatus);
  });

}


// "private" functions that call callbacks after specific events occur
http.prototype.ridersChanged = function() {
  if (this.callbacks.ridersChanged) { this.callbacks.ridersChanged(); }
  else { console.log("Warning. ridersChanged callback undefined"); }
}

http.prototype.addListener = function(event, cb) {
  this.callbacks[event] = cb;
}
