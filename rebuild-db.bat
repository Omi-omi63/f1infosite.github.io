@echo off
setlocal enabledelayedexpansion

set "DB=ratings.db"

echo ================================
echo   УДАЛЯЮ СТАРУЮ БАЗУ
echo ================================
if exist "%DB%" (
    del "%DB%"
    echo Старая база удалена.
) else (
    echo Старой базы не найдено.
)

echo.
echo ================================
echo   СОЗДАЮ НОВУЮ БАЗУ SQLite
echo ================================

rem Проверка наличия sqlite3.exe
where sqlite3 >nul 2>&1
if !ERRORLEVEL! neq 0 (
    echo ОШИБКА: sqlite3.exe не найден в PATH!
    echo Убедитесь, что SQLite установлен и путь добавлен в переменную PATH.
    pause
    exit /b 1
)

rem Проверка наличия файла init_win.sql
if not exist "init_win.sql" (
    echo ОШИБКА: Файл init_win.sql не найден!
    echo Убедитесь, что файл находится в той же папке.
    pause
    exit /b 1
)

rem Создание новой базы
sqlite3 "%DB%" ".read init_win.sql"
if !ERRORLEVEL! neq 0 (
    echo.
    echo ОШИБКА: Не удалось создать базу данных!
    pause
    exit /b 1
)

echo.
echo ================================
echo   ГОТОВО! База "%DB%" создана
echo ================================

rem Показываем размер созданного файла
if exist "%DB%" (
    for %%F in ("%DB%") do (
        echo Размер файла: %%~zF байт
    )
)

echo.
pause
endlocal
