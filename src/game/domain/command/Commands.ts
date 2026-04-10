import Command from './Command';
import ExperienceCommand from './command/exp/ExperienceCommand';
import ExperienceCommandHandler from './command/exp/ExperienceCommandHandler';
import GoldCommand from './command/gold/GoldCommand';
import GoldCommandHandler from './command/gold/GoldCommandHandler';
import GotoCommand from './command/goto/GotoCommand';
import GotoCommandHandler from './command/goto/GotoCommandHandler';
import InvokeCommand from './command/invoke/InvokeCommand';
import InvokeCommandHandler from './command/invoke/InvokeCommandHandler';
import ItemCommand from './command/item/ItemCommand';
import ItemCommandHandler from './command/item/ItemCommandHandler';
import ListCommand from './command/list/ListCommand';
import ListCommandHandler from './command/list/ListCommandHandler';
import LogoutCommand from './command/logout/LogoutCommand';
import LogoutCommandHandler from './command/logout/LogoutCommandHandler';
import LevelCommand from './command/lvl/LevelCommand';
import LevelCommandHandler from './command/lvl/LevelCommandHandler';
import PrivilegeCommand from './command/privilege/PrivilegeCommand';
import PrivilegeCommandHandler from './command/privilege/PrivilegeCommandHandler';
import QuitCommand from './command/quit/QuitCommand';
import QuitCommandHandler from './command/quit/QuitCommandHandler';
import RestartHereCommand from './command/restartHere/RestartHereCommand';
import RestartHereCommandHandler from './command/restartHere/RestartHereCommandHandler';
import RestartTownCommand from './command/restartTown/RestartTownCommand';
import RestartTownCommandHandler from './command/restartTown/RestartTownCommandHandler';
import SelectCommand from './command/select/SelectCommand';
import SelectCommandHandler from './command/select/SelectCommandHandler';
import StatCommand from './command/stat/StatCommand';
import StatCommandHandler from './command/stat/StatCommandHandler';
import ImmortalCommand from './command/immortal/ImmortalCommand';
import ImmortalCommandHandler from './command/immortal/ImmortalCommandHandler';
import InvisibilityCommand from './command/invisibility/InvisibilityCommand';
import InvisibilityCommandHandler from './command/invisibility/InvisibilityCommandHandler';
import NameColorCommand from './command/namecolor/NameColorCommand';
import NameColorCommandHandler from './command/namecolor/NameColorCommandHandler';
import WhisperCommand from './command/whisper/WhisperCommand';
import WhisperCommandHandler from './command/whisper/WhisperCommandHandler';
import WhisperAllCommand from './command/whisperall/WhisperAllCommand';
import WhisperAllCommandHandler from './command/whisperall/WhisperAllCommandHandler';
import CommandHandler from './CommandHandler';

export type CommandConstructor<T extends Command> = {
    new (args?: any): T;
    getName(): string;
    getDescription(): string;
    getExample(): string;
};

export type CommandMapValue<T extends Command> = {
    command: CommandConstructor<T>;
    createHandler: (params: any) => CommandHandler<T>;
    gmOnly?: boolean;
};

export default () =>
    new Map<string, CommandMapValue<any>>([
        [
            StatCommand.getName(),
            {
                command: StatCommand,
                createHandler: (params) => new StatCommandHandler(params),
                gmOnly: true,
            },
        ],
        [
            LogoutCommand.getName(),
            {
                command: LogoutCommand,
                createHandler: (params) => new LogoutCommandHandler(params),
            },
        ],
        [
            QuitCommand.getName(),
            {
                command: QuitCommand,
                createHandler: (params) => new QuitCommandHandler(params),
            },
        ],
        [
            ExperienceCommand.getName(),
            {
                command: ExperienceCommand,
                createHandler: (params) => new ExperienceCommandHandler(params),
                gmOnly: true,
            },
        ],
        [
            LevelCommand.getName(),
            {
                command: LevelCommand,
                createHandler: (params) => new LevelCommandHandler(params),
                gmOnly: true,
            },
        ],
        [
            GoldCommand.getName(),
            {
                command: GoldCommand,
                createHandler: (params) => new GoldCommandHandler(params),
                gmOnly: true,
            },
        ],
        [
            GotoCommand.getName(),
            {
                command: GotoCommand,
                createHandler: (params) => new GotoCommandHandler(params),
                gmOnly: true,
            },
        ],
        [
            ListCommand.getName(),
            {
                command: ListCommand,
                createHandler: (params) => new ListCommandHandler(params),
                gmOnly: true,
            },
        ],
        [
            InvokeCommand.getName(),
            {
                command: InvokeCommand,
                createHandler: (params) => new InvokeCommandHandler(params),
                gmOnly: true,
            },
        ],
        [
            ItemCommand.getName(),
            {
                command: ItemCommand,
                createHandler: (params) => new ItemCommandHandler(params),
                gmOnly: true,
            },
        ],
        [
            PrivilegeCommand.getName(),
            {
                command: PrivilegeCommand,
                createHandler: (params) => new PrivilegeCommandHandler(params),
                gmOnly: true,
            },
        ],
        [
            SelectCommand.getName(),
            {
                command: SelectCommand,
                createHandler: () => new SelectCommandHandler(),
            },
        ],
        [
            RestartHereCommand.getName(),
            {
                command: RestartHereCommand,
                createHandler: () => new RestartHereCommandHandler(),
            },
        ],
        [
            RestartTownCommand.getName(),
            {
                command: RestartTownCommand,
                createHandler: () => new RestartTownCommandHandler(),
            },
        ],
        [
            ImmortalCommand.getName(),
            {
                command: ImmortalCommand,
                createHandler: () => new ImmortalCommandHandler(),
                gmOnly: true,
            },
        ],
        [
            InvisibilityCommand.getName(),
            {
                command: InvisibilityCommand,
                createHandler: () => new InvisibilityCommandHandler(),
                gmOnly: true,
            },
        ],
        [
            NameColorCommand.getName(),
            {
                command: NameColorCommand,
                createHandler: (params) => new NameColorCommandHandler(params),
                gmOnly: true,
            },
        ],
        [
            WhisperCommand.getName(),
            {
                command: WhisperCommand,
                createHandler: (params) => new WhisperCommandHandler(params),
            },
        ],
        [
            WhisperAllCommand.getName(),
            {
                command: WhisperAllCommand,
                createHandler: (params) => new WhisperAllCommandHandler(params),
                gmOnly: true,
            },
        ],
    ]);
