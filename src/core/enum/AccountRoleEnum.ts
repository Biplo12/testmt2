export enum AccountRoleEnum {
    PLAYER = 'PLAYER',
    MODERATOR = 'MODERATOR',
    GAME_MASTER = 'GAME_MASTER',
}

export const ROLE_NAME_PREFIX: Record<AccountRoleEnum, string> = {
    [AccountRoleEnum.PLAYER]: '',
    [AccountRoleEnum.MODERATOR]: '[MOD]',
    [AccountRoleEnum.GAME_MASTER]: '[GM]',
};

const STAFF_ROLES: Set<AccountRoleEnum> = new Set([AccountRoleEnum.GAME_MASTER, AccountRoleEnum.MODERATOR]);

export function isStaffRole(role: AccountRoleEnum): boolean {
    return STAFF_ROLES.has(role);
}
