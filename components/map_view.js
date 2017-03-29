import React, { Component } from 'react'
import ReactDOM from 'react-dom'

class MapView extends Component {
  constructor(props) {
    super(props);

    this.state = this.props;
    this.travelMode = 'DRIVING';

    this.googleMarkers = {};
    this.infoWindows = {};
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
      if (typeof(stops[i]) === 'string') { place = {name: stops[i]}; }

      if (!place) {
        alert("Couldn't find " + place);
        return;
      }

      waypoints.push({
        location: place.name,
        stopover: true,
      });
    }

    this.state.route.confirmedRiders.forEach(rider => {
      waypoints.push({
        location: this.state.route.dropOffs[rider._id],
        stopover: true
      });
    });

    this.directionsService.route({
        origin: origin,
        destination: destination,
        travelMode: this.travelMode,
        waypoints: waypoints,
        optimizeWaypoints: true
    }, function(response, status) {
        if (status === 'OK') {
            me.directionsDisplay.setDirections(response);
            me.setMarkers();
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
  }

  removeRequestMarker() {
    this.googleMarkers['request'].setMap(null);
    this.infoWindows['request'].close();
  }

  setMarkers() {
    var me = this;
    var allRiders = [];
    this.state.route.riders.forEach(rider => { allRiders.push(rider); });
    this.state.route.confirmedRiders.forEach(rider => { allRiders.push(rider); });

    allRiders.forEach(rider => {
      let riderId = rider._id;
      console.log(me.state.route.dropOffs[riderId]);
      me.geocoder.geocode( { 'address': me.state.route.dropOffs[riderId] }, function(results, status) {
        if (results.length == 0) {
          return;
        }

        var marker = new google.maps.Marker({
          map: me.map,
          position: results[0].geometry.location
        });

        // if (isDriver && view != "rider") {
        //   if (!rider.confirmed && this.state.route.confirmedRiders.length < routeData.seats) {
        //     //contentString += '<button class="btn btn-success btn-xs" onclick="javascript:confirmRider(\'' + rider._id + '\', this)">Confirm</button>'
        //   }
        // }

        const span = document.createElement("span");
        const content = <div><a href={rider.facebook.link}>{rider.facebook.name}</a></div>;
        ReactDOM.render(content, span);

        var infowindow = new google.maps.InfoWindow({
          content: span
        });

        marker.addListener('click', () => {
          infowindow.open(me.map, marker);
        });

        me.googleMarkers[rider._id] = marker;
        me.infoWindows[rider._id] = infowindow;
      });
    });
  }

  markerAdded(marker) {
    var me = this;

    this.geocoder.geocode( { 'address': marker.address }, function(results, status) {
      if (results.length == 0) {
        window.alert("Please use autocomplete when choosing a location.");
        return;
      }

      var googleMarker = new google.maps.Marker({
        map: me.map,
        position: results[0].geometry.location
      });

      if (marker.type == "requestRide") {
        const span = document.createElement("span");
        const button = <button onClick={me.showModal.bind(me)} className="btn btn-success btn-xs">Request Ride</button>
        ReactDOM.render(button, span);

        var infowindow = new google.maps.InfoWindow({
          content: span
        });

        infowindow.open(me.map, googleMarker);
        googleMarker.addListener('click', () => {
          infowindow.open(me.map, googleMarker);
        });

        me.googleMarkers['request'] = googleMarker;
        me.infoWindows['request'] = infowindow;
      }
      else {
        const rider = marker.rider;
        const span = document.createElement("span");
        const content = <div><a href={rider.facebook.link}>{rider.facebook.name}</a></div>;
        ReactDOM.render(content, span);

        var infowindow = new google.maps.InfoWindow({
          content: span
        });

        googleMarker.addListener('click', () => {
          infowindow.open(me.map, googleMarker);
        });

        me.googleMarkers[rider._id] = googleMarker;
        me.infoWindows[rider._id] = infowindow;
      }

    });
  }

  showModal() {
    this.props.eventEmitter.emit("requestRideClicked");
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
    //this.directionsDisplay.setOptions( { suppressMarkers: true } );

    this.route();
  }
}


export default MapView
