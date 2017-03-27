import React, { Component } from 'react'

class MapView extends Component {
  constructor(props) {
    super(props);

    this.state = this.props;
    this.travelMode = 'DRIVING';
  }

  render() {
    console.log("rendering");
    if (this.map && this.state.route.originPlaceId && this.state.route.destinationPlaceId) {
      var me = this;

      var waypoints = [];
      var stops = this.state.route.stops;
      for (var i = 0; i < stops.length; i++) {
        var place = stops[i].place;
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
          origin: {placeId: this.state.route.originPlaceId},
          destination: {placeId: this.state.route.destinationPlaceId},
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

    return <div id="map"></div>
  }

  componentDidMount() {
    this.map = new google.maps.Map(document.getElementById('map'), {
        mapTypeControl: false,
        center: {lat: 34.4140, lng: -119.8489},
        zoom: 13
    });

    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;
    this.directionsDisplay.setMap(this.map);
  }
}


export default MapView
