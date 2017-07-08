function NewRouteMapManager(map, routeData) {
  // Call constructor of superclass to initialize superclass-derived members.
  mapManager.call(this, map, routeData);
}

// Circle derives from Shape
NewRouteMapManager.prototype = Object.create(mapManager.prototype);
NewRouteMapManager.prototype.constructor = NewRouteMapManager;


NewRouteMapManager.prototype.loadMarkers = function() {
  this.markers = new MarkerManager(this.map, this);
}
