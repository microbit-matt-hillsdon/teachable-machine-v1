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

class CodeEditor {
    constructor(parentElement) {
        this.parent = parentElement;
        this.id = "CodeEditor";
        this.element = document.createElement("div");
        this.element.classList.add("output__code-editor");
        this.element.style.display = "none";
        this.parent.appendChild(this.element);

        // Top bar.
        this.topBar = document.createElement("div");
        this.topBar.classList.add("top-bar");
        this.backButton = document.createElement("button");
        this.backButton.innerText = "< Back";
        this.backButton.addEventListener("click", this.close.bind(this));
        this.topBar.appendChild(this.backButton);
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
        this.driverRef = new MakeCodeFrameDriver(
            {
                controllerId: "Teachable machine with micro:bit",
                queryParams: { hideLanguage: "1" },
                initialProjects: async () => [initialMakeCodeProject],
                onEditorContentLoaded: (e) =>
                    console.log("MakeCode is now ready"),
                onWorkspaceSave: (e) => {
                    console.log(e.project.header.id, e.project);
                },
                onDownload: this.onDownload.bind(this),
                onBack: this.close.bind(this),
            },
            () => this.iframe
        );
        this.driverRef.initialize();

        this.bodyEl = document.querySelector("body");
    }

    open() {
        this.element.style.display = "flex";
        this.bodyEl.style.overflow = "hidden";
    }

    close() {
        this.element.style.display = "none";
        this.bodyEl.style.overflow = "auto";
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
        this.progressDialogContent.innerHTML = "Downloading program...<br/>0%";
    }
}

const extensionVersion = "5e046c731a54cbfc41f7d8b63300ffa020b3060e";
const initialMakeCodeProject = {
    header: {
        target: "microbit",
        targetVersion: "8.0.16",
        editor: "blocksprj",
        name: "TMv1Integration",
        meta: {},
        pubId: "",
        pubCurrent: false,
        id: "ad5c181a-e6d9-4f62-8e18-4fd34b7617f6",
        recentUse: 1759408610,
        modificationTime: 1759408610,
        path: "TMv1Integration",
        cloudCurrent: false,
        saveId: null,
        githubCurrent: false,
    },
    text: {
        "pxt.json": JSON.stringify({
            name: "TMv1Integration",
            description: "",
            dependencies: {
                core: "*",
                microphone: "*",
                radio: "*", // Needed to compile.
                "TM Extension": `github:microbit-grace/tm-extension#${extensionVersion}`,
            },
            files: ["main.ts", "main.blocks", "README.md"],
            preferredEditor: "blocksprj",
        }),
        "README.md": "",
        "main.blocks":
            '<xml xmlns="https://developers.google.com/blockly/xml"><variables></variables><block type="TMMachineLearning_onMLGreenStart" x="0" y="0"><statement name="HANDLER"><block type="music_playable_play"><field name="playbackMode">music.PlaybackMode.InBackground</field><value name="toPlay"><shadow type="soundExpression_builtinPlayableSoundEffect"><field name="soundExpression">soundExpression.giggle</field></shadow></value></block></statement></block><block type="TMMachineLearning_onMLPurpleStart" x="0" y="149"><statement name="HANDLER"><block type="music_playable_play"><field name="playbackMode">music.PlaybackMode.InBackground</field><value name="toPlay"><shadow type="soundExpression_builtinPlayableSoundEffect"><field name="soundExpression">soundExpression.happy</field></shadow></value></block></statement></block><block type="TMMachineLearning_onMLOrangeStart" x="-3" y="308"><statement name="HANDLER"><block type="music_playable_play"><field name="playbackMode">music.PlaybackMode.InBackground</field><value name="toPlay"><shadow type="soundExpression_builtinPlayableSoundEffect"><field name="soundExpression">soundExpression.hello</field></shadow></value></block></statement></block></xml>',
        "main.ts":
            "TMMachineLearning.onMLOrangeStart(function () {\n    music.play(music.builtinPlayableSoundEffect(soundExpression.hello), music.PlaybackMode.InBackground)\n})\nTMMachineLearning.onMLPurpleStart(function () {\n    music.play(music.builtinPlayableSoundEffect(soundExpression.happy), music.PlaybackMode.InBackground)\n})\nTMMachineLearning.onMLGreenStart(function () {\n    music.play(music.builtinPlayableSoundEffect(soundExpression.giggle), music.PlaybackMode.InBackground)\n})\n",
    },
};

import GLOBALS from "../config.js";
import {
    MakeCodeFrameDriver,
    createMakeCodeURL,
} from "@microbit/makecode-embed/vanilla";

export default CodeEditor;
