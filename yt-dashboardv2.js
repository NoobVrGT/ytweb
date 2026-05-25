/* ===========================
   YOUTUBE CONFIG
=========================== */
const API_KEY = "AIzaSyCNqJ_D43hDWST0qfBYgPleuv68UZKJNM8"; 
const CHANNEL_ID = "UCX3mH5JteWkLzXfD1CiXSqA";

/* ===========================
   PAGE LOADER + FADE
=========================== */
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");

  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const href = link.getAttribute("href");
      document.body.classList.remove("fade-in");
      document.body.classList.add("fade-out");
      setTimeout(() => window.location.href = href, 220);
    });
  });

  initPage();
});

/* ===========================
   PAGE DETECTOR
=========================== */
function initPage() {
  const page = document.body.dataset.page;

  if (page === "dashboard") initDashboard();
  if (page === "recent") initRecent();
  if (page === "videos") initVideos();
  if (page === "subscribers") initSubscribers();
}

/* ===========================
   TIME AGO HELPER
=========================== */
function timeAgo(dateStr) {
  const ts = new Date(dateStr).getTime();
  const diff = (Date.now() - ts) / 1000;

  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + " minutes ago";
  if (diff < 86400) return Math.floor(diff / 3600) + " hours ago";
  return Math.floor(diff / 86400) + " days ago";
}

/* ===========================
   FETCH CHANNEL DETAILS
=========================== */
async function fetchChannel() {
  const url =
    `https://www.googleapis.com/youtube/v3/channels?` +
    `part=snippet,statistics,contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();
  return data.items?.[0];
}

/* ===========================
   FETCH PLAYLIST ITEMS
=========================== */
async function fetchPlaylistItems(playlistId, max = 50) {
  const url =
    `https://www.googleapis.com/youtube/v3/playlistItems?` +
    `part=snippet&playlistId=${playlistId}&maxResults=${max}&key=${API_KEY}`;

  const res = await fetch(url);
  return res.json();
}

/* ===========================
   FETCH VIDEO DETAILS
=========================== */
async function fetchVideoDetails(videoIds) {
  const url =
    `https://www.googleapis.com/youtube/v3/videos?` +
    `part=snippet,statistics&id=${videoIds.join(",")}&key=${API_KEY}`;

  const res = await fetch(url);
  return res.json();
}

/* ===========================
   DASHBOARD PAGE
=========================== */
async function initDashboard() {
  const channel = await fetchChannel();
  if (!channel) return;

  const stats = channel.statistics;
  const snippet = channel.snippet;
  const uploadsId = channel.contentDetails.relatedPlaylists.uploads;

  /* Live Subscribers */
  const subEl = document.getElementById("subCount");
  if (subEl) subEl.textContent = Number(stats.subscriberCount).toLocaleString();

  /* Summary */
  const viewsEl = document.getElementById("summaryViews");
  const vidsEl = document.getElementById("summaryVideos");
  const createdEl = document.getElementById("summaryCreated");

  if (viewsEl) viewsEl.textContent = `Total views: ${Number(stats.viewCount).toLocaleString()}`;
  if (vidsEl) vidsEl.textContent = `Total videos: ${Number(stats.videoCount).toLocaleString()}`;
  if (createdEl) {
    const created = new Date(snippet.publishedAt);
    createdEl.textContent = `Channel created: ${created.toLocaleDateString("en-US")}`;
  }

  /* Latest Upload */
  const uploads = await fetchPlaylistItems(uploadsId, 1);
  const item = uploads.items?.[0]?.snippet;

  if (item) {
    const title = item.title;
    const thumb = item.thumbnails.medium.url;
    const published = item.publishedAt;

    if (document.getElementById("latestTitle"))
      document.getElementById("latestTitle").textContent = title;

    if (document.getElementById("latestThumb"))
      document.getElementById("latestThumb").src = thumb;

    if (document.getElementById("latestDate"))
      document.getElementById("latestDate").textContent =
        "Published: " + new Date(published).toLocaleDateString("en-US");

    if (document.getElementById("latestAgo"))
      document.getElementById("latestAgo").textContent = timeAgo(published);
  }

  /* Auto-refresh subs */
  setInterval(async () => {
    const c = await fetchChannel();
    if (c && document.getElementById("subCount")) {
      document.getElementById("subCount").textContent =
        Number(c.statistics.subscriberCount).toLocaleString();
    }
  }, 60000);
}

