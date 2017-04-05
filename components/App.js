import React, { Component } from 'react'
import Navbar from "./navbar"
import Landing from "./landing"

class App extends Component {
  constructor() {
    super();

    var txt = document.createElement("textarea");
    txt.innerHTML = document.getElementById("info").innerHTML;
    var val = txt.value.trim();
    var data = JSON.parse(txt.value);
    console.log(data);

    this.state = data;
  }

  render() {
    return <div>
      <Navbar user={this.state.user}/>
      <Landing/>
    </div>
  }
}


export default App
