import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import { observer } from "mobx-react";
//import {when,autorun,reaction} from 'mobx';
import {store} from './App';
import {diff} from 'json-diff';
import cfg from './config';
class Marker extends Component {
    markerClicked = (id) => {
	if (id!=='userLoc')
	    this.props.mapRef.selMarker(id);
    }
    render() {
	var tpstyle = {width:'15px'};
	var imgstyle={...tpstyle};
	var locstyle={width:'25px'};
	if (this.props.enlarged)
	    imgstyle.width='400px';
	else
	    imgstyle.width='80px';
	var { id,text,pic,found,current } = this.props;
	if (id==='userLoc')
	{
	    return <img alt="User location" src="/uploads/pin.png" style={locstyle}/>
	}
	else if (!current)
	{
	    return (<div onClick={() =>
				  {this.markerClicked(id)}} >
		    <img alt={"marker "+text} style={tpstyle} src="/img/google-maps-marker-icons.png"/>
		    {id!=='userLoc' && (found ? <img alt="found!" style={tpstyle} src="/img/found.png" />:<img alt="not found" src="/img/question-mark-24.png" style={tpstyle}/>)}</div>);
	}
	else
	{
	    return (<div style={{color:'white',width:'100px',direction:'rtl'}} onClick={() => {this.markerClicked(id)}} >{pic && <img alt={"marker "+text} style={imgstyle} src={"/uploads/"+pic}/>}
		    {id!=='userLoc' && (found ? <img alt="found!" style={tpstyle} src="/img/found.png" />:<img alt="not found" src="/img/question-mark-24.png" style={tpstyle}/>)}</div>);
	}
    }
}
const l = console.log;


@observer
class MapWrapper extends Component {
    store = store;

  static defaultProps = {
    zoom: 18
  };
    constructor(props) {
	super(props);
	this.store.mapWrapper=this;
	var p = this.props.match.params;
	l('params',this.props.match.params);
	this.state={
	    cur:null,
	    markerid:p.marker,
	    secret:p.secret,
	    center: {
		lat: cfg.map_center.lat,
		lng: cfg.map_center.lng
	    }};
	
	//autorun(reaction => {l('OBSERVING',this.store.markers); this.selectedMarkerLogic(); return this.store.markers;});
	
	this.markLogic();
	this.myRef = React.createRef();	l('created myref=',this.myRef);
	this.store.getMarkers();
	this.store.getMarkLog();
	this.store.getLoc();
	
    }
    panToBounds = () => {
	if (window.google && this.myRef.current)
	{
	    l('PANNING',this.myRef.current,'to',this.store.loc);
	    
	    l('existing bounds',this.myRef.current.map_.getBounds());
	    var swc={};var nec={};
	    Object.entries(this.store.markers).forEach(([mid,mrk]) => {
		//l('marker',mrk.lat,mrk.lng);
		if (!swc.lat || swc.lat<mrk.lat) swc.lat = mrk.lat;
		if (!swc.lng || swc.lng>mrk.lng) swc.lng = mrk.lng;
		if (!nec.lat || nec.lat>mrk.lat) nec.lat = mrk.lat;
		if (!nec.lng || nec.lng<mrk.lng) nec.lng = mrk.lng;		
	    });
	    l('my outliers are',swc.lat,swc.lng,'to',nec.lat,nec.lng);
	    var sw = new window.google.maps.LatLng(swc.lat, swc.lng);
	    var ne = new window.google.maps.LatLng(nec.lat, nec.lng);
	    l('sw:',sw);
	    l('ne:',ne);
	    var bounds = new window.google.maps.LatLngBounds(sw,ne);
	    l('bounds:',bounds);
	    this.myRef.current.map_.panToBounds(bounds);
	}
	else
	{
	    l('myRef=',this.myRef);
	    l('window.google.maps',window.google);
	    setTimeout(this.panToBounds,1000);
	}
    }	

