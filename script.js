// ===== DISASTER RESPONSE SIMULATOR - OOP IMPLEMENTATION =====
// Follow: Object-Oriented Software Engineering Lab Requirements

// ===== RESOURCE CLASS =====
class Resource {
  constructor(type, initialQuantity) {
    this.type = type;
    this.quantity = initialQuantity;
    this.maxQuantity = initialQuantity;
  }

  allocate(amount) {
    if (this.quantity >= amount) {
      this.quantity -= amount;
      return true;
    }
    return false;
  }

  release(amount) {
    this.quantity = Math.min(this.quantity + amount, this.maxQuantity);
  }

  getStatus() {
    return { type: this.type, quantity: this.quantity, maxQuantity: this.maxQuantity };
  }
}

// ===== VICTIM CLASS =====
class Victim {
  constructor(id, disasterType) {
    this.id = id;
    this.healthStatus = Math.random() > 0.4 ? "Severe" : "Stable";
    this.priority = this.healthStatus === "Severe" ? "Critical" : "Normal";
    this.status = "Waiting";
    this.location = "Zone " + Math.ceil(Math.random() * 3);
    this.lat = 0;
    this.lon = 0;
    this.injuryType = this.getInjuryByDisaster(disasterType);
    this.timeWaiting = 0;
  }

  getInjuryByDisaster(disasterType) {
    const injuries = {
      Fire: ["Burns", "Smoke Inhalation", "Fractures"],
      Flood: ["Drowning Risk", "Hypothermia", "Injuries"],
      Earthquake: ["Crush Injuries", "Fractures", "Internal Bleeding"],
      Accident: ["Trauma", "Lacerations", "Shock"]
    };
    const disasterInjuries = injuries[disasterType] || injuries["Accident"];
    return disasterInjuries[Math.floor(Math.random() * disasterInjuries.length)];
  }

  requestHelp() {
    return { victimId: this.id, priority: this.priority, location: this.location };
  }

  updateCondition() {
    this.timeWaiting++;
    if (this.timeWaiting > 5 && this.status === "Waiting") {
      this.priority = "Critical";
      this.healthStatus = "Severe";
    }
  }
}

// ===== RESCUE TEAM CLASS =====
class RescueTeam {
  constructor(id, teamType, capacity) {
    this.id = id;
    this.teamType = teamType;
    this.capacity = capacity;
    this.currentLoad = 0;
    this.status = "Available";
    this.resourcesUsed = {};
  }

  move(destination) {
    this.status = "Moving";
    return `Team ${this.id} moving to ${destination}`;
  }

  rescueVictim(victim, resourceManager) {
    if (this.currentLoad >= this.capacity) {
      return false;
    }

    let resourceNeeded = 1;
    if (victim.priority === "Critical") {
      resourceNeeded = 2;
    }

    if (resourceManager.allocateResource("medicalKit", resourceNeeded)) {
      victim.status = "Rescued";
      this.currentLoad++;
      this.resourcesUsed["medicalKit"] = (this.resourcesUsed["medicalKit"] || 0) + resourceNeeded;
      
      // Set team to Active status temporarily
      this.status = "Active";
      
      return true;
    }
    
    // If no resources, still mark as trying
    this.status = "Low Resources";
    return false;
  }

  getStatus() {
    return {
      id: this.id,
      teamType: this.teamType,
      status: this.status,
      load: `${this.currentLoad}/${this.capacity}`,
      resourcesUsed: this.resourcesUsed
    };
  }
}

// ===== DISASTER CLASS =====
class Disaster {
  constructor(type, severity, location) {
    this.type = type;
    this.severity = severity;
    this.location = location;
    this.startTime = new Date();
    this.isActive = false;
    this.victimCount = this.calculateVictimCount();
  }

  calculateVictimCount() {
    const severityMultiplier = { Low: 3, Medium: 8, High: 15 };
    return severityMultiplier[this.severity] || 8;
  }

  start() {
    this.isActive = true;
    return `Disaster started: ${this.type} (${this.severity}) at ${this.location}`;
  }

