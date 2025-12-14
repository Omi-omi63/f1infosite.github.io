-- ========================================
-- Таблицы
-- ========================================

-- USERS
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

-- OLD SYSTEM (compatibility)
CREATE TABLE IF NOT EXISTS names (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name_index INTEGER NOT NULL,
    score INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(name_index) REFERENCES names(id)
);

-- NEW SYSTEM
CREATE TABLE IF NOT EXISTS seasons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS races (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY(season_id) REFERENCES seasons(id)
);

CREATE TABLE IF NOT EXISTS pilots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

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

-- ========================================
-- Данные
-- ========================================

-- Insert season 2025
INSERT OR IGNORE INTO seasons (year) VALUES (2025);

-- Get season_id for 2025
-- (SQLite не поддерживает переменные напрямую, нужно знать ID)
-- Предположим, что это первый сезон, тогда season_id = 1
-- Если база уже существует, сезон уже есть, season_id всё равно = 1

-- Races 2025
INSERT OR IGNORE INTO races (season_id, name) VALUES
(1, 'Австралия'),
(1, 'Бахрейн'),
(1, 'Китай'),
(1, 'Азербайджан'),
(1, 'Монако'),
(1, 'Испания'),
(1, 'Канада'),
(1, 'Австрия'),
(1, 'Великобритания'),
(1, 'Венгрия'),
(1, 'Бельгия'),
(1, 'Нидерланды'),
(1, 'Италия'),
(1, 'Сингапур'),
(1, 'Япония'),
(1, 'США'),
(1, 'Саудовская Аравия'),
(1, 'Бразилия'),
(1, 'Мексика'),
(1, 'Лас-Вегас'),
(1, 'Катар'),
(1, 'Абу-Даби');

-- Pilots
INSERT OR IGNORE INTO pilots (name) VALUES
('Макс Ферстаппен'),
('Юки Цунода'),
('Льюис Хэмилтон'),
('Шарль Леклер'),
('Фернандо Алонсо'),
('Лэнс Стролл'),
('Кими Антонелли'),
('Джордж Расселл'),
('Карлос Сайнс'),
('Алекс Албон'),
('Ландо Норрис'),
('Оскар Пиастри'),
('Олли Берман'),
('Эстебан Окон'),
('Нико Хюлькенберг'),
('Габриэль Бортоллето'),
('Лиам Лоусон'),
('Айзек Хаджар'),
('Пьер Гасли'),
('Франко Колапинто');

-- Old system pilots (names)
INSERT OR IGNORE INTO names (name) VALUES
('Макс Ферстаппен'),
('Юки Цунода'),
('Льюис Хэмилтон'),
('Шарль Леклер'),
('Фернандо Алонсо'),
('Лэнс Стролл'),
('Кими Антонелли'),
('Джордж Расселл'),
('Карлос Сайнс'),
('Алекс Албон'),
('Ландо Норрис'),
('Оскар Пиастри'),
('Олли Берман'),
('Эстебан Окон'),
('Нико Хюлькенберг'),
('Габриэль Бортоллето'),
('Лиам Лоусон'),
('Айзек Хаджар'),
('Пьер Гасли'),
('Франко Колапинто');