    centerChanged = () => {
	//l('centerChanged');
	var mp = this.myRef.current.map_;
	var newcenter = {lat:mp.center.lat(),
			 lng:mp.center.lng()};
	this.setState({center:newcenter,
		      });
	//horrible, horrible hack
	if (this.state.newmarker)
	{
	    /*eslint-disable-next-line*/
	    this.state.newmarker.lat=newcenter.lat;
	    /*eslint-disable-next-line*/	    
	    this.state.newmarker.lng=newcenter.lng;
	    var el = document.getElementById('newmarker_lat');
	    if (el) el.value = newcenter.lat;
	    var el2 = document.getElementById('newmarker_lng');
	    if (el2) el2.value = newcenter.lng;
	}
	
    }
    shouldComponentUpdate = (nextProps,nextState) => {
	var nsd = diff(this.state,nextState);
	var rt=true;
	if (nsd && (Object.entries(nsd).length===1 && nsd.center)) rt= false;
	//l('SCU',diff(this.props,nextProps),nsd,'=>',rt);
	return rt;
    }
    handleMapMounted = (map) => {
	// l('HANDLEMAPMOUNTED',map);
	// this._map = map;
	// l(this._map);
	//l(this.myRef.current);
	var mp = this.myRef.current.map_;
	//l(map.maps);
	mp.addListener('center_changed',this.centerChanged);
    }
    getMapOptions = (maps) => {
	return {
            streetViewControl: false,
            scaleControl: true,
            fullscreenControl: true,
            styles: [{
		featureType: "poi.business",
		elementType: "labels",
		stylers: [{
                    visibility: "off"
		}]
            }],
            gestureHandling: "greedy",
            disableDoubleClickZoom: true,
            minZoom: 13,
            maxZoom: 21,

            mapTypeControl: true,
            mapTypeId: maps.MapTypeId.STREET,
            mapTypeControlOptions: {
		style: maps.MapTypeControlStyle.HORIZONTAL_BAR,
		position: maps.ControlPosition.BOTTOM_CENTER,
		mapTypeIds: [
                    maps.MapTypeId.ROADMAP,
                    maps.MapTypeId.SATELLITE,
                    maps.MapTypeId.HYBRID
		]
            },

            zoomControl: true,
            clickableIcons: false
	};
    }
    selectedMarkerLogic() {
	if (this.state.markerid) // && len(this.state.cur))
	{
	    l('got a markerid!',this.state.markerid,'and cur',this.state.cur);
	    if (!this.store.markers[this.state.cur-1] || this.store.markers[this.state.cur-1].id!==this.state.markerid)
	    {
		var idxof = Object.keys(this.store.markers).indexOf(this.state.markerid);
		l('idxof=',idxof);
		//this.state.cur=idxof+1;
		this.setState({cur:idxof+1});
		l('panning to',idxof+1);
		this.panToCurrentMarker();
	    }
		
	}	
    }
    render() {
	    
	//if (++this.cnt>3) throw "what called me";
	var markers = [];
	for (var mid in this.store.markers)
	    markers.push(this.store.markers[mid]);
	var ul = this.store.userLoc;
	//if (this.store.userLoc) markers.push(this.store.userLoc);
	//Object.entries(this.store.markers).concat(this.store.userLoc && this.store.userLoc || []);
	//l('cycling markers',markers);
    return (
	// Important! Always set the container height explicitly

        (true || (markers.length && this.store.auth) || (this.store.auth && this.store.auth==='admin')) ? (	    <div style={{ height: '60vh', width: '100%' }}><GoogleMapReact
	options={this.getMapOptions}
	onGoogleApiLoaded={this.handleMapMounted}
	onChanged={this.centerChanged}
	yesIWantToUseGoogleMapApiInternals
	ref={this.myRef}
        bootstrapURLKeys={{ key: cfg.google_api_key }}
        center={this.state.center}
        defaultZoom={this.props.zoom}
            >
	    {markers.map((m) => {
		//l('current=',m.id,'===',this.state.markerid);
		var found = this.store.marklog[m.id]; // && this.store.marklog[m.id].marker_id);
		var rt= (<Marker
			 mapRef={this}
			 id={m.id}
			 current={parseInt(m.id)===parseInt(this.state.markerid)}
			 enlarged={parseInt(m.id)===parseInt(this.state.markerid) && this.state.enlarged}
			 found={found}
			 pic={m.pic}
			 key={m.id}
			 style={{position:'absolute',border:'solid red 1px'}}
			 lat={m.lat}
			 lng={m.lng}
			 text={m.id+". "+m.descr}/>);
		//l('rendering marker',m.lat,m.lng,m.descr,rt);
		return rt;
	    })}
	{ul && <Marker mapRef={this} id={ul.id} pic={ul.pic} key={ul.id} lat={ul.lat} lng={ul.lng} text="Your location"/>}
						      </GoogleMapReact>
						      {this.markerControls()}	    </div>
						     ) : (<div><img
										   style={{width:'100%'}}
										   alt="invite"
							  src="/img/invite.png" />
							  <h2 dir="rtl">המשחק יחל ביום שבת, 12 לאוקטובר, 2019, עשר בבוקר, בפארק החורשות. תתכוננו!</h2>
							  </div>
							 )


    );
  }


    

