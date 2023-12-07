import { Grid } from "semantic-ui-react"

import { Activity } from "../../../models/activity"
import ActivityList from "./ActivityList";
import ActivityDetails from "../details/ActivityDetails";
import ActivityForm from "../form/ActivityForm";

interface Props {
    activities: Activity[];
    selectedActivity: Activity | undefined;
    selectActivity: (id: string) => void;
    cancelSelect: () => void;
    editMode: boolean;
    submitting: boolean;
    openForm: (id: string) => void;
    closeForm: () => void;
    createOrEdit: (activity: Activity) => void;
    deleteActivity: (id: string) => void;
}

const ActivityDashboard = ({
    activities,
    selectActivity,
    selectedActivity,
    cancelSelect,
    editMode,
    submitting,
    openForm,
    closeForm,
    createOrEdit,
    deleteActivity }: Props) => {

    return (
        <>
            <Grid>
                <Grid.Column width='10'>
                    <ActivityList submitting={submitting} activities={activities} selectActivity={selectActivity} deleteActivity={deleteActivity} />
                </Grid.Column>

                <Grid.Column width='6'>
                    {selectedActivity && !editMode && (
                        <ActivityDetails 
                            activity={selectedActivity} 
                            cancelSelectActivity={cancelSelect} 
                            openForm={openForm}
                        />
                    )}
                    {editMode && <ActivityForm submitting={submitting} closeForm={closeForm} activity={selectedActivity} createOrEdit={createOrEdit} />}
                </Grid.Column>
            </Grid>
        </>
    )
}

export default ActivityDashboard
