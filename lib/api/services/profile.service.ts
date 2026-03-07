import {UserProfileCreate, UserProfileResponse} from "../types";
import {apiClient} from "../api-client";

export interface UserProfileUpdate {
    bio?: string
    firstName?: string
    lastName?: string
    academicLevel?: string
    studentSubjectIds?: number[]
}

export const profileService = {
    create: (data: UserProfileCreate, imageFile?: File) => {
        const form = new FormData()
        if (data.bio) form.append('bio', data.bio)
        form.append('firstName', data.firstName)
        form.append('lastName', data.lastName)
        form.append('academicLevel', data.academicLevel)
        data.studentSubjectIds.forEach((id) => form.append('studentSubjectIds', String(id)))
        if (imageFile) form.append('image', imageFile)
        return apiClient.post<UserProfileResponse>('/profile', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then((r) => r.data)
    },

    update: (data: UserProfileUpdate, imageFile?: File) => {
        const form = new FormData()
        if (data.bio !== undefined) form.append('bio', data.bio)
        if (data.firstName) form.append('firstName', data.firstName)
        if (data.lastName) form.append('lastName', data.lastName)
        if (data.academicLevel) form.append('academicLevel', data.academicLevel)
        if (data.studentSubjectIds) {
            data.studentSubjectIds.forEach((id) => form.append('studentSubjectIds', String(id)))
        }
        if (imageFile) form.append('image', imageFile)
        return apiClient.put<UserProfileResponse>('/profile', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then((r) => r.data)
    },

    getById: (userId: number) =>
        apiClient.get<UserProfileResponse>(`/profile/${userId}`).then((r) => r.data),

    getMe: () =>
        apiClient.get<UserProfileResponse>('/profile/me').then((r) => r.data),
}