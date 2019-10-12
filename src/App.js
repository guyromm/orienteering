import {Component} from 'react';
import React from 'react';
//import logo from './logo.svg';
import './App.css';
import TopMenu from './TopMenu';
import { observer } from "mobx-react";
import {BrowserRouter as Router} from 'react-router-dom';
import OrienteeringAppStore from './store';
//const l = console.log;

export var store = new OrienteeringAppStore();


@observer
class App extends Component {
    store = store;
    componentDidMount() {
	document.title = 'מזל טוב למאיה!';
    }
    render() {
	return (
		<div className="App" store={this.store}><Router>
		<TopMenu />
		</Router></div>
	);
    }
}

export default App;
