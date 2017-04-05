import React, { Component } from 'react'


class Heading extends Component {

  constructor(props) {
    super(props);

    this.state = {
      driver: this.props.driver,
      user: this.props.user,
      route: this.props.route,
      isDriver: this.props.isDriver,
      showing: false
    };
  }
  render() {
    let below = "";
    if (this.state.isDriver) {
      below = <div className="panel panel-default" >
        <div className="panel-heading panel-button btn-group" id="link-panel" style={{display: "flex", justifyContent: "space-between"}}>
          <a className="btn btn-md"  href="javascript:void(0);" onClick={this.clicked.bind(this)}>
              <span id="getLinkText">{this.state.showing ? "Hide Link" : "Copy link"}</span>
              <span className="glyphicon glyphicon-paperclip" > </span>
          </a>
          <a className="btn btn-md" href={"/route?id=" + (this.state.route.shortId || this.state.route._id) + "&view=rider"}>
              <span id="getLinkText">View as Rider</span>
          </a>
          <a className="btn btn-md" href="javascript:void(0);" onClick={this.showPost.bind(this)}> Show Post </a>
        </div>
        <div ref="link" id="shareableLink" className="panel-body getlink-container" style={{display: "none"}}>
            <input ref="link" onClick={this.select.bind(this)} className=" form-control" readOnly="readonly" value={window.location.href}/>
        </div>
      </div>
    }

    let src = '';
    if (this.state.driver.facebook.photos &&
       this.state.driver.facebook.photos.length > 0 &&
       this.state.driver.facebook.photos[0].value) {
          src = this.state.driver.facebook.photos[0].value;
    }

    return <div style={{backgroundColor: "#c5d9f9", borderRadius: "5px"}}>
        <h2>
          <a href={this.state.driver.facebook.link}>
            <img src={src}></img>
          </a>
          {this.state.driver.facebook.name.split(' ')[0] + "'s Route"}
        </h2>
        {below}
      </div>
  }

  clicked() {
    if (this.state.showing) {
      $(this.refs.link).hide();
    }
    else {
      $(this.refs.link).show();
    }
    this.state.showing = !this.state.showing;

    this.setState(this.state);
  }

  select() {
    this.refs.link.focus();
  }

  showPost() {
    this.props.eventEmitter.emit("showPost");
  }
}


export default Heading
