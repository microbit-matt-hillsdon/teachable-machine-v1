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

import '../style/main.styl';
import TweenMax from 'gsap';

import GLOBALS from './config.js';
import routes from './routes.js';
import Button from './ui/components/Button.js';
import IntroSection from './ui/modules/IntroSection.js';
import InputSection from './ui/modules/InputSection.js';
import LearningSection from './ui/modules/LearningSection.js';
import OutputSection from './ui/modules/OutputSection.js';
import Wizard from './ui/modules/Wizard.js';
import Recording from './ui/modules/Recording';
import LaunchScreen from './ui/modules/wizard/LaunchScreen.js';
import BrowserUtils from './ui/components/BrowserUtils';
import * as Sentry from "@sentry/browser";

function init() {
  Sentry.init({
    // TODO: Replace with correct project DSN
    dsn: "https://255eeec84256bcb3045e0f20f535eee0@o333751.ingest.us.sentry.io/4507108147003392",
    release: "microbit-teachablemachine",
    enabled: window.location.hostname === 'microbit.teachable-machine-v1.pages.dev'
  });

  // E.g. refreshing the page on the /code route.
  if (window.location.pathname !== routes.home) {
    history.replaceState(null, "", routes.home);
  }

	// Shim for forEach for IE/Edge
  if (typeof NodeList.prototype.forEach !== 'function') {
    NodeList.prototype.forEach = Array.prototype.forEach;
	}

  GLOBALS.browserUtils = new BrowserUtils();
  GLOBALS.launchScreen = new LaunchScreen();

  GLOBALS.learningSection = new LearningSection(document.querySelector('#learning-section'));
	GLOBALS.inputSection = new InputSection(document.querySelector('#input-section'));
	GLOBALS.outputSection = new OutputSection(document.querySelector('#output-section'));

	GLOBALS.inputSection.ready();
	GLOBALS.learningSection.ready();
	GLOBALS.wizard = new Wizard();
	GLOBALS.recordSection = new Recording(document.querySelector('#recording'));
	if (localStorage.getItem('isBackFacingCam') && localStorage.getItem('isBackFacingCam') === 'true') {
		GLOBALS.isBackFacingCam = true;
	}
}

window.addEventListener('load', init);

export default GLOBALS;