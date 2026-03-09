// Victim Class
class Victim {

constructor(id){
this.id=id;

this.healthStatus=Math.random()>0.5?"Severe":"Stable";

this.priority=this.healthStatus==="Severe"?"Critical":"Normal";

this.status="Waiting";
}

requestHelp(){
return "Victim "+this.id+" requesting help";
}

updateCondition(){
if(this.healthStatus==="Severe"){
this.priority="Critical";
}
}

}


// Disaster Class
class Disaster{

constructor(type,severity,location){

this.type=type;
this.severity=severity;
this.location=location;

}

start(){

console.log(this.type+" disaster started at "+this.location);

}

update(){

console.log("Disaster updated");

}

}


// Rescue Team Class
class RescueTeam{

constructor(teamType,capacity){

this.teamType=teamType;

this.capacity=capacity;

}

move(){

console.log(this.teamType+" moving to disaster area");

}

rescueVictim(victim){

if(this.capacity>0 && victim.status==="Waiting"){

victim.status="Rescued";

this.capacity--;

}

}

}


// Resource Class
class Resource{

constructor(type,quantity){

this.type=type;

this.quantity=quantity;

}

allocate(){

if(this.quantity>0){
this.quantity--;
}

}

release(){

this.quantity++;

}

}


// Simulator Class
class Simulator{

constructor(){

this.victims=[];

this.rescueTeam=new RescueTeam("Emergency Team",3);

}

runSimulation(disasterType){

let disaster=new Disaster(disasterType,"High","City");

disaster.start();

this.victims=[];

for(let i=1;i<=5;i++){

this.victims.push(new Victim(i));

}

}

rescueProcess(){

this.victims.forEach(v=>{

this.rescueTeam.rescueVictim(v);

});

}

generateReport(){

let rescued=this.victims.filter(v=>v.status==="Rescued").length;

return{
total:this.victims.length,
rescued:rescued
};

}

}


// Global simulator object
let simulator=new Simulator();


// UI FUNCTIONS


function startSimulation(){

let disaster=document.getElementById("disasterType").value;

simulator.runSimulation(disaster);

displayVictims();

}


function displayVictims(){

let table=document.querySelector("#victimTable tbody");

table.innerHTML="";

simulator.victims.forEach(v=>{

let row=

`<tr>
<td>${v.id}</td>
<td>${v.healthStatus}</td>
<td>${v.priority}</td>
<td>${v.status}</td>
</tr>`;

table.innerHTML+=row;

});

}


function assignTeam(){

simulator.rescueProcess();

displayVictims();

}


function generateReport(){

let report=simulator.generateReport();

document.getElementById("report").innerHTML=

"Total Victims: "+report.total+
"<br>Rescued Victims: "+report.rescued;

}