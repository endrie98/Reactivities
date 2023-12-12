import { Button, Icon, Item, Segment } from "semantic-ui-react"
import { Activity } from "../../../models/activity"
import { Link } from "react-router-dom"
import { format } from "date-fns"


interface Props {
    activity: Activity
}

const ActivityListItem = ({ activity }: Props) => {

    return (
        <Segment.Group>
            <Segment>
                <Item.Group>
                    <Item>
                        <Item.Image size="tiny" circular src="/assets/user.png" />
                        <Item.Content>
                            <Item.Header as={Link} to={`/activities/${activity.id}`}>
                                {activity.title}
                            </Item.Header>
                            <Item.Description>Hosted by Bob</Item.Description>
                        </Item.Content>
                    </Item>
                </Item.Group>
            </Segment>
            <Segment>
                <span>
                    <Icon name="clock" />{format(activity.date!, 'dd MMMM yyyy h:mm aa')}
                    <Icon name="marker" />{activity.venue}
                </span>
            </Segment>
            <Segment>
                Attendes go here
            </Segment>
            <Segment clearing>
                <span>{activity.description}</span>
                <Button as={Link} to={`/activities/${activity.id}`} color="teal" floated="right" content="View" />
            </Segment>
        </Segment.Group>
    )
}

export default ActivityListItem
