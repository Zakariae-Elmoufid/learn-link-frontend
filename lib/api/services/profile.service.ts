import {UserProfileCreate, UserProfileResponse} from "../types";
import {apiClient} from "../api-client";

export const profileService = {
    create: (data: UserProfileCreate, imageFile?: File) => {
        const form = new FormData()
        form.append('bio', data.bio)
        form.append('firstName', data.firstName)
        form.append('lastName', data.lastName)
        form.append('academicLevel', data.academicLevel)
        data.subjectIds.forEach((id) => form.append('subjectIds', String(id)))
        if (imageFile) form.append('image', imageFile)
        return apiClient.post<UserProfileResponse>('/profile', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then((r) => r.data)
    },

    getById: (userId: number) =>
        apiClient.get<UserProfileResponse>(`/profile/${userId}`).then((r) => r.data),

    getMe: () =>
        apiClient.get<UserProfileResponse>('/profile/me').then((r) => r.data),
}