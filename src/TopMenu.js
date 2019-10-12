import React, {Component} from 'react';
import { withRouter, Route, Link } from "react-router-dom";
import GameLink from './GameLink';
import MapWrapper from './Map';
import MarkLog from './MarkLog';
import Auth from './Auth';
import Scanner from './Scanner';
// import { observer } from "mobx-react";
// import {store} from './App';

export const iconStyle = {maxWidth:'100px',width:'15%'};
//const l = console.log;

class TopMenu extends Component {
    render() {
	//style={{fontSize:'400%',display:'block',minHeight:'20vh'}}

	return (<div>
		<Route exact path="/marker/:marker/secret/:secret" component={MapWrapper}/>
		<Route exact path="/marker/:marker" component={MapWrapper}/>		
		<Route exact path="/log" component={MarkLog}/>
		<Route exact path="/code" component={GameLink}/>
		<Route exact path="/auth" component={Auth}/>
		<Route exact path="/scanner" component={Scanner}/>
		<Route exact path="/" component={MapWrapper}/><br />

		<div className="menu" style={{position:'fixed',bottom:'0%'}}>
		<Link to="/"><img alt="Map" src="/img/map.png" style={iconStyle}/></Link>
		<Link to="/scanner"><img alt="Scanner" src="/img/qr-code-scan-icon.png" style={iconStyle}/></Link>
		<Link to="/code"><img alt="Share code" src="/img/share-button.png" style={iconStyle}/></Link> ::
		<Link to="/log"><img alt="Scores" src="/img/high-score-icon.jpg" style={iconStyle}/></Link> ::
		<Auth mode='short'/>

		
		</div>
		
		</div>)
    }
}
export default withRouter(TopMenu);
