import React, { Component } from 'react'

class Stops extends Component {
  constructor(props) {
    super(props);

    this.state = {
      stops: this.props.stops,
      isDriver: this.props.isDriver,
      creatingRoute: this.props.creatingRoute
    };

    this.props.stops.forEach((stop, i) => {
      this.state.stops.push({
        name: stop,
        index: i,
        finalized: true
      });
    })
  }

  render() {
    let stops = [];
    for (var i = 0; i < this.state.stops.length; i++) {
      var display = null;
      var stop = this.state.stops[i];
      var id = "stop" + stop.index;
      if (stop.finalized) {
        display = <span id={id} style={{fontSize: "18px"}}>{stop.name || stop.place.name}</span>
      }
      else {
        display = <input id={id} name="origin" className="stop-input controls"
             type="text" placeholder="Enter a stop..." onPaste=""
             style={{marginLeft: "12px", paddingLeft: "12px"}}/>
      }


      var stopDiv = <div key={i}>
        <i className="material-icons clickable" style={{paddingLeft: "10px"}}
        onClick={this.removeStop.bind(this, stop.index)}>remove_circle</i>
        {display}
      </div>

      stops.push(stopDiv);
    }

    var button = <button className="btn" style={{width: "200px", marginLeft: "46px", backgroundColor: "white", color: "#0c84e4"}} onClick={this.addStop.bind(this)}>
      Add Stop
    </button>

    if (!this.state.isDriver && !this.state.creatingRoute) {
      button = ''
    }

    return <div id="stops">
      {stops}
      {button}
    </div>
  }

  componentDidUpdate() {
    // wait for dom to be rendered
    window.requestAnimationFrame(() => {
      console.log("updating");
      var stops = this.state.stops;
      for (var i = 0; i < stops.length; i++) {
        if (!stops[i].autocomplete && !stops[i].finalized) {
          var id = "stop" + stops[i].index;
          var autocomplete = new google.maps.places.Autocomplete(
            document.getElementById(id), {placeIdOnly: true});

          autocomplete.addListener('place_changed', this.stopChanged.bind(this, stops[i].index));

          stops[i].autocomplete = autocomplete;
        }
      }
    });
  }

  addStop() {
    // let stops = this.stops;
    // stops.push({index:stops.length, finalized: false});
    // this.stops = stops;
    this.state.stops.push({index:this.state.stops.length, finalized: false});
    this.setState(this.state);
  }

  removeStop(index) {
    console.log("removing", index);
    for (var i = 0; i < this.state.stops.length; i++) {
      if (this.state.stops[i].index == index) {
        this.state.stops.splice(i, 1);
      }
    }
    this.setState(this.state);
    this.props.stopsUpdated();
  }

  stopChanged(index) {
    console.log("changed", index);
    var stops = this.state.stops;
    for (var i = 0; i < stops.length; i++) {
      if (stops[i].index == index) {
        stops[i].place = stops[i].autocomplete.getPlace();
        stops[i].finalized = true;
      }
    }

    this.state.stops = stops;

    console.log(this.state);
    this.setState(this.state);

    this.props.stopsUpdated();
  }


}


export default Stops
