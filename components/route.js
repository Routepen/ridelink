import React, { Component } from 'react'
import Navbar from "./navbar"
import MapView from "./map_view"
import RouteInfo from "./route_info"
import Modals from "./modals"
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}


class Route extends Component {
  constructor() {
    super();

    var txt = document.createElement("textarea");
    txt.innerHTML = document.getElementById("info").innerHTML;
    var val = txt.value.trim();
    var data = JSON.parse(txt.value);
    console.log(data);

    this.state = data;
    this.state.routeData.date = new Date(this.state.routeData.date);

    this.state.markers = [];
    // marker = {
    //  type: 'requestRide'|'rider'
    //  riderStatus: ""
    // }

    this.eventEmitter = new MyEmitter();

    var me = this;
    this.eventEmitter.on('markerAdded', marker => {
      me.refs.mapview.markerAdded(marker);
    });

    this.eventEmitter.on('requestRideClicked', () => {
      me.refs.modals.add("confirmAddRider");
    });

    this.eventEmitter.on('rideRequested', (rider, address) => {
      me.refs.mapview.removeRequestMarker();
      me.refs.mapview.markerAdded({
        type: "rider",
        rider: rider,
        address: address
      });
      me.forceUpdate();
    });

  }

  render() {
    return <div>
      <Navbar user={this.state.user}/>
      <Modals ref="modals"
        eventEmitter={this.eventEmitter}
        toShow={[]} route={this.state.routeData}
        user={this.state.user}/>

      <div id="content" className="fill" style={{overflow: "scroll", height: "100%"}}>
        <div className="col-md-4 core-container">
          <RouteInfo
            eventEmitter={this.eventEmitter}
            markers={this.state.markers}
            route={this.state.routeData}
            user={this.state.user}
            isDriver={this.state.isDriver}
            isRider={this.state.isRider}
            confirmedRider={this.state.confirmedRider}
            mapChanged={this.forceUpdate.bind(this)}
            stopsUpdated={this.stopsUpdated.bind(this)}/>

            <button onClick={console.log.bind(null, this.state)}>Print</button>
        </div>
        <MapView
          ref="mapview"
          eventEmitter={this.eventEmitter}
          route={this.state.routeData}
          markers={this.state.markers}
          confirmationMarker={this.state.confirmationMarker}
           />
      </div>
    </div>
  }

  stopsUpdated() {
    console.log("stops updated");
    console.log(this.state.routeData.stops);
    this.refs.mapview.route();
  }


}


export default Route
