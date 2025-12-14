// ===========================================
//               CONFIG
// ===========================================
const API = "http://localhost:3000";



// DOM ELEMENTS
const seasonSelect = document.getElementById("season-select");
const raceSelect = document.getElementById("race-select");
const pilotSelect = document.getElementById("pilot-select");
const ratingInput = document.getElementById("rating-input");

const submitRatingBtn = document.getElementById("submit-rating");
const tableBody = document.getElementById("ratingTbody");

const saveBtn = document.getElementById("save-img");

// RECENT TABLE
const recentTbody = document.getElementById("recent-tbody");
const recentThead = document.getElementById("recent-thead");
const recentAvg = document.getElementById("recent-avg");

const recentSeason = document.getElementById("recent-season");
const recentRace = document.getElementById("recent-race");

// AUTH
const authUsername = document.getElementById("authUsername");
const authPassword = document.getElementById("authPassword");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");

const loginSection = document.getElementById("loginSection");
const logoutSection = document.getElementById("logoutSection");
const userName = document.getElementById("userName");


// ===========================================
//               TOKEN
// ===========================================
function token() { return localStorage.getItem("token"); }
function setToken(t) {
    if (t) localStorage.setItem("token", t);
    else localStorage.removeItem("token");
}


// ===========================================
//               AUTH UI
// ===========================================
function showUser() {
    if (token()) {
        loginSection.style.display = "none";
        logoutSection.style.display = "block";

        try {
            const payload = JSON.parse(atob(token().split(".")[1]));
            userName.textContent = payload.username;
        } catch {
            userName.textContent = "Пользователь";
        }
    } else {
        loginSection.style.display = "block";
        logoutSection.style.display = "none";
    }
}


// ===========================================
//           SIMPLE API WRAPPER
// ===========================================
async function apiGet(path) {
    const r = await fetch(API + path);
    return r.json();
}

async function apiPost(path, body) {
    const headers = {
        "Content-Type": "application/json",
        ...(token() ? { "Authorization": "Bearer " + token() } : {})
    };

    const r = await fetch(API + path, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
    });

    let data = null;
    try { data = await r.json(); } catch {}

    return { ok: r.ok, data };
}


// ===========================================
//        LOAD SEASONS AND RACES
// ===========================================
async function loadSeasons() {
    const seasons = await apiGet("/api/seasons");

    seasonSelect.innerHTML = seasons
        .map(s => `<option value="${s.id}">${s.year}</option>`)
        .join("");

    if (seasons.length) seasonSelect.value = seasons[0].id;

    await loadRaces();
    await loadRecentFilters();
}

async function loadRaces() {
    const season_id = seasonSelect.value;
    if (!season_id) return;

    const races = await apiGet(`/api/races?season_id=${season_id}`);

    raceSelect.innerHTML = races
        .map(r => `<option value="${r.id}">${r.name}</option>`)
        .join("");

    if (races.length) raceSelect.value = races[0].id;

    await refreshRaceTable();
    await refreshRecent(); // ← привязано к основным селектам
}


// ===========================================
//           LOAD PILOTS
// ===========================================
async function loadPilots() {
    const pilots = await apiGet("/api/pilots");

    pilotSelect.innerHTML = pilots
        .map(p => `<option value="${p.id}">${p.name}</option>`)
        .join("");
}


// ===========================================
//        MAIN USER TABLE (LEFT SIDE)
// ===========================================
async function refreshRaceTable() {
    const season_id = seasonSelect.value;
    const race_id = raceSelect.value;

    if (!season_id || !race_id) return;
    // обновление заголовка таблицы
const seasonText = seasonSelect.options[seasonSelect.selectedIndex].textContent;
const raceText = raceSelect.options[raceSelect.selectedIndex].textContent;

document.getElementById("rating-title").textContent =
    `Оценки пилотов — ${seasonText} • ${raceText}`;


    const res = await fetch(
        `${API}/api/ratings?season_id=${season_id}&race_id=${race_id}`,
        { headers: { ...(token() ? { "Authorization": "Bearer " + token() } : {}) } }
    );

    const data = await res.json();
    const rows = data.rows || [];

   tableBody.innerHTML = rows.map(r => `
    <tr>
        <td>${r.pilot}</td>
        <td>${r.user_score ?? "—"}</td>
    </tr>
`).join("");

}


// ===========================================
//               SUBMIT RACE RATING
// ===========================================
submitRatingBtn.onclick = async () => {
    if (!token()) return alert("Сначала войдите");

    const season_id = seasonSelect.value;
    const race_id = raceSelect.value;
    const pilot_id = pilotSelect.value;
    const score = Number(ratingInput.value);

    if (!score || score < 1 || score > 10)
        return alert("Оценка должна быть от 1 до 10");

    const { ok, data } = await apiPost("/api/rateRace", {
        season_id,
        race_id,
        pilot_id,
        score
    });

    if (!ok) return alert(data.error);

    ratingInput.value = "";
    await refreshRaceTable();
    await refreshRecent();
};


