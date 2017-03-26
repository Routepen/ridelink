import React, { Component } from 'react'


class Navbar extends Component {
  render() {
    return <nav className="navbar navbar-default navbar-fixed-top">
        <div className="container">
            <div className="navbar-header">
                <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                    <span className="sr-only">Toggle navigation</span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                </button>
                <a className="navbar-brand" href="/">Routepen</a>
            </div>
            <div id="navbar" className="navbar-collapse collapse">
                <ul className="nav navbar-nav navbar-right">
                    <li>
                        <a href="/route/new" className="btn newroute btn-md">
                            <span className="glyphicon glyphicon-plus" id="newride"></span> Create Route
                        </a>
                    </li>
                    <li><a href={"/auth/facebook?redirect=" + encodeURIComponent(window.location.href) } data-size="xlarge" className="loginbtn btn "><span className="fa fa-facebook"></span> Login Facebook</a></li>
                </ul>
            </div>
        </div>
    </nav>
  }
}


export default Navbar
