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
        this.backButton.innerText = `< ${GLOBALS.i18n.t("code-editor-back-button-text")}`;
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
            GLOBALS.i18n.locale, // Language.
            2, // Controller.
            { hideMenu: "" } // Query params.
        );
        this.iframe.width = "100%";
        this.iframe.height = "100%";
        this.iframeWrapper.appendChild(this.iframe);

        // Progress dialog.
        this.progressDialog = new DownloadingProgressDialog(this.element);

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
            this.pauseCamera();
        }
    }

    pauseCamera() {
        this.#showTopBarPausedStatus();
        GLOBALS.inputSection.camInput.stop();
    }

    #unpauseCamera(skipPictureInPicture) {
        this.clearTopBarClassDetection();
        // We might have stopped the camera due to device sync.
        // Take care not to restart if disconnected.
        if (!GLOBALS.inputSection.camInput.started && GLOBALS.microbit.isConnected()) {
            try {
                GLOBALS.inputSection.camInput.start();
                if (!skipPictureInPicture) {
                    GLOBALS.inputSection.requestPictureInPicture().catch(e => {
                        // This might not work if the video has been started
                        // now for the first time as it's too soon. If we try
                        // to wait for metadata it doesn't work either as it's
                        // no longer a user gesture. Can't win!
                    })
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
            this.pauseCamera();
        } else {
            if (GLOBALS.microbit.isConnected()) {
                GLOBALS.inputSection.requestPictureInPicture().catch(e => {
                    // Permissions, browser support. Nothing we can do.
                });
            }
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
        const translatedClassname = GLOBALS.i18n.t(`class-name-${className}`);
        const detectedStatusText = GLOBALS.i18n.t(
            "code-editor-detected-class-indicator", 
            { className: translatedClassname }
        );
        this.classDetectedStatus.innerHTML = `<p>${detectedStatusText}</p>`;
        this.topBar.className = `top-bar detected ${className}`;
    }

    clearTopBarClassDetection() {
        this.classDetectedStatus.innerHTML = "";
        this.topBar.className = "top-bar";
    }

    #showTopBarPausedStatus() {
        const warningText = GLOBALS.i18n.t("code-editor-out-of-sync-warning")
        this.classDetectedStatus.innerHTML = `<p><span style='font-weight: bold'>⚠️ ${warningText}</span></p>`;
        this.topBar.className = "top-bar";
    }

    async onDownload(e) {
        try {
            await GLOBALS.microbit.downloadProgram(e.hex, (progress) => {
                if (progress) {
                    const percentage = Math.round(progress * 100);
                    this.progressDialog.setProgress(percentage)
                }
                if (!this.progressDialog.open) {
                    this.progressDialog.show();
                }
            });
            this.progressDialog.close();
            this.#setDeviceSynced(true);
        } catch (e) {
            this.progressDialog.showError();
        }
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

class DownloadingProgressDialog {
    constructor(parentEl) {
        // Build dialog
        this.dialog = document.createElement("dialog");
        this.dialogContent = document.createElement("div");
        this.setProgress(0);
        this.dialog.appendChild(this.dialogContent);
        this.closeBtn = document.createElement("button");
        this.closeBtn.innerText = GLOBALS.i18n.t("downloading-program-dialog-close-button-text");
        this.closeBtn.addEventListener("click", this.close.bind(this))
        this.dialog.appendChild(this.closeBtn);
        parentEl.appendChild(this.dialog);
    }

    show() {
        this.dialog.showModal();
    }

    close() {
        this.dialog.close();
        this.closeBtn.style.display = "none";
        this.setProgress(0);
    }

    setProgress(percentage) {
        const text = GLOBALS.i18n.t("downloading-program-dialog-progress-text");
        this.dialogContent.innerHTML = `${text}<br/>${percentage}%`;
    }

    showError() {
        this.closeBtn.style.display = "block";
        const errorMsg = GLOBALS.i18n.t("downloading-program-dialog-error-text");
        this.dialogContent.innerHTML = errorMsg;
    }
}

import GLOBALS from "../../config.js";
import routes from "../../routes.js";
import {
    MakeCodeFrameDriver,
    createMakeCodeURL,
} from "@microbit/makecode-embed/vanilla";
import { soundMakeCodeProject } from "./constants.js";
export default CodeEditor;
