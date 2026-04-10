import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketIn from '../PacketIn';
import WhisperInPacketValidator from './WhisperInPacketValidator';

const CHARACTER_NAME_MAX_LEN = 25;

export default class WhisperInPacket extends PacketIn {
    private targetName: string;
    private message: string;

    constructor({ targetName = '', message = '' } = {}) {
        super({
            header: PacketHeaderEnum.WHISPER,
            name: 'WhisperInPacket',
            size: 3 + CHARACTER_NAME_MAX_LEN + message.length + 1,
            validator: WhisperInPacketValidator,
        });

        this.targetName = targetName;
        this.message = message;
    }

    getTargetName() {
        return this.targetName;
    }

    getMessage() {
        return this.message;
    }

    unpack(buffer: Buffer) {
        this.bufferReader.setBuffer(buffer);
        this.bufferReader.readUInt16LE();
        this.targetName = this.bufferReader.readString(CHARACTER_NAME_MAX_LEN);
        this.message = this.bufferReader.readString();
        this.validate();
        return this;
    }
}