// ===========================================
//      RECENT LAST 10 TABLE (RIGHT SIDE)
// ===========================================
async function loadRecentFilters() {
    const seasons = await apiGet("/api/seasons");

    recentSeason.innerHTML = seasons
        .map(s => `<option value="${s.id}">${s.year}</option>`)
        .join("");

    if (seasons.length) recentSeason.value = seasons[0].id;

    await loadRecentRaces();
}

async function loadRecentRaces() {
    const season_id = recentSeason.value;
    const races = await apiGet(`/api/races?season_id=${season_id}`);

    recentRace.innerHTML = races
        .map(r => `<option value="${r.id}">${r.name}</option>`)
        .join("");

    if (races.length) recentRace.value = races[0].id;

    await refreshRecent();
}

function scoreClass(score) {
    if (score === null || score === undefined || score === "—") return "";

    score = Number(score);

    if (score >= 8) return "score-green";
    if (score <= 4) return "score-red";
    return "score-yellow";
}

// ===========================================
//     BUILD FULL MATRIX TABLE OF LAST 10
// ===========================================
async function refreshRecent() {
    const season_id = seasonSelect.value; // ← главное изменение
    const race_id = raceSelect.value;

    if (!season_id || !race_id) return;

    const res = await fetch(
        `${API}/api/last10RaceRatingsTable?season_id=${season_id}&race_id=${race_id}`
    );

    const data = await res.json();
    if (!data) return;

    const users = data.users || [];
    const rows = data.rows || [];

    recentThead.innerHTML = `
        <tr>
            <th>Пилот</th>
            <th>Гран-При</th>
            <th>Год</th>
            ${users.map(u => `<th>${u}</th>`).join("")}
            <th>Средняя</th>
        </tr>
    `;

    recentTbody.innerHTML = rows
        .map(r => `
            <tr>
                <td>${r.pilot}</td>
                <td>${r.race_name}</td>
                <td>${r.season_year}</td>
                ${r.scores.map(s => `<td class="${scoreClass(s)}">${s ?? "—"}</td>`).join("")}

                <td class="${scoreClass(r.avg)}">${r.avg ? r.avg.toFixed(2) : "—"}</td>

            </tr>
        `)
        .join("");

    recentAvg.textContent = data.global_avg ? data.global_avg.toFixed(2) : "—";
}


// ===========================================
//               AUTH HANDLERS
// ===========================================
loginBtn.onclick = async () => {
    const { ok, data } = await apiPost("/api/login", {
        username: authUsername.value.trim(),
        password: authPassword.value
    });

    if (!ok) return alert(data.error);

    setToken(data.token);
    showUser();

    await refreshRaceTable();
    await refreshRecent();
};

registerBtn.onclick = async () => {
    const { ok, data } = await apiPost("/api/register", {
        username: authUsername.value.trim(),
        password: authPassword.value
    });

    if (!ok) return alert(data.error);

    setToken(data.token);
    showUser();

    await refreshRaceTable();
    await refreshRecent();
};

logoutBtn.onclick = () => {
    setToken(null);
    showUser();
    refreshRaceTable();
    refreshRecent();
};


// ===========================================
//            SAVE TABLE AS PNG
// ===========================================
saveBtn.onclick = async () => {
    const table = document.getElementById("rating-table");

    // включаем чёрно-красный режим
    table.classList.add("screenshot-mode");

    // ждём 50мс чтобы DOM перерисовался
    await new Promise(r => setTimeout(r, 50));

    html2canvas(table, {
        backgroundColor: "#0a0a0c",  // гарантируем черный фон
        scale: 2,                    // четче картинка
    }).then(canvas => {
        const link = document.createElement("a");
        link.download = "race_ratings.png";
        link.href = canvas.toDataURL("image/png");
        link.click();

        // выключаем режим
        table.classList.remove("screenshot-mode");
    });
};



// ===========================================
//                 INIT
// ===========================================
(async () => {
    showUser();
    await loadSeasons();
    await loadPilots();
    // ===============================
//          TABS LOGIC
// ===============================
// ===============================
//          TABS LOGIC
// ===============================
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {

        // переключаем кнопки
        document.querySelectorAll(".tab-btn")
            .forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        // скрываем все табы
        document.querySelectorAll("#ratings-tab, #info-tab")
            .forEach(sec => sec.classList.add("hidden"));

        // показываем выбранный
        const tab = btn.getAttribute("data-tab");
        document.getElementById(tab).classList.remove("hidden");
    });
});

})();