    markLogic = () => {
	if (!this.state.markerid || !this.state.secret) return;
	if (!this.store.auth)
	{
	    //l(this.props.history.location.pathname) ; throw "Bye";
	    var returl = encodeURIComponent(this.props.history.location.pathname);
	    l('REDIRECT TO AUTH',returl);
	    //throw "no fokking way";
	    this.props.history.push('/auth?retlink='+returl);
	}
	else
	{
	    l('RUNNING MARKLOG of marker',this.state.markerid,'on',Object.keys(this.store.marklog));
	    if (Object.keys(this.store.marklog).indexOf(this.state.markerid)!==-1 ||
		Object.keys(this.store.marklog).indexOf('admin-'+this.state.markerid)!==-1)
	    {
		l('passing since already marked');
	    }
	    else
		this.store.markLog(this.state.markerid,this.state.secret);
	}
	/* FIXME: we need to somehow focus on the marker scanned. ohwell
	  var f = Object.entries(this.store.markers).forEach(([mid,m],midx) => {
	    if( mid===this.state.markerid)
		this.state.cur=midx+1; //l(midx,'IS THE ONE!');
	});
	l('OBJECTRS:',f);*/
    }
    editMarker = () => {
	var em = Object.entries(this.store.markers)[this.state.cur-1][1];
	l('setting form on edit with',em.id);
	this.setState({form:'edit',
		       newmarker:em
		      });
		       
    }
    newMarker =() => {
	var nm = {lat:this.state.center.lat,
		  lng:this.state.center.lng,
		  points:10
		 }
	l('setting form on newmarker with',nm);
	this.setState({form:'new',
		       newmarker:nm,

		      });
    }
    cancelNewMarker = () => {
	this.setState({form:null});	
    }
    submitMarker = () => {
	const params = {...this.state.newmarker};
	l('submitMarker',params);//throw Error("kbye");
	this.store.submitMarker(params);
	//if (!params.id) this.setState({cur:Object.entries(this.store.markers).length});
	this.setState({form:null});
    }
    deleteMarker = () => {
	l('deleteMarker',this.state.newmarker);
	this.setState({cur:1,newmarker:{},form:null});
	this.store.deleteMarker(this.state.newmarker.id);
    }
    setNewLng = (e) => {
	var nm = this.state.newmarker;
	nm.lng=e.target.value;
	this.setState({newmarker:nm});
    }
    setNewLat = (e) => {
	var nm = this.state.newmarker;
	nm.lat=e.target.value;
	this.setState({newmarker:nm});
    }
    setNewDescr = (e) => {
	var nm = this.state.newmarker;
	nm.descr=e.target.value;
	this.setState({newmarker:nm});
    }

