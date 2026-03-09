let victims=[];

function startSimulation(){

let disaster=document.getElementById("disasterType").value;

alert("Simulation started for "+disaster);

victims=[];

for(let i=1;i<=6;i++){

let priority=Math.random()>0.5?"Critical":"Normal";

victims.push({
id:i,
health:priority==="Critical"?"Severe":"Stable",
priority:priority,
status:"Waiting"
});

}

displayVictims();

}

function displayVictims(){

let table=document.querySelector("#victimTable tbody");

table.innerHTML="";

victims.forEach(v=>{

let row=`
<tr>
<td>${v.id}</td>
<td>${v.health}</td>
<td>${v.priority}</td>
<td>${v.status}</td>
</tr>
`;

table.innerHTML+=row;

});

}

function assignTeam(){

for(let v of victims){

if(v.status==="Waiting"){
v.status="Rescued";
break;
}

}

displayVictims();

}

function generateReport(){

let rescued=victims.filter(v=>v.status==="Rescued").length;

let total=victims.length;

document.getElementById("report").innerHTML=
`Total Victims: ${total}<br>Rescued Victims: ${rescued}`;

}