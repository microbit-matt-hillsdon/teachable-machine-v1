// Copyright 2017 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

class ServoOutput {
    constructor() {
        this.id = "ServoOutput";

        // Corresponds with servo options in MakeCode.
        this.microbitServoOptions = [
            "slow wave",
            "fast wave",
            ...[...Array(12).keys()].map((i) => `${i * 15}`),
        ];

        this.defaultAssets = [
            this.microbitServoOptions[0],
            this.microbitServoOptions[1],
            this.microbitServoOptions[2],
        ];

        this.servoOptions = {};
        this.currentServoOption = null;
        this.element = document.createElement("div");
        this.element.classList.add("output__container");
        this.element.classList.add("output__container--led");
        this.classNames = GLOBALS.classNames;
        this.colors = GLOBALS.colors;
        this.numClasses = GLOBALS.numClasses;
        this.offScreen = document.createElement("div");
        this.offScreen.classList.add("output__servo");
        let options = {};
        options.servoCallback = this.searchResultServoOptionClick.bind(this);
        options.selectCallback = this.searchResultClick.bind(this);
        options.assets = this.microbitServoOptions;
        this.search = new ServoSearch(options);
        this.offScreen.appendChild(this.search.element);
        this.inputClasses = [];
        this.lastServoOption;

        for (let index = 0; index < this.microbitServoOptions.length; index += 1) {
            const option = this.microbitServoOptions[index];
            this.servoOptions[option] = index;
        }

        for (let index = 0; index < this.numClasses; index += 1) {
            let id = this.classNames[index];
            let inputClass = document.createElement("div");
            let option = this.defaultAssets[index];
            inputClass.classList.add("output__servo-class");
            inputClass.classList.add(`output__servo-class--${id}`);

            inputClass.servoOption = option;

            let editIcon = document.createElement("div");
            editIcon.classList.add("output__servo-edit");
            editIcon.classList.add(`output__servo-edit--${id}`);

            let input = document.createElement("input");
            input.classId = id;
            input.classList.add("output__servo-input");
            input.classList.add(`output__servo-input--${id}`);
            input.setAttribute("readonly", "readonly");
            input.value = option;
            inputClass.appendChild(editIcon);
            inputClass.appendChild(input);

            var deleteIcon = document.createElement("div");
            deleteIcon.classList.add("output__servo-delete");
            inputClass.appendChild(deleteIcon);

            deleteIcon.addEventListener("click", this.clearInput.bind(this));
            input.addEventListener("click", this.editInput.bind(this));
            inputClass.input = input;
            this.inputClasses[index] = inputClass;
            this.offScreen.appendChild(inputClass);
        }
        this.element.appendChild(this.offScreen);
        this.buildCanvas();
    }

    clearInput(event) {
        if (
            this.currentServoOption ===
            this.servoOptions[event.target.parentNode.servoOption]
        ) {
            this.resetServo();
            this.currentServoOption = null;
        }
        event.target.parentNode.servoOption = null;
        event.target.parentNode.input.value = "Nothing";

        event.target.parentNode.input.classList.add(
            "output__servo-input--nothing"
        );

        if (this.currentBorder && this.currentClassName) {
            this.currentBorder.classList.remove(
                `output__servo-input--${this.currentClassName}-selected`
            );
        }
    }

    searchResultServoOptionClick(event) {
        event.stopPropagation();
        let icon = event.target.parentNode.value;
        this.lastServoOption = icon;
        this.triggerServoOption(icon);
    }

    searchResultClick(event) {
        let value = event.target.value;
        this.activeInput.value = value;
        this.activeInput.parentNode.servoOption = value;
        this.activeInput.parentNode.input.classList.remove(
            "output__servo-input--nothing"
        );
        if (this.currentServoOption) {
            this.resetServo();
            this.currentServoOption = null;
        }
        this.search.hide();
    }

