import { createWebBluetoothConnection } from "@microbit/microbit-connection";

class Microbit {
    constructor() {
        this.connection = createWebBluetoothConnection();
        this.uartDataListener = null;
        this.connect = this.connection.connect.bind(this.connection);

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
        this.connection.addEventListener("uartdata", this.uartDataListener);
    }

    display = (arg) => this.writeUart("display", arg);
    clearDisplay = () => this.writeUart("display", -1);

    servo = (arg) => this.writeUart("servo", arg);
    stopServo = () => this.writeUart("servo", -1)
    
    playSound = (arg) => this.writeUart("sound", arg);
    stopSounds = () => this.writeUart("sound", -1);

    writeUart = (command, arg) => {
        const encoded = new TextEncoder().encode(`c:${command}:${arg}\n`);
        this.connection.uartWrite(encoded);
    };
}

import GLOBALS from "../config.js";

export default Microbit;
