import { makeAutoObservable, runInAction, } from "mobx"
import { Activity } from "../../models/activity"
import agent from "../layout/api/agent"
import { v4 as uuid } from 'uuid';

export default class ActivityStore {

    activityRegistry = new Map<string, Activity>()
    selectedActivity: Activity | undefined = undefined
    editMode: boolean = false
    loading: boolean = false
    loadingInitial: boolean = true
    
    constructor () {
        makeAutoObservable(this)
    }

    // every method function must be arrow function

    get activitiesByDate() {
        return Array.from(this.activityRegistry.values()).sort((first, second) => Date.parse(first.date) - Date.parse(second.date))
    }

    loadActivities = async () => {
        try {
            const activities = await agent.Activities.list()
            runInAction(() => {
                activities.forEach(activity => {
                    activity.date = activity.date.split('T')[0]
                    this.activityRegistry.set(activity.id, activity)
                });
                this.loadingInitial = false
            })
        } catch (error) {
           console.log(error)
           runInAction(() => {
               this.loadingInitial = false
           })
        }  
    }

    selectActivity = (id: string) => {
        this.selectedActivity = this.activityRegistry.get(id)
    }

    cancelSelectedActivity = () => {
        this.selectedActivity = undefined
    }

    openForm = (id?: string) => {
        id ? this.selectActivity(id) : this.cancelSelectedActivity()
        this.editMode = true
    }

    closeForm = () => {
        this.editMode = false
    }

    createActivity = async (activity: Activity) => {
        this.loading = true
        activity.id = uuid()
        try {
            await agent.Activities.create(activity)
            runInAction(() => {
                this.activityRegistry.set(activity.id, activity)
                this.selectedActivity = activity
                this.editMode = false
                this.loading = false
            })
        } catch (error) {
            console.log(error)
            runInAction(() => {
                this.loading = false
            })
        }
    }

    updateActivity = async (activity: Activity) => {
        this.loading = true
        try {
            await agent.Activities.update(activity)
            runInAction(() => {
                this.activityRegistry.set(activity.id, activity)
                this.selectedActivity = activity
                this.editMode = false
                this.loading = false
            })
        } catch (error) {
            console.log(error)
            runInAction(() => {
                this.loading = false
            })
        } 
    }

    deleteActivity = async (id: string) => {
        this.loading = true
        try {
            await agent.Activities.delete(id)
            runInAction(() => {
                this.activityRegistry.delete(id)
                if(this.selectedActivity?.id === id) this.cancelSelectedActivity()
                this.loading = false
            })
        } catch (error) {
            console.log(error)
            runInAction(() => {
                this.loading = false
            })
        }
    }
}