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
            const values = decoded.split(":", 3);
            const [start, command, arg] = values;
            if (values.length !== 3 || start !== "c" || isNaN(parseInt(arg))) {
                throw new Error(`Invalid micro:bit UART message: ${decoded}`);
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
        };
        this.bluetooth.addEventListener("uartdata", this.uartDataListener);
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
}

import GLOBALS from "../config.js";

export default Microbit;
