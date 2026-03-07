import { Subject } from "../types";
import { apiClient } from "../api-client";

export const subjectService = {
    getAll: () =>
        apiClient.get<Subject[]>('/subjects').then((r) => r.data),
}
