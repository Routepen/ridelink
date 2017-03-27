import React, { Component } from 'react'

class Stops extends Component {
  constructor(props) {
    super(props);

    this.state = {
      stops: props.stops
    };
  }

  addStop() {
    let stops = this.state.stops;
    stops.push({stop:"", place:stops.length});
    this.state.stops = stops;
    this.setState(this.state);
  }

  removeStop(place) {
    let stops = this.state.stops;
    for (var i = 0; i < stops.length; i++) {
      if (stops[i].place == place) {
        stops.splice(i, 1);
      }
    }
    this.state.stops = stops;
    this.setState(this.state);
  }

  render() {
    let stops = [];
    for (var i = 0; i < this.state.stops.length; i++) {
      stops.push(
        <div key={i}>
          <i className="material-icons clickable" style={{paddingLeft: "10px"}}
          onClick={this.removeStop.bind(this, this.state.stops[i].place)}>remove_circle</i>

          <input id="origin-input" name="origin" className="stop-input controls"
               type="text" placeholder="Enter a stop..." onPaste=""
               style={{marginLeft: "12px", paddingLeft: "12px"}}/>
        </div>
      );
    }

    return <div id="stops">
      {stops}
      <button className="btn" style={{width: "200px", marginLeft: "46px", backgroundColor: "white", color: "#0c84e4"}} onClick={this.addStop.bind(this)}>
        Add Stop
      </button>
    </div>
  }
}


export default Stops
