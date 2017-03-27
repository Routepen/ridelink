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
    stops.push({stop:"", index:stops.length});
    this.state.stops = stops;
    this.setState(this.state);
  }

  removeStop(index) {
    console.log("removing", index);
    let stops = this.state.stops;
    for (var i = 0; i < stops.length; i++) {
      if (stops[i].index == index) {
        stops.splice(i, 1);
      }
    }
    this.state.stops = stops;
    this.setState(this.state);
    this.props.stopsUpdated();
  }

  render() {
    let stops = [];
    for (var i = 0; i < this.state.stops.length; i++) {
      var input = <input id={"stop" + i} name="origin" className="stop-input controls"
           type="text" placeholder="Enter a stop..." onPaste=""
           style={{marginLeft: "12px", paddingLeft: "12px"}}/>


      var stop = <div key={i}>
        <i className="material-icons clickable" style={{paddingLeft: "10px"}}
        onClick={this.removeStop.bind(this, this.state.stops[i].index)}>remove_circle</i>
        {input}
      </div>

      if (!this.state.stops[i].autocomplete) {
        console.log(input);
        //this.state.stops[i].autocomplete = new google.maps.places.Autocomplete(input, {placeIdOnly: true});
      }
      stops.push(stop);
    }

    return <div id="stops">
      {stops}
      <button className="btn" style={{width: "200px", marginLeft: "46px", backgroundColor: "white", color: "#0c84e4"}} onClick={this.addStop.bind(this)}>
        Add Stop
      </button>
    </div>
  }

  componentDidUpdate() {
    // wait for dom to be rendered
    window.requestAnimationFrame(() => {
      console.log("updating");
      for (var i = 0; i < this.state.stops.length; i++) {
        if (!this.state.stops[i].autocomplete) {
          var autocomplete = new google.maps.places.Autocomplete(
            document.getElementById("stop" + i), {placeIdOnly: true});

          autocomplete.addListener('place_changed', this.stopChanged.bind(this, i));

          this.state.stops[i].autocomplete = autocomplete;
        }
      }
    });
  }

  stopChanged(index) {
    for (var i = 0; i < this.state.stops.length; i++) {
      if (this.state.stops[i].index == index) {
        this.state.stops[i].place = this.state.stops[i].autocomplete.getPlace();
      }
    }
    this.setState(this.state);

    this.props.stopsUpdated();
  }


}


export default Stops
