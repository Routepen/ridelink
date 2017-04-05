import React, { Component } from 'react'


class LocationDisplay extends Component {

  constructor(props) {
    super(props);

    this.state = {
      value: this.props.value,
      route: this.props.route,
      text: this.props.value == "stop" ? this.props.text : this.props.route[this.props.value],
      editable: this.props.editable,
      page: this.props.page,
      editing: false
    };
  }

  render() {
    this.state.text = this.props.value == "stop" ? this.props.text : this.props.route[this.props.value];


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


    var iconClass = ["material-icons"];
    if (this.props.iconClickable) { iconClass.push("clickable"); }
    iconClass = iconClass.join(" ")

    var iStyle = {};
    var inputStyle = {}, spanStyle = {};
    if (this.state.page == "new") {
      iStyle.paddingLeft = "10px";
      inputStyle = {
        fontSize: "15px",
        marginLeft: "14px",
        position: "relative",
        top: "-6px",
        width: "200px",
        color: "white",
        paddingLeft: "10px"
      };
      spanStyle = {
        fontSize: "15px",
        marginLeft: "14px",
        position: "relative",
        top: "-6px",
      }
    }
    if (this.state.page == "view") {
      iStyle.fontSize = "18px";
      inputStyle = {
        fontSize: "15px",
        width: "80%",
      };
    }

    var cancelButton = <button onClick={this.editingCancelled.bind(this)} type="button" className="btn btn-default btn-sm editable-cancel">
      <i className="glyphicon glyphicon-remove"></i>
    </button>

    if (this.state.page == "new") { cancelButton = '';}
    return <span className="form-inline editableform">
      <div style={editable}>
        <i className={iconClass} style={iStyle} onClick={this.iconClicked.bind(this)}>{this.props.icon}</i>
        <input ref="input" type="text" className="form-control input-sm" style={inputStyle} defaultValue={this.state.text}/>
        {cancelButton}
      </div>
      <div style={display}>
        <i className={iconClass} style={iStyle} onClick={this.iconClicked.bind(this)}>{this.props.icon}</i>
        <span ref="text" style={spanStyle} onClick={this.clicked.bind(this)} className={this.state.editable ? 'editableInput clickable' : ''}>{this.state.text}</span>
      </div>
    </span>
  }

  iconClicked() {
    this.props.iconClicked();
  }

  clicked() {
    if (!this.state.editable) { return; }

    this.focus();

    if (!this.autocomplete) {
      let dropOffInput = this.refs.input;
      this.autocomplete = new google.maps.places.Autocomplete(dropOffInput, {placeIdOnly: true});

      var me = this;
      this.autocomplete.addListener('place_changed', () => {
        me.placeChanged();
      });
    }

    this.state.editing = true;
    this.setState(this.state);
  }

  placeChanged() {
    let newPlace = this.autocomplete.getPlace().name;
    let me = this;

    if (this.state.page == "new") {
      this.state.text = newPlace;
      this.state.editing = false;
      this.setState(this.state);
      this.props.locationChanged(this.autocomplete);
    }
    else if (this.state.value == "stop") {
      me.props.locationChanged(me.autocomplete);
      let stopStrings = this.state.route.stops.map(stop => {
        return stop.place.name;
      }).filter(stop => { return stop; });

      this.state.text = "Loading...";
      this.state.editing = false;
      this.setState(this.state);

      this.props.eventEmitter.emit("valueChanged", "stops[]", stopStrings, (text, success) => {

        me.state.text = newPlace;
        me.state.editing = false;
        me.setState(me.state);
      });
    }
    else {
      this.state.text = "Loading...";
      this.state.editing = false;
      this.setState(this.state);

      this.props.eventEmitter.emit("valueChanged", this.state.value, newPlace, (text, success) => {
        me.state.route[this.state.value] = newPlace;
        me.state.text = newPlace;
        me.state.editing = false;
        me.setState(me.state);
        me.props.locationChanged(me.autocomplete);
      });
    }
  }

  editingCancelled() {
    if (!this.state.text) {
      return this.props.removeMe();
    }
    this.refs.input.value = this.refs.text.innerHTML;
    this.state.editing = false;
    this.setState(this.state);
  }

  componentDidMount() {
    if (!this.state.text) {
      this.clicked()
    }
  }

  componentDidUpdate() {
    if (this.state.editing) {
      this.focus();
    }
  }

  focus() {
    if (this.state.editing) {
      setTimeout(() => {
        this.refs.input.focus();
      }, 0);
    }
  }
}


export default LocationDisplay
