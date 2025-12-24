import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

/* ================= FIREBASE ================= */
const firebaseConfig = {
  apiKey: "AIzaSyCGnqFDBgUcBkl4TA2HYe8U-enFtuzpW8I",
  authDomain: "mintuuu.firebaseapp.com",
  projectId: "mintuuu",
  messagingSenderId: "795208515782",
  appId: "1:795208515782:web:b6649939729ceb669197c7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ================= DOM ================= */
const loader = document.getElementById("loader");

/* Profile */
const saveProfile = document.getElementById("saveProfile");
const profilePic = document.getElementById("profilePic");
const profileName = document.getElementById("profileName");
const profileSubtitle = document.getElementById("profileSubtitle");

/* Socials */
const addSocial = document.getElementById("addSocial");
const socialName = document.getElementById("socialName");
const socialIcon = document.getElementById("socialIcon");
const socialUrl = document.getElementById("socialUrl");
const socialEnabled = document.getElementById("socialEnabled");
const socialList = document.getElementById("socialList");

/* Navigation */
const addNav = document.getElementById("addNav");
const navLabel = document.getElementById("navLabel");
const navUrl = document.getElementById("navUrl");
const navOrder = document.getElementById("navOrder");
const navNewTab = document.getElementById("navNewTab");
const navEnabled = document.getElementById("navEnabled");
const navList = document.getElementById("navList");

/* Posts */
const addPost = document.getElementById("addPost");
const postImage = document.getElementById("postImage");
const postCaption = document.getElementById("postCaption");
const postList = document.getElementById("postList");

/* ================= LOADER ================= */
const showLoader = () => loader?.classList.remove("hidden");
const hideLoader = () => loader?.classList.add("hidden");

/* ================= TABS ================= */
document.querySelectorAll(".sidebar button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.getElementById(btn.dataset.tab)?.classList.add("active");

    if (btn.dataset.tab === "tickets") loadTickets();
  };
});

/* ================= PROFILE ================= */
saveProfile.onclick = async () => {
  showLoader();
  await setDoc(doc(db, "profile", "main"), {
    profilePic: profilePic.value,
    name: profileName.value,
    subtitle: profileSubtitle.value
  });
  hideLoader();
};

/* ================= SOCIALS ================= */
addSocial.onclick = async () => {
  showLoader();
  await addDoc(collection(db, "socials"), {
    name: socialName.value,
    icon: socialIcon.value,
    url: socialUrl.value,
    enabled: socialEnabled.checked
  });
  socialName.value = socialIcon.value = socialUrl.value = "";
  socialEnabled.checked = true;
  loadSocials();
  hideLoader();
};

async function loadSocials() {
  socialList.innerHTML = "";
  const snap = await getDocs(collection(db, "socials"));
  snap.forEach(d => {
    const div = document.createElement("div");
    div.className = "list-item";
    div.innerHTML = `<span>${d.data().name}</span><button>Delete</button>`;
    div.querySelector("button").onclick = async () => {
      showLoader();
      await deleteDoc(doc(db, "socials", d.id));
      loadSocials();
      hideLoader();
    };
    socialList.appendChild(div);
  });
}
loadSocials();

/* ================= NAVIGATION ================= */
let editingNavId = null;

addNav.onclick = async () => {
  if (!navLabel.value || !navUrl.value) {
    alert("Label & URL required");
    return;
  }

  showLoader();

  const data = {
    label: navLabel.value,
    url: navUrl.value,
    order: Number(navOrder.value) || 999,
    newTab: navNewTab.checked,
    enabled: navEnabled.checked,
    createdAt: Date.now()
  };

  if (editingNavId) {
    await setDoc(doc(db, "navigation", editingNavId), data, { merge: true });
    editingNavId = null;
    addNav.innerText = "Add Menu";
  } else {
    await addDoc(collection(db, "navigation"), data);
  }

  navLabel.value = navUrl.value = navOrder.value = "";
  navNewTab.checked = true;
  navEnabled.checked = true;

  loadNav();
  hideLoader();
};

