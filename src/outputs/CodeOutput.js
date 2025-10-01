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
  constructor() {
    this.id = "CodeOutput";
    this.element = document.createElement("div");
    this.element.classList.add("output__container");
    this.element.classList.add("output__code");

    this.openMakeCodeBtn = document.createElement("button");
		//  button--large button--color-blue
    this.openMakeCodeBtn.classList.add("button");
		this.openMakeCodeBtn.classList.add("button--open-makecode");
    this.openMakeCodeBtn.innerText = "Edit in MakeCode";
		this.openMakeCodeBtn.addEventListener("click", this.openMakeCode.bind(this))
    this.element.appendChild(this.openMakeCodeBtn);
  }

	openMakeCode() {
		console.log("click")
	}

  start() {}

  stop() {}
}

import GLOBALS from "../config.js";

export default CodeOutput;
