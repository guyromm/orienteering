PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE markers (
id integer not null primary key,
secret varchar(32) not null,
lat numeric,
lng numeric,
descr text,
pic varchar(32), points integer default 10, is_enabled boolean default true);
INSERT INTO markers VALUES(1,'f21952',32.045596292347688915,34.771054951621103157,'חדק הפיל','157027112724415702711102164826870183177003157.jpg',10,1);
INSERT INTO markers VALUES(4,'e695f1',32.045318067003627504,34.771548625014112587,'תקלה הידראולית','157027078334015702707691656334471582026233906.jpg',10,1);
INSERT INTO markers VALUES(6,'fe37aa',32.046357653530009202,34.771314821423985109,'חורבת העטלף','157027032968415702702959682416094032943747645.jpg',10,1);
INSERT INTO markers VALUES(7,'b6851b',32.046676859419946481,34.772217664315547835,'המערה החשמלית','157027042377015702704090278900925140235751940.jpg',10,1);
INSERT INTO markers VALUES(8,'b59bcc',32.046223746733389248,34.770094274793180489,'לפתוח שולחן','157027212472515702721062177470542563569921193.jpg',10,1);
INSERT INTO markers VALUES(9,'bf346',32.046266811087100734,34.769661220449513904,'חשמל ביער','157027266770015702726561293093058189793463330.jpg',30,1);
INSERT INTO markers VALUES(10,'798a17',32.044972934950187947,34.771237988200041969,'חוות הקוקוריקו','15702730298471570273013037689000527800887607.jpg',10,1);
INSERT INTO markers VALUES(12,'7103f9',32.04578309513264145,34.768971204811805364,'קיר טיפוס','157027180173315702717792035034682878599294317.jpg',10,1);
INSERT INTO markers VALUES(13,'d87364',32.045197038688634449,34.770155394063301911,'הנוף של פעם','157027143184415702714124302527618822261597528.jpg',15,1);
INSERT INTO markers VALUES(22,'42d8d5',32.046419150568837609,34.769636486604738935,'מעבר לפינה','157085630027815708562779764798742901254471253.jpg',10,1);
INSERT INTO markers VALUES(23,'ad873a',32.045413488553677438,34.770554898553072576,'הפסולת ל..','157085557756815708555547771965924105112724511.jpg',10,1);
INSERT INTO markers VALUES(24,'e0436c',32.045994300795619836,34.769541462542960629,'אומג!!1','15708560389631570856014512345324290929548551.jpg',17,1);
INSERT INTO markers VALUES(25,'c1a3e',32.046644714339507231,34.770105799836180438,'פטריארכלי','15708565263471570856507931146912834555703506.jpg',10,1);
INSERT INTO markers VALUES(26,'eaf54d',32.046316185230622863,34.770311958119343386,'הגן הנודד','157085675132915708567154805177320523395759001.jpg',10,1);
INSERT INTO markers VALUES(27,'667272',32.046356510269397687,34.770942383287533061,'פרגולה-לה','157085699573315708569697963619953059117602459.jpg',10,1);
INSERT INTO markers VALUES(28,'c97c1f',32.04597753237176505,34.771265304487833703,'צמאים לנצחון',NULL,13,1);
INSERT INTO markers VALUES(29,'d14eaf',32.045885244997265317,34.771319776498735621,'מתי נחים??',NULL,10,1);
INSERT INTO markers VALUES(30,'7f317e',32.045293841874510575,34.770512576026547436,'גליץ'' קטן','15708576223191570857604208793435999145498788.jpg',10,1);
INSERT INTO markers VALUES(31,'49d674',32.045782997943710768,34.770846551050908601,'קמפינג','157085782471915708578050745262018669628249976.jpg',10,1);
INSERT INTO markers VALUES(33,'8e9c84',32.045507286412266978,34.771043754285287264,'קומה ראשונה','157085807442715708580532423697668223589601366.jpg',10,1);
INSERT INTO markers VALUES(35,'e641c1',32.045328510496240426,34.771229151691038338,'קומה ב','157085827766115708582629947332267985267337578.jpg',10,1);
INSERT INTO markers VALUES(37,'c3477',32.045334429159431977,34.771128803267345118,'קסילופון בראש התורן','157085848111415708584675134441935869297472900.jpg',30,1);
INSERT INTO markers VALUES(39,'c9067a',32.045424762678429431,34.77115951629306778,'בדרך למטה!!','157085868837715708586751157899934944491032698.jpg',20,1);
INSERT INTO markers VALUES(40,'f56fc2',32.045502775453392984,34.771160179075778274,'האור שבקצה','15708554024661570855380253741451372172657200.jpg',10,1);
COMMIT;
CREATE TABLE marklog (
id integer not null primary key
,marker_id integer not null
,auth varchar(32) not null
,ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP
,unique(marker_id,auth)
,foreign key(marker_id) references markers(id)
);