async function loadNav() {
  navList.innerHTML = "";
  showLoader();

  const snap = await getDocs(collection(db, "navigation"));
  const items = [];

  snap.forEach(d => {
    const n = d.data();
    items.push({ id: d.id, ...n, order: n.order ?? 999 });
  });

  items.sort((a, b) => a.order - b.order);

  items.forEach(n => {
    const div = document.createElement("div");
    div.className = "list-item";
    div.innerHTML = `
      <strong>${n.label}</strong> (Order: ${n.order})<br>
      <small>${n.url}</small><br>
      <button class="edit">Edit</button>
      <button class="danger">Delete</button>
    `;

    div.querySelector(".edit").onclick = () => {
      navLabel.value = n.label;
      navUrl.value = n.url;
      navOrder.value = n.order === 999 ? "" : n.order;
      navNewTab.checked = n.newTab;
      navEnabled.checked = n.enabled;
      editingNavId = n.id;
      addNav.innerText = "Update Menu";
    };

    div.querySelector(".danger").onclick = async () => {
      if (!confirm("Delete this menu?")) return;
      showLoader();
      await deleteDoc(doc(db, "navigation", n.id));
      loadNav();
      hideLoader();
    };

    navList.appendChild(div);
  });

  hideLoader();
}
loadNav();

/* ================= POSTS ================= */
addPost.onclick = async () => {
  showLoader();
  await addDoc(collection(db, "posts"), {
    imageUrl: postImage.value,
    caption: postCaption.value,
    createdAt: Date.now()
  });
  postImage.value = postCaption.value = "";
  loadPosts();
  hideLoader();
};

async function loadPosts() {
  postList.innerHTML = "";
  const snap = await getDocs(collection(db, "posts"));
  snap.forEach(d => {
    const div = document.createElement("div");
    div.className = "list-item";
    div.innerHTML = `<span>${d.data().caption}</span><button>Delete</button>`;
    div.querySelector("button").onclick = async () => {
      showLoader();
      await deleteDoc(doc(db, "posts", d.id));
      loadPosts();
      hideLoader();
    };
    postList.appendChild(div);
  });
}
loadPosts();

/* ================= TICKETS ADMIN ================= */

const ticketList = document.getElementById("ticketList");
const adminChat = document.getElementById("adminChat");
const adminMessages = document.getElementById("adminMessages");
const adminReply = document.getElementById("adminReply");
const sendAdminReply = document.getElementById("sendAdminReply");
const closeTicketBtn = document.getElementById("closeTicket");
const deleteTicketBtn = document.getElementById("deleteTicket");

let currentTicketId = null;
let unsubscribe = null;

async function loadTickets() {
  ticketList.innerHTML = "Loading...";
  const snap = await getDocs(
    query(collection(db, "tickets"), orderBy("createdAt", "desc"))
  );
  ticketList.innerHTML = "";

  snap.forEach(d => {
    const t = d.data();
    const div = document.createElement("div");
    div.className = "list-item";
    div.innerHTML = `
      <strong>${t.name}</strong><br>
      <small>Status: ${t.status}</small>
      <button>Open</button>
    `;
    div.querySelector("button").onclick = () => openTicket(d.id, t.status);
    ticketList.appendChild(div);
  });
}

function openTicket(id, status) {
  currentTicketId = id;
  adminChat.classList.remove("hidden");
  adminMessages.innerHTML = "";

  if (unsubscribe) unsubscribe();

  unsubscribe = onSnapshot(
    query(collection(db, "tickets", id, "messages"), orderBy("createdAt", "asc")),
    snap => {
      adminMessages.innerHTML = "";
      snap.forEach(d => {
        const m = d.data();
        const div = document.createElement("div");
        div.className = "message " + m.from;
        div.innerText = `${m.from}: ${m.text}`;
        adminMessages.appendChild(div);
      });
      adminMessages.scrollTop = adminMessages.scrollHeight;
    }
  );

  adminReply.disabled = status === "closed";
  sendAdminReply.disabled = status === "closed";
}

sendAdminReply.onclick = async () => {
  if (!currentTicketId || !adminReply.value.trim()) return;

  await addDoc(collection(db, "tickets", currentTicketId, "messages"), {
    from: "admin",
    text: adminReply.value.trim(),
    createdAt: serverTimestamp()
  });

  await updateDoc(doc(db, "tickets", currentTicketId), {
    status: "replied"
  });

  adminReply.value = "";
};

closeTicketBtn.onclick = async () => {
  if (!currentTicketId) return;
  await updateDoc(doc(db, "tickets", currentTicketId), {
    status: "closed",
    closedAt: serverTimestamp()
  });
  adminReply.disabled = true;
  sendAdminReply.disabled = true;
  alert("Ticket closed");
  loadTickets();
};

deleteTicketBtn.onclick = async () => {
  if (!currentTicketId) return;
  if (!confirm("Delete this ticket permanently?")) return;
  await deleteDoc(doc(db, "tickets", currentTicketId));
  adminChat.classList.add("hidden");
  currentTicketId = null;
  loadTickets();
};
