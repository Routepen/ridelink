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


    return <div className="form-inline editableform">
      <div id="originTextEditable" style={{display: "none"}}>
        <i className="material-icons" style={{fontSize: "18px"}}>my_location</i>
        <input id="editOriginInput" type="text" className="form-control input-sm" style={{width: "60%"}} defaultValue={this.state.text}/>
        <button type="button" className="btn btn-primary btn-sm editable-submit">
          <i className="glyphicon glyphicon-ok"></i>
        </button>
        <button type="button" className="btn btn-default btn-sm editable-cancel">
          <i className="glyphicon glyphicon-remove"></i>
        </button>
      </div>
      <div id="originText" style={{fontSize:"18px"}}>
        <i className="material-icons" style={{fontSize:"18px"}}>{this.props.icon}</i>
        <span className={this.state.editable ? 'editableInput' : ''}>{this.state.text}</span>
      </div>
    </div>

  }
}


export default TextDisplay
