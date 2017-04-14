import React, { Component } from 'react'
import ReactDOM from 'react-dom'

class MapView extends Component {
  constructor(props) {
    super(props);

    this.state = this.props;
    this.travelMode = 'DRIVING';

    this.googleMarkers = {};
    this.infoWindows = {};

    var me = this;
    this.props.eventEmitter.on("riderClicked", rider => {
      if (me.infoWindows[rider._id]) {
        let marker = me.googleMarkers[rider._id];
        let latLng = marker.getPosition();
        let map = me.map;

        me.infoWindows[rider._id].open(map, marker);
        map.setCenter(latLng);
      }
    });

    this.props.eventEmitter.on("riderConfirmed", rider => {
      me.route(() => {
        me.infoWindows[rider._id].close();
      });
    })
  }

  render() {
    if (this.map && this.state.route.originPlaceId && this.state.route.destinationPlaceId) {
      this.route();
    }

    return <div id="map"></div>
  }

  route(callback) {
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

      if (place.name) {
        waypoints.push({
          location: place.name,
          stopover: true,
        });
      }
    }

    this.state.route.confirmedRiders.forEach(rider => {
      waypoints.push({
        location: me.state.route.dropOffs[rider._id],
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
            var poly = me.decodePolyline(response.routes[0].overview_polyline);
            me.state.route.distance = google.maps.geometry.spherical.computeLength(poly);
            me.setState(me.state);
            me.directionsDisplay.setDirections(response);
            me.setMarkers();
            if (callback) callback();
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

    allRiders.forEach((rider,i) => {
      let isConfirmed = i >= me.state.route.riders.length;
      let riderId = rider._id;
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
        let confirm = '';
        if (!isConfirmed && me.state.isDriver) {
          var id = "confirmButton" + rider._id;
            confirm = <span>
            <br/>
            <button id={id} onClick={me.riderConfirmed.bind(me, rider, id)} className="btn btn-success btn-xs">Confirm</button>
          </span>
        }
        const content = <div><a href={rider.facebook.link}>{rider.facebook.name}</a>{confirm}</div>;
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

  riderConfirmed(rider, id) {
    var post = {
      userId: rider._id,
      routeId: this.state.route._id
    };

    $("#" + id).button('loading');

    var me = this;
    $.post("/route/confirmrider", post, function(data, textStatus) {
      console.log(data, textStatus);
      var addedRider;
      for (var i = 0; i < me.state.route.riders.length; i++) {
        var r = me.state.route.riders[i];
        if (r._id == rider._id) {
          addedRider = r;
          me.state.route.riders.splice(i, 1);
          me.state.route.confirmedRiders.push(r);
        }
      }

      me.setState(me.state);

      me.props.eventEmitter.emit("tableShouldChange");
      me.props.eventEmitter.emit("seatsChanged");
      me.props.eventEmitter.emit("riderConfirmed", addedRider);

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
    this.directionsDisplay = new google.maps.DirectionsRenderer({
      suppressMarkers: this.state.page != "new"
    });
    this.geocoder = new google.maps.Geocoder();
    this.directionsDisplay.setMap(this.map);

    if (this.state.route.origin && this.state.page != "new") {
      this.setUpEndPoints();
    }

    this.route();
  }

  setUpEndPoints() {
    console.log("setting up endpoitns");
    var me = this;
    this.geocoder.geocode( { 'address': this.state.route.origin }, function(results, status) {
      if (results.length == 0) {
        return;
      }

      me.originMarker = new google.maps.Marker({
        map: me.map,
        position: results[0].geometry.location,
        label: "A"
      });


    });

    this.geocoder.geocode( { 'address': this.state.route.destination }, function(results, status) {
      if (results.length == 0) {
        return;
      }

      me.destinationMarker = new google.maps.Marker({
        map: me.map,
        position: results[0].geometry.location,
        label: "B"
      });

    });

  }

  decodePolyline(encoded) {
      function returner(a) { return a; }
      if (!encoded) {
          return [];
      }
      var poly = [];
      var index = 0, len = encoded.length;
      var lat = 0, lng = 0;

      while (index < len) {
          var b, shift = 0, result = 0;

          do {
              b = encoded.charCodeAt(index++) - 63;
              result = result | ((b & 0x1f) << shift);
              shift += 5;
          } while (b >= 0x20);

          var dlat = (result & 1) != 0 ? ~(result >> 1) : (result >> 1);
          lat += dlat;

          shift = 0;
          result = 0;

          do {
              b = encoded.charCodeAt(index++) - 63;
              result = result | ((b & 0x1f) << shift);
              shift += 5;
          } while (b >= 0x20);

          var dlng = (result & 1) != 0 ? ~(result >> 1) : (result >> 1);
          lng += dlng;

          var p = {
              lat: returner.bind(null, lat / 1e5),
              lng: returner.bind(null, lng / 1e5),
          };
          poly.push(p);
      }
      return poly;
  }
}


export default MapView
