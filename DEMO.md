# 🎬 Демонстрация Úmit Platform

## ✅ Проект успешно собран!

### 📊 Статистика сборки:
- **Размер CSS**: 39.88 kB (gzip: 11.10 kB)
- **Размер JS**: 456.01 kB (gzip: 139.86 kB)
- **Время сборки**: 3.61s
- **Модулей обработано**: 155

## 🚀 Как запустить локально:

### 1. Установка зависимостей
```bash
npm install
```

### 2. Запуск dev-сервера
```bash
npm run dev
```
Откройте: http://localhost:3000

### 3. Production сборка
```bash
npm run build
npm run preview
```

## 📱 Доступные страницы:

### Главная страница (`/`)
- Hero секция с призывом к действию
- Блок возможностей платформы
- Категории помощи с иконками
- Статистика в реальном времени
- CTA секции

### Аутентификация
- **`/login`** - Вход в систему
- **`/register`** - Регистрация с выбором роли:
  - Нуждающийся (Beneficiary)
  - Благотворитель (Donor)
  - Волонтёр (Volunteer)
  - Приют (Shelter)
  - НКО (NGO)

### Запросы помощи
- **`/requests`** - Каталог запросов с фильтрами
  - Фильтр по категориям (продукты, одежда, медикаменты, и т.д.)
  - Фильтр по статусам (ожидает, одобрено, в процессе, завершено)
  - Карточки с приоритетами (низкий, средний, высокий, срочно)

- **`/create-request`** - Создание нового запроса
  - Форма с валидацией
  - Выбор категории и приоритета
  - Геолокация (адрес, город, регион)
  - Загрузка фотографий

### Приюты (`/shelters`)
- Каталог приютов для животных и людей
- Статистика: 45 приютов для животных, 23 социальных центра
- Рейтинговая система
- Верифицированные организации
- Контактная информация

### Волонтёры (`/volunteers`)
- **Доска почёта** с топ-волонтёрами
- Система уровней:
  - 🏅 Бронза (1-10 помощей)
  - ⭐ Серебро (11-50 помощей)
  - 👑 Золото (51-100 помощей)
  - 💎 Платина (100+ помощей)
- Таблица всех волонтёров с рейтингами
- Подиум лидеров месяца

### Карта (`/map`)
- Интерактивная карта на базе Leaflet
- Маркеры запросов помощи
- Маркеры приютов
- Фильтры по типам
- Легенда карты
- Геолокация: центр Алматы

### Профиль (`/profile`)
- Статистика пользователя:
  - Запросов создано
  - Запросов выполнено
  - Помощь оказана
  - Волонтёров помогло
  - Рейтинг
- История активности
- Достижения
- Редактирование профиля

## 🎨 Основные компоненты:

### Layout Components
- **Header** - навигация, аутентификация, профиль
- **Footer** - ссылки, контакты, соцсети
- **Layout** - общий wrapper для всех страниц

### Features
✅ Полная типизация TypeScript
✅ Адаптивный дизайн (mobile-first)
✅ Градиентная цветовая схема
✅ Анимации и переходы
✅ React Hook Form с валидацией
✅ React Query для кеширования
✅ Zustand для глобального состояния
✅ React Router для навигации
✅ Leaflet карты

## 🎯 Mock данные

Для демонстрации используются mock данные в:
- `src/pages/RequestsPage.tsx` - примеры запросов
- `src/pages/SheltersPage.tsx` - примеры приютов
- `src/pages/VolunteersPage.tsx` - примеры волонтёров
- `src/pages/ProfilePage.tsx` - статистика пользователя

## 🔌 Интеграция с Supabase

Готовые сервисы для работы с API в `src/services/supabase.ts`:

```typescript
// Аутентификация
authService.login(email, password)
authService.register(email, password, userData)
authService.logout()
authService.getCurrentUser()

// Запросы помощи
requestsService.getAll(filters)
requestsService.getById(id)
requestsService.create(data)
requestsService.update(id, data)

// Приюты
sheltersService.getAll(filters)
sheltersService.getById(id)
sheltersService.create(data)

// Отклики
responsesService.create(data)
responsesService.update(id, data)
```

## 📸 Примеры UI

### Цветовая палитра
- **Primary**: голубой градиент (#0ea5e9)
- **Secondary**: фиолетовый градиент (#d946ef)
- **Success**: зеленый (#10b981)
- **Warning**: оранжевый (#f59e0b)
- **Danger**: красный (#ef4444)

### UI Kit
- Кнопки: `.btn-primary`, `.btn-secondary`, `.btn-outline`
- Формы: `.input-field`
- Карточки: `.card`
- Все стили в Tailwind CSS

## 🌐 Деплой

### GitHub Pages
GitHub Actions workflow уже настроен в `.github/workflows/deploy.yml`

При пуше в main/master автоматически:
1. Устанавливаются зависимости
2. Собирается production версия
3. Деплоится на GitHub Pages

### Manual Deploy
```bash
npm run build
# Результат в папке dist/
```

## 📦 Структура dist/
```
dist/
├── index.html           # Главная HTML страница
├── vite.svg            # Иконка приложения
└── assets/
    ├── index-*.js       # JavaScript bundle (456 KB)
    ├── index-*.css      # CSS styles (40 KB)
    └── index-*.js.map   # Source map
```

## 🎓 Технологии

- React 18.3 + TypeScript 5.6
- Vite 5.4
- Tailwind CSS 3.4
- React Router 6
- React Query (TanStack)
- Zustand
- React Hook Form
- Leaflet + React-Leaflet
- Supabase SDK

## 🚀 Следующие шаги

1. **Настроить Supabase бэкенд**
   - Создать коллекции (users, help_requests, shelters, etc.)
   - Настроить роли и права доступа
   - Добавить поля согласно типам в `src/types/index.ts`

2. **Заменить mock данные**
   - Подключить реальные API вызовы
   - Убрать моки из компонентов

3. **Добавить функционал**
   - Загрузка изображений
   - Real-time уведомления
   - Чат между пользователями
   - Push-уведомления

4. **Мобильное приложение**
   - React Native версия
   - Или PWA с офлайн поддержкой

5. **Блокчейн интеграция** (будущее)
   - Фиксация транзакций помощи
   - NFT достижения для волонтёров

---

**Статус**: ✅ Готово к разработке и демонстрации!
