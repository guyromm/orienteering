import {observable,action,computed} from 'mobx';
import axios from 'axios';
import FormData from 'form-data';
const l = console.log;
export default class OrienteeringAppStore {
    @observable auth = null;
    @observable marklog = {};
    @observable userLoc = null;
    @observable markers = {}
    @observable secrets = {}    
    @observable loading = false;

    @computed get pointsGained() {
	var rt= Object.entries(this.marklog).reduce((acc,[marker_id,e]) => { return (acc+e.points);	},0);
	if (isNaN(rt)) return 0;
	return rt;
    }
    @action deleteCookie = async () => {
	try {
	    await axios.get('/clear-cookie');
	    this.auth=null;
	} catch (e) {
	    console.log(e);
	}
    }
    @action login = async (username,password) => {
	try {
	    this.loading=true;
	    var res;
	    if (username==='admin')
	    {
		res = await axios.get('/authenticate', { auth: { username, password } });
	    }
	    else
	    {
		l("ARGASDF");
		res = await axios.get('/authenticate/plain', {params:{ auth: username}});
	    }
	    
	    if (res.data.screen !== undefined) {
		this.auth = res.data.screen;
		this.loading=false;
		l('login good!',this.auth);
	    }
	} catch (e) {
	    console.log(e);
	    this.loading=false;	    
	}
	return res;
    }
    @action getMarkers =  async (secrets) => {
	try {
	    l('attempting to fetch markers');
	    var res = await axios.get('/markers',{params:{secrets:secrets}});
	    if (res.data.error)
		l('getMarkers BAD',res);
	    else
	    {
		if (secrets)
		    this.secrets = res.data;
		else
		    this.markers = res.data;
		//l('getMarkers GOOD',res.data);
	    }
	} catch (e) {
	    l('error getting markers',e);
	}
	if (this.mapWrapper) this.mapWrapper.selectedMarkerLogic();
    }
    @action getSecrets = async () => {
	return this.getMarkers(true);
    }
    uploadPic = async (marker_id,file) => {
	var fd = new FormData();
	fd.append('marker',marker_id);
	fd.append('pic',file);
	await axios.post('/markers/'+marker_id+'/pic',
		   fd,
			 {headers: {'Content-Type': 'multipart/form-data'}})
	this.getMarkers();

    }
    deleteMarker = async (marker_id) => {
	l('DELETING',marker_id);
	if (!marker_id) throw Error('cannot delete '+marker_id);
	axios.delete('/markers/'+marker_id);
	this.getMarkers();
    }
    submitMarker = async (params) => {
	var res = await axios.post('/markers',params);
	l('axios post returned. refreshing markers.',res);
	this.getMarkers();
	if (res.data.id && this.mapWrapper)
	    this.mapWrapper.selMarker(res.data.id);
    }
    @action getCookie = async () => {
	try {
	    const res = await axios.get('/read-cookie');
	    
	    if (res.data.screen !== undefined) {
		this.auth = res.data.screen;
		//l('getCookie GOOD',this.auth);
	    }
	} catch (e) {
	    this.auth = null;
	    console.log(e);
	}
    }
    @action getMarkLog = async () => {
	var getmarklog = async () => {
	    l('getmarklog');
	    var res = await axios.get('/marklog');
	    if (res.data.error)
	    {
		l('getmarklog err');
		this.marklog={};
	    }
	    else
		this.marklog = res.data;
	    setTimeout(getmarklog,10000);	    
	};
	getmarklog();
    }
    @action markLog = async (markerid,secret) => {
	var params = {markerid:markerid,
		      secret:secret};
	await axios.post('/marklog',params);
	this.getMarkLog();
	
    }
    @action getLoc = () => {
	var freshnessMinimum=3000;
	navigator.geolocation.getCurrentPosition(pos => {
	    //l('POS ACQUIRED',pos.coords);
	    if (!this.loc || (this.loc.lat!==pos.coords.latitude || this.loc.lng!==pos.coords.longitude))
	    {
		this.loc = {lat:pos.coords.latitude,
			    lng:pos.coords.longitude,
			    id:'userLoc',
			    pic:'pin.png',
			    descr:'your location as of'+new Date(),
			   };
		this.userLoc = this.loc;
		if (this.mapWrapper) this.mapWrapper.render(); // re-render due to loc update
	    }
	    setTimeout(this.getLoc,freshnessMinimum);
	},err => {
	    this.loc = {};
	    setTimeout(this.getLoc,freshnessMinimum);	    
	    l('pos err',err);
	},{enableHighAccuracy:true,maximumAge:freshnessMinimum});	
    }    
}
