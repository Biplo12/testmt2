export enum NameColorEnum {
    DEFAULT = 'DEFAULT',
    GOLDEN = 'GOLDEN',
    RED = 'RED',
    BLUE = 'BLUE',
    GREEN = 'GREEN',
    PURPLE = 'PURPLE',
    WHITE = 'WHITE',
}

const NAME_COLOR_PREFIX: Record<NameColorEnum, string> = {
    [NameColorEnum.DEFAULT]: '',
    [NameColorEnum.GOLDEN]: '[GM]',
    [NameColorEnum.RED]: '[PK]',
    [NameColorEnum.BLUE]: '[BL]',
    [NameColorEnum.GREEN]: '[GR]',
    [NameColorEnum.PURPLE]: '[PP]',
    [NameColorEnum.WHITE]: '',
};

export function getNameColorPrefix(color: NameColorEnum): string {
    return NAME_COLOR_PREFIX[color] ?? '';
}