  update() {
    return {
      type: this.type,
      severity: this.severity,
      isActive: this.isActive,
      duration: Math.floor((new Date() - this.startTime) / 1000)
    };
  }
}

// ===== RESOURCE MANAGER CLASS =====
class ResourceManager {
  constructor() {
    this.resources = {
      medicalKit: new Resource("Medical Kit", 20),
      ambulance: new Resource("Ambulance", 5),
      boat: new Resource("Boat", 3),
      helicopter: new Resource("Helicopter", 2)
    };
  }

  allocateResource(resourceType, amount) {
    if (this.resources[resourceType]) {
      return this.resources[resourceType].allocate(amount);
    }
    return false;
  }

  releaseResource(resourceType, amount) {
    if (this.resources[resourceType]) {
      this.resources[resourceType].release(amount);
    }
  }

  getAllResources() {
    const status = {};
    for (let key in this.resources) {
      status[key] = this.resources[key].getStatus();
    }
    return status;
  }
}

// ===== ADMIN CLASS =====
class Admin {
  constructor() {
    this.rescueTeams = [];
    this.assignedTasks = [];
  }

  assignRescueTeam(team, victim) {
    this.assignedTasks.push({ team, victim, timestamp: new Date() });
    return `Team ${team.id} assigned to rescue victim ${victim.id}`;
  }

  generateReport(simulation) {
    const totalVictims = simulation.victims.length;
    const rescued = simulation.victims.filter(v => v.status === "Rescued").length;
    const waiting = simulation.victims.filter(v => v.status === "Waiting").length;
    const rescueRate = ((rescued / totalVictims) * 100).toFixed(2);

    return {
      disasterInfo: {
        type: simulation.disaster.type,
        severity: simulation.disaster.severity,
        location: simulation.disaster.location
      },
      victimStatistics: {
        total: totalVictims,
        rescued: rescued,
        waiting: waiting,
        rescueRate: rescueRate + "%"
      },
      criticality: {
        critical: simulation.victims.filter(v => v.priority === "Critical").length,
        normal: simulation.victims.filter(v => v.priority === "Normal").length
      },
      teamPerformance: simulation.rescueTeams.map(t => t.getStatus()),
      timestamp: new Date().toLocaleString()
    };
  }

  sendNotification(message) {
    console.log("[NOTIFICATION] " + message);
  }
}

// ===== SIMULATOR CLASS =====
class Simulator {
  constructor() {
    this.disaster = null;
    this.victims = [];
    this.rescueTeams = [];
    this.resourceManager = new ResourceManager();
    this.admin = new Admin();
    this.map = null;
    this.markerLayer = null;
    this.isRunning = false;
    this.simulationInterval = null;
    this.disasterLat = 17.6868;
    this.disasterLon = 83.2185;
  }

  initializeMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error('Map element not found');
      return;
    }
    
    this.map = L.map('map').setView([this.disasterLat, this.disasterLon], 12);
    this.map.invalidateSize();
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);
    this.markerLayer = L.layerGroup().addTo(this.map);

    this.map.on("click", (e) => {
      this.disasterLat = e.latlng.lat;
      this.disasterLon = e.latlng.lng;
      this.markerLayer.clearLayers();
      L.marker([this.disasterLat, this.disasterLon])
        .addTo(this.markerLayer)
        .bindPopup("Selected Disaster Location")
        .openPopup();
    });
  }

  createVictims() {
    this.victims = [];
    const victimCount = this.disaster.victimCount;

    for (let i = 1; i <= victimCount; i++) {
      let victim = new Victim(i, this.disaster.type);
      victim.lat = this.disasterLat + (Math.random() - 0.5) * 0.02;
      victim.lon = this.disasterLon + (Math.random() - 0.5) * 0.02;
      this.victims.push(victim);

      const color = victim.priority === "Critical" ? "red" : "green";
      L.circleMarker([victim.lat, victim.lon], {
        radius: 6,
        color: color,
        fillColor: color,
        fillOpacity: 0.7
      }).addTo(this.markerLayer);
    }
  }

  createRescueTeams() {
    this.rescueTeams = [];
    const teamTypes = ["Medical", "Fire", "Search & Rescue", "Water Rescue"];
    const teamCount = Math.ceil(this.disaster.victimCount / 5);

    for (let i = 1; i <= teamCount; i++) {
      const team = new RescueTeam(i, teamTypes[i % teamTypes.length], 5);
      this.rescueTeams.push(team);
    }
  }

  runSimulation(disasterType, severity) {
    if (this.isRunning) return;

    this.disaster = new Disaster(disasterType, severity, "Disaster Zone");
    this.disaster.start();
    
    this.markerLayer.clearLayers();
    L.marker([this.disasterLat, this.disasterLon])
      .addTo(this.markerLayer)
      .bindPopup("Disaster Location")
      .openPopup();

    this.createVictims();
    this.createRescueTeams();
    this.isRunning = true;

    document.getElementById("disasters").innerText = 1;
    document.getElementById("victimsCount").innerText = this.victims.length;
    document.getElementById("teams").innerText = this.rescueTeams.length;

    this.displayVictims();
    this.displayRescueTeams();
    this.updateResourcesDisplay();
    this.startRescueOperations();
  }

  startRescueOperations() {
    const operationSpeed = 2000; // 2 seconds between operations
    let operationCount = 0;

    this.simulationInterval = setInterval(() => {
      if (!this.isRunning || this.victims.length === 0) {
        clearInterval(this.simulationInterval);
        this.isRunning = false;
        this.finalizeSimulation();
        return;
      }

      const waitingVictims = this.victims.filter(v => v.status === "Waiting");

      if (waitingVictims.length === 0) {
        clearInterval(this.simulationInterval);
        this.isRunning = false;
        this.finalizeSimulation();
        return;
      }

      // Sort by priority - Critical first
      const victim = waitingVictims.sort((a, b) => {
        if (a.priority === "Critical" && b.priority !== "Critical") return -1;
        if (a.priority !== "Critical" && b.priority === "Critical") return 1;
        return 0;
      })[0];

      // Find an available team with capacity
      let teamAssigned = null;
      for (let i = 0; i < this.rescueTeams.length; i++) {
        const team = this.rescueTeams[i];
        if (team.currentLoad < team.capacity) {
          teamAssigned = team;
          break;
        }
      }

      if (!teamAssigned) {
        console.warn("No teams available with capacity");
        operationCount++;
        return;
      }

      // Try to rescue the victim
      const rescued = teamAssigned.rescueVictim(victim, this.resourceManager);
      
      if (rescued) {
        this.admin.assignRescueTeam(teamAssigned, victim);
        console.log(`Operation #${++operationCount}: Team ${teamAssigned.id} rescued victim ${victim.id} (Priority: ${victim.priority})`);
      } else {
        console.warn(`Operation #${++operationCount}: Team ${teamAssigned.id} couldn't rescue victim ${victim.id} (Insufficient resources)`);
      }

      victim.updateCondition();

      // Update UI
      const totalRescued = this.victims.filter(v => v.status === "Rescued").length;
      const progress = Math.floor((totalRescued / this.victims.length) * 100);
      document.getElementById("progress").innerText = progress + "%";

      // Reset team status to Available after a short delay
      setTimeout(() => {
        if (teamAssigned.status !== "Available") {
          teamAssigned.status = "Available";
          this.displayRescueTeams();
        }
      }, 1500);

      this.displayVictims();
      this.displayRescueTeams();
      this.updateResourcesDisplay();
      
    }, operationSpeed);
  }

  displayVictims() {
    const table = document.getElementById("victimTable");
    if (!table) return;
    
    table.innerHTML = "";
    this.victims.forEach(v => {
      table.innerHTML += `
        <tr>
          <td>${v.id}</td>
          <td>${v.healthStatus}</td>
          <td>${v.location}</td>
          <td style="color:${v.priority === "Critical" ? "#ef4444" : "#86efac"}">${v.priority}</td>
          <td style="color:${v.status === "Rescued" ? "#86efac" : "#fbbf24"}">${v.status}</td>
          <td>${v.injuryType}</td>
        </tr>
      `;
    });
  }

  displayRescueTeams() {
    const container = document.getElementById("teamsContainer");
    if (!container) return;

    container.innerHTML = "";

    this.rescueTeams.forEach(team => {
      const statusColor = team.status === "Available" ? "#86efac" : team.status === "Active" ? "#2563eb" : "#fbbf24";
      
      container.innerHTML += `
        <div class="team-card">
          <h4>Team ${team.id}</h4>
          <p><strong>Type:</strong> ${team.teamType}</p>
          <p><strong>Capacity:</strong> <span style="background: rgba(37,99,235,0.2); padding: 2px 8px; border-radius: 4px;">${team.currentLoad}/${team.capacity}</span></p>
          <p style="color:${statusColor}"><strong>Status:</strong> ${team.status}</p>
          <p><strong>Medical Kits Used:</strong> <span style="background: #ef4444; padding: 2px 6px; border-radius: 3px; font-weight: bold;">${team.resourcesUsed["medicalKit"] || 0}</span></p>
        </div>
      `;
    });
  }

  updateResourcesDisplay() {
    const resourcesContainer = document.getElementById("resourcesContainer");
    if (!resourcesContainer) return;

    const allResources = this.resourceManager.getAllResources();
    resourcesContainer.innerHTML = "";

    for (let resourceType in allResources) {
      const res = allResources[resourceType];
      const percentage = (res.quantity / res.maxQuantity) * 100;
      const barColor = percentage > 50 ? "#10b981" : percentage > 25 ? "#f59e0b" : "#ef4444";

      resourcesContainer.innerHTML += `
        <div class="resource-item">
          <div class="resource-header">
            <h4>${res.type}</h4>
            <span>${res.quantity}/${res.maxQuantity}</span>
          </div>
          <div class="resource-bar">
            <div class="resource-fill" style="width:${percentage}%;background-color:${barColor}"></div>
          </div>
        </div>
      `;
    }
  }

  generateCharts() {
    const critical = this.victims.filter(v => v.priority === "Critical").length;
    const normal = this.victims.length - critical;
    const rescued = this.victims.filter(v => v.status === "Rescued").length;
    const waiting = this.victims.filter(v => v.status === "Waiting").length;

    // Only generate if page is visible
    const victimCanv = document.getElementById("victimChart");
    const statusCanv = document.getElementById("statusChart");
    
    if (!victimCanv || !statusCanv) return;
    
    // Check if charts are visible (on dashboard)
    const isVisible = document.getElementById("dashboard") && !document.getElementById("dashboard").classList.contains("hidden");
    
    if (!isVisible) return; // Don't render if not visible

    if (window.victimChart) {
      window.victimChart.destroy();
      window.victimChart = null;
    }
    if (window.statusChart) {
      window.statusChart.destroy();
      window.statusChart = null;
    }

    try {
      window.victimChart = new Chart(victimCanv, {
        type: "doughnut",
        data: {
          labels: ["Critical", "Normal"],
          datasets: [{
            data: [critical, normal],
            backgroundColor: ["#ef4444", "#10b981"],
            borderColor: ["#dc2626", "#059669"],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              labels: {
                color: "white",
                font: { size: 12, weight: "600" }
              }
            }
          }
        }
      });
    } catch (e) {
      console.error("Error creating victim chart:", e);
    }

    try {
      window.statusChart = new Chart(statusCanv, {
        type: "bar",
        data: {
          labels: ["Rescued", "Waiting"],
          datasets: [{
            label: "Victim Count",
            data: [rescued, waiting],
            backgroundColor: ["#10b981", "#fbbf24"],
            borderColor: ["#059669", "#d97706"],
            borderWidth: 2,
            borderRadius: 6
          }]
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              labels: {
                color: "white",
                font: { size: 11, weight: "600" }
              }
            }
          },
          scales: {
            y: {
              ticks: {
                color: "white",
                font: { size: 11, weight: "600" }
              },
              grid: {
                display: false
              }
            },
            x: {
              ticks: {
                color: "white",
                font: { size: 11, weight: "600" }
              },
              grid: {
                color: "rgba(51, 65, 85, 0.3)"
              },
              beginAtZero: true
            }
          }
        }
      });
    } catch (e) {
      console.error("Error creating status chart:", e);
    }
  }

  finalizeSimulation() {
    const report = this.admin.generateReport(this);
    sessionStorage.setItem("simulationReport", JSON.stringify(report));
    
    // Show button with a notification
    const btn = document.getElementById("generateReportBtn");
    if (btn) {
      btn.style.display = "block";
    }
    
    // Create and show notification
    this.showNotification("✅ Simulation Complete!", "Click 'Generate Full Report' in the Reports page to view detailed results.");
  }

  showNotification(title, message) {
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      padding: 20px 25px;
      border-radius: 10px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      font-weight: 600;
      animation: slideInRight 0.4s ease-out;
      max-width: 350px;
    `;
    
    notification.innerHTML = `<div style="font-size: 16px; margin-bottom: 5px;">${title}</div><div style="font-size: 13px; opacity: 0.9;">${message}</div>`;
    
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes slideInRight {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  stopSimulation() {
    this.isRunning = false;
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
  }
}

// ===== GLOBAL SIMULATOR INSTANCE =====
let simulator = new Simulator();

// ===== UI FUNCTIONS =====
window.addEventListener('load', function() {
  console.log('Page loaded, initializing map...');
  console.log('Leaflet available:', typeof L !== 'undefined');
  console.log('Map element:', document.getElementById('map'));
  
  setTimeout(() => {
    try {
      simulator.initializeMap();
      console.log('Map initialized successfully');
      setTimeout(() => {
        if (simulator.map) {
          simulator.map.invalidateSize();
          console.log('Map size invalidated');
        }
      }, 200);
    } catch (e) {
      console.error('Error initializing map:', e);
    }
  }, 100);
});

function showPage(page, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  document.querySelectorAll(".page").forEach(p => {
    p.classList.add("hidden");
  });
  document.getElementById(page).classList.remove("hidden");

  document.querySelectorAll(".sidebar li").forEach(li => {
    li.classList.remove("active");
  });
  
  if (event && event.target) {
    event.target.classList.add("active");
  }

  if (page === "dashboard") {
    setTimeout(() => { if (simulator.map) simulator.map.invalidateSize(); }, 200);
  }
}

function startSimulation() {
  if (simulator.isRunning) {
    alert("⚠️ Simulation already running!");
    return;
  }
  
  const disasterType = document.getElementById("disasterSelect").value;
  const severity = document.getElementById("severitySelect").value;

  if (!disasterType || !severity) {
    alert("❌ Please select disaster type and severity");
    return;
  }

  simulator.runSimulation(disasterType, severity);
}

function stopSimulation() {
  simulator.stopSimulation();
  alert("⏸️ Simulation stopped");
}

function generateReport() {
  // First, navigate to the reports page
  document.querySelectorAll(".page").forEach(p => {
    p.classList.add("hidden");
  });
  const reportsPage = document.getElementById("reports");
  reportsPage.classList.remove("hidden");

  // Update sidebar navigation
  document.querySelectorAll(".sidebar li").forEach(li => {
    li.classList.remove("active");
  });
  
  // Find and highlight Reports link (it's the 4th item)
  const sidebarItems = document.querySelectorAll(".sidebar li");
  if (sidebarItems.length >= 4) {
    sidebarItems[3].classList.add("active");
  }

  // Get report from sessionStorage
  const reportData = sessionStorage.getItem("simulationReport");
  
  if (!reportData) {
    document.getElementById("reportContent").innerHTML = "<p style='color: #fca5a5; font-size: 16px; text-align: center; padding: 40px;'>❌ No simulation report available. Please run a simulation first.</p>";
    document.getElementById("generateReportBtn").style.display = "none";
    return;
  }

  try {
    const report = JSON.parse(reportData);
    
    // Recreate charts after page is visible
    setTimeout(() => {
      createReportCharts(report);
    }, 100);
    
    let reportHTML = `
      <div class="report-container">
        <h2>📋 Disaster Response Report</h2>
        
        <section class="report-section">
          <h3>Disaster Information</h3>
          <table class="report-table">
            <tr><td><strong>Type:</strong></td><td>${report.disasterInfo.type}</td></tr>
            <tr><td><strong>Severity:</strong></td><td>${report.disasterInfo.severity}</td></tr>
            <tr><td><strong>Location:</strong></td><td>${report.disasterInfo.location}</td></tr>
          </table>
        </section>

        <section class="report-section">
          <h3>Victim Statistics</h3>
          <table class="report-table">
            <tr><td><strong>Total Victims:</strong></td><td>${report.victimStatistics.total}</td></tr>
            <tr><td><strong>Rescued:</strong></td><td style="color:#10b981;font-weight:bold;">${report.victimStatistics.rescued}</td></tr>
            <tr><td><strong>Still Waiting:</strong></td><td style="color:#fbbf24;font-weight:bold;">${report.victimStatistics.waiting}</td></tr>
            <tr><td><strong>Rescue Rate:</strong></td><td style="color:#2563eb;font-weight:bold;font-size:16px;">${report.victimStatistics.rescueRate}</td></tr>
          </table>
        </section>

        <section class="report-section">
          <h3>Priority Breakdown</h3>
          <table class="report-table">
            <tr><td><strong>Critical Cases:</strong></td><td style="color:#ef4444;font-weight:bold;">${report.criticality.critical}</td></tr>
            <tr><td><strong>Normal Cases:</strong></td><td style="color:#10b981;font-weight:bold;">${report.criticality.normal}</td></tr>
          </table>
        </section>

        <section class="report-section">
          <h3>Team Performance</h3>
          <table class="report-table">
            <thead>
              <tr><th>Team ID</th><th>Type</th><th>Rescued</th><th>Medical Kits Used</th></tr>
            </thead>
            <tbody>
    `;

    report.teamPerformance.forEach(team => {
      reportHTML += `
        <tr>
          <td>Team ${team.id}</td>
          <td>${team.teamType}</td>
          <td>${team.load}</td>
          <td>${team.resourcesUsed.medicalKit || 0}</td>
        </tr>
      `;
    });

    reportHTML += `
            </tbody>
          </table>
        </section>

        <section class="report-section">
          <p><strong>Generated:</strong> ${report.timestamp}</p>
        </section>

        <div style="display: flex; gap: 15px; margin-top: 30px;">
          <button class="btn-primary" onclick="downloadReport()">📥 Download Report</button>
          <button class="btn-secondary" onclick="printReport()">🖨️ Print Report</button>
        </div>
      </div>
    `;

    document.getElementById("reportContent").innerHTML = reportHTML;
    document.getElementById("reportContent").style.display = "block";
    document.getElementById("generateReportBtn").style.display = "none";
    
  } catch (error) {
    console.error("Error generating report:", error);
    document.getElementById("reportContent").innerHTML = "<p style='color: #fca5a5;'>⚠️ Error generating report. Please try again.</p>";
  }
}

function createReportCharts(report) {
  const critical = report.criticality.critical;
  const normal = report.criticality.normal;
  const rescued = report.victimStatistics.rescued;
  const waiting = report.victimStatistics.waiting;

  // Destroy existing charts
  if (window.reportVictimChart) {
    window.reportVictimChart.destroy();
    window.reportVictimChart = null;
  }
  if (window.reportStatusChart) {
    window.reportStatusChart.destroy();
    window.reportStatusChart = null;
  }

  // Create Victim Priority Chart (Doughnut)
  const victimCanv = document.getElementById("victimChart");
  if (victimCanv && victimCanv.offsetParent !== null) {
    try {
      window.reportVictimChart = new Chart(victimCanv, {
        type: "doughnut",
        data: {
          labels: ["🔴 Critical", "🟢 Normal"],
          datasets: [{
            data: [critical, normal],
            backgroundColor: ["#ef4444", "#10b981"],
            borderColor: ["#fca5a5", "#86efac"],
            borderWidth: 3,
            hoverBorderWidth: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: "white",
                font: { size: 14, weight: "bold" },
                padding: 20
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return context.label + ": " + context.parsed + " victims";
                }
              }
            }
          }
        }
      });
      console.log("✅ Victim chart created");
    } catch (e) {
      console.error("Error creating victim chart:", e);
    }
  }

  // Create Status Chart (Bar)
  const statusCanv = document.getElementById("statusChart");
  if (statusCanv && statusCanv.offsetParent !== null) {
    try {
      window.reportStatusChart = new Chart(statusCanv, {
        type: "bar",
        data: {
          labels: ["Rescued ✅", "Waiting ⏳"],
          datasets: [{
            label: "Victim Count",
            data: [rescued, waiting],
            backgroundColor: ["#10b981", "#fbbf24"],
            borderColor: ["#059669", "#d97706"],
            borderWidth: 2,
            borderRadius: 8,
            hoverBackgroundColor: ["#06b6d4", "#f97316"]
          }]
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              labels: {
                color: "white",
                font: { size: 13, weight: "bold" }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return context.dataset.label + ": " + context.parsed.x + " victims";
                }
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: "white",
                font: { size: 12, weight: "bold" }
              },
              grid: {
                color: "rgba(51, 65, 85, 0.3)"
              },
              beginAtZero: true
            },
            y: {
              ticks: {
                color: "white",
                font: { size: 12, weight: "bold" }
              },
              grid: {
                display: false
              }
            }
          }
        }
      });
      console.log("✅ Status chart created");
    } catch (e) {
      console.error("Error creating status chart:", e);
    }
  }
}

function downloadReport() {
  const reportData = sessionStorage.getItem("simulationReport");
  
  if (!reportData) {
    alert("❌ No report available to download");
    return;
  }

  try {
    const report = JSON.parse(reportData);
    const reportText = `
╔════════════════════════════════════════════════╗
║  DISASTER RESPONSE SIMULATION REPORT           ║
║  Generated: ${report.timestamp}
╚════════════════════════════════════════════════╝

📍 DISASTER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type:       ${report.disasterInfo.type}
Severity:   ${report.disasterInfo.severity}
Location:   ${report.disasterInfo.location}

👥 VICTIM STATISTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Victims:  ${report.victimStatistics.total}
Rescued:        ${report.victimStatistics.rescued}
Still Waiting:  ${report.victimStatistics.waiting}
Rescue Rate:    ${report.victimStatistics.rescueRate}

🚨 PRIORITY BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Critical Cases:  ${report.criticality.critical}
Normal Cases:    ${report.criticality.normal}

🚑 TEAM PERFORMANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;

    report.teamPerformance.forEach(team => {
      reportText += `\nTeam ${team.id} (${team.teamType}):
  - Rescued: ${team.load}
  - Medical Kits Used: ${team.resourcesUsed.medicalKit || 0}`;
    });

    reportText += `\n\n════════════════════════════════════════════════\n`;

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(reportText));
    element.setAttribute("download", `Disaster_Report_${new Date().getTime()}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    console.log("✅ Report downloaded successfully");
  } catch (error) {
    console.error("Error downloading report:", error);
    alert("❌ Error downloading report");
  }
}

function printReport() {
  try {
    const reportData = sessionStorage.getItem("simulationReport");
    if (!reportData) {
      alert("❌ No report available to print");
      return;
    }
    
    window.print();
  } catch (error) {
    console.error("Error printing report:", error);
    alert("❌ Error printing report");
  }
}