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

    this.topBar = document.createElement("div");
    this.topBar.classList.add("top-bar");
    this.backButton = document.createElement("button");
    this.backButton.innerText = "< Back";
    this.backButton.addEventListener("click", this.close.bind(this));
    this.topBar.appendChild(this.backButton);
    this.element.appendChild(this.topBar);

    this.iframeWrapper = document.createElement("div");
    this.iframeWrapper.classList.add("iframe-wrapper");
    this.element.appendChild(this.iframeWrapper);

    // MakeCode iframe
    this.iframe = document.createElement("iframe");
    this.iframe.allow = "usb; autoplay; camera; microphone;";
    this.iframe.src = createMakeCodeURL(
      "https://makecode.microbit.org",
      undefined, // Version.
      undefined, // Language.
      1, // Controller.
      { hideMenu: "" } // Query params.
    );
    this.iframe.width = "100%";
    this.iframe.height = "100%";
    this.iframeWrapper.appendChild(this.iframe);

    // Create and initialise an instance of MakeCodeFrameDriver.
    this.driverRef = new MakeCodeFrameDriver(
      {
        controllerId: "Teachable machine with micro:bit",
        queryParams: { hideLanguage: "1" },
        initialProjects: async () => [defaultMakeCodeProject],
        onEditorContentLoaded: (e) => console.log("MakeCode is now ready"),
        onWorkspaceSave: (e) => {
          console.log(e.project.header.id, e.project);
        },
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
}

const defaultMakeCodeProject = {
  text: {
    "main.blocks":
      '<xml xmlns="http://www.w3.org/1999/xhtml">\n  <block type="pxt-on-start" id=",{,HjW]u:lVGcDRS_Cu|" x="-247" y="113"></block>\n</xml>',
    "main.ts": "",
    "README.md": " ",
    "pxt.json":
      '{\n    "name": "Untitled",\n    "dependencies": {\n        "core": "*"\n , "radio": "*"\n   },\n    "description": "",\n    "files": [\n        "main.blocks",\n        "main.ts",\n        "README.md"\n    ]\n}',
  },
};

import GLOBALS from "../config.js";
import {
  MakeCodeFrameDriver,
  createMakeCodeURL,
} from "@microbit/makecode-embed/vanilla";

export default CodeEditor;
