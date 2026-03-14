const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
container.classList.remove("right-panel-active");
});


// SIGNUP
function signup(){

let name = document.getElementById("signupName").value;
let email = document.getElementById("signupEmail").value;
let password = document.getElementById("signupPassword").value;

if(!name || !email || !password){
alert("Please fill all fields");
return;
}

fetch("http://localhost:5000/signup",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
name:name,
email:email,
password:password
})
})
.then(res=>res.json())
.then(data=>{
alert(data.message || "Signup Successful");
})
.catch(err=>{
console.log(err);
alert("Server error");
});

}


// LOGIN
function login(){

let email=document.getElementById("email").value.trim();
let password=document.getElementById("password").value.trim();

let error=document.getElementById("loginError");

let btnText=document.getElementById("btnText");
let btnDots=document.getElementById("btnDots");

error.innerText="";

// validation
if(!email || !password){
error.innerText="Please enter email and password";
return;
}

/* show dots animation */
btnText.style.display="none";
btnDots.style.display="inline";

/* demo login */
if(email==="demo@gmail.com" && password==="123456"){
setTimeout(()=>{
window.location.href="dashboard.html";
},1000);
return;
}

fetch("http://localhost:5000/login",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
email:email,
password:password
})
})

.then(res=>res.json())

.then(data=>{

btnText.style.display="inline";
btnDots.style.display="none";

if(data.success){
window.location.href="dashboard.html";
}else{
error.innerText="Invalid credentials";
}

})

.catch(()=>{

btnText.style.display="inline";
btnDots.style.display="none";

error.innerText="Invalid credentials";

});

}