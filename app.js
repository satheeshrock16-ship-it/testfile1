import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const SUPABASE_URL="https://lpqdnmaaykeyklfdfzdl.supabase.co";
const SUPABASE_KEY="sb_publishable_MpTMTeTLJ74A5gm8QHs2kA_Z0aETuMX";
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY);
const $=id=>document.getElementById(id),fmt=n=>Number(n||0).toLocaleString("en-IN",{maximumFractionDigits:0});
let day=key(new Date()),user=null,roomId=null,room=null,people=[],meals=[],peopleChannel,mealChannel,authMode="signin";
function key(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate()).toISOString().slice(0,10)}
function safe(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function icon(t){return({Breakfast:"☀️",Lunch:"🍛",Snack:"🍎",Dinner:"🌙",Other:"🍽️"})[t]||"🍽️"}
function status(id,msg,bad=false){$(id).textContent=msg;$(id).classList.toggle("error",bad)}
function show(v){["authView","roomView","appView"].forEach(x=>$(x).classList.toggle("hidden",x!==v))}
function dateText(k){return k===key(new Date())?"Today":new Date(k+"T00:00:00").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})}
function totals(uid){return meals.filter(m=>m.eaten_on===day&&(!uid||m.user_id===uid)).reduce((a,m)=>a+(Number(m.calories)||0),0)}
function render(){
 $("date").textContent=dateText(day);const ps=[...people].sort((a,b)=>String(a.id).localeCompare(String(b.id)));renderPerson("p1",ps[0]);renderPerson("p2",ps[1]);
 const today=meals.filter(m=>m.eaten_on===day).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
 $("list").innerHTML=today.length?today.map(m=>'<article class="meal"><div class="ico">'+icon(m.meal_type)+'</div><div><b>'+safe(m.food)+'</b><span>'+safe(m.profiles?.name||"Member")+' · '+safe(m.meal_type)+'</span></div><div class="kcal"><b>'+fmt(m.calories)+'</b><span>kcal</span></div><button class="del" data-id="'+m.id+'">×</button></article>').join(""):'<div class="empty">No meals logged for this day yet.</div>';
 $("list").querySelectorAll(".del").forEach(b=>b.onclick=()=>deleteMeal(b.dataset.id));
 const total=today.reduce((a,m)=>a+Number(m.calories||0),0);$("mc").textContent=today.length;$("tc").textContent=fmt(total);$("sum").textContent=today.length?fmt(total)+" kcal logged":"Nothing logged yet";$("sub").textContent=ps.length>1?ps[0].name+": "+fmt(totals(ps[0].id))+" · "+ps[1].name+": "+fmt(totals(ps[1].id)):"Invite your friend to start tracking together.";if(room)$("roomMeta").textContent="Room "+room.invite_code+" · "+people.length+"/2 members";
}
function renderPerson(pre,p){
 if(!p){$(pre+"n").textContent="Waiting…";$(pre+"role").textContent="Invite your friend";$(pre+"t").textContent="—";$(pre+"c").textContent="0";$(pre+"rm").textContent="—";$(pre+"p").textContent="";$(pre+"b").style.width="0";return}
 const t=totals(p.id),pct=(Number(p.calorie_target)||2000)?t/(Number(p.calorie_target)||2000)*100:0;$(pre+"n").textContent=p.name;$(pre+"role").textContent=p.id===user?.id?"You":"Friend";$(pre+"t").textContent=fmt(p.calorie_target)+" kcal";$(pre+"c").textContent=fmt(t);$(pre+"rm").textContent=fmt(Math.max(0,p.calorie_target-t));$(pre+"p").textContent=Math.round(pct)+"% of target";$(pre+"b").style.width=Math.min(100,pct)+"%";$(pre+"r").style.setProperty("--p",Math.min(100,pct)+"%");
}
async function loadRoom(id){
 roomId=id;localStorage.setItem("calorieDuoRoom",id);
 const {data:r,error:re}=await supabase.from("rooms").select("*").eq("id",id).single();if(re)throw re;room=r;
 await refresh();subscribe();show("appView");
}
async function refresh(){
 const [{data:p,error:pe},{data:m,error:me}]=await Promise.all([
  supabase.from("profiles").select("id,name,calorie_target,room_id").eq("room_id",roomId),
  supabase.from("meals").select("id,user_id,meal_type,food,calories,protein,carbs,fat,eaten_on,created_at").eq("room_id",roomId).eq("eaten_on",day)
 ]);
 if(pe)throw pe;if(me)throw me;
 people=p||[];meals=m||[];
 if(meals.length){
   const ids=[...new Set(meals.map(x=>x.user_id))];
   const {data:memberProfiles,error:profileError}=await supabase.from("profiles").select("id,name").in("id",ids);
   if(profileError)throw profileError;
   const names=new Map((memberProfiles||[]).map(x=>[x.id,x.name]));
   meals=meals.map(m=>({...m,profiles:{name:names.get(m.user_id)||"Member"}}));
 }
 render();
}
function subscribe(){
 peopleChannel?.unsubscribe();mealChannel?.unsubscribe();
 peopleChannel=supabase.channel("room-members-"+roomId).on("postgres_changes",{event:"*",schema:"public",table:"profiles",filter:"room_id=eq."+roomId},refresh).subscribe();
 mealChannel=supabase.channel("room-meals-"+roomId).on("postgres_changes",{event:"*",schema:"public",table:"meals",filter:"room_id=eq."+roomId},refresh).subscribe();
}
async function createRoom(){
 const {data,error}=await supabase.rpc("create_room",{p_name:$("createName").value.trim(),p_target:Number($("createTarget").value)||2000});if(error)throw error;await loadRoom(data);
}
async function joinRoom(){
 const {data,error}=await supabase.rpc("join_room",{p_code:$("joinCode").value.trim(),p_name:$("joinName").value.trim(),p_target:Number($("joinTarget").value)||2000});if(error)throw error;await loadRoom(data);
}
async function deleteMeal(id){const {error}=await supabase.from("meals").delete().eq("id",id).eq("user_id",user.id);if(error)alert(error.message)}
async function addMeal(e){
 e.preventDefault();const food=$("food").value.trim(),cal=Number($("cal").value);if(!food||!Number.isFinite(cal)||cal<0)return;
 const {data:p}=await supabase.from("profiles").select("name").eq("id",user.id).single();
 const {error}=await supabase.from("meals").insert({room_id:roomId,user_id:user.id,meal_type:$("type").value,food,calories:cal,protein:Number($("pro").value)||0,carbs:Number($("carb").value)||0,fat:Number($("fat").value)||0,eaten_on:day});
 if(error)status("status",error.message,true);else{e.target.reset();status("status","Meal added.")}
}
async function clearMine(){
 const ids=meals.filter(m=>m.eaten_on===day&&m.user_id===user.id).map(m=>m.id);if(!ids.length)return;if(confirm("Delete your meals for "+dateText(day)+"?"))await supabase.from("meals").delete().in("id",ids).eq("user_id",user.id);
}
async function copyCode(){await navigator.clipboard.writeText(room.invite_code);status("roomMeta","Invite code "+room.invite_code+" copied.")}
async function loadUser(){
 const {data:p}=await supabase.from("profiles").select("*").eq("id",user.id).maybeSingle();
 if(p?.room_id){try{await loadRoom(p.room_id);return}catch{}}
 const saved=localStorage.getItem("calorieDuoRoom");if(saved){try{await loadRoom(saved);return}catch{localStorage.removeItem("calorieDuoRoom")}}
 $("createName").value=p?.name||"";$("joinName").value=p?.name||"";show("roomView");
}
document.querySelectorAll("[data-auth-tab]").forEach(b=>b.onclick=()=>{authMode=b.dataset.authTab;document.querySelectorAll("[data-auth-tab]").forEach(x=>x.classList.toggle("active",x===b));$("authNameLabel").classList.toggle("hidden",authMode!=="signup");$("authSubmit").textContent=authMode==="signup"?"Create account":"Sign in"});
$("authForm").onsubmit=async e=>{e.preventDefault();const email=$("authEmail").value,password=$("authPassword").value;const r=authMode==="signup"?await supabase.auth.signUp({email,password,options:{data:{name:$("authName").value.trim()||"User"}}}):await supabase.auth.signInWithPassword({email,password});if(r.error)status("authStatus",r.error.message,true);else if(authMode==="signup"&&r.data.session)await loadUser();else status("authStatus","Check your email to confirm your account.")};
$("createRoomForm").onsubmit=async e=>{e.preventDefault();try{await createRoom()}catch(x){status("roomStatus",x.message,true)}};
$("joinRoomForm").onsubmit=async e=>{e.preventDefault();try{await joinRoom()}catch(x){status("roomStatus",x.message,true)}};
async function logout(){peopleChannel?.unsubscribe();mealChannel?.unsubscribe();localStorage.removeItem("calorieDuoRoom");await supabase.auth.signOut();show("authView")}
$("signOut").onclick=$("signOutFromRoom").onclick=logout;
$("mealForm").onsubmit=addMeal;$("clear").onclick=clearMine;
$("prev").onclick=async()=>{const d=new Date(day+"T00:00:00");d.setDate(d.getDate()-1);day=key(d);await refresh()};$("next").onclick=async()=>{const d=new Date(day+"T00:00:00");d.setDate(d.getDate()+1);day=key(d);await refresh()};$("today").onclick=async()=>{day=key(new Date());await refresh()};
$("copyCode").onclick=$("copyCode2").onclick=copyCode;
$("settings").onclick=async()=>{const {data:p}=await supabase.from("profiles").select("*").eq("id",user.id).single();$("settingsName").value=p.name;$("settingsTarget").value=p.calorie_target;$("settingsDialog").showModal()};
$("closeSettings").onclick=()=>$("settingsDialog").close();
$("settingsForm").onsubmit=async e=>{e.preventDefault();const {error}=await supabase.from("profiles").update({name:$("settingsName").value.trim()||"User",calorie_target:Number($("settingsTarget").value)||2000}).eq("id",user.id);if(error)status("settingsStatus",error.message,true);else $("settingsDialog").close()};
supabase.auth.onAuthStateChange((_event,session)=>{user=session?.user||null;if(user)loadUser();else show("authView")});
const initial=await supabase.auth.getSession();if(initial.data.session){user=initial.data.session.user;await loadUser()}else show("authView");