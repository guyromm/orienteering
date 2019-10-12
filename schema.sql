create table if not exists markers (
id integer not null primary key,
secret varchar(32) not null,
lat numeric,
lng numeric,
descr text,
pic varchar(32),
points integer default 10,
is_enabled boolean
);

create table if not exists marklog (
id integer not null primary key
,marker_id integer not null
,auth varchar(32) not null
,ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP
,unique(marker_id,auth)
,foreign key(marker_id) references markers(id)
);

-- delete from markers;
-- insert into markers (secret) values('abcde');
-- insert into markers (secret) values('fokk3r');
-- select * from markers;
