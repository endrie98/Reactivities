import { useEffect, useState } from 'react'
import './App.css'
import axios from 'axios';
import { Header, List } from 'semantic-ui-react';

function App() {

  const [activities, setActivites] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/activities')
    .then(response => {
      console.log(response)
      setActivites(response.data)
    })
    .catch(err =>
      console.log(err)
    )
  }, [])

  return (
    <>
      <Header as='h2' icon='users' content='Reactivities' />
      <div>
        <List>
          {activities.map((activity: any) => (
            <List.Item key={activity.id}>
              {activity.title}
            </List.Item>
          ))}
        </List>
      </div>
    </>
  )
}

export default App