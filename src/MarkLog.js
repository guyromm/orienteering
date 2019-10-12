import React, {Component} from 'react';
import { observer } from "mobx-react";
import {store} from './App';
import {Link} from 'react-router-dom';
@observer
class MarkLog extends Component {
    store=store;
    constructor(props) {
	super(props);
	this.store.getMarkLog();
    }
    highscores() {
	var scoreboard={};
	var markers={};
	for (var marker_id in this.store.marklog)
	{
	    var s = this.store.marklog[marker_id];
	    if (!scoreboard[s.auth])
	    {
		scoreboard[s.auth]=0;
		markers[s.auth]=0;
	    }
	    scoreboard[s.auth]+=s.points;
	    markers[s.auth]+=1;
	}
	//l(scoreboard);
	return <div>
	    <h4>scoreboard</h4>
	    <table><thead>
	    <tr>
	    <th>name</th>
	    <th>score</th>
	    <th>markers</th>
	    </tr>
	    </thead>
	    <tbody>
	    {Object.entries(scoreboard).map(([auth,points]) => { return (<tr key={"points-"+auth}><td>{auth}</td><td>{points}</td><td>{markers[auth]}</td></tr>) })}
	    </tbody>
	    </table>
	    </div>
    }
    render() {
	var tot = this.store.pointsGained;
	return (this.store.marklog &&
		
		<div dir="rtl">
		{this.store.auth==='admin'?this.highscores():null}
		<h4>{tot} נקודות נצברו</h4><table><thead>
		<tr>
		<th>שחקן</th>
		<th>מרקר</th>
		<th>תיאור</th>
		<th>נסרק ב-</th>
		<th>נקודות</th>
		</tr>
		</thead>
		<tbody>
		{Object.entries(this.store.marklog).map(([marker_id,e]) => {
		    var suf = 'marker/'+e.marker_id;
		    var burl = suf;
		    
		    return <tr key={marker_id}>
			
			<td>{e.auth}</td>
			<td><Link to={burl}>{marker_id}</Link></td>
			<td>{e.descr}</td>
			
			<td>{e.first}</td>
		        <td>{e.points}</td>
		    </tr>
	    })}
		</tbody></table></div>)
    }
}

export default MarkLog;
