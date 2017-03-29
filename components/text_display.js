import React, { Component } from 'react'


class TextDisplay extends Component {

  constructor(props) {
    super(props);

    this.state = {
      text: this.props.text,
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
        <input ref="input" type="text" className="form-control input-sm" style={{width: "60%"}} defaultValue={this.state.text}/>
        <button type="button" className="btn btn-primary btn-sm editable-submit">
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


export default TextDisplay
