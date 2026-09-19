import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth,onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore,doc,setDoc,getDoc,addDoc,updateDoc,deleteDoc,collection,query,where,onSnapshot,serverTimestamp,writeBatch } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig=window.CALORIE_DUO_FIREBASE_CONFIG||{
  apiKey:"YOUR_API_KEY",authDomain:"YOUR_PROJECT.firebaseapp.com",projectId:"YOUR_PROJECT_ID",storageBucket:"YOUR_PROJECT.appspot.com",messagingSenderId:"YOUR_SENDER_ID",appId:"YOUR_APP_ID"
};
const configured=!Object.values(firebaseConfig).some(v=>String(v).includes("YOUR_"));
let app,auth,db;
if(configured){app=initializeApp(firebaseConfig);auth=getAuth(app);db=getFirestore(app)}

const $=id=>document.getElementById(id);
const fmt=n=>Number(n||0).toLocaleString("en-IN",{maximumFractionDigits:0});
const dateKey=d=>new Date(d.getFullYear(),d.getMonth(),d.getDate()).toISOString().slice(0,10);
let day=dateKey(new Date()),mode="signin",user=null,roomId=null,room=null,people=[],unsubPeople=null,unsubMeals=null,meals=[];

function status(el,msg,bad=false){$(el).textContent=msg;$(el).classList.toggle("error",bad)}
function show(view){["authView","roomView","appView"].forEach(x=>$(x).classList.toggle("hidden",x!==view))}
function dateText(k){return k===dateKey(new Date())?"Today":new Date(k+"T00:00:00").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})}
function normalizeCode(v){return v.trim().toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,12)}
function makeCode(){return Math.random().toString(36).slice(2,10).toUpperCase()}
function currentPerson(){return people.find(p=>p.uid===user?.uid)}
function sortedPeople(){return [...people].sort((a,b)=>(a.joinedAt?.seconds||0)-(b.joinedAt?.seconds||0))}
function totals(uid){return meals.filter(m=>m.date===day&&(!uid||m.uid===uid)).reduce((a,m)=>a+(Number(m.calories)||0),0)}
function render(){
  $("date").textContent=dateText(day);
  const ps=sortedPeople(), me=currentPerson(), p1=ps[0],p2=ps[1];
  renderPerson("p1",p1,me?.uid===p1?.uid?"You":"Friend");
  renderPerson("p2",p2,me?.uid===p2?.uid?"You":"Friend");
  const todays=meals.filter(m=>m.date===day).sort((a,b)=>(b.createdAt?.seconds||b.createdAt||0)-(a.createdAt?.seconds||a.createdAt||0));
  $("list").innerHTML=todays.length?todays.map(m=>'<article class="meal"><div class="ico">'+icon(m.type)+'</div><div><b>'+safe(m.food)+'</b><span>'+safe(m.personName||"Member")+' · '+safe(m.type)+'</span></div><div class="kcal"><b>'+fmt(m.calories)+'</b><span>kcal</span></div><button class="del" data-id="'+m.id+'">×</button></article>').join(""):'<div class="empty">No meals logged for this day yet.</div>';
  $("list").querySelectorAll(".del").forEach(b=>b.onclick=()=>removeMeal(b.dataset.id));
  const total=todays.reduce((a,m)=>a+(Number(m.calories)||0),0);
  $("mc").textContent=todays.length;$("tc").textContent=fmt(total);$("sum").textContent=todays.length?fmt(total)+" kcal logged":"Nothing logged yet";$("sub").textContent=p1&&p2?p1.name+": "+fmt(totals(p1.uid))+" · "+p2.name+": "+fmt(totals(p2.uid)):"Add your first meal to start the day.";
  $("roomMeta").textContent="Room "+room.code+" · "+people.length+"/2 members";
}
function renderPerson(prefix,p,label){
  if(!p){$(prefix+"n").textContent="Waiting…";$(prefix+"role").textContent="Invite your friend";$(prefix+"t").textContent="—";$(prefix+"c").textContent="0";$(prefix+"rm").textContent="—";$(prefix+"p").textContent="";$(prefix+"b").style.width="0";return}
  const total=totals(p.uid),target=Number(p.target)||2000,pct=target?total/target*100:0;
  $(prefix+"n").textContent=p.name||label;$(prefix+"role").textContent=label;$(prefix+"t").textContent=fmt(target)+" kcal";$(prefix+"c").textContent=fmt(total);$(prefix+"rm").textContent=fmt(Math.max(0,target-total));$(prefix+"p").textContent=Math.round(pct)+"% of target";$(prefix+"b").style.width=Math.min(100,pct)+"%";$(prefix+"r").style.setProperty("--p",Math.min(100,pct)+"%");
}
function icon(t){return({Breakfast:"☀️",Lunch:"🍛",Snack:"🍎",Dinner:"🌙",Other:"🍽️"})[t]||"🍽️"}
function safe(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
async function createRoom(){
  const name=$("createName").value.trim(),target=Number($("createTarget").value)||2000,code=makeCode();
  const r=doc(collection(db,"rooms")); await setDoc(r,{code,createdBy:user.uid,createdAt:serverTimestamp(),memberCount:1});
  await setDoc(doc(db,"rooms",r.id,"members",user.uid),{uid:user.uid,name,target,joinedAt:serverTimestamp()});
  await setDoc(doc(db,"users",user.uid),{roomId:r.id,name,target});
  await enterRoom(r.id);
}
async function joinRoom(){
  const code=normalizeCode($("joinCode").value),name=$("joinName").value.trim(),target=Number($("joinTarget").value)||2000;
  if(!code||!name)throw Error("Enter the invite code and your name.");
  const snap=await getDocsCompat(query(collection(db,"rooms"),where("code","==",code)));
  if(snap.empty)throw Error("Room not found. Check the invite code.");
  const r=snap.docs[0],members=await getDocsCompat(collection(db,"rooms",r.id,"members"));
  if(members.size>=2&&!members.docs.some(d=>d.id===user.uid))throw Error("This room already has two members.");
  await setDoc(doc(db,"rooms",r.id,"members",user.uid),{uid:user.uid,name,target,joinedAt:serverTimestamp()});
  await updateDoc(doc(db,"rooms",r.id),{memberCount:Math.min(2,members.size+(members.docs.some(d=>d.id===user.uid)?0:1))});
  await setDoc(doc(db,"users",user.uid),{roomId:r.id,name,target});
  await enterRoom(r.id);
}
async function getDocsCompat(q){const mod=await import("https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js");return mod.getDocs(q)}
async function enterRoom(id){
  roomId=id;const rs=await getDoc(doc(db,"rooms",id));room={id,...rs.data()};localStorage.setItem("calorieDuoRoom",id);show("appView");subscribe();
}
function subscribe(){
  unsubPeople?.();unsubMeals?.();
  unsubPeople=onSnapshot(collection(db,"rooms",roomId,"members"),s=>{people=s.docs.map(d=>({uid:d.id,...d.data()}));render()});
  unsubMeals=onSnapshot(query(collection(db,"rooms",roomId,"meals"),where("date",">=",day),where("date","<=",day)),s=>{meals=s.docs.map(d=>({id:d.id,...d.data()}));render()});
}
async function removeMeal(id){await deleteDoc(doc(db,"rooms",roomId,"meals",id))}
async function addMeal(e){
  e.preventDefault();const food=$("food").value.trim(),cal=Number($("cal").value);
  if(!food||!Number.isFinite(cal)||cal<0)return;
  const me=currentPerson();
  await addDoc(collection(db,"rooms",roomId,"meals"),{uid:user.uid,personName:me?.name||"Member",date:day,type:$("type").value,food,calories:cal,protein:Number($("pro").value)||0,carbs:Number($("carb").value)||0,fat:Number($("fat").value)||0,createdAt:serverTimestamp()});
  e.target.reset();status("status","Meal added.");
}
async function clearMyMeals(){
  const mine=meals.filter(m=>m.date===day&&m.uid===user.uid);if(!mine.length)return;
  if(!confirm("Delete your "+mine.length+" meals for "+dateText(day)+"?"))return;
  const batch=writeBatch(db);mine.forEach(m=>batch.delete(doc(db,"rooms",roomId,"meals",m.id)));await batch.commit();
}
async function copyInvite(){await navigator.clipboard.writeText(room.code);status("roomMeta","Invite code "+room.code+" copied.")}
function shift(n){const d=new Date(day+"T00:00:00");d.setDate(d.getDate()+n);day=dateKey(d);subscribe()}

document.querySelectorAll("[data-auth-tab]").forEach(b=>b.onclick=()=>{mode=b.dataset.authTab;document.querySelectorAll("[data-auth-tab]").forEach(x=>x.classList.toggle("active",x===b));$("authNameLabel").classList.toggle("hidden",mode!=="signup");$("authSubmit").textContent=mode==="signup"?"Create account":"Sign in"});
$("authForm").onsubmit=async e=>{e.preventDefault();if(!configured)return status("authStatus","Add your Firebase config first.",true);try{status("authStatus","");if(mode==="signup")await createUserWithEmailAndPassword(auth,$("authEmail").value,$("authPassword").value);else await signInWithEmailAndPassword(auth,$("authEmail").value,$("authPassword").value);if(mode==="signup")await setDoc(doc(db,"users",auth.currentUser.uid),{name:$("authName").value.trim()||"You",target:2000})}catch(err){status("authStatus",friendly(err),true)}};
$("createRoomForm").onsubmit=async e=>{e.preventDefault();try{await createRoom()}catch(err){status("roomStatus",friendly(err),true)}};
$("joinRoomForm").onsubmit=async e=>{e.preventDefault();try{await joinRoom()}catch(err){status("roomStatus",friendly(err),true)}};
$("signOut").onclick=$("signOutFromRoom").onclick=async()=>{unsubPeople?.();unsubMeals?.();await signOut(auth);localStorage.removeItem("calorieDuoRoom")};
$("mealForm").onsubmit=addMeal;$("clear").onclick=clearMyMeals;
$("prev").onclick=()=>shift(-1);$("next").onclick=()=>shift(1);$("today").onclick=()=>{day=dateKey(new Date());subscribe()};
$("copyCode").onclick=$("copyCode2").onclick=copyInvite;
$("settings").onclick=async()=>{const me=currentPerson();$("settingsName").value=me?.name||"";$("settingsTarget").value=me?.target||2000;$("settingsDialog").showModal()};
$("closeSettings").onclick=()=>$("settingsDialog").close();
$("settingsForm").onsubmit=async e=>{e.preventDefault();await updateDoc(doc(db,"rooms",roomId,"members",user.uid),{name:$("settingsName").value.trim()||"Member",target:Number($("settingsTarget").value)||2000});await setDoc(doc(db,"users",user.uid),{roomId,name:$("settingsName").value.trim()||"Member",target:Number($("settingsTarget").value)||2000});$("settingsDialog").close()};
function friendly(e){const m=e?.message||String(e);return m.replace("Firebase: ","").replace(/\(auth\/.*?\)/,"").trim()}
if(!configured){show("authView");status("authStatus","Firebase config is not connected yet.",true)}
else onAuthStateChanged(auth,async u=>{
  user=u;if(!u){show("authView");return}
  const us=await getDoc(doc(db,"users",u.uid));const data=us.exists()?us.data():{};
  const saved=localStorage.getItem("calorieDuoRoom");
  if(saved){try{await enterRoom(saved);return}catch{}}
  if(data.roomId){try{await enterRoom(data.roomId);return}catch{}}
  $("createName").value=data.name||"";$("joinName").value=data.name||"";show("roomView");
});