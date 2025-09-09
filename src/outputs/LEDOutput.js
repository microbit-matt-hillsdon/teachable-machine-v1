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

class LEDOutput {
    constructor() {
        this.id = "LEDOutput";
        
		// Corresponds with icon options in MakeCode.
        this.microbitLedIcons = [
            "Heart",
            "Small heart",
            "Yes",
            "No",
            "Happy",
            "Sad",
            "Confused",
            "Angry",
            "Asleep",
            "Surprised",
            "Silly",
            "Fabulous",
            "Meh",
            "T-Shirt",
            "Rollerskate",
            "Duck",
            "House",
            "Tortoise",
            "Butterfly",
            "Stick figure",
            "Ghost",
            "Sword",
            "Giraffe",
            "Skull",
            "Umbrella",
            "Snake",
            "Rabbit",
            "Cow",
            "Quarter note",
            "Eighth note",
            "Pitchfork",
            "Target",
            "Triangle",
            "Left triangle",
            "Chessboard",
            "Diamond",
            "Small diamond",
            "Square",
            "Small square",
            "Scissor",
        ];

        this.defaultAssets = [
            this.microbitLedIcons[0],
            this.microbitLedIcons[1],
            this.microbitLedIcons[2],
        ];


        this.LEDIcons = {};
        this.currentLEDIcon = null;
        this.currentIcon = null;
        this.element = document.createElement("div");
        this.element.classList.add("output__container");
        this.element.classList.add("output__container--led");
        this.classNames = GLOBALS.classNames;
        this.colors = GLOBALS.colors;
        this.numClasses = GLOBALS.numClasses;
        this.offScreen = document.createElement("div");
        this.offScreen.classList.add("output__led");
        let options = {};
        options.playCallback = this.searchResultPlayClick.bind(this);
        options.selectCallback = this.searchResultClick.bind(this);
        options.assets = this.microbitLedIcons;
        this.search = new LEDSearch(options);
        this.offScreen.appendChild(this.search.element);
        this.inputClasses = [];
        this.lastIcon;

        for (let index = 0; index < this.microbitLedIcons.length; index += 1) {
            let icon = this.microbitLedIcons[index];
            this.LEDIcons[icon] = index;
        }

        for (let index = 0; index < this.numClasses; index += 1) {
            let id = this.classNames[index];
            let inputClass = document.createElement("div");
            let LEDIcon = this.defaultAssets[index];
            inputClass.classList.add("output__led-class");
            inputClass.classList.add(`output__led-class--${id}`);

            let speakerIcon = document.createElement("div");
            speakerIcon.classList.add("output__led-speaker");
            speakerIcon.classList.add(`output__led-speaker--${id}`);
            inputClass.LEDIcon = LEDIcon;
            inputClass.icon = speakerIcon;

            let loader = ((el) => {
                let ajax = new XMLHttpRequest();
                ajax.open("GET", "static/outputs/speaker-icon.svg", true);
                ajax.onload = (event) => {
                    el.innerHTML = ajax.responseText;
                };
                ajax.send();
            })(speakerIcon);

            let editIcon = document.createElement("div");
            editIcon.classList.add("output__led-edit");
            editIcon.classList.add(`output__led-edit--${id}`);

            let input = document.createElement("input");
            input.classId = id;
            input.classList.add("output__led-input");
            input.classList.add(`output__led-input--${id}`);
            input.setAttribute("readonly", "readonly");
            input.value = LEDIcon;
            inputClass.appendChild(speakerIcon);
            inputClass.appendChild(editIcon);
            inputClass.appendChild(input);

            var deleteIcon = document.createElement("div");
            deleteIcon.classList.add("output__led-delete");
            inputClass.appendChild(deleteIcon);

            deleteIcon.addEventListener("click", this.clearInput.bind(this));
            input.addEventListener("click", this.editInput.bind(this));
            inputClass.input = input;
            this.inputClasses[index] = inputClass;
            this.offScreen.appendChild(inputClass);
        }
        this.element.appendChild(this.offScreen);
        this.speakers = [];
        this.buildCanvas();
    }

