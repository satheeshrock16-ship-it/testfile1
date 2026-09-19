const K="calorie-duo-v1";
const DEFAULT={settings:{you:{name:"You",target:2000},friend:{name:"Friend",target:2000}},meals:[]};
let state=load(), selected="you", day=key(new Date());
const $=id=>document.getElementById(id);
const fmt=n=>Number(n||0).toLocaleString("en-IN",{maximumFractionDigits:0});
function key(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate()).toISOString().slice(0,10)}
function dateText(k){if(k===key(new Date()))return"Today";return new Date(k+"T00:00:00").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})}
function load(){try{const x=JSON.parse(localStorage.getItem(K));return x&&x.settings?x:structuredClone(DEFAULT)}catch{return structuredClone(DEFAULT)}}
function save(){localStorage.setItem(K,JSON.stringify(state))}
function meals(k=day){return state.meals.filter(x=>x.date===k).sort((a,b)=>b.createdAt-a.createdAt)}
function totals(p,k=day){return meals(k).filter(x=>!p||x.person===p).reduce((a,x)=>{a.c+=Number(x.calories)||0;a.p+=Number(x.protein)||0;a.carb+=Number(x.carbs)||0;a.f+=Number(x.fat)||0;return a},{c:0,p:0,carb:0,f:0})}
function safe(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function icon(t){return {Breakfast:"☀️",Lunch:"🍛",Snack:"🍎",Dinner:"🌙",Other:"🍽️"}[t]||"🍽️"}
function render(){
  $("date").textContent=dateText(day);
  renderPerson("you");renderPerson("friend");renderList();renderTrend();
}
function renderPerson(p){
  const cfg=state.settings[p],t=totals(p),pct=cfg.target?t.c/cfg.target*100:0;
  const n=p==="you"?"yn":"fn",target=p==="you"?"yt":"ft",cal=p==="you"?"yc":"fc",rem=p==="you"?"yrm":"frm",bar=p==="you"?"yb":"fb",pctEl=p==="you"?"yp":"fp",ring=p==="you"?"yr":"fr";
  $(n).textContent=cfg.name;$(target).textContent=fmt(cfg.target)+" kcal";$(cal).textContent=fmt(t.c);$(rem).textContent=fmt(Math.max(0,cfg.target-t.c));$(pctEl).textContent=Math.round(pct)+"% of target";$(bar).style.width=Math.min(100,pct)+"%";$(ring).style.setProperty("--p",Math.min(100,pct)+"%");
}
function renderList(){
  const arr=meals(),list=$("list");
  if(!arr.length){list.innerHTML='<div class="empty">No meals logged for this day yet.</div>'}
  else{
    list.innerHTML=arr.map(function(x){return '<article class="meal"><div class="ico">'+icon(x.type)+'</div><div><b>'+safe(x.food)+'</b><span>'+safe(state.settings[x.person].name)+' · '+safe(x.type)+' · '+new Date(x.createdAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})+'</span></div><div class="kcal"><b>'+fmt(x.calories)+'</b><span>kcal</span></div><button class="del" data-id="'+x.id+'">×</button></article>'}).join("");
    list.querySelectorAll(".del").forEach(function(b){b.onclick=function(){state.meals=state.meals.filter(function(x){return x.id!==b.dataset.id});save();render()}})
  }
  const total=arr.reduce((a,x)=>a+(Number(x.calories)||0),0);
  $("mc").textContent=arr.length;$("tc").textContent=fmt(total);$("sum").textContent=arr.length?fmt(total)+" kcal logged":"Nothing logged yet";
  $("sub").textContent=arr.length?state.settings.you.name+": "+fmt(totals("you").c)+" · "+state.settings.friend.name+": "+fmt(totals("friend").c):"Add your first meal to start the day.";
}
function renderTrend(){
  const days=[],d0=new Date(day+"T00:00:00");
  for(let i=6;i>=0;i--){const d=new Date(d0);d.setDate(d.getDate()-i);days.push(key(d))}
  const vals=days.map(function(k){return totals(null,k).c}),max=Math.max.apply(Math,vals.concat([100]));
  $("trend").innerHTML='<div class="bars">'+days.map(function(k,i){const h=Math.max(3,vals[i]/max*115);return '<div class="barcol"><div class="bar" style="height:'+h+'px"></div><b>'+fmt(vals[i])+'</b><span>'+new Date(k+"T00:00:00").toLocaleDateString("en-IN",{weekday:"narrow"})+'</span></div>'}).join("")+'</div>';
}
function shift(n){const d=new Date(day+"T00:00:00");d.setDate(d.getDate()+n);day=key(d);render()}
document.querySelectorAll("[data-person]").forEach(function(b){b.onclick=function(){selected=b.dataset.person;document.querySelectorAll(".tabs button").forEach(function(x){x.classList.toggle("active",x===b)})}});
$("mealForm").onsubmit=function(e){
  e.preventDefault();
  const food=$("food").value.trim(),cal=Number($("cal").value);
  if(!food||!Number.isFinite(cal)||cal<0)return;
  state.meals.push({id:crypto.randomUUID(),date:day,person:selected,type:$("type").value,food:food,calories:cal,protein:Number($("pro").value)||0,carbs:Number($("carb").value)||0,fat:Number($("fat").value)||0,createdAt:Date.now()});
  save();e.target.reset();$("status").textContent="Meal added.";setTimeout(function(){$("status").textContent=""},1500);render();
};
$("prev").onclick=function(){shift(-1)};$("next").onclick=function(){shift(1)};$("today").onclick=function(){day=key(new Date());render()};
$("clear").onclick=function(){const n=meals().length;if(n&&confirm("Delete all "+n+" meals for "+dateText(day)+"?")){state.meals=state.meals.filter(function(x){return x.date!==day});save();render()}};
$("settings").onclick=function(){$("yin").value=state.settings.you.name;$("yit").value=state.settings.you.target;$("fin").value=state.settings.friend.name;$("fit").value=state.settings.friend.target;$("dlg").showModal()};
$("close").onclick=function(){$("dlg").close()};
$("settingsForm").onsubmit=function(e){e.preventDefault();state.settings.you.name=$("yin").value.trim()||"You";state.settings.you.target=Number($("yit").value)||2000;state.settings.friend.name=$("fin").value.trim()||"Friend";state.settings.friend.target=Number($("fit").value)||2000;save();$("dlg").close();render()};
$("export").onclick=function(){const a=document.createElement("a"),b=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});a.href=URL.createObjectURL(b);a.download="calorie-duo-backup.json";a.click();URL.revokeObjectURL(a.href)};
$("import").onchange=async function(e){try{state=JSON.parse(await e.target.files[0].text());save();render();alert("Data imported.")}catch{alert("Invalid backup file.")}e.target.value=""};
render();