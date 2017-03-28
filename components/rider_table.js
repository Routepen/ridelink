import React, { Component } from 'react'


class TextDisplay extends Component {

  constructor(props) {
    super(props);

    this.state = {
      riders: this.props.riders,
      confirmedRiders: this.props.confirmedRiders,
      seats: this.props.seats,
      isFull: this.props.confirmedRiders.length >= this.props.seats
    };
  }
  render() {


    return <div>
      <div style={{fontSize: "24px"}}>Riders</div>
      <div id="tableDiv" className="container-fluid row">
          <table className="table table-striped table-hover">
              <thead>
              <tr>
                  <th>#</th>
                  <th> Rider </th>
                  <th> Status </th>
                  <th> Baggage </th>
              </tr>
              </thead>
              <tbody id="riderTable"></tbody>
          </table>
          <p style={{display: "none"}} id="tableMessage"></p>
      </div>
      <div style={{display: "none"}} id="waitListTable" className="container-fluid row">
        <div style={{fontSize: "24px"}}>Waitlist</div>
        <table className="table table-striped table-hover">
            <thead>
            <tr>
                <th>#</th>
                <th> Rider </th>
                <th> Status </th>
            </tr>
            </thead>
            <tbody id="waitlistRiderTable"></tbody>
        </table>
      </div>
    </div>

  }
}


export default TextDisplay
