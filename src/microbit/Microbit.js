import { createUniversalHexFlashDataSource, createWebBluetoothConnection, createWebUSBConnection } from "@microbit/microbit-connection";

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
            const decoded = event.data;
            this.serialBuffer = this.serialBuffer + decoded;
            if (this.serialBuffer.endsWith("\n")) {
                const cmds = this.serialBuffer.split("\n").filter(s => s.length > 0);
                cmds.forEach((cmd) => {
                    this.triggerCommand(cmd)
                })
                this.serialBuffer = "";
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

    display = (arg) => this.writeUart("display", arg);
    clearDisplay = () => this.writeUart("display", -1);

    servo = (arg) => this.writeUart("servo", arg);
    stopServo = () => this.writeUart("servo", -1)
    
    playSound = (arg) => this.writeUart("sound", arg);
    stopSounds = () => this.writeUart("sound", -1);

    writeUart = (command, arg) => {
        const encoded = new TextEncoder().encode(`c:${command}:${arg}\n`);
        this.bluetooth.uartWrite(encoded);
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

import GLOBALS from "../config.js";

export default Microbit;
