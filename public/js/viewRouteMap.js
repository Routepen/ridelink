function ViewRouteMapManager(map, routeData) {
  // Call constructor of superclass to initialize superclass-derived members.
  mapManager.call(this, map, routeData);
}

// Circle derives from Shape
ViewRouteMapManager.prototype = Object.create(mapManager.prototype);
ViewRouteMapManager.prototype.constructor = ViewRouteMapManager;


ViewRouteMapManager.prototype.loadMarkers = function() {
  this.markers = new MarkerManager(this.map, this);

  var me = this;
  this.routeData.stops.forEach(function(stop) {
    var position = new google.maps.LatLng(stop);
    console.log
    var marker = me.markers.addMarker({position: position});
    marker.hide();
  });

  console.log(this.routeData.origin.place_id);
  // this.markers.addMarker({position: new google.maps.LatLng(this.routeData.originCoor)});
  // this.markers.addMarker({position: new google.maps.LatLng(this.routeData.destinationCoor)});
}
