import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import { observer } from "mobx-react";
import {store} from './App';
import {iconStyle} from './TopMenu';
import {parse} from 'qs';
const l = console.log;

@observer
class Auth extends Component {
    //these are transient and local to component.
    constructor(props) {
	super(props);
	var retlink;
	if (this.props.history)
	{
	    retlink = parse(this.props.history.location.search.replace(/^\?/,'')).retlink;
	}
	else
	    retlink=null;
	this.state={username:'',
		    password:'',
		    retlink:retlink
		   }
    }
    store = store;
    componentDidMount() {
	if (!this.store.auth)
	{
	    this.store.getCookie();
	    if (this.inp) this.inp.focus();
	}
	else if (this.state.retlink)
	    this.props.history.push(this.state.retlink);
	
    }
    setUsername = (un) => {
	this.setState({username:un.toLowerCase()});
    }
    setPassword = (pw) => {
	this.setState({password:pw});
    }
	

    login = async (un,pw) => {
	var res = await this.store.login(this.state.username,this.state.password);
	l('LOGIN resulted in',res);
	if (res && res.data && res.data.screen)
	{
	    if (this.state.retlink)
		this.props.history.push(this.state.retlink);
	    else
		this.props.history.push('/');
	}	

    }
    
    longAuth() {
	return (
		<div  style={{fontSize:'200%',direction:'rtl'}}>
		    <label>איך קוראים לך?</label>
		    <input ref={(inp) => {this.inp = inp;}} type="text" onChange={e => this.setUsername(e.target.value)} value={this.state.username} /><br />

		    {this.state.username==='admin' && <div><label>סיסמה: </label><input type="password" onChange={e => this.setPassword(e.target.value)} value={this.state.password} /><br/></div>}
		<button onClick={this.login}>בוא נתחיל!</button>
		</div>	);
    }
    deleteCookie = async () => {
	l('deleteCookie.. my store is',this.store);
	await this.store.deleteCookie();
	this.props.history.push('/');
    }

    shortAuth() {
	var alt = "Login";
	return (<Link to='/auth'><img alt={alt} src="/img/profile-icon.png"      style={iconStyle}/></Link>)
    }
    shortAuthLoggedIn() {
	var alt = "Logged in "+this.store.auth;
	return (<Link to='/auth'><img alt={alt} src="/img/logged-in-icon-20.png" style={iconStyle}/><span style={{position:'absolute',top:'50%',right:'0%',transform:'translate(-50%, -50%)'}}>{this.store.auth}</span></Link>)
    }
    render() {
	var auth = this.store.auth;
	var mode = this.props.mode;
	if (mode!=='short' && this.store.auth && this.state.retlink)
	    this.props.history.push(this.state.retlink);

	if (auth ===null)
	    return (mode==='short'?this.shortAuth():this.longAuth())
	else
	{
	    return (this.props.mode==='short'?
		    this.shortAuthLoggedIn():
		(<div>
		 <p dir="rtl">מחובר כ-&quot;{this.store.auth}&quot;</p>
		 <button onClick={this.deleteCookie}>יציאה</button>
		 </div>))		    
	}
    }
}

export default Auth;


