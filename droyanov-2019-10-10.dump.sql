PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE markers (
id integer not null primary key,
secret varchar(32) not null,
lat numeric,
lng numeric,
descr text,
pic varchar(32), points integer default 10, is_enabled boolean default true);
INSERT INTO markers VALUES(1,'f21952',32.045596292347688915,34.771054951621103157,'חדק הפיל','157027112724415702711102164826870183177003157.jpg',10,0);
INSERT INTO markers VALUES(4,'e695f1',32.045318067003627504,34.771548625014112587,'תקלה הידראולית','157027078334015702707691656334471582026233906.jpg',10,0);
INSERT INTO markers VALUES(6,'fe37aa',32.046357653530009202,34.771314821423985109,'חורבת העטלף','157027032968415702702959682416094032943747645.jpg',10,0);
INSERT INTO markers VALUES(7,'b6851b',32.046676859419946481,34.772217664315547835,'המערה החשמלית','157027042377015702704090278900925140235751940.jpg',10,0);
INSERT INTO markers VALUES(8,'b59bcc',32.046223746733389248,34.770094274793180489,'לפתוח שולחן','157027212472515702721062177470542563569921193.jpg',10,0);
INSERT INTO markers VALUES(9,'bf346',32.046266811087100734,34.769661220449513904,'חשמל ביער','157027266770015702726561293093058189793463330.jpg',30,0);
INSERT INTO markers VALUES(10,'798a17',32.044972934950187947,34.771237988200041969,'חוות הקוקוריקו','15702730298471570273013037689000527800887607.jpg',10,0);
INSERT INTO markers VALUES(11,'ff3a39',32.045496131385220906,34.771070794622858102,'קסילופון בראש התורן','157027360330215702735902112549288449350595739.jpg',20,0);
INSERT INTO markers VALUES(12,'7103f9',32.04578309513264145,34.768971204811805364,'קיר טיפוס','157027180173315702717792035034682878599294317.jpg',10,0);
INSERT INTO markers VALUES(13,'d87364',32.045197038688634449,34.770155394063301911,'הנוף של פעם','157027143184415702714124302527618822261597528.jpg',15,0);
INSERT INTO markers VALUES(14,'78f4a0',32.056934382418731388,34.76530984950694858,'Droyanov 14',NULL,10,1);
INSERT INTO markers VALUES(15,'96f778',32.056934382418702967,34.765309849506898843,'Droyanov 15',NULL,10,1);
INSERT INTO markers VALUES(16,'8012da',32.056934382418702967,34.765309849506898843,'Droyanov 16',NULL,10,1);
INSERT INTO markers VALUES(17,'f8a122',32.056934382418702967,34.765309849506898843,'Droyanov 17',NULL,10,1);
INSERT INTO markers VALUES(18,'2e086e',32.056934382418702967,34.765309849506898843,'Droyanov 18',NULL,10,1);
INSERT INTO markers VALUES(19,'e3881b',32.056998859454473916,34.76530984950694858,'Droyanov 19',NULL,10,1);
INSERT INTO markers VALUES(20,'f041bf',32.056934382418702967,34.76530984950694858,'Droyanov 20',NULL,10,1);
CREATE TABLE marklog (
id integer not null primary key
,marker_id integer not null
,auth varchar(32) not null
,ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP
,unique(marker_id,auth)
,foreign key(marker_id) references markers(id)
);
INSERT INTO marklog VALUES(11,11,'מאיה','2019-10-05 11:08:24');
INSERT INTO marklog VALUES(12,7,'מאיה','2019-10-05 11:18:36');
INSERT INTO marklog VALUES(13,6,'מאיה','2019-10-05 11:22:12');
INSERT INTO marklog VALUES(14,1,'מאיה','2019-10-05 11:25:42');
INSERT INTO marklog VALUES(15,10,'מאיה','2019-10-05 11:28:07');
INSERT INTO marklog VALUES(16,4,'מאיה','2019-10-05 11:30:39');
INSERT INTO marklog VALUES(17,13,'מאיה','2019-10-05 11:33:52');
INSERT INTO marklog VALUES(18,8,'מאיה','2019-10-05 11:36:05');
INSERT INTO marklog VALUES(19,9,'מאיה','2019-10-05 11:39:04');
INSERT INTO marklog VALUES(20,12,'מאיה','2019-10-05 11:43:03');
INSERT INTO marklog VALUES(21,10,'אלכס ','2019-10-08 10:35:03');
INSERT INTO marklog VALUES(22,6,'כהן','2019-10-08 13:41:09');
INSERT INTO marklog VALUES(23,6,'בוב','2019-10-08 13:46:31');
INSERT INTO marklog VALUES(24,15,'admin','2019-10-10 17:18:12');
INSERT INTO marklog VALUES(25,14,'admin','2019-10-10 17:18:52');
INSERT INTO marklog VALUES(26,16,'admin','2019-10-10 17:19:23');
INSERT INTO marklog VALUES(27,20,'admin','2019-10-10 17:25:28');
INSERT INTO marklog VALUES(28,19,'admin','2019-10-10 17:30:34');
INSERT INTO marklog VALUES(29,18,'admin','2019-10-10 17:31:03');
COMMIT;