    clearInput(event) {
        if (
            this.currentLEDIcon ===
            this.LEDIcons[event.target.parentNode.LEDIcon]
        ) {
            this.clearDisplay();
            this.currentLEDIcon = null;
            if (this.currentIcon) {
                this.currentIcon.classList.remove(
                    "output__led-speaker--active"
                );
                this.currentIcon = null;
            }
        }
        event.target.parentNode.LEDIcon = null;
        event.target.parentNode.input.value = "Nothing";

        event.target.parentNode.input.classList.add(
            "output__led-input--nothing"
        );

        if (this.currentBorder && this.currentClassName) {
            this.currentBorder.classList.remove(
                `output__led-input--${this.currentClassName}-selected`
            );
        }
    }

    searchResultPlayClick(event) {
        event.stopPropagation();
        let sound = event.target.parentNode.value;
        this.lastIcon = sound;
        this.showIcon(sound);
    }

    searchResultClick(event) {
        let value = event.target.value;
        this.activeInput.value = value;
        this.activeInput.parentNode.LEDIcon = value;
        this.activeInput.parentNode.input.classList.remove(
            "output__led-input--nothing"
        );
        if (this.currentLEDIcon) {
            this.clearDisplay();
            this.currentLEDIcon = null;
        }
        this.search.hide();
    }

    editInput(event) {
        this.activeInput = event.target;
        let classId = this.activeInput.classId;
        if (this.currentLEDIcon) {
            this.clearDisplay();
            this.currentLEDIcon = null;
            if (this.currentIcon) {
                this.currentIcon.classList.remove(
                    "output__led-speaker--active"
                );
                this.currentIcon = null;
            }
        }
        this.search.show(classId);
    }

    showCurrentLedIcon() {
        if (this.currentLEDIcon !== null) {
            GLOBALS.microbit.display(this.currentLEDIcon);
        }
    }

    showIcon(icon) {
        if (!this.search.visible) {
            if (this.currentLEDIcon === icon) {
                this.currentLEDIcon = null;
            } else if (this.LEDIcons[icon] !== null) {
                this.currentLEDIcon = this.LEDIcons[icon];
                this.showCurrentLedIcon();
                this.lastIcon = this.currentLEDIcon;
            }
        }
    }

    clearDisplay() {
        GLOBALS.microbit.clearDisplay();
    }

    trigger(index) {
        if (!GLOBALS.clearing) {
            if (this.currentIndex !== index) {
                this.currentIndex = index;

                let icon = this.inputClasses[this.currentIndex].LEDIcon;
                if (icon) {
                    this.showIcon(icon);
                } else {
                    this.clearDisplay();
                }

                if (this.currentIcon) {
                    this.currentIcon.classList.remove(
                        "output__led-speaker--active"
                    );
                }

                if (this.currentBorder && this.currentClassName) {
                    this.currentBorder.classList.remove(
                        `output__led-input--${this.currentClassName}-selected`
                    );
                }

                let border = this.inputClasses[index].input;
                let id = this.classNames[index];

                this.currentClassName = id;
                this.currentBorder = border;
                this.currentBorder.classList.add(
                    `output__led-input--${this.currentClassName}-selected`
                );

                this.currentIcon = this.inputClasses[this.currentIndex];
                this.currentIcon.classList.add("output__led-speaker--active");
                if (this.canvas) {
                    icon === null ? (icon = "(nothing)") : icon;
                    this.updateCanvas(this.currentIndex, icon);
                }
            }
        }
        if (GLOBALS.clearing) {
            if (this.currentIcon) {
                this.currentIcon.classList.remove(
                    "output__led-speaker--active"
                );
            }
            if (this.currentBorder && this.currentClassName) {
                this.currentBorder.classList.remove(
                    `output__led-input--${this.currentClassName}-selected`
                );
            }
            this.clearDisplay();
        }
    }

    stop() {
        this.clearDisplay();
        this.element.style.display = "none";
    }

    start() {
        console.trace("here");
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
            if (this.currentSound === null) {
                this.currentSound;
            } else if (document.hidden) {
                this.clearDisplay();
            } else {
                this.showCurrentLedIcon();
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

        let img = new Image();
        img.onload = () => {
            this.canvasImage = img;
        };
        img.src = "static/outputs/speaker-icon.svg";
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

import LEDSearch from "./led/LEDSearch.js";
import GLOBALS from "./../config.js";

export default LEDOutput;
