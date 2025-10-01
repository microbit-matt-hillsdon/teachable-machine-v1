import {
    ConnectionStatus,
    createUniversalHexFlashDataSource,
    createWebUSBConnection,
} from "@microbit/microbit-connection";

class Microbit {
    constructor() {
        this.connection = createWebUSBConnection();
        this.connect = this.connection.connect.bind(this.connection);

        // Initialise connection.
        (async () => {
            await this.connection.initialize();
        })();

        // Initialise micro:bit serial listeners.
        this.serialBuffer = "";
        this.serialDataListener = (event) => {
            const cmds = (this.serialBuffer + event.data).split("\n");
            this.serialBuffer = cmds[cmds.length - 1];
            cmds.forEach((cmd, idx) => {
                // Skip the last cmd which is either an empty string or a partially completed cmd.
                if (idx < cmds.length - 1) {
                    this.triggerCommand(cmd);
                }
            });
        };
        this.connection.addEventListener("serialdata", this.serialDataListener);

        this.serialStatusListener = (event) => {
            if (event.status !== ConnectionStatus.CONNECTED) {
                const customEvent = new CustomEvent("disconnected", {});
                window.dispatchEvent(customEvent);
            }
        };
        this.connection.addEventListener("status", this.serialStatusListener);
    }

    triggerCommand(commandMsg) {
        const values = commandMsg.split(":", 3);
        const [start, command, arg] = values;
        if (values.length !== 3 || start !== "c" || isNaN(parseInt(arg))) {
            console.error(`Invalid micro:bit message: ${commandMsg}`);
            return;
        }
        switch (command) {
            case "startRecord": {
                const classIdx = parseInt(arg);
                const event = new CustomEvent("record", {
                    detail: { start: classIdx },
                });
                window.dispatchEvent(event);
                break;
            }
            case "endRecord": {
                const classIdx = parseInt(arg);
                const event = new CustomEvent("record", {
                    detail: { stop: classIdx },
                });
                window.dispatchEvent(event);
                break;
            }
            default: {
                console.error(`Unexpected micro:bit message: ${commandMsg}`);
            }
        }
    }

    display = (arg) => this.writeToMicrobit("display", arg);
    clearDisplay = () => this.writeToMicrobit("display", -1);

    servo = (arg) => this.writeToMicrobit("servo", arg);
    stopServo = () => this.writeToMicrobit("servo", -1);

    playSound = (arg) => this.writeToMicrobit("sound", arg);
    stopSounds = () => this.writeToMicrobit("sound", -1);

    writeToMicrobit = (command, arg) => {
        const msg = microbitCommandMessage(command, arg);
        this.connection.serialWrite(msg);
    };

    downloadProgram = async (hexString, progress) => {
        await this.connection.flash(
            createUniversalHexFlashDataSource(hexString),
            { partial: true, progress }
        );
    };

    usbReset = async () => {
        await this.connection.clearDevice();
    };
}

const microbitCommandMessage = (command, arg) => `c:${command}:${arg}\n`;

export default Microbit;
