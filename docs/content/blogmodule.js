import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getFirestore, onSnapshot, collection, getDocs, addDoc, setDoc, doc } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyDhauv4c-G83a7SpxKyxzqQxNMPP7ZRBNE",
  authDomain: "sima-kyr.firebaseapp.com",
  projectId: "sima-kyr",
  storageBucket: "sima-kyr.appspot.com",
  messagingSenderId: "121579921311",
  appId: "1:121579921311:web:659ca9fa96f64b1f5027aa",
  measurementId: "G-267937X2RE"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore();
const analytics = getAnalytics(app);

const loc = location.pathname.split('.')[0].replace('/', '');

const comments = collection(db, 'comments');
const querySnapshot = await getDocs(comments);
if(querySnapshot[loc]){

}else{
  await setDoc(doc(db, 'comments', loc), {});
}

if(localStorage.blogSimaKyr){
  const json = JSON.parse(localStorage.blogSimaKyr);
  const array = Object.keys(json);
  for (var i = 0; i < array.length; i++) {
    var e = document.getElementById(array[i]);
    if(e){
      e.value = json[array[i]];
    }
  }
}else{
  localStorage.blogSimaKyr = '{}';
}
const unsub = onSnapshot(doc(db, 'comments', loc), (doc) => {
    console.log("Current data: ", doc.data());
});
document.getElementById('sendcomment').onclick = async function () {
  const nickname = document.getElementById('aurl-nick').value || 'Anonymous';
  const msg = document.getElementById('text-msg').value;
  const mail = document.getElementById('aurl-email').value || 'unknown'
  if(msg){
    if(msg != ''){
      const id = Math.floor((new Date()).getTime() / 1000) + '_' + Math.random().toString(36).substr(2, 9);
      const data = {
        msg: msg,
        nickname: nickname,
        mail: mail,
        date: new Date().toISOString()
      };
      const j = JSON.stringify(data);
      const querySnapshot = await getDocs(comments);
      console.log(querySnapshot);
      var k = JSON.parse(querySnapshot[loc]);
      k[id] = j;
      await addDoc(collection(db, 'comments', loc), JSON.stringify(k));
    }
  }
}
const inp = document.getElementsByClassName('ccreate')[0].getElementsByTagName('input');
for (var i = 0; i < inp.length; i++) {
  const z = inp[i];
  z.onchange = function () {
    var g = JSON.parse(localStorage.blogSimaKyr);
    g[z.id] = z.value;
    localStorage.blogSimaKyr = JSON.stringify(g);
  }
}
