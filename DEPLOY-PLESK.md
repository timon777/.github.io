# 🚀 Деплой на Plesk хостинг

Пошаговая инструкция по развертыванию проекта на Plesk без терминала.

---

## 📋 Что нужно сделать:

### 1️⃣ Локальная сборка проекта

На вашем компьютере выполните:

```bash
# 1. Убедитесь, что все зависимости установлены
npm install

# 2. Соберите проект для продакшена
npm run build
```

После сборки появится папка **`dist/`** с готовыми файлами.

---

### 2️⃣ Загрузка файлов на хостинг

#### Через File Manager в Plesk:

1. Откройте **Plesk Panel**
2. Выберите ваш домен
3. Перейдите в **Files** → **File Manager**
4. Откройте папку `httpdocs/` (или `public_html/`)
5. **Удалите** все старые файлы из этой папки
6. **Загрузите** все содержимое из папки `dist/`:
   - `index.html`
   - папка `assets/`
   - и все остальные файлы

#### Или через FTP:

1. Используйте FTP клиент (FileZilla, WinSCP и т.д.)
2. Подключитесь к хостингу
3. Перейдите в `httpdocs/` (или `public_html/`)
4. Загрузите все файлы из локальной папки `dist/`

---

### 3️⃣ Настройка .htaccess для SPA

Создайте файл `.htaccess` в корне `httpdocs/` со следующим содержимым:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Если файл или папка существует, показываем их
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d

  # Иначе направляем на index.html (для React Router)
  RewriteRule . /index.html [L]
</IfModule>

# Кэширование статических файлов
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/x-javascript "access plus 1 month"
</IfModule>

# Сжатие файлов
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

---

### 4️⃣ Настройка Supabase для продакшена

#### Откройте Supabase Dashboard → Authentication → URL Configuration

Измените:
- **Site URL:** `https://ваш-домен.com` (ваш реальный домен)
- **Redirect URLs:** Добавьте:
  ```
  https://ваш-домен.com/**
  ```

✅ Сохраните

---

### 5️⃣ Обновление переменных окружения (если есть)

Если используете `.env` файл, убедитесь что в коде используются правильные ключи Supabase для продакшена.

Проверьте файл `src/services/supabase.ts` - там должны быть ваши ключи.

---

## 🔄 Обновление проекта (при внесении изменений)

Каждый раз когда вносите изменения в код:

```bash
# 1. Локально соберите проект
npm run build

# 2. Загрузите новые файлы из dist/ на хостинг
# (замените старые файлы новыми)
```

---

## ✅ Проверка работоспособности

1. Откройте ваш сайт: `https://ваш-домен.com`
2. Проверьте, что:
   - ✅ Главная страница открывается
   - ✅ Навигация работает (переход между страницами)
   - ✅ Вход/регистрация работает
   - ✅ Нет ошибок в консоли браузера (F12)

---

## 🐛 Решение проблем

### Ошибка 404 при переходе по ссылкам

**Решение:** Убедитесь, что `.htaccess` файл создан и содержит правильные правила перенаправления.

### CORS ошибка

**Решение:** Проверьте Site URL в Supabase - он должен совпадать с вашим доменом.

### Белый экран

**Решение:**
1. Откройте консоль браузера (F12) → вкладка Console
2. Посмотрите ошибки
3. Чаще всего проблема в неправильном `base` в `vite.config.ts`

Если сайт размещен в подпапке (например `домен.com/app/`), измените в `vite.config.ts`:

```typescript
export default defineConfig({
  // ...
  base: '/app/', // Укажите подпапку
  // ...
})
```

И пересоберите проект.

---

## 📦 Структура файлов на хостинге

После загрузки в `httpdocs/` должно быть:

```
httpdocs/
├── .htaccess           ← Создайте вручную
├── index.html          ← Из dist/
├── assets/             ← Из dist/
│   ├── index-xxx.js
│   ├── index-xxx.css
│   └── ...
└── (другие файлы из dist/)
```

---

## 🎯 Автоматизация (опционально)

Если хотите автоматизировать деплой, можете использовать:
- **GitHub Actions** + FTP Deploy
- **Plesk Git** (если доступен)
- **FTP-клиент с синхронизацией** (FileZilla)

---

## ✅ Готово!

После выполнения всех шагов ваш сайт будет доступен на `https://ваш-домен.com` 🎉

---

## 📞 Важные моменты:

1. **Локальная разработка:** `npm run dev` → `http://localhost:3000`
2. **Продакшен:** Собрать `npm run build` → Загрузить `dist/` на хостинг
3. **Каждое изменение:** Пересобрать → Загрузить новые файлы
