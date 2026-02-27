
const defaultProjects = [
  { id:1, title:"Mentor Sync", description:"Mentor-mentee takvim eşleştirme platformu.", term:"Güz 2024", category:"Web", status:"approved", tags:["React","Firebase"] },
  { id:2, title:"Mentor Pulse", description:"Haftalık memnuniyet ölçüm dashboard sistemi.", term:"Güz 2025", category:"Dashboard", status:"approved", tags:["Node","MongoDB"] },
  { id:3, title:"Mentor Connect", description:"Mentor-mentee eşleştirme algoritması.", term:"Bahar 2025", category:"Algoritma", status:"approved", tags:["Python","Machine Learning"] },
  { id:4, title:"Mentor Hub", description:"Mentor-mentee iletişim ve kaynak paylaşım platformu.", term:"Bahar 2024", category:"Web", status:"approved", tags:["Python","Node"] },
  { id:5, title:"Mentor Insights", description:"Mentor-mentee etkileşim analizi ve raporlama aracı.", term:"Güz 2024", category:"Analiz", status:"approved", tags:["Python","Data Analysis"] },
  { id:6, title:"Mentor Match", description:"Mentor-mentee eşleştirme uygulaması.", term:"Bahar 2025", category:"Mobil", status:"approved", tags:["Flutter","Firebase"] },
  { id:7, title:"Mentor Tracker", description:"Mentor-mentee ilerleme takip sistemi.", term:"Güz 2025", category:"Web", status:"pending", tags:["React","Node"] }, 
];

let storedProjects = JSON.parse(localStorage.getItem("projects")) || [];

defaultProjects.forEach(p => {
  if (!storedProjects.find(sp => sp.id === p.id)) {
    storedProjects.push(p);
  }
});

let projects = storedProjects;
localStorage.setItem("projects", JSON.stringify(projects));


const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";
let isAdmin = false;

const adminLoginBtn = document.getElementById("adminLoginBtn");

adminLoginBtn.addEventListener("click", () => {
  const username = document.getElementById("adminUsername").value;
  const password = document.getElementById("adminPassword").value;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    alert("Admin modu açıldı!");
    setAdminMode(true);
  } else {
    alert("Kullanıcı adı veya şifre yanlış!");
    setAdminMode(false);
  }
});


function setAdminMode(on) {
  isAdmin = on;

  if (on) {
    document.getElementById("adminLoginDiv").style.display = "none";

    if (!document.getElementById("adminLogoutBtn")) {
      const btn = document.createElement("button");
      btn.id = "adminLogoutBtn";
      btn.className = "primary-btn";
      btn.textContent = "Admin Modu Kapat";
      btn.style.marginLeft = "10px";
      btn.onclick = () => setAdminMode(false);

      document.querySelector(".navbar").appendChild(btn);
    }

  } else {
    document.getElementById("adminLoginDiv").style.display = "flex";

    const logoutBtn = document.getElementById("adminLogoutBtn");
    if (logoutBtn) logoutBtn.remove();
  }
  

  renderProjects();
  updateStats();
}



const projectGrid = document.getElementById("projectGrid");
const searchInput = document.getElementById("searchInput");
const tagFilters = document.getElementById("tagFilters");
const form = document.getElementById("projectForm");

let activeTag = "all";

function updateStats() {
  document.getElementById("totalProjects").textContent = projects.length;
  document.getElementById("pendingProjects").textContent =
    projects.filter(p => p.status === "pending").length;
  document.getElementById("totalTerms").textContent =
    new Set(projects.map(p => p.term)).size;
}

