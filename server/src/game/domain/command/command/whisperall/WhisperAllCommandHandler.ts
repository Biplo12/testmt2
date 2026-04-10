import Logger from '@/core/infra/logger/Logger';
import WhisperAllCommand from './WhisperAllCommand';
import World from '@/core/domain/World';
import Player from '@/core/domain/entities/game/player/Player';
import CommandHandler from '../../CommandHandler';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { WhisperTypeEnum } from '@/core/interface/networking/packets/packet/out/WhisperOutPacket';
import { getRoleTag } from '@/core/enum/AccountRoleEnum';

export default class WhisperAllCommandHandler extends CommandHandler<WhisperAllCommand> {
    private logger: Logger;
    private world: World;

    constructor({ logger, world }) {
        super();
        this.logger = logger;
        this.world = world;
    }

    async execute(player: Player, whisperAllCommand: WhisperAllCommand) {
        if (!whisperAllCommand.isValid()) {
            const errors = whisperAllCommand.errors();
            this.logger.error(whisperAllCommand.getErrorMessage());
            player.sendCommandErrors(errors);
            return;
        }

        const message = whisperAllCommand.getArgs().join(' ');
        const senderTag = getRoleTag(player.getRole());
        const senderDisplayName = senderTag ? `${senderTag}${player.getRawName()}` : player.getRawName();

        const whisperType = player.hasStaffRole() ? WhisperTypeEnum.GM : WhisperTypeEnum.NORMAL;
        let count = 0;

        for (const target of this.world.getPlayers().values()) {
            if (target.getRawName() === player.getRawName()) continue;

            target.whisper({
                partnerName: senderDisplayName,
                message,
                type: whisperType,
            });
            count++;
        }

        player.chat({
            message: `[SYSTEM] Whisper sent to ${count} player(s).`,
            messageType: ChatMessageTypeEnum.INFO,
        });
    }
}
