import React, {Component} from 'react';
import QrReader from 'react-qr-reader'
import { observer } from "mobx-react";
import parse from 'url-parse';
import {store} from './App';

@observer
class Scanner extends Component {
    store = store;
    constructor(props) {
	super(props);
	this.store.getMarkLog();
    }
    componentDidMount() {
	if (!this.store.auth) this.props.history.push('/auth'); //l('didmount');
    }
    render() {
	return	(<QrReader
	onError={(err) => { alert(err); }}
		 onScan={(code) => { if (code) {
		     var p = parse(code);
		     /*eslint-disable-next-line*/		     
		     var [_,_,markerid,_,secret] = p.pathname.split('/');
		     if (this.store.marklog && this.store.marklog[markerid])
			 alert('הסמן '+markerid+' כבר נסרק, יחד עם '+Object.keys(this.store.marklog).length+' אחרים.');
		     else
			 this.props.history.push(p.pathname);
		 }
		     }
	       }/>)
    }
}
export default Scanner;
