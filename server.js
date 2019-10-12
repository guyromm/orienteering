#!/usr/bin/env node
const express = require('express');
const path = require('path');
const basicAuth = require('express-basic-auth');
const cookieParser = require('cookie-parser');
const sqlite3 = require('sqlite3');
const uuidv4 = require('uuid/v4');
const bodyParser = require("body-parser");
const multer = require('multer');
const resize = require('./resize');
let db = new sqlite3.Database('db.sqlite3');
const l = console.log;
const cfg = require('./config');

const storage = multer.diskStorage({
    destination:function(req,file,cb) { cb(null,'./uploads/');    },
    filename:function(req,file,cb) {cb(null,Date.now()+file.originalname);    }
});

const filefilter = (req,file,cb) => {
    if (file.mimetype==='image/jpeg' || file.mimetype==='image/png')
	cb(null,true);
    else
	cb(null,false);
}

const upload = multer({
    storage:storage,
    limits: {
	fileSize:1024*1024*10
    },
    fileFilter:filefilter});

const app = express();

const auth = basicAuth({
  users: { admin: cfg.admin_password },});

const PORT = process.env.PORT || 5000;
const BUILDDIR='/build';

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser(cfg.cookie_salt));

app
  .use(express.static(path.join(__dirname, BUILDDIR)))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, BUILDDIR+'/index.html'));
});

const cookieOptions = {
    httpOnly: true,
    signed: true,
    maxAge:900000000,
  };

app.get('/authenticate/plain',(req,res) => {
    //l('HAI PLAIN',req.query);
    if (req.auth!='admin')
    {
	l('setting an auth cookie with',req.query.auth);
	res.cookie('name',req.query.auth,cookieOptions).send({screen:req.query.auth});
    }
});

app.get('/authenticate', auth, (req, res) => {
    if (req.auth.user === 'admin') {
	res.cookie('name', 'admin', cookieOptions).send({ screen: 'admin' });
    }
    else
    {
	l('allowing in as normal user',req.auth.user);
	res.cookie('name',req.auth.user,cookieOptions).send({screen:req.auth.user});
    }
  }
);

function authmode(req) {
    if (req.signedCookies.name === 'admin') {
	return 'admin';
    }
    else
	return (req.signedCookies.name);
}

function reqlogin(req,res) {
    var am = authmode(req);
    if (!am)
    {
	l('bad authmode',am);
	res.send({error:401});
	return;
    }
    return am;
}

function reqadmin(req,res) {
    var am = authmode(req);
    if (am!='admin')
    {
	l('bad authmode',am);
	res.send({error:401});
	return;
    }
    return am;
    
}

app.get('/marklog',(req,res) => {
    var am;
    if (!(am = reqlogin(req,res))) return;
    
    var qry = 'select auth,marker_id,min(ts) first,max(ts) last,count(*) times,m.points,m.descr from marklog ml,markers m where ml.marker_id=m.id'
    if (am=='admin')
    {
	var args = [];
    }
    else
    {
	qry+= ' and auth=?';
	var args = [am,];
    }
    qry+=' group by auth,ml.marker_id';

    db.all(qry,
	   args,
	   (err,rows) => {
	       if (err) l('err fetching marklog!',err);
	       var rt = {};
	       rows.map(function(row) {
		   if (am==='admin') var k=row.auth+"-"+row.marker_id;
		   else var k = row.marker_id;
		   rt[k]=row;
	       });
	       res.send(rt);
	   });
});

app.get('/read-cookie', (req, res) => {
    var am = authmode(req);
    res.send({screen:am});
});


app.post('/marklog',(req,res,done) => {
    var am;
    if (!(am=reqlogin(req,res))) return;
    
    db.get('select * from markers where id=? and secret=?',
	   [req.body.markerid,
	    req.body.secret],
	   (err,row) => {
	       if (err)
	       {
		   l('err checking for secret',err);
		   res.send({error:err});
		   done();
	       }
	       db.get('select * from marklog where auth=? and marker_id=?',[am,req.body.markerid],
		      (err,row) => {
			  if (err) { l('err checking marklog',err); res.send({error:err}); done(); }
			  if (row)
			  { res.send({ok:1,state:'exists'}); done(); }
			  else
			  {
			      db.run('insert into marklog (auth,marker_id) values(?,?)',
				     [am,req.body.markerid],
				     err => {
					 if (err) {
					     l('err inserting marklog',err);
					     res.send({error:err});
					     done();
					 }
					 else
					 {
					     l('INSERTED MARKLOG',req.body.markerid,'for',am);
					     res.send({ok:1,state:'new'});
					     done();
					 }
				     });
				     
			  }
			  });
	       

	   });

    
});

app.post('/markers',(req,res,done) => {
    if (!reqadmin(req,res)) return;
    var p = req.body;
    l('about to submit params',p,'with id',p.id);
    var sec = Math.floor(Math.random()*16777215).toString(16); // secret
    var qry=null;
    var args = [p.lat,
		p.lng,
		p.descr,
		p.points
	       ];
    if (p.id)
    {
	qry = 'update markers set lat=?,lng=?,descr=?,points=? where id=?'
	args.push(p.id);
	var lastid = p.id;
    }
    else
    {
	qry = 'insert into markers (lat,lng,descr,points,secret) values(?,?,?,?,?)'
	args.push(sec);
	var lastid=null;
    }
    l('executing',qry,'args:',args);
    db.run(qry,
	   args,
	   (err,data) => {
	       if (err) l('error occured inserting',err);
	       else
	       {
		   if (!lastid) db.get('select last_insert_rowid() id',(err,row) => {
		       if (err) { res.send({error:'wtf'}); done(); return;}
		       res.send({ok:1,id:row.id});done();
		   });
		   else
		   {
		       res.send({ok:1,id:lastid});done();
		   }
	       }
	   });
});

app.post('/markers/:markerId/pic',upload.single('pic'),function(req,res,next) {
    if (!reqadmin(req,res)) return;
    l('upload! for marker',req.params.markerId,req.file);
    db.run('update markers set pic=? where id=?',
	   [req.file.filename,req.params.markerId],
	   err => {
	       if (err) l('err updating marker with pic filename',err);
	       else {
		   l('updated marker',req.params.markerId,' with pic field',req.file.filename);
		   res.send({ok:1});
	       }
	   }
	  );
});

app.get('/uploads/:fileName',function(req,res,next) {
    res.type('image/png');
    resize('./uploads/'+req.params.fileName,'png',400).pipe(res);
});

app.get('/img/:fileName',function(req,res,next) {
    res.sendFile(path.join(__dirname, './img/'+req.params.fileName));
});

app.delete('/markers/:marker_id',(req,res,done) => {
    if (!reqadmin(req,res)) return;
    db.run('delete from markers where id=?',[req.params.marker_id,],err => {
	if (err) { l('delete failed with',err); res.send({error:err}); }
	else res.send({ok:1});
	done();
    });
});

app.get('/markers', (req,res,done) => {
    var rt = [];
    if (req.query.secrets)
    {
	if (!reqadmin(req,res)) return;
	var qry = 'select id,secret,lat,lng,descr,pic,points from markers where is_enabled=true order by id'
    }
    else
	var qry = 'select id,lat,lng,descr,pic,points from markers where is_enabled=true order by id'
    db.all(qry, (err,rows) => {
	res.setHeader('Content-Type', 'application/json');
	var rt = {};
	rows.map(function(row) {
	    rt[row.id]=row;
	});
	res.send(rt);
	done();
    });
});

app.get('/clear-cookie', (req, res) => {
  res.clearCookie('name').end();
});

