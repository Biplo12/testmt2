import Logger from '@/core/infra/logger/Logger';
import PacketHandler from '../../PacketHandler';
import WhisperInPacket from './WhisperInPacket';
import GameConnection from '@/game/interface/networking/GameConnection';
import World from '@/core/domain/World';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { WhisperTypeEnum } from '../../out/WhisperOutPacket';
import { getRoleTag } from '@/core/enum/AccountRoleEnum';

const COLOR_CODE_PATTERN = /\|cFF[0-9A-Fa-f]{6}/g;
const ROLE_TAG_PATTERN = /^\[(?:GM|MOD)\]/;

export default class WhisperInPacketHandler extends PacketHandler<WhisperInPacket> {
    private logger: Logger;
    private world: World;

    constructor({ logger, world }) {
        super();
        this.logger = logger;
        this.world = world;
    }

    async execute(connection: GameConnection, packet: WhisperInPacket) {
        if (!packet.isValid()) {
            this.logger.error(`[WhisperInPacketHandler] Packet invalid`);
            this.logger.error(packet.getErrorMessage());
            connection.close();
            return;
        }

        const player = connection.getPlayer();

        if (!player) {
            this.logger.info(`[WhisperInPacketHandler] Connection has no player selected`);
            connection.close();
            return;
        }

        const targetName = packet.getTargetName();
        const rawTargetName = targetName.replace(COLOR_CODE_PATTERN, '').replace(ROLE_TAG_PATTERN, '');
        const message = packet.getMessage();

        this.logger.info(`[WhisperInPacketHandler] ${player.getRawName()} -> ${rawTargetName}: ${message}`);

        if (rawTargetName === player.getRawName()) {
            player.chat({
                message: '[SYSTEM] You cannot whisper to yourself.',
                messageType: ChatMessageTypeEnum.INFO,
            });
            return;
        }

        const target = this.world.getPlayerByName(rawTargetName);

        if (!target) {
            player.chat({
                message: `[SYSTEM] Player ${rawTargetName} is not online.`,
                messageType: ChatMessageTypeEnum.INFO,
            });
            return;
        }

        const senderTag = getRoleTag(player.getRole());
        const senderDisplayName = senderTag ? `${senderTag}${player.getRawName()}` : player.getRawName();

        const whisperType = player.hasStaffRole() ? WhisperTypeEnum.GM : WhisperTypeEnum.NORMAL;

        target.whisper({
            partnerName: senderDisplayName,
            message,
            type: whisperType,
        });
    }
}
