// Origin:
// https://github.com/citizenfx/fivem/blob/master/ext/cfx-ui/src/cfx/common/services/servers/source/utils/frameReader.ts

class FrameReader {
    constructor(stream, onFrame, onEnd) {
        this.stream = stream;
        this.onFrame = onFrame;
        this.onEnd = onEnd;
        //console.log(stream)
        this.reader = this.stream.getReader();
        this.lastArray = null;
        this.frameLength = -1;
        this.framePos = 0;
    }

    read() {
        this.doRead();
    }

    async doRead() {
        const { done, value } = await this.reader.read();
        if (done || !value) {
            return this.onEnd();
        }

        let array = value;

        while (array.length > 0) {
            const start = 4;

            if (this.lastArray) {
                const newArray = new Uint8Array(array.length + this.lastArray.length);
                newArray.set(this.lastArray);
                newArray.set(array, this.lastArray.length);

                this.lastArray = null;

                array = newArray;
            }

            if (this.frameLength < 0) {
                if (array.length < 4) {
                    this.lastArray = array;
                    this.doRead();
                    return;
                }

                this.frameLength = array[0] | (array[1] << 8) | (array[2] << 16) | (array[3] << 24);

                if (this.frameLength > 65535) {
                    throw new Error('A too large frame was passed.');
                }
            }

            const end = 4 + this.frameLength - this.framePos;

            if (array.length < end) {
                this.lastArray = array;
                this.doRead();
                return;
            }

            const frame = softSlice(array, start, end);
            this.framePos += (end - start);

            if (this.framePos === this.frameLength) {
                // reset
                this.frameLength = -1;
                this.framePos = 0;
            }

            this.onFrame(frame);

            // more in the array?
            if (array.length > end) {
                array = softSlice(array, end);
            } else {
                // continue reading
                this.doRead();

                return;
            }
        }
    }
}

function softSlice(arr, start, end) {
    return new Uint8Array(arr.buffer, arr.byteOffset + start, end && end - start);
}

module.exports = { FrameReader: FrameReader };
