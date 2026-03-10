import { apiClient } from '../api-client'
import {
    ConnectionRequest,
    ConnectionRequestResponse,
    ConnectionResponse,
    CountResponse,
    ConnectionCheckResponse,
} from '../types'

export const connectionsService = {
    // ─── Connection Requests ─────────────────────────────────────────────────

    /** Send a connection request */
    sendRequest: (data: ConnectionRequest) =>
        apiClient
            .post<ConnectionRequestResponse>('/connections/requests', data)
            .then((r) => r.data),

    /** Get pending requests received by current user */
    getPendingRequests: () =>
        apiClient
            .get<ConnectionRequestResponse[]>('/connections/requests/pending')
            .then((r) => r.data),

    /** Get count of pending requests */
    getPendingRequestsCount: () =>
        apiClient
            .get<CountResponse>('/connections/requests/pending/count')
            .then((r) => r.data),

    /** Get sent requests by current user */
    getSentRequests: () =>
        apiClient
            .get<ConnectionRequestResponse[]>('/connections/requests/sent')
            .then((r) => r.data),

    /** Accept a connection request */
    acceptRequest: (requestId: number) =>
        apiClient
            .post<ConnectionResponse>(`/connections/requests/${requestId}/accept`)
            .then((r) => r.data),

    /** Reject a connection request */
    rejectRequest: (requestId: number) =>
        apiClient.post(`/connections/requests/${requestId}/reject`),

    /** Cancel a sent connection request */
    cancelRequest: (requestId: number) =>
        apiClient.delete(`/connections/requests/${requestId}`),

    // ─── Connections ─────────────────────────────────────────────────────────

    /** Get all active connections */
    getConnections: () =>
        apiClient
            .get<ConnectionResponse[]>('/connections')
            .then((r) => r.data),

    /** Get connections count */
    getConnectionsCount: () =>
        apiClient
            .get<CountResponse>('/connections/count')
            .then((r) => r.data),

    /** Get a specific connection */
    getConnection: (connectionId: number) =>
        apiClient
            .get<ConnectionResponse>(`/connections/${connectionId}`)
            .then((r) => r.data),

    /** Remove a connection */
    removeConnection: (connectionId: number) =>
        apiClient.delete(`/connections/${connectionId}`),

    /** Check if connected with another user */
    checkConnection: (otherUserId: number) =>
        apiClient
            .get<ConnectionCheckResponse>(`/connections/check/${otherUserId}`)
            .then((r) => r.data),
}
