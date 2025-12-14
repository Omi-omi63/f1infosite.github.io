const express = require("express");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");

const app = express();
const db = new sqlite3.Database("ratings.db");
const SECRET = "F1_SECRET_KEY";

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* -----------------------------
      JWT МИДЛВАРА
--------------------------------*/
function auth(req, res, next) {
    const h = req.headers.authorization;
    if (!h) return res.status(401).json({ error: "Требуется токен" });

    const token = h.split(" ")[1];
    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Неверный токен" });
        req.user = user;
        next();
    });
}

/* -----------------------------
      AUTH
--------------------------------*/
app.post("/api/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({ error: "Введите логин и пароль" });

    const hash = bcrypt.hashSync(password, 10);

    db.run(
        "INSERT INTO users (username, password_hash) VALUES (?, ?)",
        [username, hash],
        function (err) {
            if (err) {
                return res.status(400).json({ error: "Пользователь существует" });
            }

            const token = jwt.sign({ id: this.lastID, username }, SECRET);
            res.json({ token });
        }
    );
});

app.post("/api/login", (req, res) => {
    const { username, password } = req.body;

    db.get(
        "SELECT * FROM users WHERE username = ?",
        [username],
        (err, user) => {
            if (err || !user)
                return res.status(400).json({ error: "Неверные данные" });

            if (!bcrypt.compareSync(password, user.password_hash))
                return res.status(400).json({ error: "Пароль неверный" });

            const token = jwt.sign(
                { id: user.id, username: user.username },
                SECRET
            );
            res.json({ token });
        }
    );
});

/* -----------------------------
      API: SEASONS
--------------------------------*/
app.get("/api/seasons", (req, res) => {
    db.all("SELECT id, year FROM seasons ORDER BY year ASC", [], (err, rows) => {
        if (err) {
            console.log("SEASONS ERROR:", err);
            return res.status(500).json({ error: "DB seasons error" });
        }
        res.json(rows || []); // ← важное исправление
    });
});

/* -----------------------------
      API: RACES
--------------------------------*/
app.get("/api/races", (req, res) => {
    const season_id = req.query.season_id;

    if (!season_id) return res.json([]);

    db.all(
        "SELECT id, name FROM races WHERE season_id = ?",
        [season_id],
        (err, rows) => {
            if (err) {
                console.log("RACES ERROR:", err);
                return res.status(500).json({ error: "DB races error" });
            }
            res.json(rows || []);
        }
    );
});

/* -----------------------------
      API: PILOTS
--------------------------------*/
app.get("/api/pilots", (req, res) => {
    db.all("SELECT id, name FROM pilots ORDER BY name", [], (err, rows) => {
        if (err) {
            console.log("PILOTS ERROR:", err);
            return res.status(500).json({ error: "DB pilots error" });
        }
        res.json(rows || []);
    });
});

/* -----------------------------
      API: Рейтинг пилотов в гонке
--------------------------------*/
app.post("/api/rateRace", auth, (req, res) => {
    const { season_id, race_id, pilot_id, score } = req.body;

    if (!season_id || !race_id || !pilot_id || !score) {
        return res.status(400).json({ error: "Неверные параметры" });
    }

    db.run(
        `INSERT INTO race_ratings 
         (user_id, season_id, race_id, pilot_id, score) 
         VALUES (?, ?, ?, ?, ?)`,
        [req.user.id, season_id, race_id, pilot_id, score],
        function (err) {
            if (err) {
                console.log("RATE ERROR:", err);
                return res.status(500).json({ error: "DB rateRace error" });
            }
            res.json({ ok: true });
        }
    );
});
/* -----------------------------
      API: РЕЙТИНГИ В ГОНКЕ
--------------------------------*/
app.get("/api/ratings", (req, res) => {
    const { season_id, race_id } = req.query;
    const auth = req.headers.authorization;

    if (!season_id || !race_id) {
        return res.status(400).json({ error: "season_id и race_id обязательны" });
    }

    let user_id = null;

    // если есть токен — берём user_id
    if (auth && auth.startsWith("Bearer ")) {
        try {
            const token = auth.replace("Bearer ", "");
            const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
            user_id = payload.id;
        } catch (e) {}
    }

    const sql = `
        SELECT
            pilots.id AS pilot_id,
            pilots.name AS pilot,
            races.name AS race_name,
            (SELECT score 
             FROM race_ratings rr 
             WHERE rr.pilot_id = pilots.id
             AND rr.season_id = ?
             AND rr.race_id = ?
             AND rr.user_id = ?
             LIMIT 1) AS user_score
        FROM pilots
        CROSS JOIN races
        WHERE races.id = ?
        ORDER BY pilots.name ASC
    `;

    db.all(sql, [season_id, race_id, user_id, race_id], (err, rows) => {
        if (err) {
            console.error("RATINGS ERROR:", err);
            return res.status(500).json({ error: "DB error" });
        }

        res.json({ rows });
    });
});

