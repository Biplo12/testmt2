import Logger from '@/core/infra/logger/Logger';
import PacketHandler from '../../PacketHandler';
import WhisperInPacket from './WhisperInPacket';
import GameConnection from '@/game/interface/networking/GameConnection';
import World from '@/core/domain/World';
import WhisperOutPacket, { WhisperTypeEnum } from '../../out/WhisperOutPacket';

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
        const message = packet.getMessage();

        this.logger.info(
            `[WhisperInPacketHandler] ${player.getRawName()} -> ${targetName}: ${message}`,
        );

        if (targetName === player.getRawName()) {
            connection.send(
                new WhisperOutPacket({
                    type: WhisperTypeEnum.NOT_FOUND,
                    partnerName: targetName,
                }),
            );
            return;
        }

        const target = this.world.getPlayerByName(targetName);

        if (!target) {
            connection.send(
                new WhisperOutPacket({
                    type: WhisperTypeEnum.NOT_FOUND,
                    partnerName: targetName,
                }),
            );
            return;
        }

        const senderName = player.getRawName();
        const whisperType = player.hasStaffRole() ? WhisperTypeEnum.GM : WhisperTypeEnum.NORMAL;

        target.whisper({
            partnerName: senderName,
            message,
            type: whisperType,
        });

        connection.send(
            new WhisperOutPacket({
                type: WhisperTypeEnum.NORMAL,
                partnerName: targetName,
                message,
            }),
        );
    }
}
