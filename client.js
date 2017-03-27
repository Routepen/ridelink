import React from 'react'
import { render } from 'react-dom'
import App from './components/App'
import NewRoute from './components/new_route'

if (document.getElementById('App')) {
  render(
    <App/>,
    document.getElementById('App')
  );
}
else {
  render(
    <NewRoute/>,
    document.getElementById('newRoute')
  );
}
