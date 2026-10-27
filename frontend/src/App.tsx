import { useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { getHealth } from './api'
import { Button, Card, Input } from './components/ui'

function ServerStatus() {
  const [state, setState] = useState('Проверяем соединение…')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 5000)
    setState('Проверяем соединение…')
    getHealth(controller.signal)
      .then(() => setState('Сервер доступен'))
      .catch(() => setState('Нет соединения с сервером'))
    return () => { controller.abort(); window.clearTimeout(timeout) }
  }, [attempt])
  return <div className="server"><span role="status">{state}</span>
    <button aria-label="Повторить проверку соединения" onClick={() => setAttempt(x => x + 1)}>↻</button>
  </div>
}

function EmptyChat() {
  return <div className="empty-chat">
    <h1>Окно переписки</h1>
    <p>Нет выбранного диалога.</p>
    <p>После входа здесь появятся ваши сообщения.</p>
    <Link to="/login">Перейти ко входу</Link>
  </div>
}

function AuthPage({ register = false }) {
  return <div className="page"><Card>
    <h1>{register ? 'Регистрация' : 'Экран входа'}</h1>
    {register && <Input id="username" label="Имя пользователя" placeholder="Логин" disabled />}
    <Input id="email" label="Электронная почта" type="email" placeholder="Почта" disabled />
    <Input id="password" label="Пароль" type="password" placeholder="Пароль" disabled />
    <Button disabled>{register ? 'Создать аккаунт' : 'Войти'}</Button>
    <p>{register ? 'Уже есть аккаунт?' : 'Нет аккаунта?'} <Link to={register ? '/login' : '/register'}>{register ? 'Войти' : 'Регистрация'}</Link></p>
    <p className="placeholder-note">Форма пока недоступна.</p>
  </Card></div>
}

function ProfilePage() {
  return <div className="page profile-page"><Card>
    <h1>Ваш профиль</h1>
    <div className="avatar-placeholder" aria-label="Место для аватара" />
    <Input id="display-name" label="Имя пользователя" placeholder="Ваше имя" disabled />
    <label className="field" htmlFor="description">Описание
      <textarea id="description" rows={4} placeholder="О себе" disabled />
    </label>
    <Button disabled>Сохранить изменения</Button>
    <p className="placeholder-note">Данные профиля появятся после входа.</p>
  </Card></div>
}

function ChatPage() {
  return <div className="chat-page">
    <h1>Переписка</h1>
    <div className="message-area"><p>Сообщений пока нет.</p></div>
    <div className="message-input">
      <label htmlFor="message">Сообщение</label>
      <textarea id="message" rows={3} placeholder="Написать сообщение" disabled />
      <Button disabled>Отправить</Button>
    </div>
  </div>
}

export function App() {
  const profile = useLocation().pathname === '/profile'
  return <div className="app-shell">
    <aside className="sidebar">
      <Link to="/dialogs" className="brand">SAXophone</Link>
      <div className="sidebar-title">
        {profile && <Link to="/dialogs" className="close-settings" aria-label="Закрыть настройки">×</Link>}
        <h2>{profile ? 'Настройки и профиль' : 'Чаты'}</h2>
      </div>
      {profile ? <nav className="settings-list"><a href="#display-name">Имя пользователя</a><a href="#description">Описание</a></nav>
        : <div className="sidebar-empty"><p>Пока нет чатов</p><p>Войдите в аккаунт, чтобы начать общение.</p></div>}
      <div className="sidebar-footer">
        <NavLink to="/profile">⚙ Настройки и профиль</NavLink>
        <NavLink to="/login">Войти</NavLink>
      </div>
    </aside>
    <main>
      <header className="topbar"><span>Мессенджер</span><ServerStatus /></header>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dialogs" element={<EmptyChat />} />
        <Route path="/chat/:chatId" element={<ChatPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage register />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<div className="page"><Card><h1>Страница не найдена</h1><Link to="/dialogs">К диалогам</Link></Card></div>} />
      </Routes>
    </main>
  </div>
}
