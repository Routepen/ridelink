import React, { Component } from 'react'
import LocationDisplay from './location_display'

class Stops extends Component {
  constructor(props) {
    super(props);

    this.state = {
      route: this.props.route,
      isDriver: this.props.isDriver,
      creatingRoute: this.props.creatingRoute,
      page: this.props.page
    };

    this.props.route.stops.forEach((stop, i) => {
      this.state.route.stops[i] = {
        place: {name: stop},
        index: i,
        finalized: true
      };
    })
  }

  render() {
    let stops = [];
    for (var i = 0; i < this.state.route.stops.length; i++) {
      var display = null;
      var stop = this.state.route.stops[i];
      var id = "stop" + stop.index;

      var style = {
        fontSize: "17px",
        marginLeft: "14px",
        position: "relative",
        top: "-6px"
      };

      if (this.state.page == "new") {
        style = {

        };
      }
      else if (this.state.page == "view") {
        style = {
          fontSize: "18px",
          marginLeft: "22px"
        };
      }

      display = <LocationDisplay
        eventEmitter={this.props.eventEmitter}
        ref={"locationDisplay" + stop.index}
        text={stop.place.name}
        route={this.state.route}
        value={"stop"}
        editable={this.state.isDriver}
        icon={"remove_circle"}
        iconClickable={true}
        iconClicked={this.removeStop.bind(this, stop.index)}
        locationChanged={this.stopChanged(stop.index)}
        removeMe={this.removeStop.bind(this, stop.index)}
        page={this.state.page}/>


      var stopDiv = <div key={i}>
        {display}
      </div>

      stops.push(stopDiv);
    }

    var buttonStyle = {};
    if (this.state.page == "view") {
      buttonStyle = {width: "200px", marginLeft: "38px"};
    }
    else if (this.state.page == "new") {
      buttonStyle = {width: "200px", marginLeft: "46px", backgroundColor: "white", color: "#0c84e4"};
    }

    var button = <button className="btn btn-primary" style={buttonStyle} onClick={this.addStop.bind(this)}>
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

  addStop() {
    // let stops = this.stops;
    // stops.push({index:stops.length, finalized: false});
    // this.stops = stops;
    var index = Math.max.apply(null, this.state.route.stops.map(s => { return s.index }) ) + 1;
    this.state.route.stops.push({index:index, finalized: false, place:{}});
    this.setFocusOn = index;
    this.setState(this.state);
  }

  componentDidUpdate() {
      if (this.setFocusOn != undefined) {
        this.refs["locationDisplay" + this.setFocusOn].focus();
      }
      this.setFocusOn = undefined
  }

  removeStop(index) {
    for (var i = 0; i < this.state.route.stops.length; i++) {
      if (this.state.route.stops[i].index == index) {
        this.state.route.stops.splice(i, 1);
      }
    }
    let stopStrings = this.state.route.stops.map(stop => {
      return stop.place.name;
    }).filter(s => { return s; });

    var me = this;
    this.props.eventEmitter.emit("valueChanged", "stops[]", stopStrings, (text, success) => {

    });
    this.setState(this.state);
    this.props.stopsUpdated();
  }

  stopChanged(index) {
    var me = this;
    return autocomplete => {
      var stops = me.state.route.stops;
      for (var i = 0; i < stops.length; i++) {
        if (stops[i].index == index) {
          stops[i].place = autocomplete.getPlace();
          stops[i].finalized = true;
        }
      }

      me.state.route.stops = stops;
      this.setState(me.state);

      me.props.stopsUpdated();
    }
  }


}


export default Stops
