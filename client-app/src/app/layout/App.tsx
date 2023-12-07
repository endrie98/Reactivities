import { useEffect, useState } from 'react';

import { v4 as uuid } from 'uuid';

import { Container } from 'semantic-ui-react';
import { Activity } from '../../models/activity';

import Navbar from './NavBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import agent from './api/agent';
import LoadingComponent from './LoadingComponent';

function App() {

  const [activities, setActivites] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>(undefined);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  function handleSelectActivity(id: string) {
    setSelectedActivity(activities.find(activity => activity.id === id))
  }

  function handleCancelSelectActivity() {
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
    setSubmitting(true)
    if (activity.id) {
      agent.Activities.update(activity).then(() => {
        setActivites([...activities.filter(item => item.id !== activity.id), activity])
        setSelectedActivity(activity)
        setEditMode(false)
        setSubmitting(false)
      }).catch((error) => console.log(error))
    } else {
      activity.id = uuid()
      agent.Activities.create(activity).then(() => {
        setActivites([...activities, activity])
        setSelectedActivity(activity)
        setEditMode(false)
        setSubmitting(false)
      }).catch((error) => console.log(error))
    }
  }

  function handleDeleteActivity(id: string) {
    setSubmitting(true)
    agent.Activities.delete(id).then(() => {
      setActivites([...activities.filter(item => item.id !== id)])
       setSubmitting(false)
    }).catch((error) => console.log(error))
  }

  useEffect(() => {
    agent.Activities.list()
      .then(response => {
        // console.log(response)
        let activities: Activity[] = []
        response.forEach(activity => {
          activity.date = activity.date.split('T')[0]
          activities.push(activity)
        })
        setActivites(activities)
        setLoading(false)
      })
      .catch(err =>
        console.log(err)
      )
  }, [])

  if (loading) return <LoadingComponent content='Loading app' />

  return (
    <>
      <Navbar openForm={handleFormOpen} />
      <Container style={{ marginTop: '7em' }}>
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
          submitting={submitting}
        />
      </Container>
    </>
  )
}

export default App