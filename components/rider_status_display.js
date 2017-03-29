import React, { Component } from 'react'


class RiderStatusDisplay extends Component {

  constructor(props) {
    super(props);

    this.state = {
      riderId: this.props.riderId,
      riders: this.props.riders,
      confirmedRiders: this.props.confirmedRiders,
      user: this.props.user,
      text: this.props.text,
      editable: this.props.editable,
      routeId: this.props.routeId,
      editing: false
    };
  }
  render() {

    var hiddenStyle = {display: "none"}, normal = {};
    var editable, display;
    if (this.state.editing) {
      editable = normal;
      display = hiddenStyle;
    }
    else {
      editable = hiddenStyle;
      display = normal;
    }

    display.fontSize = "18px";

    return <div className="form-inline editableform">
      <div style={editable}>
        <button id="confirmRider" className="btn btn-success btn-xs" onClick={this.confirmRider.bind(this)}>Confirm</button>
        <button type="button"
        className="btn btn-default btn-xs editable-cancel" style={{marginLeft: "10px"}}
        onClick={this.cancel.bind(this)}>Cancel</button>

      </div>
      <div style={display}>
        <span ref="text" onClick={this.clicked.bind(this)} className={this.state.editable ? 'editableInput clickable' : ''}>{this.state.text}</span>
      </div>
    </div>
  }

  confirmRider() {
    var post = {
      userId: this.state.riderId,
      routeId: this.state.routeId
    };

    $("#confirmRider").button('loading');

    var me = this;
    $.post("/route/confirmrider", post, function(data, textStatus) {
      var addedRider;
      for (var i = 0; i < me.state.riders.length; i++) {
        var rider = me.state.riders[i];
        if (rider._id == this.state.riderId) {
          addedRider = rider;
          me.state.riders.splice(i, 1);
          me.state.confirmedRiders.push(rider);
        }
      }

      me.setState(me.state);

    });
  }

  clicked() {
    if (!this.state.editable) { return; }
    this.state.editing = true;
    this.setState(this.state);
  }

  cancel() {
    this.state.editing = false;
    this.setState(this.state);
  }
}


export default RiderStatusDisplay
