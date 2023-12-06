import { useEffect, useState } from 'react';

import {v4 as uuid} from 'uuid';
import axios from 'axios';

import { Container } from 'semantic-ui-react';
import { Activity } from '../../models/activity';

import Navbar from './NavBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';

function App() {

  const [activities, setActivites] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>(undefined);
  const [editMode, setEditMode] = useState(false);

  function handleSelectActivity (id: string) {
    setSelectedActivity(activities.find(activity => activity.id === id))
  }

  function handleCancelSelectActivity () {
    setSelectedActivity(undefined)
  }

  function handleFormOpen(id?: string) {
    id ? handleSelectActivity(id) : handleCancelSelectActivity();
    setEditMode(true);
  }

  function handleFormClose() {
    setEditMode(false)
  }

  function handleCreateOrEditActivity(activity: Activity) {
    activity.id 
      ? setActivites([...activities.filter(item => item.id !== activity.id), activity])
      : setActivites([...activities, {...activity, id: uuid()}])
      setEditMode(false)
      setSelectedActivity(activity)
  }

  function handleDeleteActivity(id: string) {
    setActivites([...activities.filter(item => item.id !== id)])
  }

  useEffect(() => {
      axios.get<Activity[]>('http://localhost:5000/api/activities')
          .then(response => {
              // console.log(response)
              setActivites(response.data)
          })
          .catch(err =>
              console.log(err)
          )
  }, [])

  return (
    <>
      <Navbar openForm={handleFormOpen} />
      <Container style={{marginTop: '7em'}}>
        <ActivityDashboard 
          activities={activities}
          selectedActivity={selectedActivity}
          selectActivity={handleSelectActivity}
          cancelSelect={handleCancelSelectActivity}
          editMode={editMode}
          openForm={handleFormOpen}
          closeForm={handleFormClose}
          createOrEdit={handleCreateOrEditActivity}
          deleteActivity={handleDeleteActivity}
        />
      </Container>
    </>
  )
}

export default App