    setNewPoints = (e) => {
	var nm = this.state.newmarker;
	nm.points=e.target.value;
	this.setState({newmarker:nm});
    }
    panToLoc = () => {
	this.setState({cur:null});
	l('panToLoc');
	this.panToCurrentMarker(true);
    }
    panToCurrentMarker = (toloc) => {
	//l('PTCM ->',toloc,(this.state && this.state.cur),'in store',this.store,this.store.userLoc);
	var curMarker;
	if (toloc &&
	    this.store &&
	    this.store.userLoc)
	{
	    curMarker = this.store.userLoc;
	}
	else if (!toloc &&
		 this.store &&
	    this.state.cur &&
	    this.store.markers &&
	    Object.entries(this.store.markers).length>=(this.state.cur))
	{
	    //l('curMarker',this.state.cur,'is chosen from store',this.store.markers);
	    curMarker = Object.entries(this.store.markers)[this.state.cur-1][1];
	}
	else
	{
	    //l('no curMarker');
	    curMarker = null;
	}
	if (curMarker &&
	    window.google &&
	    this.store.markers &&
	    this.myRef.current &&
	    this.myRef.current.map_)
	{
	    //l('curMarker',curMarker.lat,curMarker.lng,curMarker.descr);
	    var pos = new window.google.maps.LatLng(curMarker.lat,curMarker.lng);
	    this.myRef.current.map_.panTo(pos);
	}
	else
	{
	    //l('curMarker bad or no window.google',curMarker,window.google);
	    setTimeout(this.panToCurrentMarker,1000); //CANCELLED
	}
	
    }
    componentDidMount() {
	//l('Wrapper CDM');
	this.panToLoc();
    }
    componentDidUpdate = (prevProps,prevState) => {
	var propsdiff =diff(prevProps,this.props);
	var statediff = diff(this.state,prevState)
	//l('Wrapper CDU',propsdiff,statediff);
	this.markLogic();
	var stch=false;
	if (statediff && (Object.entries(statediff).length>1 || !statediff.center)) stch=true;
	if (propsdiff || stch)
	{
	    //l('panning to current');
	    this.panToCurrentMarker();
	}

    }
    nextCompute = () => {
	var nxt = this.state.cur+1;
	if (nxt>Object.entries(this.store.markers).length) nxt=1; //this.store.markers.length;
	return nxt;
    }

