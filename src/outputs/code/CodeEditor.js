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

// It's important that the editor has a size so it renders properly so we
// move it off screen but keep it in the layout.
const editorHiddenStyles = {
    transform: "translate(-150vw, -150vh)",
    visibility: "hidden",
};
const editorVisibleStyles = {
    transform: "unset",
    visibility: "unset",
};
class CodeEditor {
    constructor({ parentElement, onClose }) {
        this.parent = parentElement;
        this.id = "CodeEditor";
        this.element = document.createElement("div");
        this.element.classList.add("output__code-editor");
        Object.assign(this.element.style, editorHiddenStyles);

        this.parent.appendChild(this.element);

        // Top bar.
        this.topBar = document.createElement("div");
        this.topBar.classList.add("top-bar");
        this.backButton = document.createElement("button");
        this.backButton.innerText = "< Back";
        this.backButton.addEventListener("click", this.close.bind(this));
        this.topBar.appendChild(this.backButton);
        this.classDetectedStatus = document.createElement("div");
        this.classDetectedStatus.classList.add("status");
        this.topBar.appendChild(this.classDetectedStatus);
        this.element.appendChild(this.topBar);

        // MakeCode iframe.
        this.iframeWrapper = document.createElement("div");
        this.iframeWrapper.classList.add("iframe-wrapper");
        this.element.appendChild(this.iframeWrapper);

        this.iframe = document.createElement("iframe");
        this.iframe.allow = "usb; autoplay; camera; microphone;";
        this.iframe.src = createMakeCodeURL(
            "https://makecode.microbit.org",
            undefined, // Version.
            undefined, // Language.
            2, // Controller.
            { hideMenu: "" } // Query params.
        );
        this.iframe.width = "100%";
        this.iframe.height = "100%";
        this.iframeWrapper.appendChild(this.iframe);

        // Progress dialog.
        this.progressDialog = document.createElement("dialog");
        this.progressDialogContent = document.createElement("div");
        this.progressDialogContent.innerHTML = "Downloading program...<br/>0%";
        this.progressDialog.appendChild(this.progressDialogContent);
        this.element.appendChild(this.progressDialog);

        // Create and initialise an instance of MakeCodeFrameDriver.
        this.project = soundMakeCodeProject;
        this.isEditorLoaded = false;
        this.isDeviceSynced = false;
        this.driverRef = new MakeCodeFrameDriver(
            {
                controllerId: "Teachable machine with micro:bit",
                queryParams: { hideLanguage: "1" },
                initialProjects: async () => [this.project],
                onEditorContentLoaded: (e) => {
                    console.log("MakeCode is now ready");
                    this.driverRef.hideSimulator().catch(e => {
                        // Nothing we can do.
                    });
                    this.isEditorLoaded = true;
                    const event = new CustomEvent("makeCodeReady", {});
                    window.dispatchEvent(event)
                },
                onWorkspaceSave: (e) => {
                    this.project = e.project;
                    this.#setDeviceSynced(false);
                },
                onDownload: this.onDownload.bind(this),
                onSave: this.onSave.bind(this),
                onBack: this.close.bind(this),
            },
            () => this.iframe
        );
        this.driverRef.initialize();

        this.bodyEl = document.querySelector("body");
        window.addEventListener(
            "classDetected",
            this.onClassDetected.bind(this)
        );

        this.onCloseCallback = onClose;
    }

    #setDeviceSynced(isDeviceSynced) {
        this.isDeviceSynced = isDeviceSynced;
    
        if (isDeviceSynced) {
            this.#unpauseCamera();
        } else {
            this.#pauseCamera();
        }
    }

    #pauseCamera() {
        this.#showTopBarPausedStatus();
        GLOBALS.inputSection.camInput.stop();
    }

    #unpauseCamera(skipPictureInPicture) {
        this.clearTopBarClassDetection();
        // We might have stopped the camera due to device sync.
        if (!GLOBALS.inputSection.camInput.started) {
            try {
                GLOBALS.inputSection.camInput.start();
                if (!skipPictureInPicture) {
                    GLOBALS.inputSection.requestPictureInPicture();
                }
            } catch (e) {
                // Best effort restart.
            }
        }
    }

    open() {
        // Simple routing to allow use of browser back button as well as UI button.
        window.history.pushState(null, "", routes.code);
        Object.assign(this.element.style, editorVisibleStyles);
        window.addEventListener("popstate", () => {
            this.#unpauseCamera(true);
            GLOBALS.inputSection.exitPictureInPicture();
            Object.assign(this.element.style, editorHiddenStyles);
            this.clearTopBarClassDetection();
            this.onCloseCallback({
                project: this.project,
                isDeviceSynced: this.isDeviceSynced,
            });
        }, { once: true })
        if (!this.isDeviceSynced) {
            this.#pauseCamera();
        } else {
            GLOBALS.inputSection.requestPictureInPicture().catch(e => {
                // Permissions, browser support. Nothing we can do.
            })
        }
    }

    async loadProject(project) {
        await this.driverRef.importProject({ project });
    }

    close() {
        window.history.back();
    }

    onClassDetected(event) {
        const className = event.detail.className;
        this.classDetectedStatus.innerHTML = `<p>Detected: ${className}</p>`;
        this.topBar.className = `top-bar detected ${className}`;
    }

    clearTopBarClassDetection() {
        this.classDetectedStatus.innerHTML = "";
        this.topBar.className = "top-bar";
    }

    #showTopBarPausedStatus() {
        this.classDetectedStatus.innerHTML = "<p><span style='font-weight: bold'>Press Download to re-enable the camera</span></p>";
        this.topBar.className = "top-bar";
    }

    async onDownload(e) {
        await GLOBALS.microbit.downloadProgram(e.hex, (progress) => {
            if (progress) {
                const percentage = Math.round(progress * 100);
                this.progressDialogContent.innerHTML = `Downloading program...<br/>${percentage}%`;
            }
            if (!this.progressDialog.open) {
                this.progressDialog.showModal();
            }
        });
        this.progressDialog.close();
        this.#setDeviceSynced(true);
        this.progressDialogContent.innerHTML = "Downloading program...<br/>0%";
    }

    onSave(e) {
        const blob = new Blob([e.hex], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        try {
            const a = document.createElement("a");
            a.href = url;
            // e.name isn't very user friendly at the moment.
            a.download = "microbit-teachable-machine-program.hex"
            a.click();
        } finally {
            URL.revokeObjectURL(url);
        }
    };
}

import GLOBALS from "../../config.js";
import routes from "../../routes.js";
import {
    MakeCodeFrameDriver,
    createMakeCodeURL,
} from "@microbit/makecode-embed/vanilla";
import { soundMakeCodeProject } from "./constants.js";
export default CodeEditor;
