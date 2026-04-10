export enum NameColorEnum {
    DEFAULT = 'DEFAULT',
    RED = 'RED',
    BLUE = 'BLUE',
    GREEN = 'GREEN',
    GOLDEN = 'GOLDEN',
    PURPLE = 'PURPLE',
    WHITE = 'WHITE',
    ORANGE = 'ORANGE',
    CYAN = 'CYAN',
    PINK = 'PINK',
}

const NAME_COLOR_HEX: Record<NameColorEnum, string> = {
    [NameColorEnum.DEFAULT]: '',
    [NameColorEnum.RED]: 'FF0000',
    [NameColorEnum.BLUE]: '3296FF',
    [NameColorEnum.GREEN]: '00FF00',
    [NameColorEnum.GOLDEN]: 'FFA200',
    [NameColorEnum.PURPLE]: 'AA00FF',
    [NameColorEnum.WHITE]: 'FFFFFF',
    [NameColorEnum.ORANGE]: 'FF8C00',
    [NameColorEnum.CYAN]: '00FFFF',
    [NameColorEnum.PINK]: 'FF69B4',
};

export function colorize(text: string, color: NameColorEnum): string {
    const hex = NAME_COLOR_HEX[color];
    if (!hex) return text;
    return `|cFF${hex}${text}`;
}

export function colorizeHex(text: string, hex: string): string {
    return `|cFF${hex}${text}`;
}
