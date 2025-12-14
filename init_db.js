const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./ratings.db');

// 10 имён
const names = [
  "Иван", "Мария", "Павел", "Наталья", "Олег",
  "София", "Максим", "Елена", "Дмитрий", "Анна"
];

db.serialize(() => {

  // Таблица пользователей
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password_hash TEXT
    )
  `);

  // Таблица оценок
  db.run(`
    CREATE TABLE IF NOT EXISTS ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name_index INTEGER,
      score INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // Таблица имён
  db.run(`
    CREATE TABLE IF NOT EXISTS names (
      id INTEGER PRIMARY KEY,
      name TEXT
    )
  `);

  // Заполняем имена, если пусто
  const stmt = db.prepare(`INSERT OR IGNORE INTO names (id, name) VALUES (?, ?)`);
  names.forEach((n, i) => stmt.run(i, n));
  stmt.finalize();

  console.log("✔ DB initialized successfully");
});



// Закрываем базу
db.close();
