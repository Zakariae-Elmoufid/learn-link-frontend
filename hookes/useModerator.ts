import { useQuery } from "@tanstack/react-query";
import { adminModeratorsService } from "@/lib/api/services";
import { useAuthStore } from "@/stores";
import { ModeratorPermission, ModeratorPermissionsResponse } from "@/lib/api/types";

type PermissionLike = string | Partial<ModeratorPermission>;

function normalizePermissions(list: PermissionLike[] = []): ModeratorPermission[] {
    return list
        .map((item, index): ModeratorPermission | null => {
            if (typeof item === "string") {
                return {
                    id: index,
                    permission: item,
                    description: "",
                    assigned: true,
                };
            }

            const permissionName = item.permission ?? "";
            if (!permissionName) return null;

            return {
                id: item.id ?? index,
                permission: permissionName,
                description: item.description ?? "",
                assigned: item.assigned ?? true,
            };
        })
        .filter((item): item is ModeratorPermission => item !== null);
}

const QUERY_KEYS = {
    moderators: ['admin-moderators'] as const,
    moderator: (id: number) => ['admin-moderator', id] as const,
    moderatorPermissions: (id: number) => ['moderator-permissions', id] as const,
}

export function useModerationPermissions() {
    const userId = useAuthStore((s) => s.user?.id);

    return useQuery({
        queryKey: QUERY_KEYS.moderatorPermissions(userId ?? 0),
        queryFn: async (): Promise<ModeratorPermissionsResponse> => {
            if (!userId) {
                return {
                    moderatorId: 0,
                    currentPermissions: [],
                    availablePermissions: [],
                };
            }

            try {
                const result = await adminModeratorsService.getModeratorPermissions(userId);
                return {
                    ...result,
                    currentPermissions: normalizePermissions(result.currentPermissions as PermissionLike[]),
                };
            } catch {
                const moderator = await adminModeratorsService.getModeratorById(userId);
                return {
                    moderatorId: moderator.userId,
                    currentPermissions: normalizePermissions(moderator.permissions as PermissionLike[]),
                    availablePermissions: [],
                };
            }
        },
        enabled: !!userId,
    });
}


