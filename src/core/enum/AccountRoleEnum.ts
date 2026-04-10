import { NameColorEnum, colorize } from './NameColorEnum';

export enum AccountRoleEnum {
    PLAYER = 'PLAYER',
    MODERATOR = 'MODERATOR',
    GAME_MASTER = 'GAME_MASTER',
}

const ROLE_CONFIG: Record<AccountRoleEnum, { tag: string; color: NameColorEnum; staff: boolean }> = {
    [AccountRoleEnum.PLAYER]: { tag: '', color: NameColorEnum.DEFAULT, staff: false },
    [AccountRoleEnum.MODERATOR]: { tag: '[MOD]', color: NameColorEnum.BLUE, staff: true },
    [AccountRoleEnum.GAME_MASTER]: { tag: '[GM]', color: NameColorEnum.GOLDEN, staff: true },
};

export function getRoleTag(role: AccountRoleEnum): string {
    const config = ROLE_CONFIG[role];
    if (!config?.tag) return '';
    return colorize(config.tag, config.color);
}

export function getRoleColor(role: AccountRoleEnum): NameColorEnum {
    return ROLE_CONFIG[role]?.color ?? NameColorEnum.DEFAULT;
}

export function getRawRoleTag(role: AccountRoleEnum): string {
    return ROLE_CONFIG[role]?.tag ?? '';
}

export function isStaffRole(role: AccountRoleEnum): boolean {
    return ROLE_CONFIG[role]?.staff ?? false;
}
