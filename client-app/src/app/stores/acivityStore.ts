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

    constructor() {
        makeAutoObservable(this)
    }

    // every method or function must be arrow function

    get activitiesByDate() {
        return Array.from(this.activityRegistry.values()).sort((first, second) => Date.parse(first.date) - Date.parse(second.date))
    }

    loadActivities = async () => {
        this.loadingInitial = true
        this.selectedActivity = undefined
        try {
            const activities = await agent.Activities.list()
            runInAction(() => {
                activities.forEach(activity => {
                    this.setActivity(activity)
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

    loadActivity = async (id: string) => {
        let activity = this.getActivity(id)
        if (activity) {
            this.selectedActivity = activity
            this.loadingInitial = false
            return activity
        }
        else {
            this.loadingInitial = true
            try {
                activity = await agent.Activities.details(id)
                this.setActivity(activity)
                runInAction(() => {
                    this.selectedActivity = activity
                    this.loadingInitial = false
                })
                return activity
            } catch (error) {
                console.log(error)
                runInAction(() => {
                    this.loadingInitial = false
                })
            }
        }
    }

    private setActivity = (activity: Activity) => {
        activity.date = activity.date.split('T')[0]
        this.activityRegistry.set(activity.id, activity)
    }

    private getActivity = (id: string) => {
        return this.activityRegistry.get(id)
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