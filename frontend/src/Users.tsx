import { useEffect, useState } from "react"

type User = {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
}

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const HOSTNAME = window.location.hostname
    const PORT = 3000

    fetch(`http://${HOSTNAME}:${PORT}/users`)
      .then(res => res.json())
      .then(data => {
        setUsers(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.filter((user, index)=>index<5).map(user => (
          <li key={user.id}>
            {user.username} ({user.email}) {user.first_name} {user.last_name}
          </li>
        ))}
      </ul>
    </div>
  )
}