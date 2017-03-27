import React, { Component } from 'react'
import Stops from "./stops"


class DriverInput extends Component {

  constructor(props) {
    super(props);

    this.state = {
      route: this.props.route
    };
  }

  keyPressed(e) {
    if (e.keyCode == 13) { return false; }
  }

  render() {
    return <div>
        <div style={{paddingLeft: "10px"}}>
            <div id="header-color-box" className="color-box">
                <h3 className="color-header">
                    Create a Route
                </h3>
            </div>

            <div id="driver_input_form" className="row">
                <div id="form-color-box" className="color-box">
                    <div>
                        <i className="material-icons" style={{paddingLeft: "10px"}}>adjust</i>
                        <input id="origin-input" name="origin" className="controls" type="text"
                               placeholder="Enter an origin location..." onPaste=""
                               onKeyDown={this.keyPressed.bind(this)}
                               defaultValue={this.state.route.origin}/>
                    </div>
                    <Stops stops={this.props.route.stops}/>
                    <div>
                        <i className="material-icons" style={{paddingLeft: "10px"}}>place</i>
                        <input autoFocus id="destination-input" name="destination" className="controls" type="text"
                               placeholder="Enter a destination location..." onPaste=""
                               onKeyDown={this.keyPressed.bind(this)} />
                    </div>
                </div>


                <hr/>
                <div>
                    <div className="col-md-12">
                        <input id="num-seats" name="seats" className="controls" type="text"
                               placeholder="Enter number of seats..."/><br/>
                        <input id="charge" name="charge" className="controls" type="text" placeholder="$ Cost per seat" onPaste=""/>
                        <br/>
                        <br/>
                        <input id="date" name="date" className="controls" type="text" placeholder="Date..." onPaste=""/>

                        <br/>
                        <input id="time" name="time" className="controls" type="text" placeholder="Time..." onPaste=""/>

                        <br/><br/>
                        <input type="submit" id="create-route" className="btn btn-md btn-success" value="Create Route" onClick={this.printState.bind(this)}/>
                    </div>
                </div>


                <input type="hidden" name="confirmedEmail" id="confirmed_email_input"/>
            </div>

            <br/>

        </div>
    </div>
  }

  printState() {
    console.log(this.state);
  }

  componentDidMount() {
    var originInput = document.getElementById('origin-input');
    var destinationInput = document.getElementById('destination-input');

    var originAutocomplete = new google.maps.places.Autocomplete(
            originInput, {placeIdOnly: true});
    var destinationAutocomplete = new google.maps.places.Autocomplete(
            destinationInput, {placeIdOnly: true});


    this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
    this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');
  }

  setupPlaceChangedListener(autocomplete, mode) {
    var originInput = document.getElementById('origin-input');
    var destinationInput = document.getElementById('destination-input');

    var me = this;
    autocomplete.addListener('place_changed', function() {
        var place = autocomplete.getPlace();
        if (!place.place_id) {
            window.alert("Please select an option from the dropdown list.");
            return;
        }
        if (mode === 'ORIG') {
            me.state.route.originPlaceId = place.place_id;
            me.state.route.origin = originInput.value;
        } else if (mode == "DEST"){
            me.state.route.destinationPlaceId = place.place_id;
            me.state.route.destination = destinationInput.value;
        }
        console.log("state set");
        me.setState(me.state);
        me.props.mapChanged();
    });
  }
}


export default DriverInput
