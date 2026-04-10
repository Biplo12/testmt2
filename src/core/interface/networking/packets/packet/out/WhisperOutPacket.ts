import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

const CHARACTER_NAME_MAX_LEN = 25;

export enum WhisperTypeEnum {
    NORMAL = 0,
    NOT_FOUND = 1,
    BLOCKED = 2,
    SENDER_BLOCKED = 3,
    GM = 5,
}

type WhisperOutPacketParams = {
    type?: WhisperTypeEnum;
    partnerName?: string;
    message?: string;
};

export default class WhisperOutPacket extends PacketOut {
    private type: WhisperTypeEnum;
    private partnerName: string;
    private message: string;

    constructor({ type = WhisperTypeEnum.NORMAL, partnerName = '', message = '' }: WhisperOutPacketParams = {}) {
        super({
            header: PacketHeaderEnum.WHISPER_OUT,
            name: 'WhisperOutPacket',
            size: 1 + 2 + 1 + CHARACTER_NAME_MAX_LEN + message.length + 1,
        });
        this.type = type;
        this.partnerName = partnerName;
        this.message = message;
    }

    pack() {
        this.bufferWriter.writeUint16LE(this.size);
        this.bufferWriter.writeUint8(this.type);
        this.bufferWriter.writeString(this.partnerName, CHARACTER_NAME_MAX_LEN);
        this.bufferWriter.writeString(this.message, this.message.length + 1);
        return this.bufferWriter.getBuffer();
    }
}
