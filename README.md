# 🌿 Úmit - Социальный реестр адресной помощи

![Úmit Platform](https://img.shields.io/badge/Version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Vite](https://img.shields.io/badge/Vite-5.4-purple)

## 🎯 О проекте

**Úmit** — единая цифровая экосистема, объединяющая благотворителей, нуждающихся, НКО, государственные структуры и бизнес для **прозрачной координации адресной натуральной помощи** без финансовых операций.

> 💬 "Реальная помощь реальным людям с полной прозрачностью — без денег, только доброта."

## 🚀 Технологический стек

### Frontend
- **React 18.3** - UI библиотека
- **TypeScript 5.6** - Типобезопасность
- **Vite 5.4** - Сборщик и dev-сервер
- **React Router 6** - Маршрутизация
- **Tailwind CSS 3.4** - Стилизация
- **React Query (TanStack)** - Управление состоянием и кешированием
- **Zustand** - Легковесный state manager
- **React Hook Form** - Управление формами
- **Leaflet & React-Leaflet** - Интерактивные карты

### Backend
- **Supabase** - PostgreSQL база данных, аутентификация, storage

## 📦 Установка и запуск

### Предварительные требования
- Node.js 18+
- npm или yarn
- Supabase аккаунт (бесплатный)

### Установка зависимостей

```bash
npm install
```

### Конфигурация

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_NAME=Úmit
VITE_APP_URL=https://umit.asia
```

> См. [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) для подробной настройки бэкенда

### Запуск в режиме разработки

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

### Сборка для production

```bash
npm run build
```

### Предпросмотр production сборки

```bash
npm run preview
```

## 🏗 Структура проекта

```
umit-platform/
├── src/
│   ├── components/       # Переиспользуемые компоненты
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Layout.tsx
│   ├── pages/           # Страницы приложения
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── RequestsPage.tsx
│   │   ├── CreateRequestPage.tsx
│   │   ├── SheltersPage.tsx
│   │   ├── VolunteersPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── MapPage.tsx
│   ├── services/        # API сервисы
│   │   └── supabase.ts
│   ├── stores/          # Zustand stores
│   │   └── authStore.ts
│   ├── types/           # TypeScript типы
│   │   └── index.ts
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Утилиты
│   ├── assets/          # Статические ресурсы
│   ├── App.tsx          # Главный компонент
│   ├── main.tsx         # Точка входа
│   └── index.css        # Глобальные стили
├── public/              # Публичные файлы
├── index.html           # HTML шаблон
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## ✨ Основные функции

### 1. Система аутентификации
- Регистрация пользователей с выбором роли
- Вход/выход из системы
- Верификация пользователей

### 2. Запросы помощи
- Создание запросов с описанием и геолокацией
- Категории: продукты, одежда, медикаменты, услуги, помощь животным
- Приоритеты: низкий, средний, высокий, срочно
- Фильтрация и поиск

### 3. Приюты
- Каталог приютов для животных и людей
- Детальная информация и контакты
- Рейтинговая система

### 4. Доска почёта волонтёров
- Система уровней: Бронза, Серебро, Золото, Платина
- Рейтинги и статистика
- Достижения

### 5. Интерактивная карта
- Геолокация запросов и приютов
- Фильтры по категориям
- Кластеризация маркеров

### 6. Профиль пользователя
- Персональная статистика
- История активности
- Достижения

## 🎨 Дизайн-система

### Цветовая палитра

```css
/* Primary - Голубой */
--primary-500: #0ea5e9

/* Secondary - Фиолетовый */
--secondary-500: #d946ef

/* Success - Зеленый */
--success-500: #10b981

/* Warning - Оранжевый */
--warning-500: #f59e0b

/* Danger - Красный */
--danger-500: #ef4444
```

## 🔐 Роли пользователей

1. **Beneficiary (Нуждающийся)** - может создавать запросы на помощь
2. **Donor (Благотворитель)** - может откликаться на запросы
3. **Volunteer (Волонтёр)** - активный участник помощи
4. **Shelter (Приют)** - организация, управляющая приютом
5. **NGO (НКО)** - некоммерческая организация
6. **Admin (Администратор)** - полный доступ к системе

## 🌐 Развертывание на GitHub Pages

1. Обновите `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/your-repo-name/',
  // ...
})
```

2. Соберите проект:

```bash
npm run build
```

3. Разверните в ветку `gh-pages`:

```bash
git add dist -f
git commit -m "Deploy to GitHub Pages"
git subtree push --prefix dist origin gh-pages
```

## 🤝 Вклад в проект

Мы приветствуем вклад сообщества! Пожалуйста:

1. Fork проекта
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📝 Roadmap

- [x] MVP фронтенд
- [x] Интеграция с Supabase
- [x] Система аутентификации
- [x] Основные страницы
- [ ] Интеграция с реальным Supabase бэкендом
- [ ] Загрузка изображений через Supabase Storage
- [ ] Real-time уведомления
- [ ] Мобильное приложение
- [ ] Блокчейн интеграция (будущее)
- [ ] NFT достижения (будущее)

## 📄 Лицензия

MIT License - см. файл LICENSE для деталей

## 📞 Контакты

- Email: info@umit.asia
- Telegram: @umit_help
- Сайт: [umit.asia](https://umit.asia)

---

Сделано с ❤️ для тех, кто нуждается в помощи
