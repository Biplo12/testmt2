import Logger from '@/core/infra/logger/Logger';
import WhisperCommand from './WhisperCommand';
import World from '@/core/domain/World';
import Player from '@/core/domain/entities/game/player/Player';
import CommandHandler from '../../CommandHandler';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { WhisperTypeEnum } from '@/core/interface/networking/packets/packet/out/WhisperOutPacket';
import { getRoleTag } from '@/core/enum/AccountRoleEnum';

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
            return;
        }

        const target = this.world.getPlayerByName(targetName);

        if (!target) {
            player.chat({
                message: `[SYSTEM] Player ${targetName} is not online.`,
                messageType: ChatMessageTypeEnum.INFO,
            });
            return;
        }

        const senderTag = getRoleTag(player.getRole());
        const senderDisplayName = senderTag ? `${senderTag}${player.getRawName()}` : player.getRawName();

        const whisperType = player.hasStaffRole() ? WhisperTypeEnum.GM : WhisperTypeEnum.NORMAL;

        target.whisper({
            partnerName: senderDisplayName,
            message: whisperMessage,
            type: whisperType,
        });
    }
}
