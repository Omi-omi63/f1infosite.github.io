DELETE  FROM seasons
WHERE id = 2;
UPDATE seasons
SET "year" = 2025
WHERE id = 1;

SELECT count(*)
FROM sqlite_sequence
WHERE seq = 2;