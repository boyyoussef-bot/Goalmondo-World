window.GM_STORE=(function(){
 const KEY='GOALMONDO_WORLD_V6_STATE';
 const BACKUP='GOALMONDO_WORLD_V6_BACKUP';
 const SAFE='GOALMONDO_WORLD_V6_SAFE_BACKUP';
 const LAST='GOALMONDO_WORLD_V6_LAST_SAVE_TIME';

 function clone(x){return JSON.parse(JSON.stringify(x));}
 function fallbackTeams(c){return Array.from({length:16},(_,i)=>`${c} FC ${i+1}`)}

 function defaultState(){
   const leagues={};
   GM_DATA.countries.forEach(c=>{
     leagues[c]=[{
       name:'1. Liga',
       teams:(GM_DATA.teams[c]||fallbackTeams(c)).map(n=>({
         name:n,numbers:[],stats:{p:0,w:0,d:0,l:0,gf:0,ga:0},played:{}
       })),
       fixtures:[]
     }];
   });
   return {version:'6.2.2',lang:'de',country:'Deutschland',leagueIndex:0,mode:'single',scoreMode:'countdown',leagues,champions:[],worldcup:[],records:[]};
 }

 function normalizeTeam(tm){
   tm=tm||{};
   tm.name=tm.name||'Team';
   tm.numbers=Array.isArray(tm.numbers)?tm.numbers.map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=20):[];
   tm.stats=tm.stats||{p:0,w:0,d:0,l:0,gf:0,ga:0};
   ['p','w','d','l','gf','ga'].forEach(k=>tm.stats[k]=Number(tm.stats[k]||0));
   tm.played=tm.played||{};
   return tm;
 }

 function migrate(s){
   const d=defaultState();
   s=Object.assign(d,s||{});
   s.version='6.2.2';
   if(!GM_I18N[s.lang]) s.lang='de';
   if(!GM_DATA.countries.includes(s.country)) s.country='Deutschland';
   s.leagues=s.leagues||d.leagues;

   GM_DATA.countries.forEach(c=>{
     if(!Array.isArray(s.leagues[c])||!s.leagues[c].length) s.leagues[c]=d.leagues[c];
     s.leagues[c].forEach((l,i)=>{
       l.name=l.name||`${i+1}. Liga`;
       l.teams=Array.isArray(l.teams)?l.teams.map(normalizeTeam):[];
       l.fixtures=Array.isArray(l.fixtures)?l.fixtures:[];
     });
   });

   s.leagueIndex=Number(s.leagueIndex||0);
   if(!s.leagues[s.country]||!s.leagues[s.country][s.leagueIndex]) s.leagueIndex=0;
   s.mode=s.mode==='double'?'double':'single';
   s.scoreMode=s.scoreMode==='normal'?'normal':'countdown';
   s.champions=Array.isArray(s.champions)?s.champions:[];
   s.worldcup=Array.isArray(s.worldcup)?s.worldcup:[];
   s.records=Array.isArray(s.records)?s.records:[];
   return s;
 }

 function load(){
   for(const k of [KEY,SAFE,BACKUP,'gm_v6_autosave_latest','GOALMONDO_WORLD_V6_LAST_GOOD']){
     try{
       const raw=localStorage.getItem(k);
       if(raw) return migrate(JSON.parse(raw));
     }catch(e){}
   }
   return defaultState();
 }

 function save(s){
   try{
     const stable=migrate(clone(s));
     const next=JSON.stringify(stable);
     const old=localStorage.getItem(KEY);
     if(old && old!==next) localStorage.setItem(BACKUP,old);
     localStorage.setItem(KEY,next);
     localStorage.setItem(SAFE,next);
     localStorage.setItem('gm_v6_autosave_latest',next);
     localStorage.setItem('GOALMONDO_WORLD_V6_LAST_GOOD',next);
     localStorage.setItem(LAST,String(Date.now()));
     return localStorage.getItem(KEY)===next;
   }catch(e){
     console.error('GOALMONDO save error',e);
     return false;
   }
 }

 function backup(s){
   try{
     const next=JSON.stringify(migrate(clone(s)));
     localStorage.setItem(BACKUP,next);
     localStorage.setItem(SAFE,next);
     localStorage.setItem(LAST,String(Date.now()));
     return true;
   }catch(e){return false;}
 }

 function restore(){
   for(const k of [BACKUP,SAFE,'GOALMONDO_WORLD_V6_LAST_GOOD','gm_v6_autosave_latest']){
     try{
       const raw=localStorage.getItem(k);
       if(raw){localStorage.setItem(KEY,raw);return load();}
     }catch(e){}
   }
   return null;
 }

 return {load,save,backup,restore,defaultState};
})();
