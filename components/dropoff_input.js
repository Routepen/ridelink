import React, { Component } from 'react'

class DropoffInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      routeId: this.props.routeId,
      markers: this.props.markers
    }
  }

  render() {
    return <span>
      <span> <i className="material-icons">place</i> </span>
      <input id="pac-input" style={{width: "60%"}} name="address" className="controls" type="text" placeholder="Enter dropoff address..." autoFocus/>
      <input type="hidden" name="routeId" value={this.state.routeId}/>
      <button type="button" className="btn btn-primary btn-sm editable-submit">
        <i className="glyphicon glyphicon-ok"></i>
      </button>
    </span>
  }

  componentDidMount() {
    let dropOffInput = document.getElementById("pac-input");
    let autocomplete = new google.maps.places.Autocomplete(dropOffInput, {placeIdOnly: true});

    var me = this;

    autocomplete.addListener('place_changed', () => {
      var place = autocomplete.getPlace();

      var address;
      if (place && place.place_id) {
        address = place.name;
      }
      else {
        address = $('#pac-input').val();
      }

      if (address == "") {
          window.alert("Please select an option from the dropdown list.");
          return;
      }

      var exists = !!me.marker;
      me.marker = {
        type: "requestRide",
        address: address
      }

      if (!exists) {
        me.state.markers.push(me.marker);
      }

      me.setState(me.state);
      me.props.eventEmitter.emit('markerAdded', me.marker);



    });
  }
}


export default DropoffInput
