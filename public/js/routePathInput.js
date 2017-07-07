function RoutePathInput() {
  $("#originInputContainer").show();
  $("#destinationInputContainer").show();
}

RoutePathInput.prototype.acceptRoute = function() {
  $("#editRouteDiv").show();
  $("#acceptRouteDiv").hide();
  $("#resetMapDiv").hide();
  $("#changeRouteDiv").hide();

  // $("#acceptRouteButton").html("Save Changes");
  // $("#changeRouteButton").html("Cancel");

  $("#destination-error").hide();
  // TODO fill origin/destination with correct values


  $('#originInputContainer').hide();
  $('#originDisplaySpan').html(routeData.origin.name);
  $('#originDisplayContainer').show();

  $('#destinationInputContainer').hide();
  $('#destinationDisplaySpan').html(routeData.destination.name);
  $('#destinationDisplayContainer').show();

  mapHandler.hideAllMarkers();

  $("#num-seats").focus();

  mapHandler.setRouteEditable(false);

}

RoutePathInput.prototype.editRoute = function() {
  $("#editRouteDiv").hide();
  $("#acceptRouteDiv").show();
  $("#resetMapDiv").hide();
  $("#changeRouteDiv").show();

  $('#originInputContainer').show();
  $('#originDisplayContainer').hide();

  $('#destinationInputContainer').show();
  $('#destinationDisplayContainer').hide();

  mapHandler.showAllMarkers();
}

RoutePathInput.prototype.resetMap = function() {
  // $("#resetMapDiv").hide();
  // $("#changeRouteDiv").show();

  mapHandler.clearExtraWaypoints();
}

RoutePathInput.prototype.changeRoute = function() {
  $("#resetMapDiv").show();
  $("#changeRouteDiv").hide();

  mapHandler.setRouteEditable(true);
}
