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
        const browserWarningDiv = document.querySelector('.wizard__browser-warning')
        browserWarningDiv.style.display = 'block';
        browserWarningDiv.innerHTML = `${GLOBALS.i18n.t("intro-browser-incompatible-1")} 
        <br> ${GLOBALS.i18n.t("intro-browser-incompatible-2", {
            link: chunks => `<a class="link" href="https://www.google.com/chrome/browser/desktop/index.html" target="_blank">${chunks}</a>`
        })}`

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

        this.connectStatusDisplay = new ConnectStatusDisplay(document.getElementById('input__media__activate'), () => this.connect());
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
        try {
            this.hasConnectedBefore = false;
            await GLOBALS.microbit.connect();
            this.connectStatusDisplay.setLoading(0);
            const fetchedHex = await fetch("static/microbit/TMv1Integration.hex");
            const universalHexString = await fetchedHex.text();
            // Avoid overwriting program on reconnection if the initial program has been downloaded before.
            if (!this.hasDownloadedInitialProgram) {
                await GLOBALS.microbit.downloadProgram(
                    universalHexString, 
                    (percentage) => this.connectStatusDisplay.setLoading(percentage)
                );
                this.hasDownloadedInitialProgram = true;
            }
            this.connectStatusDisplay.hide();
            GLOBALS.camInput.start();
            this.hasConnectedBefore = true;
            GLOBALS.microbit.ready();
        } catch (err) {
            const errMessage = getConnectionErrorMsgHTML(err.code);
            await GLOBALS.microbit.usbReset();
            this.connectStatusDisplay.setError(errMessage)
        }
    }

    async onDisconnected() {
        if (this.hasConnectedBefore) {
            this.connectStatusDisplay.setError(
                getConnectionErrorMsgHTML(connectionErrorId.disconnected)
            )
        }
        GLOBALS.outputSection.codeEditor.pauseCamera();
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

const connectionErrorId = {
    updateRequired: "update-req",
    noDeviceSelected: "no-device-selected",
    clearConnect: "clear-connect",
    disconnected: "disconnected",
    generic: "generic"
}

const getConnectionErrorMsgHTML = (errorId) => {
    switch (errorId) {
        case connectionErrorId.updateRequired:
            return GLOBALS.i18n.t(`input-section-connect-error-update-req`, {
                link: chunks => `<a href='https://microbit.org/get-started/user-guide/firmware/'>${chunks}</a>`
            })
        case connectionErrorId.noDeviceSelected:
        case connectionErrorId.clearConnect:
        case connectionErrorId.disconnected:
        case connectionErrorId.generic: {
            return GLOBALS.i18n.t(`input-section-connect-error-${errorId}`, {
                link: chunks => `<a>${chunks}</a>`
            })
        }
        default:
            return getConnectionErrorMsgHTML(connectionErrorId.generic)
    }
}

class ConnectStatusDisplay {

    #element;
    #onConnect;

    constructor(element, onConnect) {
        this.#element = element;
        this.#onConnect = onConnect;
    }

    /**
     * @param {number} percentage The percentage as a 0..1 value.
     */
    setLoading(percentage) {
        this.#element.style.display = 'flex';
        this.#element.innerHTML = `${GLOBALS.i18n.t("loading-text")}<br />${percentage ? `${Math.round(percentage * 100)}%` : ""}`;
    }

    /**
     * @param {string} errMessageHtml The message to display as HTML.
     */
    setError(errMessageHtml) {
        const errorMessageElement = document.createElement("div");
        Object.assign(errorMessageElement.style, {
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center'
        });
        errorMessageElement.innerHTML = `<p>${errMessageHtml}</p>`;
        errorMessageElement.addEventListener('click', this.#onConnect);

        this.#element.replaceChildren(errorMessageElement);
        this.#element.style.display = 'flex';
    }

    hide() {
        this.#element.style.display = 'none';
        this.#element.innerHTML = '';
    }
}

import TweenMax from 'gsap/esm';
import ScrollToPlugin from 'gsap/esm/ScrollToPlugin';
import GLOBALS from './../../../config.js';
import Button from './../../components/Button.js';
import { ConnectionStatus } from '@microbit/microbit-connection';

export default LaunchScreen;