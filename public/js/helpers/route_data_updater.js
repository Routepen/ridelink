function RouteDataUpdater(routeData) {
  this.routeData = routeData;
}

RouteDataUpdater.prototype.addRider = function(user, userStatus, pickUpAddress, dropOffAddress, baggage) {
  userStatus.isRider = true;

  var userId = user._id;
  var found = false;
  for (var i = 0; i < this.routeData.riders.length; i++) {
    if (this.routeData.riders[i]._id == userId) {
      found = true;
      break;
    }
  }
  if (found) {
    routeData.dropOffs[userId] = dropOffAddress;
    routeData.pickUps[userId] = pickUpAddress;
  }
  else {
    routeData.riders.push(user);
    routeData.dropOffs = routeData.dropOffs || {};
    routeData.pickUps = routeData.pickUps || {};
    routeData.dropOffs[userId] = dropOffAddress;
    routeData.pickUps[userId] = pickUpAddress;
  }
  routeData.riderStatus = routeData.riderStatus || {};
  routeData.riderStatus[userId] = routeData.riderStatus[userId] || {};
  routeData.riderStatus[userId].baggage = baggage;
}

RouteDataUpdater.prototype.cancelRiderRequest = function(user, userStatus, routeData) {
  userStatus.isRider = false;

  var userId = user._id;
  var riderDeleted;
  for (var i = 0; i < routeData.riders.length; i++) {
    var rider = routeData.riders[i];
    if (rider._id == userId) {
      riderDeleted = rider;
      routeData.riders.splice(i, 1);
    }
  }

  if (routeData.dropOffs) {
    if (routeData.dropOffs[userId]) {
      delete routeData.dropOffs[userId];
    }
  }
}

RouteDataUpdater.prototype.confirmRider = function(riderId, routeData) {
  var addedRider;
  for (var i = 0; i < routeData.riders.length; i++) {
    var rider = routeData.riders[i];
    if (rider._id == riderId) {
      addedRider = rider;
      routeData.riders.splice(i, 1);
      routeData.confirmedRiders.push(rider);
    }
  }
  routeData.dropOffs = routeData.dropOffs || {};
    // $("#seatsText>span").html(routeData.seats - routeData.confirmedRiders.length);
    // me.ridersChanged();
    // if (addedRider) {
    //   if (addedRider.facebook.gender.toLowerCase() == "male") {
    //     $('#riderPronounHeShe').html('he');
    //     $('#riderPronounHisHer').html('his');
    //     $('#riderPronounHimHer').html('him');
    //   }
    //   else {
    //     $('#riderPronounHeShe').html('she');
    //     $('#riderPronounHisHer').html('her');
    //     $('#riderPronounHimHer').html('her');
    //   }
    //   $('#addedRider').html(addedRider.facebook.name.split(' ')[0]);
    //   $('#tellDriverToWait').modal('show');
    // }
  // });
}

RouteDataUpdater.prototype.removeRider = function(riderId, routeData) {
  for (var i = 0; i < routeData.confirmedRiders.length; i++) {
    var rider = routeData.confirmedRiders[i];
    if (rider._id == riderId) {
      routeData.riders.push(rider);
      routeData.confirmedRiders.splice(i, 1);
    }
  }
}
