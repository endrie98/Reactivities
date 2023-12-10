import { Button, Card, Image } from "semantic-ui-react"
import { useStore } from "../../../app/stores/store"
import { observer } from "mobx-react-lite"
import { Link, useParams } from "react-router-dom"
import { useEffect } from "react"
import LoadingComponent from "../../../app/layout/LoadingComponent"

const ActivityDetails = () => {

    const { activityStore } = useStore()
    const { selectedActivity: activity, loadActivity, loadingInitial } = activityStore

    const { id } = useParams()
    
    useEffect(() => {
        if(id) loadActivity(id)
    }, [id, loadActivity])

    if(loadingInitial || !activity) return <LoadingComponent content="Finding the Activity" />

    return (
        <Card fluid>
            <Image src={`/assets/categoryImages/${activity.category}.jpg`} />
            <Card.Content>
                <Card.Header>{activity.title}</Card.Header>
                <Card.Meta>
                    <span>{activity.date}</span>
                </Card.Meta>
                <Card.Description>
                    {activity.description}
                </Card.Description>
            </Card.Content>
            <Card.Content extra>
                <div className="ui two buttons">
                    <Button as={Link} to={`/manage/${activity.id}`} basic color="blue" content='Edit' />
                    <Button as={Link} to='/activities' basic color="grey" content='Cancel' />
                </div>
            </Card.Content>
        </Card>
    )
}

export default observer(ActivityDetails)