    editInput(event) {
        this.activeInput = event.target;
        let classId = this.activeInput.classId;
        if (this.currentServoOption) {
            this.resetServo();
            this.currentServoOption = null;
        }
        this.search.show(classId);
    }

    triggerCurrentServoOption() {
        if (this.currentServoOption !== null) {
            GLOBALS.microbit.servo(this.currentServoOption);
        }
    }

    triggerServoOption(option) {
        if (!this.search.visible) {
            if (this.currentServoOption === option) {
                this.currentServoOption = null;
            } else if (this.servoOptions[option] !== null) {
                this.currentServoOption = this.servoOptions[option];
                this.triggerCurrentServoOption();
                this.lastServoOption = this.currentServoOption;
            }
        }
    }

    resetServo() {
        GLOBALS.microbit.stopServo();
    }

    trigger(index) {
        if (!GLOBALS.clearing) {
            if (this.currentIndex !== index) {
                this.currentIndex = index;

                let icon = this.inputClasses[this.currentIndex].servoOption;
                if (icon) {
                    this.triggerServoOption(icon);
                } else {
                    this.resetServo();
                }

                if (this.currentBorder && this.currentClassName) {
                    this.currentBorder.classList.remove(
                        `output__servo-input--${this.currentClassName}-selected`
                    );
                }

                let border = this.inputClasses[index].input;
                let id = this.classNames[index];

                this.currentClassName = id;
                this.currentBorder = border;
                this.currentBorder.classList.add(
                    `output__servo-input--${this.currentClassName}-selected`
                );

                if (this.canvas) {
                    icon === null ? (icon = "(nothing)") : icon;
                    this.updateCanvas(this.currentIndex, icon);
                }
            }
        }
        if (GLOBALS.clearing) {
            if (this.currentBorder && this.currentClassName) {
                this.currentBorder.classList.remove(
                    `output__servo-input--${this.currentClassName}-selected`
                );
            }
            this.resetServo();
        }
    }

    stop() {
        this.resetServo();
        this.element.style.display = "none";
    }

    start() {
        this.element.style.display = "block";
        this.offScreen.style.display = "block";
        this.handleVisibilityChange();
    }

    handleVisibilityChange() {
        if (
            GLOBALS.outputSection &&
            GLOBALS.outputSection.currentOutput &&
            GLOBALS.outputSection.currentOutput.id === this.id
        ) {
            if (this.currentServoOption === null) {
                this.currentServoOption;
            } else if (document.hidden) {
                this.resetServo();
            } else {
                this.triggerCurrentServoOption();
            }
        }
    }

    buildCanvas() {
        this.canvas = document.createElement("canvas");
        this.canvas.style.display = "none";
        this.context = this.canvas.getContext("2d");
        this.canvas.width = 340;
        this.canvas.height = 260;
        this.offScreen.appendChild(this.canvas);
    }

    updateCanvas(colorId, icon) {
        let color = "#2baa5e";
        switch (colorId) {
            case 0:
                color = "#2baa5e";
                break;
            case 1:
                color = "#c95ac5";
                break;
            default:
            case 2:
                color = "#dd4d31";
                break;
        }
        if (this.canvasImage) {
            this.context.globalCompositeOperation = "source-over";
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.fillStyle = "rgb(255, 255, 255)";
            this.context.fillRect(0, 0, 300, 300);
            this.context.drawImage(this.canvasImage, 105, 52, 95, 95);
            this.context.font = "25px Poppins";
            this.context.fillStyle = "#000";
            this.context.fillText(
                icon,
                this.canvas.width / 2 -
                    this.context.measureText(icon).width / 2 -
                    20,
                207
            );
            this.context.globalCompositeOperation = "screen";
            this.context.fillStyle = color;
            this.context.fillRect(0, 0, 300, 300);
        }
    }
}

import ServoSearch from "./servo/ServoSearch.js";
import GLOBALS from "../config.js";

export default ServoOutput;
