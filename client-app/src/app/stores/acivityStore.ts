import { makeAutoObservable, reaction, runInAction, } from "mobx"
import { Activity, ActivityFormValues } from "../../models/activity"
import agent from "../layout/api/agent"
import { format } from "date-fns";
import { store } from "./store";
import { Profile } from "../../models/profile";
import { Pagination, PagingParams } from "../../models/pagination";

export default class ActivityStore {

    activityRegistry = new Map<string, Activity>()
    selectedActivity: Activity | undefined = undefined
    editMode: boolean = false
    loading: boolean = false
    loadingInitial: boolean = true
    pagination: Pagination | null = null
    pagingParams = new PagingParams()
    predicate = new Map().set('all', true)

    constructor() {
        makeAutoObservable(this)

        reaction(
            () => this.predicate.keys(),
            () => {
                this.pagingParams = new PagingParams()
                this.activityRegistry.clear()
                this.loadActivities()
            }
        )
    }

    setPagingParams = (pagingParams: PagingParams) => {
        this.pagingParams = pagingParams
    }

    setPredicate = (predicate: string, value: string | Date) => {
        const resetPredicate = () => {
            this.predicate.forEach((_value, key) => {
                if(key !== 'startDate') this.predicate.delete(key)
            })
        }
        switch(predicate) {
            case 'all':
                resetPredicate();
                this.predicate.set('all', true)
                break;
            case 'isGoing':
                resetPredicate()
                this.predicate.set('isGoing', true)
                break;
            case 'isHost':
                resetPredicate()
                this.predicate.set('isHost', true)
                break;
            case 'startDate':
                this.predicate.delete('startDate')
                this.predicate.set('startDate', value)
        }
    }

    get axiosParams() {
        const params = new URLSearchParams()
        params.append("pageNumber", this.pagingParams.pageNumber.toString())
        params.append("pageSize", this.pagingParams.pageSize.toString())
        this.predicate.forEach((value, key) => {
            if(key === 'startDate') {
                params.append(key, (value as Date).toISOString())
            } else {
                params.append(key, value)
            }
        })
        return params
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
            const result = await agent.Activities.list(this.axiosParams)
            console.log(result)
            runInAction(() => {
                result.data.forEach(activity => {
                    this.setActivity(activity)
                });
                this.setPagination(result.pagination)
                this.loadingInitial = false
            })
        } catch (error) {
            console.log(error)
            runInAction(() => {
                this.loadingInitial = false
            })
        }
    }

    setPagination = (pagination: Pagination) => {
        this.pagination = pagination
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
        const user = store.userStore.user
        if(user) {
            activity.isGoing = activity.attendees!.some(
                a => a.username === user.username 
            )
            activity.isHost = activity.hostUsername === user.username
            activity.host = activity.attendees?.find(x => x.username === activity.hostUsername)
        }
        activity.date = new Date(activity.date!)
        this.activityRegistry.set(activity.id, activity)
    }

    private getActivity = (id: string) => {
        return this.activityRegistry.get(id)
    }


    createActivity = async (activity: ActivityFormValues) => {
        const user = store.userStore.user
        const attende = new Profile(user!)
        try {
            await agent.Activities.create(activity)
            const newActivity = new Activity(activity)
            newActivity.hostUsername = user!.username
            newActivity.attendees = [attende]
            this.setActivity(newActivity)
            runInAction(() => {
                this.selectedActivity = newActivity
            })
        } catch (error) {
            console.log(error)
        }
    }

    updateActivity = async (activity: ActivityFormValues) => {
        try {
            await agent.Activities.update(activity)
            runInAction(() => {
                if(activity.id) {
                    const updatedActivity = {...this.getActivity(activity.id), ...activity}
                    this.activityRegistry.set(activity.id, updatedActivity as Activity)
                    this.selectedActivity = updatedActivity as Activity
                }
            })
        } catch (error) {
            console.log(error)
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

    updateAttendance = async () => {
        const user = store.userStore.user
        this.loading = true
        try {
            await agent.Activities.attend(this.selectedActivity!.id)
            runInAction(() => {
                if(this.selectedActivity?.isGoing) {
                    this.selectedActivity.attendees = this.selectedActivity.attendees?.filter(a => a.username !== user?.username)
                    this.selectedActivity.isGoing = false
                } else {
                    const attende = new Profile(user!)
                    this.selectedActivity?.attendees?.push(attende)
                    this.selectedActivity!.isGoing = true
                }
                this.activityRegistry.set(this.selectedActivity!.id, this.selectedActivity!)
            })
        } catch (error) {
            console.log(error)
        } finally {
            runInAction(() => this.loading = false)
        }
    }

    cancelActivityToggle = async () => {
        this.loading = true
        try {
            await agent.Activities.attend(this.selectedActivity!.id)
            runInAction(() => {
                this.selectedActivity!.isCancelled = !this.selectedActivity?.isCancelled
                this.activityRegistry.set(this.selectedActivity!.id, this.selectedActivity!)
            })
        } catch (error) {
            console.log(error)
        } finally {
            runInAction(() => this.loading = false)
        }
    }

    clearSelectedActivity = () => {
        this.selectedActivity = undefined
    }
    
    updateAttendeeFollowing = (username: string) => {
        this.activityRegistry.forEach(activity => {
            activity.attendees.forEach(attendee => {
                if(attendee.username === username) {
                    attendee.following ? attendee.followersCount-- : attendee.followersCount++
                    attendee.following = !attendee.following
                }
            })
        })
    }
}