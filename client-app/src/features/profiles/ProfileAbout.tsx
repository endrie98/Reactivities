import { observer } from "mobx-react-lite"
import { useStore } from "../../app/stores/store"
import { useState } from "react"
import { Button, Grid, Header, Tab } from "semantic-ui-react"
import ProfileEdit from "./ProfileEdit"

const ProfileAbout = () => {

    const { profileStore } = useStore()
    const { isCurrentUser, profile } = profileStore
    const [editMode, setEditMode] = useState(false)

  return (
    <div>
      <Tab.Pane>
        <Grid>
            <Grid.Column width={16}>
                <Header floated="left" icon='user' content={`About ${profile?.displayName}`}></Header>
                {isCurrentUser && (
                    <Button floated="right" basic content={editMode ? 'Cancel' : 'Edit Profile'} onClick={() => setEditMode(!editMode)}></Button>
                )}
            </Grid.Column>
            <Grid.Column width={16}>
                {editMode ? <ProfileEdit setEditMode={setEditMode} /> : <span style={{ whiteSpace: 'pre-wrap' }}>{profile?.bio}</span>}
            </Grid.Column>
        </Grid>
      </Tab.Pane>
    </div>
  )
}

export default observer(ProfileAbout)