/* ===========================
   RECENT PAGE
=========================== */
async function initRecent() {
  const channel = await fetchChannel();
  const uploadsId = channel.contentDetails.relatedPlaylists.uploads;

  const uploads = await fetchPlaylistItems(uploadsId, 1);
  const item = uploads.items?.[0]?.snippet;

  if (!item) return;

  const title = item.title;
  const published = item.publishedAt;

  if (document.getElementById("recentLastTitle"))
    document.getElementById("recentLastTitle").textContent = title;

  if (document.getElementById("recentLastDate"))
    document.getElementById("recentLastDate").textContent =
      "Date: " + new Date(published).toLocaleDateString("en-US");

  if (document.getElementById("recentLastAgo"))
    document.getElementById("recentLastAgo").textContent =
      "(" + timeAgo(published) + ")";
}

/* ===========================
   VIDEOS PAGE
=========================== */
async function initVideos() {
  const channel = await fetchChannel();
  const uploadsId = channel.contentDetails.relatedPlaylists.uploads;

  const uploads = await fetchPlaylistItems(uploadsId, 50);
  const grid = document.getElementById("videoGrid");

  if (!grid) return;

  grid.innerHTML = "";

  uploads.items.forEach(item => {
    const s = item.snippet;

    const div = document.createElement("div");
    div.className = "video-card";

    div.innerHTML = `
      <img src="${s.thumbnails.medium.url}">
      <div class="video-title">${s.title}</div>
      <div class="muted">${new Date(s.publishedAt).toLocaleDateString("en-US")}</div>
    `;

    grid.appendChild(div);
  });
}

/* ===========================
   SUBSCRIBERS PAGE
=========================== */
async function initSubscribers() {
  const list = document.getElementById("subscriberList");
  if (!list) return;

  list.innerHTML = `
    <li class="muted">YouTube no longer provides public subscriber lists.</li>
    <li class="muted">OAuth required — coming soon.</li>
  `;
}






/* ============================
   LIVE SUB COUNTER (ODOMETER)
   ============================ */
const apiKey = "AIzaSyCNqJ_D43hDWST0qfBYgPleuv68UZKJNM8"; 
const channelId = "UCX3mH5JteWkLzXfD1CiXSqA";

let currentSubs = 0;

function flashSubIncrease() {
  const el = document.getElementById("subCount");
  el.classList.add("flash");
  setTimeout(() => el.classList.remove("flash"), 300);
}

function checkMilestoneOdo(subs) {
  const milestones = [1000, 10000, 100000, 1000000, 10000000];
  const milestoneText = document.getElementById("milestoneText");

  for (let m of milestones) {
    if (currentSubs < m && subs >= m) {
      milestoneText.textContent = `🎉 Milestone reached: ${m.toLocaleString()} subscribers!`;
      setTimeout(() => milestoneText.textContent = "", 3000);
    }
  }
}

async function updateSubsOdo() {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const subs = Number(data.items[0].statistics.subscriberCount);

    const el = document.getElementById("subCount");
    if (!el) return;

    if (subs !== currentSubs) {
      el.innerHTML = subs;          // Odometer animates this change
      if (subs > currentSubs) {
        flashSubIncrease();
        checkMilestoneOdo(subs);
      }
      currentSubs = subs;
    }
  } catch (e) {
    console.error("Error fetching subs:", e);
  }
}

//setInterval(updateSubsOdo, 2000);
updateSubsOdo();

/* ============================
   ADD ONE BUTTON (TEST)
   ============================ */

const addOneBtn = document.getElementById("addOneBtn");
if (addOneBtn) {
  addOneBtn.addEventListener("click", () => {
    const el = document.getElementById("subCount");
    if (!el) return;

    const newValue = currentSubs + 1;
    el.innerHTML = newValue;   // Odometer animates
    flashSubIncrease();
    checkMilestoneOdo(newValue);
    currentSubs = newValue;
  });
}


/* ============================
   GOOGLE OAUTH LOGIN
   ============================ */

