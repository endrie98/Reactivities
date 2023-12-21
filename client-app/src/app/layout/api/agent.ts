import axios, { AxiosError, AxiosResponse } from 'axios'
import { Activity, ActivityFormValues } from '../../../models/activity'
import { toast } from 'react-toastify'
import { router } from '../../router/Routes'
import { store } from '../../stores/store'
import { User, UserFormValues } from '../../../models/user'
import { Photo, Profile } from '../../../models/profile'
import { PaginationResult } from '../../../models/pagination'
import { UserActivity } from '../../../models/userActivity'

axios.defaults.baseURL = 'http://localhost:5000/api'

const sleep = (delay: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, delay)
    })
}

axios.interceptors.request.use(config => {
    const token = store.commonStore.token
    if(token && config.headers) config.headers.Authorization = `Bearer ${token}`
    return config
})

axios.interceptors.response.use(async response => {
    await sleep(1000)
    const pagination = response.headers["pagination"]
    if(pagination) {
        response.data = new PaginationResult(response.data, JSON.parse(pagination))
        return response as AxiosResponse<PaginationResult<any>>
    }
    return response
}, (error: AxiosError) => {
    const { data, status, config } = error.response as AxiosResponse;
    switch(status) {
        case 400:
            if(config.method === 'get' && data.errors.hasOwnProperty('id')) {
                router.navigate('/not-found')
            }
            if(data.errors) {
                const modalStateErrors = [];
                for(const key in data.errors) {
                    if(data.errors[key]) {
                        modalStateErrors.push(data.errors[key])
                    }
                }
                throw modalStateErrors.flat()
            } else {
                 toast.error(data)
            }
            break;
        case 401:
            toast.error('unauthorised')
            break;
        case 403: 
            toast.error('forbidden')
            break;
        case 404:
            router.navigate('/not-found')
            break;
        case 500: 
            store.commonStore.setServerError(data)
            router.navigate('/server-error')
            break;
    }
    return Promise.reject(error)
})

const responseBody = <T>(response: AxiosResponse<T>) => response.data

const request = {
    get: <T>(url: string) => axios.get<T>(url).then(responseBody),
    post: <T>(url: string, _body: {}) => axios.post<T>(url).then(responseBody),
    put: <T>(url: string, _body: {}) => axios.put<T>(url).then(responseBody),
    del: <T>(url: string) => axios.delete<T>(url).then(responseBody)
}

const Activities = {
    list: (params: URLSearchParams) => axios.get<PaginationResult<Activity[]>>('/activities', {params}).then(responseBody),
    details: (id: string) => request.get<Activity>(`/activities/${id}`),

    // create: (activity: Activity) => request.post('/activities', activity),
    // update: (activity: Activity) => request.put(`/activities/${activity.id}`, activity),
    // delete: (activity: Activity) => request.del(`/activities/${activity.id}`)

    create: (activity: ActivityFormValues) => axios.post<void>('/activities', activity),
    update: (activity: ActivityFormValues) => axios.put<void>(`/activities/${activity.id}`, activity),
    delete: (id: string) => axios.delete<void>(`/activities/${id}`),
    attend: (id: string) => axios.post<void>(`/activities/${id}/attend`, {})
}

const Account = {
    current: () => request.get<User>('/account'),
    login: (user: UserFormValues) => axios.post<User>('/account/login', user),
    register: (user: UserFormValues) => axios.post<User>('/account/register', user)
}

const Profiles = {
    get: (username: string) => request.get<Profile>(`/profiles/${username}`),
    uploadPhoto: (file: Blob) => {
        let formData = new FormData();
        formData.append("File", file);
        return axios.post<Photo>("photos", formData, {
            headers: {'Content-Type': 'multipart/form-data'}
        })
    },
    setMainPhoto: (id: string) => axios.post(`/photos/${id}/setMain`, {}),
    deletePhoto: (id: string) => axios.delete(`/photos/${id}`),
    updateProfile: (profile: Partial<Profile>) => axios.put(`/profiles`, profile),
    updateFollowing: (username: string) => axios.post(`/follow/${username}`, {}),
    listFollowings: (username: string, predicate: string) => request.get<Profile[]>(`/follow/${username}?predicate=${predicate}`),
    listActivities: (username: string, predicate: string) => request.get<UserActivity[]>(`/profiles/${username}/activities?predicate=${predicate}`)
}

const agent = {
    Activities,
    Account,
    Profiles
}

export default agent