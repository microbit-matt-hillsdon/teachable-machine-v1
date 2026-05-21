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
import GLOBALS from './config.js';
import routes from './routes.js';
import InputSection from './ui/modules/InputSection.js';
import LearningSection from './ui/modules/LearningSection.js';
import OutputSection from './ui/modules/OutputSection.js';
import Wizard from './ui/modules/Wizard.js';
import Recording from './ui/modules/Recording';
import LaunchScreen from './ui/modules/wizard/LaunchScreen.js';
import BrowserUtils from './ui/components/BrowserUtils';
import * as Sentry from "@sentry/browser";

async function init() {
  Sentry.init({
    dsn: "https://15e0b368863e98ae12ae95727dd72bab@o333751.ingest.us.sentry.io/4510273655013376",
    sendDefaultPii: false,
    // We may enable again in the future.
    enabled: false
  });

  // E.g. refreshing the page on the /code route.
  if (window.location.pathname !== routes.home) {
    history.replaceState(null, "", routes.home);
  }

	await GLOBALS.i18n.initialise();

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

	initFpsControl();
}

// Log-scale slider so you can reach sub-1-fps rates at the low end without
// losing the high end. Slider position 0..max maps to fps MIN_FPS..MAX_FPS.
const MIN_FPS = 0.1;
const MAX_FPS = 30;
const LOG_MIN = Math.log10(MIN_FPS);
const LOG_RANGE = Math.log10(MAX_FPS) - LOG_MIN;

function sliderToFps(pos, max) {
	return Math.pow(10, LOG_MIN + (pos / max) * LOG_RANGE);
}

function formatFps(fps) {
	if (fps >= 10) return String(Math.round(fps));
	if (fps >= 1) return fps.toFixed(1);
	if (fps >= 0.1) return fps.toFixed(2);
	return fps.toFixed(3);
}

function initFpsControl() {
	const slider = document.getElementById('fps-slider');
	const valueEl = document.getElementById('fps-value');
	if (!slider || !valueEl) return;

	const sliderMax = Number(slider.max);
	const storedPos = Number(localStorage.getItem('targetFpsSliderPos'));
	const initialPos = Number.isFinite(storedPos) && storedPos >= 0 && storedPos <= sliderMax
		? storedPos
		: sliderMax;
	slider.value = String(initialPos);

	const apply = (pos) => {
		const fps = sliderToFps(pos, sliderMax);
		valueEl.textContent = formatFps(fps);
		GLOBALS.targetFps = fps;
		if (GLOBALS.webcamClassifier) {
			GLOBALS.webcamClassifier.setTargetFps(fps);
		}
	};

	apply(initialPos);

	slider.addEventListener('input', () => {
		const pos = Number(slider.value);
		localStorage.setItem('targetFpsSliderPos', String(pos));
		apply(pos);
	});
}

window.addEventListener('load', init);

export default GLOBALS;