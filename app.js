import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const SUPABASE_URL="https://lpqdnmaaykeyklfdfzdl.supabase.co";
const SUPABASE_KEY="sb_publishable_MpTMTeTLJ74A5gm8QHs2kA_Z0aETuMX";
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY);
const $=id=>document.getElementById(id),fmt=n=>Number(n||0).toLocaleString("en-IN",{maximumFractionDigits:0});
let day=key(new Date()),user=null,roomId=null,room=null,people=[],meals=[],peopleChannel,mealChannel,authMode="signin";
const indianFoods={
"Idli (2 pieces)":120,"Idli (3 pieces)":180,"Plain dosa (1)":170,"Masala dosa (1)":350,"Rava dosa (1)":220,"Onion dosa (1)":250,"Set dosa (2)":300,"Medu vada (1)":140,"Sambar (1 cup)":120,"Coconut chutney (2 tbsp)":80,"Tomato chutney (2 tbsp)":45,"Ven pongal (1 cup)":280,"Khara bath/upma (1 cup)":230,"Kesari bath (1 cup)":300,"Poori (2)":300,"Chapati (1)":110,"Chapati (2)":220,"Parotta (1)":300,"Kothu parotta (1 plate)":550,"Curd rice (1 cup)":250,"Lemon rice (1 cup)":280,"Tamarind rice (1 cup)":300,"Veg biryani (1 plate)":450,"Chicken biryani (1 plate)":600,"Mutton biryani (1 plate)":650,"Egg biryani (1 plate)":550,"Chicken rice (1 plate)":500,"Fried rice veg (1 plate)":450,"Fried rice chicken (1 plate)":550,"Plain rice cooked (1 cup)":205,"Rasam (1 cup)":70,"Sambar rice (1 cup)":300,"Vegetable rice (1 cup)":280,"Dal rice (1 cup)":300,"Rajma chawal (1 bowl)":380,"Chole rice (1 bowl)":400,"Dal (1 cup)":180,"Chana masala (1 cup)":280,"Rajma (1 cup)":220,"Sambar (2 cups)":240,"Vegetable kurma (1 cup)":250,"Paneer butter masala (1 cup)":350,"Palak paneer (1 cup)":300,"Chicken curry (1 cup)":320,"Chicken tikka (6 pieces)":280,"Tandoori chicken (1 leg)":250,"Butter chicken (1 cup)":400,"Mutton curry (1 cup)":400,"Egg curry (2 eggs)":280,"Fish curry (1 cup)":250,"Fish fry (1 piece)":220,"Omelette (2 eggs)":220,"Boiled egg (1)":78,"Boiled eggs (2)":156,"Chicken breast cooked (100 g)":165,"Paneer (100 g)":265,"Curd/plain yogurt (1 cup)":150,"Buttermilk (1 glass)":80,"Milk (1 glass)":120,"Tea with milk (1 cup)":90,"Coffee with milk (1 cup)":90,"Filter coffee (1 cup)":110,"Tea without sugar (1 cup)":20,"Coffee without sugar (1 cup)":15,"Banana (1 medium)":105,"Apple (1 medium)":95,"Orange (1)":62,"Mango (1 medium)":135,"Guava (1)":68,"Watermelon (1 cup)":46,"Papaya (1 cup)":55,"Dates (3)":200,"Peanuts (30 g)":170,"Almonds (10)":70,"Cashews (10)":85,"Mixed nuts (30 g)":180,"Roasted chana (30 g)":120,"Peanut chikki (1 piece)":150,"Samosa (1)":260,"Pakora/bajji (4 pieces)":250,"Bonda (2)":250,"Pani puri (6)":250,"Masala vada (2)":220,"Murukku (2 pieces)":180,"Mixture (30 g)":160,"Biscuits (4)":200,"Bread (2 slices)":140,"Peanut butter (1 tbsp)":95,"Oats cooked (1 cup)":160,"Cornflakes with milk (1 bowl)":250,"Poha (1 cup)":250,"Upma (1 cup)":230,"Pulao veg (1 cup)":300,"Curd (100 g)":60,"Gulab jamun (1)":150,"Jalebi (2)":220,"Rasgulla (2)":180,"Kheer/payasa (1 cup)":250,"Payasam (1 cup)":250,"Laddu (1)":180,"Mysore pak (1 piece)":180,"Ice cream (1 scoop)":140,"Chocolate (20 g)":110
};
const foodInput=$("food"),calInput=$("cal");
function applyFoodPreset(){const v=foodInput.value;if(indianFoods[v]!=null)calInput.value=indianFoods[v]}
const foodList=$("indianFoodList");if(foodList)foodList.innerHTML=Object.entries(indianFoods).map(([name,kcal])=>`<option value="${name}">${kcal} kcal</option>`).join("");
foodInput?.addEventListener("change",applyFoodPreset);
foodInput?.addEventListener("input",()=>{if(indianFoods[foodInput.value]!=null)calInput.value=indianFoods[foodInput.value]});

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