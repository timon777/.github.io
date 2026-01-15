#!/bin/bash
# Скрипт для освобождения порта 3000

PORT=3000

echo "🔍 Поиск процессов на порту $PORT..."

# Найти PID процесса, использующего порт
PID=$(lsof -ti:$PORT)

if [ -z "$PID" ]; then
  echo "✅ Порт $PORT свободен"
else
  echo "⚠️  Найден процесс PID: $PID на порту $PORT"
  echo "🔪 Завершаю процесс..."
  kill -9 $PID
  echo "✅ Порт $PORT освобожден"
fi