const OAUTH_CLIENT_ID = "1065908217691-07lovtuj33ba0ual9768gtq71khohnt7.apps.googleusercontent.com";
const OAUTH_REDIRECT = "http://127.0.0.1:5500/YTweb%20V.20/oauth2callback.html";
const OAUTH_SCOPE = "openid email profile https://www.googleapis.com/auth/youtube.readonly";


document.getElementById("loginBtn")?.addEventListener("click", () => {
  const url =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    `?client_id=${encodeURIComponent(OAUTH_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(OAUTH_REDIRECT)}` +
    "&response_type=token" +
    `&scope=${encodeURIComponent(OAUTH_SCOPE)}` +
    "&include_granted_scopes=true";

  window.location.href = url;
});

/* Handle OAuth redirect */
if (window.location.hash.includes("access_token")) {
  const params = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = params.get("access_token");

  console.log("OAuth Token:", accessToken);

  // Save token for API calls
  localStorage.setItem("yt_oauth_token", accessToken);

  // Redirect back to dashboard
  window.location.href = "dashboardv2.html";
}

async function loadUserInfo() {
  const token = localStorage.getItem("yt_oauth_token");
  console.log("Token:", token);

  if (!token) {
    console.log("No token found");
    return;
  }

  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: "Bearer " + token }
  });

  const data = await res.json();
  console.log("UserInfo:", data);

  const emailEl = document.getElementById("userEmail");
  if (emailEl) emailEl.textContent = data.email || "No email returned";
}







async function loadPrivateSubscribers() {
  const token = localStorage.getItem("yt_oauth_token");
  console.log("Token:", token);

  if (!token) {
    console.log("No token found");
    return;
  }

  const res = await fetch(
    "https://www.googleapis.com/youtube/v3/subscriptions?part=subscriberSnippet&mySubscribers=true&maxResults=50",
    {
      headers: { Authorization: "Bearer " + token }
    }
  );

  const data = await res.json();
  console.log("Subscribers API:", data);

  const list = document.getElementById("subscriberList");
  if (!list) return;

  if (!data.items) {
    list.innerHTML = `<li>No subscribers returned</li>`;
    return;
  }

  list.innerHTML = "";
  data.items.forEach(sub => {
    const s = sub.subscriberSnippet;
    list.innerHTML += `
      <li>
        <img src="${s.thumbnails.default.url}" width="32" height="32">
        ${s.title}
      </li>
    `;
  });
}

function updateLoginButtonState() {
  const btn = document.getElementById("loginBtn");
  const token = localStorage.getItem("yt_oauth_token");

  if (!btn) return;

  if (token) {
    // Logged in
    btn.textContent = "Logout";
    btn.classList.add("logged-in");
    btn.style.background = "#34A853"; // green
  } else {
    // Logged out
    btn.textContent = "Login with Google";
    btn.classList.remove("logged-in");
    btn.style.background = "#4285F4"; // blue
  }
}


document.getElementById("loginBtn").addEventListener("click", () => {
  const token = localStorage.getItem("yt_oauth_token");

  if (token) {
    // Logout mode
    localStorage.removeItem("yt_oauth_token");
    updateLoginButtonState();
    location.reload();
  } else {
    // Login mode
    startOAuth(); // your existing login function
  }
});

function updateLoginButtonState() {
  const btn = document.getElementById("loginBtn");
  const status = document.getElementById("loginStatus");
  const token = localStorage.getItem("yt_oauth_token");

  if (!btn || !status) return;

  if (token) {
    // Logged in
    btn.textContent = "Logout";
    btn.style.background = "#34A853"; // green
    status.textContent = "You are currently logged in. Clicking this will log you out.";
  } else {
    // Logged out
    btn.textContent = "Login with Google";
    btn.style.background = "#4285F4"; // blue
    status.textContent = "This is only used to access private subscriber data.You can still use the dashboard without logging in, but the Subscribers page will be empty and show an error in the console.";
  }
}

document.getElementById("loginBtn").addEventListener("click", () => {
  const token = localStorage.getItem("yt_oauth_token");

  if (token) {
    // Logout
    localStorage.removeItem("yt_oauth_token");
    updateLoginButtonState();
    location.reload();
  } else {
    // Login
    startOAuth(); // your existing login function
  }
});








loadUserInfo();
loadPrivateSubscribers();
updateLoginButtonState();
updateLoginButtonState();







