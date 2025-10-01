import { ConnectionStatus, createUniversalHexFlashDataSource, createWebUSBConnection } from "@microbit/microbit-connection";

class Microbit {
    constructor() {
        this.connection = createWebUSBConnection();
        this.connect = this.connection.connect.bind(this.connection);

        // Initialise connection.
        (async() => { await this.connection.initialize() })();

        // Initialise micro:bit serial listeners.
        this.serialBuffer = "";
        this.serialDataListener = (event) => {
            const cmds = (this.serialBuffer + event.data).split("\n");
            this.serialBuffer = cmds[cmds.length - 1];
            cmds.forEach((cmd) => {
                if (cmd !== "") {
                    this.triggerCommand(cmd);
                }
            })
        };
        this.connection.addEventListener("serialdata", this.serialDataListener);

        this.serialStatusListener = (event) => {
            if (event.status !== ConnectionStatus.CONNECTED) {
                const customEvent = new CustomEvent("disconnected", {});
                window.dispatchEvent(customEvent);
            }
        }
        this.connection.addEventListener("status", this.serialStatusListener)
    }

    triggerCommand (commandMsg) {
        const values = commandMsg.split(":", 3);
        const [start, command, arg] = values;
        if (values.length !== 3 || start !== "c" || isNaN(parseInt(arg))) {
            console.error(`Invalid micro:bit message: ${commandMsg}`);
            return;
        }
        switch (command) {
            case "photo": {
                const classIdx = parseInt(arg);
                const event = new CustomEvent("record", {
                    detail: GLOBALS.recording
                        ? { stop: classIdx }
                        : { start: classIdx },
                });
                window.dispatchEvent(event);
            }
        }
    }

    display = (arg) => this.writeToMicrobit("display", arg);
    clearDisplay = () => this.writeToMicrobit("display", -1);

    servo = (arg) => this.writeToMicrobit("servo", arg);
    stopServo = () => this.writeToMicrobit("servo", -1)
    
    playSound = (arg) => this.writeToMicrobit("sound", arg);
    stopSounds = () => this.writeToMicrobit("sound", -1);

    writeToMicrobit = (command, arg) => {
        const msg = microbitCommandMessage(command, arg);
        this.connection.serialWrite(msg)
    };

    flashMicrobitProgram = async (progress) => {
        const fetchedHex = await fetch('static/microbit/TMv1Integration.hex');
        const universalHexString = await fetchedHex.text()
        await this.connection.flash(createUniversalHexFlashDataSource(universalHexString), {
            partial: true,
            progress,
        });
    }

    usbReset = async () => {
        await this.connection.clearDevice()
    }
}

const microbitCommandMessage = (command, arg) => `c:${command}:${arg}\n`

import GLOBALS from "../config.js";

export default Microbit;
