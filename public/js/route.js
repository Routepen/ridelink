var routeData = data.routeData;
if (!routeData.dropOffs) { routeData.dropOffs = {}; }

var user = data.user
var userStatus = {
  isRider: data.isRider,
  confirmedRider: data.confirmedRider,
  isDriver: data.isDriver,
  view: data.view
};


var mapHandler;

function initMap() {
  NavBarAutocompleteHandler();

  var map = new google.maps.Map(document.getElementById('map'), {
    mapTypeControl: false,
    center: {lat: 34.4140, lng: -119.8489},
    zoom: 13
  });

  mapHandler = new ViewRouteMapManager(map, routeData);
  var tableManager = new table(document.getElementById("tableDiv"), routeData);
  var httpManager = new http(routeData);
  var headingManager = new heading(user, userStatus, routeData);
  var routeDataUpdater = new RouteDataUpdater(routeData);
  var joinRideModal = new JoinRide();
  var facebookModal = new Facebook();

  var infoDisplay = new InfoDisplay(routeData, userStatus, mapHandler);

  mapHandler.addListener('onInfoWindowClosed', function()  {
    tableManager.unHighlightTable();
  });

  mapHandler.addListener('riderClicked', function(riderId)  {
    tableManager.hightlightInTable(riderId);
  });

  infoDisplay.setUpEditability();
  infoDisplay.addListener('valueChanged', function(name, value, mapChanged) {
    console.log(name, value);

    var sendData = function() {
      httpManager.updateRoute(name, value, mapChanged, mapHandler.getDistance(), function(data, result) {
        if(data.status == "failure"){
          window.alert(data.message);
        }
        else {
          routeData.stopsCoor = data.stopsCoor;
          routeData.originCoor = data.originCoor;
          routeData.destinationCoor = data.destinationCoor;
          checkSeatsLeft();
        }
      });
    }

    if (mapChanged) {
      mapHandler.drawMap(sendData);
    }
    else {
      sendData();
    }

  });

  httpManager.addListener('ridersChanged', function() {
    mapHandler.drawMap(function() {
      mapHandler.setMarkers();
    });

    tableManager.setUpTable();
    checkSeatsLeft();
  });


  var pickUpAddress, dropOffAddress;
  headingManager.addListener('requestRideButtonClicked', function(pickUpAutocomplete, dropOffAutocomplete) {
    pickUpAddress = pickUpAutocomplete.getPlace().name;
    dropOffAddress = dropOffAutocomplete.getPlace().name;
    console.log("clicked", pickUpAddress, dropOffAddress)
    joinRideModal.show();
  });

  joinRideModal.addListener('joinRideClicked', function(baggage) {
    console.log(baggage);
    joinRideModal.grayOutButton();

    httpManager.addRider(user._id, pickUpAddress, dropOffAddress, baggage, function() {
      routeDataUpdater.addRider(user, userStatus, pickUpAddress, dropOffAddress, baggage);

      joinRideModal.restoreButton();
      joinRideModal.hide();
      tableManager.setUpTable();
      mapHandler.hideDropOffMarker();
      mapHandler.setMarkers();
      headingManager.onUserStatusChanged();
    });
  });

  headingManager.addListener('cancelRiderRequest', function() {
    httpManager.cancelRiderRequest(routeData, function() {
      routeDataUpdater.cancelRiderRequest(user, userStatus, routeData);
      tableManager.setUpTable();
      mapHandler.removeMarker(user._id);
      headingManager.onUserStatusChanged();
    });
  });

  headingManager.addListener('showPostClicked', function() {
    facebookModal.show();
  });

  tableManager.addListener('confirmRiderClicked', function(riderId) {
    httpManager.confirmRider(riderId, routeData, function() {
      routeDataUpdater.confirmRider(riderId, routeData);
      tableManager.setUpTable();
      mapHandler.drawMap();
      mapHandler.closeDisplay(riderId);
      infoDisplay.ridersChanged();
    });
  });

  mapHandler.addListener('confirmRiderClicked', function(riderId) {
    httpManager.confirmRider(riderId, routeData, function() {
      routeDataUpdater.confirmRider(riderId, routeData);
      tableManager.setUpTable();
      mapHandler.drawMap();
      mapHandler.closeDisplay(riderId);
      infoDisplay.ridersChanged();
    });
  });

  tableManager.addListener('removeRiderClicked', function(riderId) {
    httpManager.removeRider(riderId, routeData, function() {
      routeDataUpdater.removeRider(riderId, routeData);
      tableManager.setUpTable();
      mapHandler.drawMap();
      infoDisplay.ridersChanged();
    });
  });
}



function checkSeatsLeft() {
  var seatsLeft = routeData.seats - routeData.confirmedRiders.length;
  if (seatsLeft <= 0) {
    $("#rideIsFull").show();
  }
  else {
    $("#rideIsFull").hide();
  }
}


var shareableLinkStatus = 0;
function toggleShareableLink() {
  $('#shareableLink>input').val(window.location.hostname + "/route?id=" + routeData.shortId || routeData._id);
  if (shareableLinkStatus == 0) {
      $('#shareableLink').show();
      $('#getLinkText').html("Hide link");
      shareableLinkStatus = 1;
  }
  else {
    $('#shareableLink').hide();
    $('#getLinkText').html("Copy link");
    shareableLinkStatus = 0;
  }
}


checkSeatsLeft();

if (data.isRider && !data.confirmedRider) {
  $('#cancelRequestButton').show();
}
