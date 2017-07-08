function Marker(map, options) {
  this.map = map;
  this.marker = new google.maps.Marker({map: map});
  this.marker.setOptions(options);
}

Marker.prototype.getGoogleMarker = function() {
  return this.marker;
}

Marker.prototype.getPosition = function() {
  return this.marker.getPosition();
}


Marker.prototype.hide = function() {
  this.marker.setMap(null);
}

Marker.prototype.show = function() {
  this.marker.setMap(this.map);
}

function MarkerManager(map, mapManager) {
  this.map = map;
  this.count = 0;
  this.markers = [];
  this.mapManager = mapManager;
}

MarkerManager.prototype.addMarker = function(options) {

  var marker = new Marker(this.map, options);
  this.markers.push(marker);

  var me = this;
  google.maps.event.addListener(marker.getGoogleMarker(), 'dragend', function() {
    me.mapManager.drawMap();
  });

  return marker;
}

MarkerManager.prototype.removeAll = function() {
  this.hideAllMarkers();
  this.markers = [];
}

MarkerManager.prototype.hideAllMarkers = function() {
  this.markers.forEach(function(marker) {
    marker.hide();
  });
}

MarkerManager.prototype.showAllMarkers = function() {
  this.markers.forEach(function(marker) {
    marker.show();
  });
}

MarkerManager.prototype.getWayPoints = function() {
  var waypoints = this.markers.map(function(m) {
    return m.getPosition();
  });

  return waypoints;
}


function mapManager(map, routeData) {
  this.map = map;
  this.originPlaceId = null;
  this.destinationPlaceId = null;
  this.travelMode = 'DRIVING';
  this.placesService = new google.maps.places.PlacesService(map);
  this.directionsService = new google.maps.DirectionsService();
  this.directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
  this.directionsDisplay.setMap(map);
  this.geocoder = new google.maps.Geocoder();

  this.infoWindows = {};
  this.routeData = routeData;

  this.loadMarkers();

  this.routeEditable = false;
  this.tutorialStep = 0;
  this.distance = routeData.distance;
  this.cachedGoogleMapsRoute = null;

  this.callbacks = {};

  var me = this;
  this.drawMap(function() {
    me.setMarkers();
  });

  google.maps.event.addListener(map, 'click', function(event) {
    if (!me.routeEditable) { return; }
    me.mapClicked(event.latLng);
  });

  this.directionsDisplay.addListener('directions_changed', function() {
    console.log(me.directionsDisplay.directions.routes[0].legs[0].via_waypoint);
    me.cachedGoogleMapsRoute = me.directionsDisplay.directions;
    me.updateTutorial();
  });

}

