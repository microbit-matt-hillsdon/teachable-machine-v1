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

class LaunchScreen {
    constructor() {
        this.element = document.querySelector('.intro');

        this.startButton = new Button(document.querySelector('#start-tutorial-button'));
        this.skipButtonMobile = document.querySelector('#skip-tutorial-button-mobile');

        this.messageIsCompatible = document.querySelector('#is-compatible');
        this.messageIsNotCompatible = document.querySelector('#is-not-compatible');

        this.startButton.element.classList.add('button--disabled');
        document.querySelector('.wizard__browser-warning').style.display = 'block';

        let facebookButton = document.querySelector('.intro__share-link--facebook');
        let twitterButton = document.querySelector('.intro__share-link--twitter');

        let intro = document.querySelector('.intro__content-mobile');
         
        let defaultPrevent = (event) => {
            event.preventDefault();
        };
         
        intro.addEventListener('touchstart', defaultPrevent);
        intro.addEventListener('touchmove', defaultPrevent);


        let loader = ((el) => {
            let ajax = new XMLHttpRequest();
            ajax.open('GET', 'static/social-facebook.svg', true);
            ajax.onload = (event) => {
                el.innerHTML = ajax.responseText;
            };
            ajax.send();
        })(facebookButton);

        loader = ((el) => {
            let ajax = new XMLHttpRequest();
            ajax.open('GET', 'static/social-twitter.svg', true);
            ajax.onload = (event) => {
                el.innerHTML = ajax.responseText;
            };
            ajax.send();
        })(twitterButton);

        facebookButton.addEventListener('click', this.openFacebookPopup.bind(this));
        twitterButton.addEventListener('click', this.openTwitterPopup.bind(this));
        
        if (GLOBALS.browserUtils.isCompatible === true && GLOBALS.browserUtils.isMobile === false) {
            this.startButton.element.classList.remove('button--disabled');
            document.querySelector('.wizard__browser-warning').style.display = 'none';
        }

        if (GLOBALS.browserUtils.isMobile) {
            this.messageIsCompatible.style.display = 'block';

        }else {
            this.messageIsCompatible.style.display = 'none';
        }

        if (GLOBALS.browserUtils.isMobile && !GLOBALS.browserUtils.isCompatible) {
            this.messageIsCompatible.style.display = 'none';
            this.messageIsNotCompatible.style.display = 'block';
        }

        // Hacked to skip the tutorial always
        this.skipButtonMobile.addEventListener('click', this.skipClick.bind(this));
        this.startButton.element.addEventListener('click', this.skipClick.bind(this));

        this.connectStatusDisplay = document.getElementById('input__media__activate');
        this.hasConnectedBefore = false;
        this.hasDownloadedInitialProgram = false;
        window.addEventListener('disconnected', this.onDisconnected.bind(this));
    }

