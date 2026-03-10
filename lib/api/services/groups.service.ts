import { apiClient } from '../api-client'
import {
    CreateGroupRequest,
    UpdateGroupRequest,
    StudyGroupResponse,
    GroupMember,
    GroupRole,
    PageResponse,
} from '../types'

export const groupsService = {
    // ─── CRUD ────────────────────────────────────────────────────────────────

    /** Create a new study group */
    create: (data: CreateGroupRequest) =>
        apiClient
            .post<StudyGroupResponse>('/groups', data)
            .then((r) => r.data),

    /** Get group details */
    getById: (groupId: number) =>
        apiClient
            .get<StudyGroupResponse>(`/groups/${groupId}`)
            .then((r) => r.data),

    /** Get group with members */
    getWithMembers: (groupId: number) =>
        apiClient
            .get<StudyGroupResponse>(`/groups/${groupId}/full`)
            .then((r) => r.data),

    /** Update a study group */
    update: (groupId: number, data: UpdateGroupRequest) =>
        apiClient
            .put<StudyGroupResponse>(`/groups/${groupId}`, data)
            .then((r) => r.data),

    /** Delete a study group */
    delete: (groupId: number) =>
        apiClient.delete(`/groups/${groupId}`),

    // ─── Discovery ───────────────────────────────────────────────────────────

    /** Discover public groups with pagination */
    discover: (page = 0, size = 10) =>
        apiClient
            .get<PageResponse<StudyGroupResponse>>('/groups/discover', { params: { page, size } })
            .then((r) => r.data),

    /** Search groups by keyword */
    search: (keyword: string, page = 0, size = 10) =>
        apiClient
            .get<PageResponse<StudyGroupResponse>>('/groups/search', { params: { keyword, page, size } })
            .then((r) => r.data),

    /** Get groups by subject */
    getBySubject: (subjectId: number) =>
        apiClient
            .get<StudyGroupResponse[]>(`/groups/subject/${subjectId}`)
            .then((r) => r.data),

    // ─── User's Groups ───────────────────────────────────────────────────────

    /** Get groups the current user is a member of */
    getMyGroups: () =>
        apiClient
            .get<StudyGroupResponse[]>('/groups/my')
            .then((r) => r.data),

    /** Get groups owned by current user */
    getOwnedGroups: () =>
        apiClient
            .get<StudyGroupResponse[]>('/groups/owned')
            .then((r) => r.data),

    // ─── Membership ──────────────────────────────────────────────────────────

    /** Join a public group */
    join: (groupId: number) =>
        apiClient.post(`/groups/${groupId}/join`),

    /** Request to join a private group */
    requestJoin: (groupId: number) =>
        apiClient.post(`/groups/${groupId}/request-join`),

    /** Leave a group */
    leave: (groupId: number) =>
        apiClient.post(`/groups/${groupId}/leave`),

    /** Get group members */
    getMembers: (groupId: number) =>
        apiClient
            .get<GroupMember[]>(`/groups/${groupId}/members`)
            .then((r) => r.data),

    // ─── Admin Actions ───────────────────────────────────────────────────────

    /** Get pending join requests (admin only) */
    getPendingRequests: (groupId: number) =>
        apiClient
            .get<GroupMember[]>(`/groups/${groupId}/requests`)
            .then((r) => r.data),

    /** Approve join request (admin only) */
    approveRequest: (groupId: number, requesterId: number) =>
        apiClient.post(`/groups/${groupId}/requests/${requesterId}/approve`),

    /** Reject join request (admin only) */
    rejectRequest: (groupId: number, requesterId: number) =>
        apiClient.post(`/groups/${groupId}/requests/${requesterId}/reject`),

    /** Remove member (admin only) */
    removeMember: (groupId: number, memberId: number) =>
        apiClient.delete(`/groups/${groupId}/members/${memberId}`),

    /** Update member role (admin only) */
    updateMemberRole: (groupId: number, memberId: number, role: GroupRole) =>
        apiClient.put(`/groups/${groupId}/members/${memberId}/role`, null, { params: { role } }),
}