    next = () => {
	var nxt = this.nextCompute();
	var markerid = Object.entries(this.store.markers)[nxt-1][0];
	
	this.setState({cur:nxt,markerid:markerid});
	this.props.history.push('/marker/'+markerid);
	if (this.state.form==='edit' || this.state.form==='new') this.setState({newmarker:Object.entries(this.store.markers)[nxt-1][1],form:'edit'});
    }
    prevCompute = () => {
	var prv = this.state.cur-1;
	if (prv<1) prv=Object.entries(this.store.markers).length;
	return prv;
    }
    prev = () => {
	var prv = this.prevCompute();
	var markerid = Object.entries(this.store.markers)[prv-1][0];
	this.setState({cur:prv,markerid:markerid});
	this.props.history.push('/marker/'+markerid);	
	if (this.state.form==='edit' || this.state.form==='new') this.setState({newmarker:Object.entries(this.store.markers)[prv-1][1],form:'edit'});	
    }
    uploadPic = (e,marker_id) => {
	this.store.uploadPic(marker_id,e.target.files[0]);
    }
    selMarker = (markerid) => {
	var mkeys = Object.keys(this.store.markers);
	var cur = mkeys.indexOf(markerid.toString())+1;
	//l('mkeys',mkeys,'looking for',markerid); throw "cur ="+cur;
	if (parseInt(this.state.markerid)===parseInt(markerid))
	{
	    this.setState({enlarged:!this.state.enlarged});
	}
	else
	    this.setState({cur:cur,
			   markerid:markerid,
			   enlarged:false
			  });
	this.props.history.push('/marker/'+markerid);
	
    }
    markerControls = () => {
	var showform=false;	
	if (this.state.form==='new' || this.state.form==='edit') showform=true;
	var leftstyle = {display:'block',height:'10vh',fontSize:'400%',float:'left'};
	var rightstyle = {display:'block',height:'10vh',fontSize:'400%',float:'right'}
	var actStyle = {width:'25px'};
	//var linkStyle=leftstyle; //{'width':'15%'};
	
	//l('MARKERS',Object.keys(this.store.markers));
	return (<div> 
		<span>
		{/*eslint-disable-next-line*/}
		{<a href="#" accessKey='l' onClick={this.panToLoc}><img style={actStyle} src="/img/curloc.png" alt="Go to current location"/></a>} 
		{/*eslint-disable-next-line*/}
		{this.store.auth==='admin' && <a href="#" accessKey='a' onClick={this.newMarker}><img style={actStyle} src="/img/add.png" alt="Add new marker" /></a>} 
		{/*eslint-disable-next-line*/}		    				
		{this.store.auth==='admin' && this.state.cur && Object.entries(this.store.markers).length && <span><a href="#" accessKey='m' onClick={this.editMarker}><img src="/img/edit.png" alt="modify" style={actStyle}/></a></span>}


		<span dir="rtl">סרקת {Object.keys(this.store.marklog).length} מתוך {Object.entries(this.store.markers).length} סמנים  {this.store.pointsGained ?"וצברת "+this.store.pointsGained+" נקודות!":""}</span><br />


		{this.state.cur?"סמן "+Object.entries(this.store.markers)[this.state.cur-1][1].id+" - ":""}
		{Object.entries(this.store.markers).length &&
		 this.state.cur &&
		 Object.keys(this.store.markers).length>=(this.state.cur-10) &&
		 Object.entries(this.store.markers)[this.state.cur-1][1].descr+" ("+Object.entries(this.store.markers)[this.state.cur-1][1].points+" נק')"}

				{/*eslint-disable-next-line*/}
		<a style={leftstyle} href="#" title="prev" accessKey='p' onClick={this.prev}><img alt="prev" src="/img/left-arrow.png" style={leftstyle}/></a>
		{/*eslint-disable-next-line*/}		
		<a style={rightstyle} href="#" title="next" accessKey='n' onClick={this.next}><img alt="next" src="/img/right-arrow.png" style={rightstyle}/></a>
		
		</span>
{showform && (
	<form style={{position:'fixed',bottom:0,zIndex:100,clear:'both',background:'gray'}}>
		    {this.state.newmarker.id && <h4>editing marker {this.state.newmarker.id}</h4>}
		    Latitude: <input type="number" name="lat" id='newmarker_lat' value={this.state.newmarker.lat} onChange={this.setNewLat}/><br/>
		    Longitude: <input type="number" name="lng"	id='newmarker_lng' value={this.state.newmarker.lng} onChange={this.setNewLng} /><br/>
	Description: <textarea name="descr" id='newmarker_descr' value={this.state.newmarker.descr} onChange={this.setNewDescr}></textarea><br/>
	Points: <input type='number' min='0' step='1' value={this.state.newmarker.points} onChange={this.setNewPoints}/>
		    {/*eslint-disable-next-line*/}
	<input type="button" value={"Submit "+this.state.form} accessKey='s' onClick={this.submitMarker} />
		    {/*eslint-disable-next-line*/}		    
		{this.state.newmarker.id && <input type="button" accessKey='k' value={"Delete "+this.state.newmarker.id} onClick={this.deleteMarker} />}
		    {/*eslint-disable-next-line*/}		    		
	<input type="button" value="Cancel" accessKey='c' onClick={this.cancelNewMarker} />
	{this.store.auth==='admin' && this.state.newmarker.id ?<input type='file' name='pic' onChange={(e) => { this.uploadPic(e,this.state.newmarker.id)}} />:null}<br />
	{this.state.newmarker.pic && <img alt={this.state.newmarker.descr} style={{maxWidth:'100px'}} src={"/uploads/"+this.state.newmarker.pic}/>}
	
	
	</form>
)}		
		</div>);

    }
}

export default MapWrapper;
