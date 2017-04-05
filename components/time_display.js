import React, { Component } from 'react'


class TimeDisplay extends Component {

  constructor(props) {
    super(props);

    this.state = {
      time: this.props.time,
      editable: this.props.editable,
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
        <i className="material-icons" style={{fontSize:"18px"}}>{this.props.icon}</i>
        <input ref="input" type="text" className="form-control input-sm" style={{width: "60%"}}
          onKeyPress={this.keyPressed(this)} defaultValue={this.state.time}/>
        <button ref="doneButton" type="button" className="btn btn-primary btn-sm editable-submit" onClick={this.doneEditing.bind(this)}>
          <i className="glyphicon glyphicon-ok"></i>
        </button>
        <button onClick={this.editingCancelled.bind(this)} type="button" className="btn btn-default btn-sm editable-cancel">
          <i className="glyphicon glyphicon-remove"></i>
        </button>
      </div>
      <div style={display}>
        <i className="material-icons" style={{fontSize:"18px"}}>{this.props.icon}</i>
        <span ref="text" onClick={this.clicked.bind(this)} className={this.state.editable ? 'editableInput clickable' : ''}>{this.state.time}</span>
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

  componentDidMount() {
    var me = this;
    $(function () {
      $(me.refs.input).timepicker({
          template: false,
          showInputs: false,
          minuteStep: 5
      });
    });
  }

  doneEditing() {
    var time = this.refs.input.value;

    $(this.refs.doneButton).button('loading');

    var me = this;
    this.props.eventEmitter.emit("valueChanged", "time", time, (textResponse, success) => {
      me.state.time = time;
      me.state.editing = false;

      $(this.refs.doneButton).button('reset');
      me.setState(this.state);

      me.props.eventEmitter.emit("timeChanged");

    });
  }

  clicked() {
    if (!this.state.editable) { return; }
    this.state.editing = true;
    this.setState(this.state);
  }

  editingCancelled() {
    this.refs.input.value = this.refs.text.innerHTML;
    this.state.editing = false;
    this.setState(this.state);
  }
}


export default TimeDisplay
