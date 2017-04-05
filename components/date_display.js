import React, { Component } from 'react'


class DateDisplay extends Component {

  constructor(props) {
    super(props);

    this.state = {
      date: this.props.date,
      text: this.formatDate(this.props.date),
      editable: this.props.editable,
      editing: false
    };
  }

  formatDate(date) {
    return (date.getMonth() + 1) + "/" + date.getDate() + "/" + (date.getYear()-100);
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
          onKeyPress={this.keyPressed(this)} />
        <button ref="doneButton" type="button" className="btn btn-primary btn-sm editable-submit" onClick={this.doneEditing.bind(this)}>
          <i className="glyphicon glyphicon-ok"></i>
        </button>
        <button onClick={this.editingCancelled.bind(this)} type="button" className="btn btn-default btn-sm editable-cancel">
          <i className="glyphicon glyphicon-remove"></i>
        </button>
      </div>
      <div style={display}>
        <i className="material-icons" style={{fontSize:"18px"}}>{this.props.icon}</i>
        <span ref="text" onClick={this.clicked.bind(this)} className={this.state.editable ? 'editableInput clickable' : ''}>{this.state.text}</span>
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
      $(me.refs.input).datepicker();
    });
  }

  doneEditing() {
    let date = new Date(this.refs.input.value);
    let me = this;
    $(this.refs.doneButton).button("loading");
    this.props.eventEmitter.emit("valueChanged", "date", date, (text, success) => {
      me.state.date = date;
      me.state.text = this.formatDate(me.state.date);
      me.state.editing = false;

      $(me.refs.doneButton).button('reset');
      me.setState(me.state);

      me.props.eventEmitter.emit("dateChanged");
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


export default DateDisplay
