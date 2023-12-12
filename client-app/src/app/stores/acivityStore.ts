import { makeAutoObservable, runInAction, } from "mobx"
import { Activity } from "../../models/activity"
import agent from "../layout/api/agent"
import { v4 as uuid } from 'uuid';
import { format } from "date-fns";

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
        return Array.from(this.activityRegistry.values()).sort((first, second) => first.date!.getTime() - second.date!.getTime())
    }

    get groupedActivities() {
        return Object.entries(
            this.activitiesByDate.reduce((activities, activity) => {
                const date = format(activity.date!, 'dd MMMM yyyy')
                activities[date] = activities[date] ? [...activities[date], activity] : [activity]
                return activities
            }, {} as {[key: string]: Activity[]})
        )
    }

    // for that get groupedActivity...
    // we have an array of objects each object has a key which is going to be activity date, and for each date we are going to have an array of activities inside there

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
        activity.date = new Date(activity.date!)
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