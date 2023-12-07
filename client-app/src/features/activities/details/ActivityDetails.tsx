import { Button, Card, Image } from "semantic-ui-react"
import { useStore } from "../../../app/stores/store"

const ActivityDetails = () => {

    const { activityStore } = useStore()
    const { selectedActivity: activity, cancelSelectedActivity, openForm } = activityStore

    if(!activity) return

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
                    <Button basic color="blue" onClick={() => openForm(activity.id)} content='Edit' />
                    <Button basic onClick={cancelSelectedActivity} color="grey" content='Cancel' />
                </div>
            </Card.Content>
        </Card>
    )
}

export default ActivityDetails
