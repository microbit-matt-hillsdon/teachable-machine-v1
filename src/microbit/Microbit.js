import { ConnectionStatus, createUniversalHexFlashDataSource, createWebBluetoothConnection, createWebUSBConnection } from "@microbit/microbit-connection";

class Microbit {
    constructor() {
        this.bluetooth = createWebBluetoothConnection();
        this.uartDataListener = null;
        this.bluetoothConnect = this.bluetooth.connect.bind(this.bluetooth);

        this.usb = createWebUSBConnection();
        this.usbConnect = this.usb.connect.bind(this.usb);

        // Initialise micro:bit UART data listener.
        this.uartDataListener = (event) => {
            const decoded = new TextDecoder().decode(event.value);
            this.triggerCommand(decoded);
        };
        this.bluetooth.addEventListener("uartdata", this.uartDataListener);

        // Initialise micro:bit serial data listener.
        this.serialBuffer = "";
        this.serialDataListener = (event) => {
            if (this.bluetooth.status === ConnectionStatus.CONNECTED) {
                // Listen to UART data listener instead.
                return
            }
            const decoded = event.data;
            this.serialBuffer = this.serialBuffer + decoded;
            if (this.serialBuffer.endsWith("\n")) {
                const cmds = this.serialBuffer.split("\n").filter(s => s.length > 0);
                this.serialBuffer = "";
                cmds.forEach((cmd) => {
                    this.triggerCommand(cmd)
                })
            }
        };
        this.usb.addEventListener("serialdata", this.serialDataListener);
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
        const encoded = new TextEncoder().encode(msg);
        if (this.bluetooth.status === ConnectionStatus.CONNECTED) {
            this.bluetooth.uartWrite(encoded);
        } else {
            this.usb.serialWrite(msg)
        }
    };

    flashMicrobitProgram = async (progress) => {
        const fetchedHex = await fetch('static/microbit/TMv1Integration.hex');
        const universalHexString = await fetchedHex.text()
        await this.usb.flash(createUniversalHexFlashDataSource(universalHexString), {
            partial: true,
            progress,
        });
    }

    usbReset = async () => {
        await this.usb.clearDevice()
    }
}

const microbitCommandMessage = (command, arg) => `c:${command}:${arg}\n`

import GLOBALS from "../config.js";

export default Microbit;
