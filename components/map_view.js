import React, { Component } from 'react'
import ReactDOM from 'react-dom'

class MapView extends Component {
  constructor(props) {
    super(props);

    this.state = this.props;
    this.travelMode = 'DRIVING';

    this.googleMarkers = [];
  }

  render() {
    console.log("rendering");
    if (this.map && this.state.route.originPlaceId && this.state.route.destinationPlaceId) {
      this.route();
    }

    return <div id="map"></div>
  }

  route() {
    console.log(this.state);
    var origin, destination;
    if (this.state.route.originPlaceId && this.state.route.destinationPlaceId) {
      origin = {placeId: this.state.route.originPlaceId};
      destination = {placeId: this.state.route.destinationPlaceId};
    }
    else if (this.state.route.origin && this.state.route.destination) {
      origin = this.state.route.origin
      destination = this.state.route.destination;
    }
    else {
      return;
    }
    var me = this;

    var waypoints = [];
    var stops = this.state.route.stops;
    for (var i = 0; i < stops.length; i++) {
      var place = stops[i].place || {name: stops[i].name};
      if (typeof(stops[i]) === 'string') {
        place = {name: stops[i]};
      }
      if (!place) {
        alert("Couldn't find " + place);
        return;
      }
      waypoints.push({
        location: place.name,
        stopover: true,
      });
    }

    this.directionsService.route({
        origin: origin,
        destination: destination,
        travelMode: this.travelMode,
        waypoints: waypoints,
        optimizeWaypoints: true
    }, function(response, status) {
        if (status === 'OK') {
            me.directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
  }

  markerAdded(marker) {
    var me = this;

    this.geocoder.geocode( { 'address': marker.address }, function(results, status) {
      if (results.length == 0) {
        window.alert("Please use autocomplete when choosing a location.");
        return;
      }

      if (marker.type == "requestRide") {
        var googleMarker = new google.maps.Marker({
          map: me.map,
          position: results[0].geometry.location
        });

        const span = document.createElement("span");
        const button = <button onClick={me.showModal.bind(me)} className="btn btn-success btn-xs">Request Ride</button>
        ReactDOM.render(button, span);

        var infowindow = new google.maps.InfoWindow({
          content: span
        });

        infowindow.open(me.map, googleMarker);

        me.googleMarkers.push(googleMarker);
      }

    });
  }

  showModal() {
    console.log("show");
  }

  componentDidMount() {
    this.map = new google.maps.Map(document.getElementById('map'), {
        mapTypeControl: false,
        center: {lat: 34.4140, lng: -119.8489},
        zoom: 13
    });

    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;
    this.geocoder = new google.maps.Geocoder();
    this.directionsDisplay.setMap(this.map);

    this.route();
  }
}


export default MapView
