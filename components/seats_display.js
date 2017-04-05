import React, { Component } from 'react'


class SeatsDisplay extends Component {

  constructor(props) {
    super(props);

    this.state = {
      route: this.props.route,
      editable: this.props.editable,
      editing: false
    };

    var me = this;
    this.props.eventEmitter.on("seatsChanged", () => {
      me.forceUpdate();
    })
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
        <i className="material-icons" style={{fontSize:"18px"}}>{this.props.icon}</i>
        <input ref="input" type="text" className="form-control input-sm" style={{width: "60%"}} defaultValue={this.state.text}
          placeholder="Total number of people you can take..." onKeyPress={this.keyPressed(this)}/>
        <button ref="doneButton" type="button" className="btn btn-primary btn-sm editable-submit" onClick={this.doneEditing.bind(this)}>
          <i className="glyphicon glyphicon-ok"></i>
        </button>
        <button onClick={this.editingCancelled.bind(this)} type="button" className="btn btn-default btn-sm editable-cancel">
          <i className="glyphicon glyphicon-remove"></i>
        </button>
      </div>
      <div style={display}>
        <i className="material-icons" style={{fontSize:"18px"}}>{this.props.icon}</i>
        <span>{"Seats Left: "}</span>
        <span ref="text" onClick={this.clicked.bind(this)} className={this.state.editable ? 'editableInput clickable' : ''}>
          {this.state.route.seats - this.state.route.confirmedRiders.length}
          </span>
      </div>
    </div>
  }

  keyPressed(me) {
    return event => {
      if (event.key == 'Enter'){
        me.doneEditing();
      }
    }
  }

  componentDidUpdate() {
    this.refs.input.focus()
  }

  doneEditing() {
    let seats = parseInt(this.refs.input.value);

    if (seats < this.state.route.confirmedRiders.length) {
      this.props.eventEmitter.emit("notEnoughSeats");
      return;
    }

    $(this.refs.doneButton).button('loading');

    var me = this;
    this.props.eventEmitter.emit("valueChanged", "seats", seats, (text, success) => {
      console.log(text, success);
      me.state.route.seats = seats;
      me.refs.input.value = "";
      me.state.editing = false;
      $(me.refs.doneButton).button('reset');
      me.setState(me.state);

      me.props.eventEmitter.emit("seatsChanged");
    });
  }

  clicked() {
    if (!this.state.editable) { return; }
    this.state.editing = true;
    this.setState(this.state);
  }

  editingCancelled() {
    this.refs.input.value = "";
    this.state.editing = false;
    this.setState(this.state);
  }
}


export default SeatsDisplay
