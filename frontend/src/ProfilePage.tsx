import { Link } from 'react-router-dom'
import { useAuth } from './auth'
import { Card } from './components/ui'

export function ProfilePage() {
  const { user } = useAuth()
  return <div className="page profile-page"><Card>
    <h1>Ваш профиль</h1>
    <div className="avatar-placeholder" aria-hidden="true" />
    <dl id="profile-data" className="profile-data">
      <dt>Имя</dt><dd>{user?.display_name}</dd>
      <dt>Логин</dt><dd>{user?.username}</dd>
      <dt>Электронная почта</dt><dd>{user?.email}</dd>
    </dl>
    <Link to="/dialogs">К диалогам</Link>
  </Card></div>
}
