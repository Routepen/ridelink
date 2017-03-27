import React, { Component } from 'react'
import Navbar from "./navbar"
import Landing from "./landing"
import DriverInput from "./driver_input"
import MapView from "./map_view"

class NewRoute extends Component {
  constructor() {
    super();

    var txt = document.createElement("textarea");
    txt.innerHTML = document.getElementById("info").innerHTML;
    var val = txt.value.trim();
    var data = JSON.parse(txt.value);
    console.log(data);

    this.state = data;

    this.state.route = {
      stops: [],
      origin: "UCSB, Santa Barbara, CA, United States",
      originPlaceId: "ChIJN0sx82c_6YARws62XH5rlU4",
      destination: "",
      destinationPlaceId: null
    };
  }

  render() {
    return <div>
      <Navbar user={this.state.user}/>
      <div id="content" className="fill">
        <div className="col-md-4 core-container">
          <DriverInput route={this.state.route} mapChanged={this.forceUpdate.bind(this)}/>
        </div>
        <MapView route={this.state.route}/>
      </div>
    </div>
  }
}


export default NewRoute