    openFacebookPopup(event) {
        event.preventDefault();
        let url = event.currentTarget.getAttribute('href');
        window.open(url, 'fbShareWindow', 'height=450, width=550, top='+(window.innerHeight/2-275)+', left='+(window.innerWidth/2-225)+',toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
    }

    openTwitterPopup(event) {
        event.preventDefault();
        let url = event.currentTarget.getAttribute('href');
         
        window.open(url, 'fbShareWindow', 'height=450, width=600, top='+(window.innerHeight/2-150)+', left='+(window.innerWidth/2-225)+', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
         
    }

    skipClick(event) {
        event.preventDefault();
        let intro = document.querySelector('.intro');
        let offset = intro.offsetHeight;
        GLOBALS.wizard.skip();
        gtag('event', 'wizard_skip');        

        if (GLOBALS.browserUtils.isMobile) {
            let msg = new SpeechSynthesisUtterance();
            msg.text = ' ';
            window.speechSynthesis.speak(msg);

            GLOBALS.inputSection.createCamInput();
            GLOBALS.camInput.start();
            let event = new CustomEvent('mobileLaunch');
            window.dispatchEvent(event);
        }
        TweenMax.to(intro, 0.5, {
            y: -offset,
            onComplete: () => {
                this.destroy();
                if (!GLOBALS.browserUtils.isMobile) {
                    this.connect();
                }
            }
        });
    }

    async connect() {
        // TODO: Do we need to fix
        // https://github.com/microbit-foundation/microbit-connection/issues/20
        // ?
        try {
            this.hasConnectedBefore = false;
            await GLOBALS.microbit.connect();
            this.connectStatusDisplay.style.display = 'flex';
            this.connectStatusDisplay.innerHTML = "Loading<br />0%";
            const fetchedHex = await fetch("static/microbit/TMv1Integration.hex");
            const universalHexString = await fetchedHex.text();
            // Avoid overwriting program on reconnection if the initial program has been downloaded before.
            if (!this.hasDownloadedInitialProgram) {
                await GLOBALS.microbit.downloadProgram(
                    universalHexString, 
                    (percentage) => {
                        this.connectStatusDisplay.innerHTML = `Loading<br />${percentage ? `${Math.round(percentage * 100)}%` : ""}`;
                    }
                );
                this.hasDownloadedInitialProgram = true;
            }
            this.connectStatusDisplay.style.display = 'none';
            GLOBALS.camInput.start();
            this.hasConnectedBefore = true;
        } catch (err) {
            const errMessage = connectionErrorMsg[err.code] ?? connectionErrorMsg["generic"]
            await GLOBALS.microbit.usbReset();
            await this.displayConnectionError(errMessage)
        }
    }

    async onDisconnected() {
        if (this.hasConnectedBefore) {
            this.displayConnectionError(connectionErrorMsg["disconnected"]);
        }
        GLOBALS.camInput.stop();
    }

    async displayConnectionError(errMessage) {
        this.connectStatusDisplay.style.display = 'flex';
        this.connectStatusDisplay.innerHTML = `<p>${errMessage}</p>`;
        this.connectStatusDisplay.addEventListener('click', this.connect.bind(this));
    }

    destroy() {
        document.body.classList.remove('no-scroll');
        this.element.style.display = 'none';        

    }

    startClick() {
        let intro = document.querySelector('.intro');
        let offset = intro.offsetHeight;
        if (GLOBALS.browserUtils.isMobile || GLOBALS.browserUtils.isSafari) {
            GLOBALS.inputSection.createCamInput();
            GLOBALS.camInput.start();
            GLOBALS.wizard.touchPlay();
            let event = new CustomEvent('mobileLaunch');
            window.dispatchEvent(event);
        }

        TweenMax.to(intro, 0.5, {
            y: -offset,
            onComplete: () => {
                this.destroy();
                GLOBALS.wizard.start();             
            }
        });
    }
}

const connectionErrorMsg = {
    "update-req": "Connecting to the micro:bit failed because the firmware on your micro:bit is too old. You must <a href='https://microbit.org/get-started/user-guide/firmware/'>update your firmware</a> before you can connect to this micro:bit.",
    "no-device-selected": "No device selected. Plug in a micro:bit and <a>click here to try again</a>.",
    "clear-connect": "Another process is connected to this device. Close any other tabs that may be using WebUSB (for example, MakeCode, Python Editor, CreateAI), or unplug and replug the micro:bit before <a>clicking here to try again</a>.",
    "disconnected": "The micro:bit got disconnected. <a>Click here to try again</a>.",
    generic: "Replug the micro:bit and <a>click here to try again</a>."
}

import TweenMax from 'gsap/esm';
import ScrollToPlugin from 'gsap/esm/ScrollToPlugin';
import GLOBALS from './../../../config.js';
import Button from './../../components/Button.js';
import { ConnectionStatus } from '@microbit/microbit-connection';

export default LaunchScreen;