function renderProjects() {
  projectGrid.innerHTML = "";

  let filtered = projects.filter(project => {
    if (!isAdmin && project.status !== "approved") return false;

    const searchValue = searchInput.value.toLowerCase();

    const matchesSearch =
      project.title.toLowerCase().includes(searchValue) ||
      project.description.toLowerCase().includes(searchValue);

    const matchesTag =
      activeTag === "all" || project.tags.includes(activeTag);

    return matchesSearch && matchesTag;
  });

  if (filtered.length === 0) {
    projectGrid.innerHTML = "<p>Proje bulunamadı.</p>";
    return;
  }

  filtered.forEach(project => {
    const card = document.createElement("div");
    card.className = "project-card";

    let badgeHTML = `
      <div class="badge ${project.status}">
        ${project.status === "approved" ? "Onaylandı" : "Bekliyor"}
      </div>
    `;

    if (isAdmin) {
      badgeHTML += `
        <div style="margin-top:10px;">
          ${
            project.status === "pending"
              ? `<button onclick="approveProject(${project.id})"
                  class="primary-btn"
                  style="padding:5px 10px;font-size:12px;">
                  Onayla
                </button>`
              : ""
          }

          <button onclick="deleteProject(${project.id})"
            class="ghost-btn"
            style="padding:5px 10px;font-size:12px;margin-left:5px;">
            Sil
          </button>

          <button onclick="editProject(${project.id})"
            class="primary-btn"
            style="padding:5px 10px;font-size:12px;margin-left:5px;">
            Düzenle
          </button>
        </div>
      `;
    }

    card.innerHTML = `
      ${badgeHTML}
      ${project.image ? `<img src="${project.image}" class="project-image" />` : ""}
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <div class="meta">
        <span>${project.term}</span>
        <span>${project.category}</span>
        <span>${project.date || ""}</span>
      </div>
    `;      

    card.addEventListener("click", () => openModal(project.id));

    projectGrid.appendChild(card);
  });
}


function renderTags() {
  const allTags = new Set();

  projects.forEach(p => p.tags.forEach(tag => allTags.add(tag)));

  tagFilters.innerHTML = "";

  tagFilters.appendChild(createTagButton("all"));

  allTags.forEach(tag => {
    tagFilters.appendChild(createTagButton(tag));
  });
}

function createTagButton(tag) {
  const button = document.createElement("button");

  button.textContent = tag;
  button.className = tag === activeTag ? "active" : "";

  button.addEventListener("click", () => {
    activeTag = tag;
    renderTags();
    renderProjects();
  });

  return button;
}


searchInput.addEventListener("input", renderProjects);


form.addEventListener("submit", e => {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const term = document.getElementById("term").value;
  const category = document.getElementById("category").value;
  const projectDate = document.getElementById("projectDate").value;
  const tags = document.getElementById("tags").value
                .split(",")
                .map(t => t.trim());

  const imageFile = document.getElementById("imageFile").files[0];

  if (!imageFile) {
    alert("Lütfen bir görsel seç.");
    return;
  }

  const reader = new FileReader();

  reader.onload = function(event) {
    const newProject = {
  id: Date.now(),
  title,
  description,
  term,
  category,
  status: "pending",
  tags,
  date: projectDate,
  image: event.target.result
};

    projects.push(newProject);
    localStorage.setItem("projects", JSON.stringify(projects));

    updateStats();
    renderProjects();
    renderTags();
    form.reset();

    alert("Proje başarıyla gönderildi.");
  };

  reader.readAsDataURL(imageFile);
});
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

const modal = document.getElementById("projectModal");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const modalMeta = document.getElementById("modalMeta");
const closeModal = document.getElementById("closeModal");
const favoriteBtn = document.getElementById("favoriteBtn");

let currentProjectId = null;

function approveProject(id) {
  const project = projects.find(p => p.id === id);

  if (project) {
    project.status = "approved";
    localStorage.setItem("projects", JSON.stringify(projects));
    renderProjects();
    updateStats();
  }
}


function deleteProject(id) {
  if (!confirm("Projeyi silmek istediğine emin misin?")) return;

  projects = projects.filter(p => p.id !== id);
  localStorage.setItem("projects", JSON.stringify(projects));

  renderProjects();
  updateStats();
  renderTags();
}

function editProject(id) {
  const project = projects.find(p => p.id === id);
  if (!project) return;

  document.getElementById("title").value = project.title;
  document.getElementById("description").value = project.description;
  document.getElementById("term").value = project.term;
  document.getElementById("category").value = project.category;
  document.getElementById("tags").value = project.tags.join(",");

  projects = projects.filter(p => p.id !== id);
  localStorage.setItem("projects", JSON.stringify(projects));

  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth"
  });
}

renderTags();
renderProjects();
updateStats();