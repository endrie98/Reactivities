import { Button, Header, Segment } from "semantic-ui-react"
import { v4 as uuid } from 'uuid'
import { useEffect, useState } from "react";
import { useStore } from "../../../app/stores/store";
import { observer } from "mobx-react-lite";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ActivityFormValues } from "../../../models/activity";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { Formik, Form } from "formik";
import * as Yup from 'yup';
import MyTextInput from "../../../app/common/form/MyTextInput";
import MyTextArea from "../../../app/common/form/MyTextArea";
import MySelectInput from "../../../app/common/form/MySelectInput";
import { categoryOptions } from "../../../app/common/options/categoryOptions";
import MyDateInput from "../../../app/common/form/MyDateInput";

const ActivityForm = () => {

    const { activityStore } = useStore()
    const { createActivity, updateActivity, loadActivity, loadingInitial } = activityStore

    const { id } = useParams()
    const navigate = useNavigate()

    const [activity, setActivity] = useState<ActivityFormValues>(new ActivityFormValues)

    const validationSchema = Yup.object({
        title: Yup.string().required('The activity title is required'),
        description: Yup.string().required('The activity description is required'),
        category: Yup.string().required('The activity category is required'),
        date: Yup.string().required('The activity date is required'),
        venue: Yup.string().required('The activity venue is required'),
        city: Yup.string().required('The activity city is required')
    })

    useEffect(() => {
        if (id) loadActivity(id).then(activity => setActivity(new ActivityFormValues(activity))).catch((error) => console.log(error))
    }, [id, loadActivity])

    function handleFormSubmit(activity: ActivityFormValues) {
        if(!activity.id) {
            activity.id = uuid()
            createActivity(activity).then(() => navigate(`/activities/${activity.id}`)).catch((error) => console.log(error))
        } else {
            updateActivity(activity).then(() => navigate(`/activities/${activity.id}`)).catch((error) => console.log(error))
        }
        // activity.id ? updateActivity(activity) : createActivity(activity)
    }

    if (id && loadingInitial) return <LoadingComponent content="Fetching the Activity" />

    return (
        <Segment clearing>
            <Header content="Activity Details" sub color="teal" />
            <Formik validationSchema={validationSchema} enableReinitialize initialValues={activity} onSubmit={values => handleFormSubmit(values)}>
                {({ handleSubmit, isValid, isSubmitting, dirty }) => (
                    <Form className="ui form" onSubmit={handleSubmit} autoComplete="off">
                        <MyTextInput name="title" placeholder="Title" />
                        <MyTextArea rows={3} placeholder="Description" name='description' />
                        <MySelectInput options={categoryOptions} placeholder="Category" name='category' />
                        <MyDateInput showTimeSelect timeCaption="time" dateFormat="MMMM d, yyyy h:mm aa" placeholderText="Date" name='date' />
                        <Header content="Location Details" sub color="teal" />
                        <MyTextInput placeholder="City" name='city' />
                        <MyTextInput placeholder="Venue" name='venue'/>
                        <Button disabled={isSubmitting || !dirty || !isValid} loading={isSubmitting} floated="right" positive type="submit" content="Submit" />
                        <Button as={Link} to='/activities' floated="right" type="button" content="Cancel" />
                    </Form>
                )}
            </Formik>
        </Segment>
    )
}

export default observer(ActivityForm)