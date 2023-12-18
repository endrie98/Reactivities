import { Grid } from "semantic-ui-react"
import { useStore } from "../../../app/stores/store"
import { observer } from "mobx-react-lite"
import { useParams } from "react-router-dom"
import { useEffect } from "react"
import LoadingComponent from "../../../app/layout/LoadingComponent"
import ActivitiyDetailHeader from "./ActivitiyDetailHeader"
import ActivityDetailInfo from "./ActivityDetailInfo"
import ActivityDetailChat from "./ActivityDetailChat"
import ActivityDetailSidebar from "./ActivityDetailSidebar"

const ActivityDetails = () => {

    const { activityStore } = useStore()
    const { selectedActivity: activity, loadActivity, loadingInitial, clearSelectedActivity } = activityStore

    const { id } = useParams()
    
    useEffect(() => {
        if(id) loadActivity(id)
        return () => clearSelectedActivity()
    }, [id, loadActivity, clearSelectedActivity])

    if(loadingInitial || !activity) return <LoadingComponent content="Finding the Activity" />

    return (
        <Grid>
            <Grid.Column width={10}>
                <ActivitiyDetailHeader activity={activity} />
                <ActivityDetailInfo activity={activity} />
                <ActivityDetailChat activityId={activity.id} />
            </Grid.Column>
            <Grid.Column width={6}>
                <ActivityDetailSidebar activity={activity} />
            </Grid.Column>
        </Grid>
    )
}

export default observer(ActivityDetails)
