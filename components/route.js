import React, { Component } from 'react'
import Navbar from "./navbar"
import MapView from "./map_view"
import RouteInfo from "./route_info"
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

  }

  render() {
    return <div>
      <Navbar user={this.state.user}/>
      <div id="content" className="fill" style={{overflow: "scroll", height: "100%"}}>
        <div className="col-md-4 core-container">
          <RouteInfo
            eventEmitter={this.eventEmitter}
            markers={this.state.markers}
            route={this.state.routeData}
            user={this.state.user}
            mapChanged={this.forceUpdate.bind(this)}
            stopsUpdated={this.forceUpdate.bind(this)}/>
            <button onClick={console.log.bind(null, this.state)}>Print</button>
        </div>
        <MapView
          ref="mapview"
          eventEmitter={this.eventEmitter}
          route={this.state.routeData}
          markers={this.state.markers}
          confirmationMarker={this.state.confirmationMarker} />
      </div>
    </div>
  }


}


export default Route
