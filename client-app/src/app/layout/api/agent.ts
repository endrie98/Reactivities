import axios, { AxiosError, AxiosResponse } from 'axios'
import { Activity } from '../../../models/activity'
import { toast } from 'react-toastify'
import { router } from '../../router/Routes'
import { store } from '../../stores/store'

axios.defaults.baseURL = 'http://localhost:5000/api'

const sleep = (delay: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, delay)
    })
}

axios.interceptors.response.use(async response => {
    await sleep(1000)
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
    list: () => request.get<Activity[]>('/activities'),
    details: (id: string) => request.get<Activity>(`/activities/${id}`),

    // create: (activity: Activity) => request.post('/activities', activity),
    // update: (activity: Activity) => request.put(`/activities/${activity.id}`, activity),
    // delete: (activity: Activity) => request.del(`/activities/${activity.id}`)

    create: (activity: Activity) => axios.post<void>('/activities', activity),
    update: (activity: Activity) => axios.put<void>(`/activities/${activity.id}`, activity),
    delete: (id: string) => axios.delete<void>(`/activities/${id}`)
}

const agent = {
    Activities
}

export default agent