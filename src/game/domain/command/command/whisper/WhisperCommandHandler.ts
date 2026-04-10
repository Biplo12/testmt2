import Logger from '@/core/infra/logger/Logger';
import WhisperCommand from './WhisperCommand';
import World from '@/core/domain/World';
import Player from '@/core/domain/entities/game/player/Player';
import CommandHandler from '../../CommandHandler';
import { WhisperTypeEnum } from '@/core/interface/networking/packets/packet/out/WhisperOutPacket';

export default class WhisperCommandHandler extends CommandHandler<WhisperCommand> {
    private logger: Logger;
    private world: World;

    constructor({ logger, world }) {
        super();
        this.logger = logger;
        this.world = world;
    }

    async execute(player: Player, whisperCommand: WhisperCommand) {
        if (!whisperCommand.isValid()) {
            const errors = whisperCommand.errors();
            this.logger.error(whisperCommand.getErrorMessage());
            player.sendCommandErrors(errors);
            return;
        }

        const [targetName, ...messageParts] = whisperCommand.getArgs();
        const whisperMessage = messageParts.join(' ');

        if (targetName === player.getRawName()) {
            player.whisper({
                partnerName: targetName,
                message: '',
                type: WhisperTypeEnum.NOT_FOUND,
            });
            return;
        }

        const target = this.world.getPlayerByName(targetName);

        if (!target) {
            player.whisper({
                partnerName: targetName,
                message: '',
                type: WhisperTypeEnum.NOT_FOUND,
            });
            return;
        }

        const whisperType = player.hasStaffRole() ? WhisperTypeEnum.GM : WhisperTypeEnum.NORMAL;

        target.whisper({
            partnerName: player.getRawName(),
            message: whisperMessage,
            type: whisperType,
        });

        player.whisper({
            partnerName: targetName,
            message: whisperMessage,
            type: WhisperTypeEnum.NORMAL,
        });
    }
}
