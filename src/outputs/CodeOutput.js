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

class CodeOutput {
    constructor(codeEditor) {
        this.id = "CodeOutput";
        this.element = document.createElement("div");
        this.element.classList.add("output__code");
        this.container = document.createElement("div");
        this.container.classList.add("output__code-container");
        this.element.appendChild(this.container);

        this.renderer = createMakeCodeRenderBlocks({});
        this.renderer.initialize();

        this.codePreviews = document.createElement("div");
        this.codePreviews.classList.add("output__code-container");
        this.container.appendChild(this.codePreviews);

        makeCodeProjectsForCodePreview.forEach((code) => {
            const blockPreviewContainer = document.createElement("div");
            blockPreviewContainer.classList.add("block-preview");
            this.codePreviews.appendChild(blockPreviewContainer);
            blockPreviewContainer.innerHTML = "<p>Loading...</p>";
            this.renderBlock(blockPreviewContainer, code);
        });

        this.openMakeCodeBtn = document.createElement("button");
        this.openMakeCodeBtn.classList.add("button");
        this.openMakeCodeBtn.classList.add("button--open-makecode");
        this.openMakeCodeBtn.innerText = "Edit in MakeCode";
        this.openMakeCodeBtn.addEventListener(
            "click",
            this.openMakeCode.bind(this)
        );
        this.container.appendChild(this.openMakeCodeBtn);

        this.codeEditor = codeEditor;
        this.classNames = GLOBALS.classNames;
    }

    openMakeCode() {
        this.codeEditor.open();
        this.codePreviews.innerHTML =
            "<p>Open MakeCode editor to see the code.</p>";
    }

    renderBlock(parent, code) {
        this.renderer
            .renderBlocks({ code, options: { layout: BlockLayout.None } })
            .then((result) => {
                // Remove styling from SVG as it would influence the styling of other components.
                const svgText = result.svg.replace(
                    /<style[^>]*>[\s\S]*?<\/style>/gi,
                    ""
                );
                parent.innerHTML = svgText;
            });
    }

    start() {}
    stop() {
        GLOBALS.microbit.stopSounds();
        GLOBALS.microbit.stopServo();
        GLOBALS.microbit.clearDisplay();
    }
    trigger(index) {
        if (this.currentIndex !== index) {
            this.currentIndex = index;
            const className = this.classNames[index];
            GLOBALS.microbit.writeToMicrobit(className);
            // Dispatch event for code editor.
            console.log("dispatch class detected")
            const event = new CustomEvent("classDetected", {
                detail: { className },
            });
            window.dispatchEvent(event);
        }
    }
}

import {
    BlockLayout,
    createMakeCodeRenderBlocks,
} from "@microbit/makecode-embed/vanilla";
import GLOBALS from "../config.js";
import { makeCodeProjectsForCodePreview } from "./code/constants.js";

export default CodeOutput;
