import Logger from '@/core/infra/logger/Logger';
import PacketHandler from '../../PacketHandler';
import ChatInPacket from './ChatInPacket';
import GameConnection from '@/game/interface/networking/GameConnection';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import CommandManager from '@/game/app/command/CommandManager';
import World from '@/core/domain/World';
import Player from '@/core/domain/entities/game/player/Player';

const SHOUT_COOLDOWN_MS = 15_000;
const SHOUT_MIN_LEVEL = 15;
const MAX_CHAT_MESSAGE_LENGTH = 512;

export default class ChatInPacketHandler extends PacketHandler<ChatInPacket> {
    private logger: Logger;
    private commandManager: CommandManager;
    private world: World;

    constructor({ logger, commandManager, world }) {
        super();
        this.logger = logger;
        this.commandManager = commandManager;
        this.world = world;
    }

    async execute(connection: GameConnection, packet: ChatInPacket) {
        if (!packet.isValid()) {
            this.logger.error(`[ChatInPacketHandler] Packet invalid`);
            this.logger.error(packet.getErrorMessage());
            connection.close();
            return;
        }

        const player = connection.getPlayer();

        if (!player) {
            this.logger.info(`[ChatInPacketHandler] The connection does not have an player select, this cannot happen`);
            connection.close();
            return;
        }

        const message = packet.getMessage();
        const messageType = packet.getMessageType();

        this.logger.info(`[ChatInPacketHandler] type=${messageType} msg="${message}"`);

        if (message.length > MAX_CHAT_MESSAGE_LENGTH) {
            this.logger.info(`[ChatInPacketHandler] Message too long (${message.length}), dropping`);
            return;
        }

        switch (messageType) {
            case ChatMessageTypeEnum.NORMAL: {
                this.logger.debug(`[ChatInPacketHandler] NORMAL CHAT: ${message}`);
                if (message.startsWith('/')) {
                    this.commandManager.execute({ message, player });
                    break;
                }

                const formattedMessage = `${player.getName()}: ${message}`;
                const senderVid = player.getVirtualId();
                const senderEmpire = player.getEmpire();

                player.chat({
                    messageType: ChatMessageTypeEnum.NORMAL,
                    message: formattedMessage,
                });

                for (const entity of player.getNearbyEntities().values()) {
                    if (entity instanceof Player) {
                        entity.sendChat({
                            messageType: ChatMessageTypeEnum.NORMAL,
                            message: formattedMessage,
                            vid: senderVid,
                            empireId: senderEmpire,
                        });
                    }
                }
                break;
            }
            case ChatMessageTypeEnum.SHOUT: {
                if (!player.hasStaffRole()) {
                    if (player.getLevel() < SHOUT_MIN_LEVEL) {
                        player.chat({
                            messageType: ChatMessageTypeEnum.INFO,
                            message: `[SYSTEM] You must be at least level ${SHOUT_MIN_LEVEL} to shout.`,
                        });
                        break;
                    }

                    const now = Date.now();
                    const lastTime = player.getLastShoutTime();

                    if (now - lastTime < SHOUT_COOLDOWN_MS) {
                        const remaining = Math.ceil((SHOUT_COOLDOWN_MS - (now - lastTime)) / 1000);
                        player.chat({
                            messageType: ChatMessageTypeEnum.INFO,
                            message: `[SYSTEM] You must wait ${remaining} seconds before shouting again.`,
                        });
                        break;
                    }

                    player.setLastShoutTime(now);
                }

                const shoutMessage = `${player.getName()}: ${message}`;
                const senderArea = player.getArea();

                for (const otherPlayer of this.world.getPlayers().values()) {
                    otherPlayer.sendChat({
                        messageType: ChatMessageTypeEnum.SHOUT,
                        message: shoutMessage,
                        vid: otherPlayer.getArea() === senderArea ? player.getVirtualId() : 0,
                        empireId: player.getEmpire(),
                    });
                }
                break;
            }
            case ChatMessageTypeEnum.GROUP:
                this.logger.debug(`[ChatInPacketHandler] GROUP CHAT: ${message}`);
                player.chat({
                    messageType: ChatMessageTypeEnum.INFO,
                    message: '[SYSTEM] You are not in a party.',
                });
                break;
            case ChatMessageTypeEnum.GUILD:
                this.logger.debug(`[ChatInPacketHandler] GUILD CHAT: ${message}`);
                player.chat({
                    messageType: ChatMessageTypeEnum.INFO,
                    message: '[SYSTEM] You are not in a guild.',
                });
                break;
            case ChatMessageTypeEnum.NOTICE:
                this.logger.info(`[ChatInPacketHandler] Client sent NOTICE type (server-only), ignoring`);
                break;
            case ChatMessageTypeEnum.INFO:
                this.logger.debug(`[ChatInPacketHandler] INFO CHAT (server-only type), ignoring`);
                break;
            case ChatMessageTypeEnum.COMMAND:
                this.logger.debug(`[ChatInPacketHandler] COMMAND CHAT (server-only type), ignoring`);
                break;

            default:
                this.logger.error(`[ChatInPacketHandler] Unknown chat type: ${messageType}, message: ${message}`);
                break;
        }
    }
}