/* ----------------------------------------------------
      API: Последние 10 оценок в виде таблицы:
      Пилот | Гран-При | Год | user1..user10 | Средняя
-----------------------------------------------------*/
app.get("/api/last10RaceRatingsTable", (req, res) => {
    const { season_id, race_id } = req.query;

    if (!season_id || !race_id) {
        return res.status(400).json({ error: "season_id и race_id обязательны" });
    }

    // 1) Получаем 10 последних уникальных пользователей
    const sqlUsers = `
        SELECT DISTINCT users.id, users.username
        FROM race_ratings
        JOIN users ON users.id = race_ratings.user_id
        WHERE season_id = ? AND race_id = ?
        ORDER BY race_ratings.created_at DESC
        LIMIT 10
    `;

    db.all(sqlUsers, [season_id, race_id], (errU, users) => {
        if (errU) {
            console.error("USER LIST ERROR:", errU);
            return res.status(500).json({ error: "DB user list error" });
        }

        const userIds = users.map(u => u.id);
        const usernames = users.map(u => u.username);

        // 2) Берём всех пилотов и их оценки от этих 10 пользователей
        const sqlRatings = `
            SELECT
                pilots.id AS pilot_id,
                pilots.name AS pilot,
                races.name AS race_name,
                seasons.year AS season_year,
                users.id AS user_id,
                race_ratings.score
            FROM pilots
            CROSS JOIN races
            JOIN seasons ON seasons.id = races.season_id
            LEFT JOIN race_ratings 
                ON race_ratings.pilot_id = pilots.id
                AND race_ratings.season_id = ?
                AND race_ratings.race_id = ?
                AND race_ratings.user_id IN (${userIds.length ? userIds.join(",") : "-1"})
            LEFT JOIN users ON users.id = race_ratings.user_id
            WHERE races.id = ?
            ORDER BY pilots.name ASC
        `;

        db.all(sqlRatings, [season_id, race_id, race_id], (errR, rows) => {
            if (errR) {
                console.error("RATINGS TABLE ERROR:", errR);
                return res.status(500).json({ error: "DB table error" });
            }

            // Группируем по пилоту
            const pilotsMap = {};

            for (const r of rows) {
                if (!pilotsMap[r.pilot_id]) {
                    pilotsMap[r.pilot_id] = {
                        pilot: r.pilot,
                        race_name: r.race_name,
                        season_year: r.season_year,
                        scores: new Array(userIds.length).fill(null)   // user1..user10
                    };
                }
                if (r.user_id) {
                    const idx = userIds.indexOf(r.user_id);
                    if (idx !== -1) pilotsMap[r.pilot_id].scores[idx] = r.score;
                }
            }

            // Преобразуем в массив
            const tableRows = Object.values(pilotsMap).map(p => {
                const valid = p.scores.filter(s => s !== null);

                return {
                    ...p,
                    avg: valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null
                };
            });

            // Общая средняя
            let allScores = [];
            tableRows.forEach(r => {
                r.scores.forEach(s => { if (s !== null) allScores.push(s); });
            });

            const global_avg = allScores.length
                ? allScores.reduce((a, b) => a + b, 0) / allScores.length
                : null;

            res.json({
                users: usernames,
                rows: tableRows,
                global_avg
            });
        });
    });
});

/* -----------------------------
      API: ПОСЛЕДНИЕ ОЦЕНКИ В ГОНКЕ
--------------------------------*/
app.get("/api/last10RaceRatings", (req, res) => {
    const { season_id, race_id } = req.query;

    if (!season_id || !race_id) {
        return res.status(400).json({ error: "season_id и race_id обязательны" });
    }

    const sql = `
        SELECT
            users.username,
            pilots.name AS pilot,
            race_ratings.score,
            race_ratings.created_at
        FROM race_ratings
        JOIN users ON users.id = race_ratings.user_id
        JOIN pilots ON pilots.id = race_ratings.pilot_id
        WHERE race_ratings.season_id = ?
        AND race_ratings.race_id = ?
        ORDER BY race_ratings.created_at DESC
        LIMIT 10
    `;

    db.all(sql, [season_id, race_id], (err, rows) => {
        if (err) {
            console.error("RECENT RACE ERROR:", err);
            return res.status(500).json({ error: "DB error" });
        }

        const avg =
            rows.length > 0
                ? (rows.reduce((s, r) => s + r.score, 0) / rows.length).toFixed(2)
                : "—";

        res.json({ rows, avg });
    });
});


/* -----------------------------
      API: Последние оценки
--------------------------------*/
app.get("/api/recentRaceRatings", (req, res) => {
    const sql = `
        SELECT 
            users.username,
            pilots.name AS pilot,
            race_ratings.score,
            race_ratings.created_at
        FROM race_ratings
        JOIN users ON users.id = race_ratings.user_id
        JOIN pilots ON pilots.id = race_ratings.pilot_id
        ORDER BY race_ratings.created_at DESC
        LIMIT 10
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("RECENT ERROR:", err);
            return res.status(500).json({ error: "DB error" });
        }

        const avg =
            rows.length > 0
                ? (rows.reduce((s, r) => s + r.score, 0) / rows.length).toFixed(2)
                : null;

        res.json({ rows, last10_avg: avg });
    });
});
/* -----------------------------
      START SERVER
--------------------------------*/
app.get("/", (_, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(3000, () => console.log("Server running on 3000"));

