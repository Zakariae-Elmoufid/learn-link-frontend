import {useQuery} from "@tanstack/react-query";
import {adminModeratorsService} from "@/lib/api/services";
import {useAuthStore} from "@/stores";

const QUERY_KEYS = {
    moderators: ['admin-moderators'] as const,
    moderator: (id: number) => ['admin-moderator', id] as const,
    moderatorPermissions: (id: number) => ['moderator-permissions', id] as const,
}

export function useModerationPermissions() {
    const userId = useAuthStore((s) => s.user?.id);
    return useQuery({
        queryKey: QUERY_KEYS.moderatorPermissions(userId ?? 0),
        queryFn: () => adminModeratorsService.getModeratorPermissions(userId!),
        enabled: !!userId,
    });
}