mapManager.prototype.drawMap = function(callback) {
  var routeData = this.routeData;

  if (!routeData) return;

  var waypoints = [];
  for (var i = 0; i < routeData.confirmedRiders.length; i++) {
    waypoints.push({
      location: routeData.dropOffs[routeData.confirmedRiders[i]._id],
      stopover: true,
    });
  }

  this.markers.getWayPoints().forEach(function(waypoint) {
    console.log(waypoint);
    waypoints.push({
      location: waypoint,
      stopover: true
    });
  });

  me = this;

  if (!routeData.origin || !routeData.destination) { return; }

  console.log(routeData.destination);
  this.directionsService.route({
    origin: {placeId: routeData.origin.place_id},
    destination:  {placeId: routeData.destination.place_id},
    travelMode: this.travelMode,
    waypoints: waypoints,
    optimizeWaypoints: true
  }, function(response, status) {
    if (status === 'OK') {
      me.distance = google.maps.geometry.spherical.computeLength(response.routes[0].overview_path);
      console.log(me.distance + " meters");
      me.directionsDisplay.setDirections(response);
      me.cachedGoogleMapsRoute = response;
      if (callback) callback();
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}

mapManager.prototype.redrawMap = function() {
  if (!this.cachedGoogleMapsRoute) { return; }

  this.directionsDisplay.setDirections(this.cachedGoogleMapsRoute);
}

mapManager.prototype.getPlaceId = function(locationName, callback) {
  this.placesService.textSearch({
    location: this.map.getCenter(),
    query: locationName
  }, function(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      callback(results[0]);
    }
    else {
      callback(null);
    }
  });
}

mapManager.prototype.getDistance = function() {
  return this.distance;
}

mapManager.prototype.mapClicked = function(latLng) {
  console.log('clicked', latLng);
  this.addWayPoint(latLng);
}

mapManager.prototype.addWayPoint = function(location) {
  this.markers.addMarker({
    position: location,
    draggable: true,
  });



  this.drawMap();
}

mapManager.prototype.getRouteWayPoints = function() {
  return this.markers.getWayPoints();
}

mapManager.prototype.clearExtraWaypoints = function() {
  this.markers.removeAll();
  this.drawMap();
}

mapManager.prototype.hideAllMarkers = function() {
  this.markers.hideAllMarkers();
}

mapManager.prototype.showAllMarkers = function() {
  this.markers.showAllMarkers();
}

mapManager.prototype.setRouteEditable = function(routeEditable) {
  this.routeEditable = routeEditable;

  this.tutorialStep = 0;
  if (this.routeEditable) {
    this.updateTutorial();
  }
  else {
    $("#mapInstructionsText").html("");
    $("#mapInstructions").css('visibility', 'hidden');
  }
}

mapManager.prototype.updateTutorial = function() {
  if (!this.routeEditable) { return; }
  if (this.tutorialStep == 0) {
    $("#mapInstructionsText").html("Click anywhere to add a stop");
    $("#mapInstructions").css('visibility', 'visible');
  }
  else if (this.tutorialStep == 1) {
    $("#mapInstructionsText").html("Drag the marker to change it");
    $("#mapInstructions").css('visibility', 'visible');
  }
  else { // tutorial done
    $("#mapInstructionsText").html("");
    $("#mapInstructions").css('visibility', 'hidden');
  }

  this.tutorialStep++;
}


mapManager.prototype.setMarkers = function(map) {
  var map = this.map;
  var routeData = this.routeData;
  var contentString;
  var me = this;

  var allRiders = [];
  for (var i = 0; i < routeData.riders.length; i++) {
    var rider = routeData.riders[i];
    rider.confirmed = false;
    allRiders.push(rider);
  }
  for (var i = 0; i < routeData.confirmedRiders.length; i++) {
    var rider = routeData.confirmedRiders[i];
    rider.confirmed = true;
    allRiders.push(rider);
  }

  var me = this;
  allRiders.forEach(function(rider) {
    var addMarker = function(results, status) {
      var content = $('<div></div>');
      content.append($('<div>Facebook: <a href="' + rider.facebook.link + '">' + rider.facebook.name + '</a></div>'));

      var me = this;
      if (data.isDriver && data.view != "rider") {
        if (!rider.confirmed && routeData.confirmedRiders.length < routeData.seats) {
          var button = $('<button class="btn btn-success btn-xs">Confirm</button>')

          button.click(function() {
            me.confirmRiderClicked(rider._id);
          });
          content.append(button);
        }
      }


      console.log("content", content[0]);
      var infowindow = new google.maps.InfoWindow({
        content: content[0]
      });

      var riderId = rider._id;

      var markerExists = me.markers[riderId] != undefined;

      if (!me.markers[riderId]) {
        me.markers[riderId] = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location,
          title: rider.facebook.name
        });
      }

      me.markers[riderId].setPosition(results[0].geometry.location);

      if (!markerExists) {
        me.infoWindows[riderId] = infowindow;
        me.markers[riderId].addListener('click', function() {
          me.riderClicked(rider._id);
          infowindow.open(map, me.markers[riderId]);
        });
      }
      else {
        me.infoWindows[riderId].setContent(contentString);
      }

      google.maps.event.addListener(infowindow, 'closeclick', me.infoWindowClosed.bind(me));

      if (data.action == "confirm") {
        if (data.riderId == riderId) {
          me.riderClicked(rider._id);
          me.infoWindows[riderId].open(map, me.markers[riderId]);
        }
      }

    };
    me.geocoder.geocode( { 'address': routeData.dropOffs[rider._id] }, function(result, status) {
      addMarker.call(me, result, status);
    });

    // me.geocoder.geocode( { 'address': routeData.pickUps[rider._id] }, function(result, status) {
    //   addMarker.call(me, result, status);
    // });
  });
}

mapManager.prototype.removeMarker = function(id) {
  this.markers.removeMarker(id);
}

mapManager.prototype.closeDisplay = function(riderId) {
  if (this.infoWindows[riderId]) {
    this.infoWindows[riderId].close();
  }
}

mapManager.prototype.changeRoute = function(location) {
  var autocomplete;
  if (location == "origin") { autocomplete = this.pickUpAutocomplete; }
  else { autocomplete = this.destinationAutocomplete}

  var place = autocomplete.getPlace();
  if (!place || !place.place_id) {
      //window.alert("Please select an option from the dropdown list.");
      if (location == "origin") { routeData[location] = this.pickUpInput.value; }
      else { routeData[location] = this.destinationInput.value; }

  }
  else {
      routeData[location] = place.name;
  }

  this.drawMap(function() {
    restoreMapText(location);
  });
}

mapManager.prototype.bindAutocompleteToMap = function(autocomplete) {
  autocomplete.bindTo('bounds', this.map);
}

mapManager.prototype.hideDropOffMarker = function() {
  if (this.testMarker) {
    this.testMarker.setMap(null);
    this.testInfoWindow.close();
  }
}

mapManager.prototype.userClicked = function(riderId) {
  var marker = me.markers[riderId];
  this.map.setCenter(marker.getPosition());
  this.infoWindows[riderId].open(this.map, marker);
}


mapManager.prototype.confirmRiderClicked = function(riderId) {
  if (this.callbacks.confirmRiderClicked) { this.callbacks.confirmRiderClicked(riderId); }
  else { console.log("Warning. confirmRiderClicked callback undefined"); }
}

mapManager.prototype.infoWindowClosed = function() {
  if (this.callbacks.onInfoWindowClosed) { this.callbacks.onInfoWindowClosed(); }
  else { console.log("Warning. onInfoWindowClosed callback undefined"); }
}

mapManager.prototype.riderClicked = function(riderId) {
  if (this.callbacks.riderClicked) { this.callbacks.riderClicked(riderId); }
  else { console.log("Warning. riderClicked callback undefined"); }
}

mapManager.prototype.addListener = function(event, cb) {
  this.callbacks[event] = cb;
}
