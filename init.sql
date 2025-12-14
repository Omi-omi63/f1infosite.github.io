-- ================================
--      USERS
-- ================================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

-- ================================
--      OLD SYSTEM: PILOT NAMES
-- (оставляем совместимость со старым функционалом)
-- ================================
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

-- ================================
--      NEW SYSTEM: F1 STRUCTURE
-- ================================

-- СЕЗОНЫ (2025 и т.д.)
CREATE TABLE IF NOT EXISTS seasons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER UNIQUE NOT NULL
);

-- ГОНКИ (привязанные к сезону)
CREATE TABLE IF NOT EXISTS races (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season_id INTEGER NOT NULL,
    name TEXT NOT NULL,

    FOREIGN KEY(season_id) REFERENCES seasons(id)
);

-- ПИЛОТЫ (единый список)
CREATE TABLE IF NOT EXISTS pilots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

-- ОЦЕНКИ С УЧЁТОМ:
--   - сезона
--   - гонки
--   - пилота
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

-- ================================
--      TEST DATA: SEASONS
-- ================================
INSERT OR IGNORE INTO seasons (year) VALUES
(2025);

-- ================================
--      TEST DATA: RACES
-- ================================

-- Races for 2025
INSERT OR IGNORE INTO races (season_id, name) VALUES
(2, 'Австралия'),
(2, 'Бахрейн'),
(2, 'Китай'),
(2, 'Азербайджан'),
(2, 'Монако'),
(2, 'Испания'),
(2, 'Канада'),
(2, 'Австрия'),
(2, 'Великобритания'),
(2, 'Венгрия'),
(2, 'Бельгия'),
(2, 'Нидерланды'),
(2, 'Италия'),
(2, 'Сингапур'),
(2, 'Япония'),
(2, 'США'),
(2, 'Саудовская Аравия'),
(2, 'Бразилия'),
(2, 'Мексика'),
(2, 'Лас-Вегас'),
(2, 'Катар'),
(2, 'Абу-Даби')

-- ================================
--      TEST DATA: PILOTS
-- ================================
INSERT OR IGNORE INTO pilots (name) VALUES
('Макс Ферстаппен'),
('Юки Цунода')
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

-- ================================
--      COMPATIBILITY PILOT LIST
-- (для старой системы /api/names)
-- ================================
INSERT OR IGNORE INTO names (name) VALUES
('Макс Ферстаппен'),
('Юки Цунода')
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
