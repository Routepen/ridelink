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
                    <Stops
                      route={this.state.route}
                      stopsUpdated={this.props.stopsUpdated.bind(this)}
                      creatingRoute={true}
                      isDriver={true}
                      page="new"/>
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
                        <input type="submit" id="create-route" className="btn btn-md btn-success" value="Create Route" onClick={this.submitForm.bind(this)}/>
                        <input type="submit" id="print-state" className="btn btn-md btn-success" value="p" onClick={console.log.bind(null, this.state)}/>
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

    $(function () {
        $("#date").datepicker();
    });
    $("#time").timepicker({
        template: false,
        showInputs: false,
        minuteStep: 5,
        defaultTime: "8:00 AM"
    });
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

  submitForm() {

    $('#create-route').button("loading");

    var seats = document.getElementById("num-seats");
    var charge = document.getElementById("charge");
    var requireInitialDeposit = document.getElementById("requireInitialDeposit");
    var date = document.getElementById("date");
    var time = document.getElementById("time");

    let data = {
      origin: this.state.route.origin,
      destination: this.state.route.destination,
      stops: this.state.route.stops
      .map(stop => {
        return stop.place.name
      })
      .filter(stop => {
        return stop;
      }),
      seats: seats.value,
      charge: charge.value.replace('$', ''),
      date: date.value,
      time: time.value,
      distance: this.state.route.distance || 0
    };

    var email = document.getElementById("confirmed_email_input");


    var confirmedEmail = email.value;
    if (confirmedEmail) {
      data.confirmedEmail = confirmedEmail;
    }

    $.post('/route/new/', data, function(data, status){
      console.log(data, status);
      if (status == "success") {
        window.location.href = data;
      }
      else {
        posted = false;
        $('#create-route').button('reset');
      }
    })
    .error(function() { alert("Request failed. Try again later"); });


  }
}


export default DriverInput
