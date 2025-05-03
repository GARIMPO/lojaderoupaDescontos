@echo off
echo Limpando cache...

:: Remover o cache do Node.js
call npm cache clean --force

:: Remover o diretório .vite
if exist node_modules\.vite (
  rmdir /s /q node_modules\.vite
)

:: Remover cache do Vite
if exist node_modules\.cache (
  rmdir /s /q node_modules\.cache
)

:: Remover diretório dist
if exist dist (
  rmdir /s /q dist
)

:: Reinstalar dependências
echo Reinstalando dependências...
call npm ci

:: Reiniciar o servidor de desenvolvimento
echo Iniciando o servidor de desenvolvimento...
call npm run dev 