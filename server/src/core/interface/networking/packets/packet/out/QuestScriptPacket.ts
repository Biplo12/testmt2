import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

type QuestScriptPacketParams = {
    skin: number;
    src: string;
};

export default class QuestScriptPacket extends PacketOut {
    private readonly totalSize: number;
    private readonly skin: number;
    private readonly src_size: number;
    private readonly src: string;

    constructor({ skin, src }: QuestScriptPacketParams) {
        const totalSize = 1 + 2 + 1 + 2 + src.length;

        super({
            header: PacketHeaderEnum.QUEST_SCRIPT,
            name: 'QuestScriptPacket',
            size: totalSize,
        });

        this.skin = skin;
        this.src_size = src.length;
        this.totalSize = totalSize;
        this.src = src;
    }

    pack() {
        this.bufferWriter.writeUint16LE(this.totalSize);
        this.bufferWriter.writeUint8(this.skin);
        this.bufferWriter.writeUint16LE(this.src_size);
        this.bufferWriter.writeString(this.src, this.src_size + 1);
        return this.bufferWriter.getBuffer();
    }
}
