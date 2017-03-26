import React, { Component } from 'react'
import Navbar from "./navbar"
import Landing from "./landing"

class App extends Component {
  constructor() {
    super();

    this.state={
      user: false
    };
  }

  render() {
    return <div>
      <Navbar/>
      <Landing/>
    </div>
  }
}


export default App
