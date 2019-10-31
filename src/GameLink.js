import QRCode from 'qrcode.react';
import {Component} from 'react';
import { observer } from "mobx-react";
import {Link} from 'react-router-dom';
import React from 'react';
import {store} from './App';
import cfg from './config';

const BASEURL=cfg.baseurl;
const codeStyle = {width:'60%',height:'40vh'};

@observer
class GameLink extends Component {
    store=store;
    constructor(props) {
	super(props);
	this.store.getSecrets();
    }
    placeholder() {
	    return <div style={{minHeight:'40vh'}}/>	
    }
    renderMarkers() {
	return (this.store.secrets && Object.entries(this.store.secrets).map(([mid,m]) => {
	    var suf = 'marker/'+m.id+'/secret/'+m.secret;
	    var burl = BASEURL+suf;
	    return <div key={"h2-marker-"+m.id}><div ><h2 ><a href={burl}>{m.id}.</a> {m.descr}</h2>
		<QRCode
	    style={codeStyle}
	    key={"marker-"+m.id}
	    value={burl}/>;
	    </div>{/*this.placeholder()*/}</div>

	}));
    }
    render () {
	
	return <div><h1><Link to={"/"}>קישור כניסה למשחק</Link></h1>
	    <QRCode key="BASEURL" value={BASEURL} style={codeStyle}/>
	    {this.placeholder()}	    
	    {this.store.auth==='admin' && this.renderMarkers()}
	<div style={{minHeight:'140vh'}}/>
	    </div>;
    }
}
export default GameLink;
