--
-- Файл сгенерирован с помощью SQLiteStudio v3.4.18 в Пн дек 15 01:54:11 2025
--
-- Использованная кодировка текста: System
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- Таблица: names
CREATE TABLE IF NOT EXISTS names (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);
INSERT INTO names (id, name) VALUES (1, 'Макс Ферстаппен');
INSERT INTO names (id, name) VALUES (2, 'Юки Цунода');
INSERT INTO names (id, name) VALUES (3, 'Льюис Хэмилтон');
INSERT INTO names (id, name) VALUES (4, 'Шарль Леклер');
INSERT INTO names (id, name) VALUES (5, 'Фернандо Алонсо');
INSERT INTO names (id, name) VALUES (6, 'Лэнс Стролл');
INSERT INTO names (id, name) VALUES (7, 'Кими Антонелли');
INSERT INTO names (id, name) VALUES (8, 'Джордж Расселл');
INSERT INTO names (id, name) VALUES (9, 'Карлос Сайнс');
INSERT INTO names (id, name) VALUES (10, 'Алекс Албон');
INSERT INTO names (id, name) VALUES (11, 'Ландо Норрис');
INSERT INTO names (id, name) VALUES (12, 'Оскар Пиастри');
INSERT INTO names (id, name) VALUES (13, 'Олли Берман');
INSERT INTO names (id, name) VALUES (14, 'Эстебан Окон');
INSERT INTO names (id, name) VALUES (15, 'Нико Хюлькенберг');
INSERT INTO names (id, name) VALUES (16, 'Габриэль Бортоллето');
INSERT INTO names (id, name) VALUES (17, 'Лиам Лоусон');
INSERT INTO names (id, name) VALUES (18, 'Айзек Хаджар');
INSERT INTO names (id, name) VALUES (19, 'Пьер Гасли');
INSERT INTO names (id, name) VALUES (20, 'Франко Колапинто');

-- Таблица: pilots
CREATE TABLE IF NOT EXISTS pilots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);
INSERT INTO pilots (id, name) VALUES (1, 'Макс Ферстаппен');
INSERT INTO pilots (id, name) VALUES (2, 'Юки Цунода');
INSERT INTO pilots (id, name) VALUES (3, 'Льюис Хэмилтон');
INSERT INTO pilots (id, name) VALUES (4, 'Шарль Леклер');
INSERT INTO pilots (id, name) VALUES (5, 'Фернандо Алонсо');
INSERT INTO pilots (id, name) VALUES (6, 'Лэнс Стролл');
INSERT INTO pilots (id, name) VALUES (7, 'Кими Антонелли');
INSERT INTO pilots (id, name) VALUES (8, 'Джордж Расселл');
INSERT INTO pilots (id, name) VALUES (9, 'Карлос Сайнс');
INSERT INTO pilots (id, name) VALUES (10, 'Алекс Албон');
INSERT INTO pilots (id, name) VALUES (11, 'Ландо Норрис');
INSERT INTO pilots (id, name) VALUES (12, 'Оскар Пиастри');
INSERT INTO pilots (id, name) VALUES (13, 'Олли Берман');
INSERT INTO pilots (id, name) VALUES (14, 'Эстебан Окон');
INSERT INTO pilots (id, name) VALUES (15, 'Нико Хюлькенберг');
INSERT INTO pilots (id, name) VALUES (16, 'Габриэль Бортоллето');
INSERT INTO pilots (id, name) VALUES (17, 'Лиам Лоусон');
INSERT INTO pilots (id, name) VALUES (18, 'Айзек Хаджар');
INSERT INTO pilots (id, name) VALUES (19, 'Пьер Гасли');
INSERT INTO pilots (id, name) VALUES (20, 'Франко Колапинто');

-- Таблица: race_ratings
CREATE TABLE IF NOT EXISTS race_ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    season_id INTEGER NOT NULL,
    race_id INTEGER NOT NULL,
    pilot_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(season_id) REFERENCES seasons(id),
    FOREIGN KEY(race_id) REFERENCES races(id),
    FOREIGN KEY(pilot_id) REFERENCES pilots(id)
);

-- Таблица: races
CREATE TABLE IF NOT EXISTS races (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY(season_id) REFERENCES seasons(id)
);
INSERT INTO races (id, season_id, name) VALUES (1, 1, 'Австралия');
INSERT INTO races (id, season_id, name) VALUES (2, 1, 'Бахрейн');
INSERT INTO races (id, season_id, name) VALUES (3, 1, 'Китай');
INSERT INTO races (id, season_id, name) VALUES (4, 1, 'Азербайджан');
INSERT INTO races (id, season_id, name) VALUES (5, 1, 'Монако');
INSERT INTO races (id, season_id, name) VALUES (6, 1, 'Испания');
INSERT INTO races (id, season_id, name) VALUES (7, 1, 'Канада');
INSERT INTO races (id, season_id, name) VALUES (8, 1, 'Австрия');
INSERT INTO races (id, season_id, name) VALUES (9, 1, 'Великобритания');
INSERT INTO races (id, season_id, name) VALUES (10, 1, 'Венгрия');
INSERT INTO races (id, season_id, name) VALUES (11, 1, 'Бельгия');
INSERT INTO races (id, season_id, name) VALUES (12, 1, 'Нидерланды');
INSERT INTO races (id, season_id, name) VALUES (13, 1, 'Италия');
INSERT INTO races (id, season_id, name) VALUES (14, 1, 'Сингапур');
INSERT INTO races (id, season_id, name) VALUES (15, 1, 'Япония');
INSERT INTO races (id, season_id, name) VALUES (16, 1, 'США');
INSERT INTO races (id, season_id, name) VALUES (17, 1, 'Саудовская Аравия');
INSERT INTO races (id, season_id, name) VALUES (18, 1, 'Бразилия');
INSERT INTO races (id, season_id, name) VALUES (19, 1, 'Мексика');
INSERT INTO races (id, season_id, name) VALUES (20, 1, 'Лас-Вегас');
INSERT INTO races (id, season_id, name) VALUES (21, 1, 'Катар');
INSERT INTO races (id, season_id, name) VALUES (22, 1, 'Абу-Даби');

-- Таблица: ratings
CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name_index INTEGER NOT NULL,
    score INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(name_index) REFERENCES names(id)
);

-- Таблица: seasons
CREATE TABLE IF NOT EXISTS seasons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER UNIQUE NOT NULL
);
INSERT INTO seasons (id, year) VALUES (1, 2025);

-- Таблица: users
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);
INSERT INTO users (id, username, password_hash) VALUES (1, 'omi', '$2b$10$B7Kbjh0HRY9Z1BjaKS/tv.baea.exJlbBSd7DpFbSf1NE676VTY/6');
INSERT INTO users (id, username, password_hash) VALUES (2, '123', '$2b$10$btAJiQ47IzExCpD3/7hoduchLX/PN3.jXTrb5KMyHVu3QNEv4pr86');

COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
