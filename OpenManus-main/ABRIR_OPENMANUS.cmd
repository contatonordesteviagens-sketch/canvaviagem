@echo off
title OpenManus
cd /d "C:\Users\win 10\Desktop\CANVA E FABRICA - JUNHO 26\OpenManus-main"
set "TIKTOKEN_CACHE_DIR=C:\Users\win 10\Desktop\CANVA E FABRICA - JUNHO 26\OpenManus-main\.tiktoken-cache"
echo ============================================================
echo OpenManus - Agente de IA
echo ============================================================
echo.
echo Digite sua tarefa quando aparecer: Enter your prompt
echo Para sair, pressione Ctrl+C.
echo.
".venv312\Scripts\python.exe" main.py
echo.
echo O OpenManus foi encerrado. Pressione uma tecla para fechar.
pause >nul
