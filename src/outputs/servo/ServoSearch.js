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

class ServoSearch {
	constructor(options) {
		this.servoCallback = options.servoCallback;
		this.selectCallback = options.selectCallback;
		this.assets = options.assets;

		this.element = document.createElement('div');
		this.element.classList.add('output__servo-search');
		this.searchBar = document.createElement('div');
		this.searchBar.classList.add('output__servo-search-bar');
		this.element.appendChild(this.searchBar);
		this.searchInput = document.createElement('input');
		this.searchInput.classList.add('output__servo-search-input');
		this.searchBar.appendChild(this.searchInput);
		this.backButton = document.createElement('div');
		this.backButton.addEventListener('click', this.hide.bind(this));
		this.backButton.classList.add('output__servo-back');

		let loader = ((el) => {
			let ajax = new XMLHttpRequest();
			ajax.open('GET', 'static/outputs/back-icon.svg', true);
			ajax.onload = (event) => {
				el.innerHTML = ajax.responseText;
			};
			ajax.send();
		})(this.backButton);

		this.searchBar.appendChild(this.backButton);

		this.searchResults = document.createElement('div');
		this.searchResults.classList.add('output__servo-search-results');

		this.allResults = [];
		for (let index = 0; index < this.assets.length; index += 1) {
			let item = document.createElement('div');
			item.classList.add('output__servo-search-result');

			let icon = document.createElement('div');
			icon.classList.add('output__servo-search-result-icon');

			let label = document.createElement('input');
			label.setAttribute('readonly', 'readonly');
			label.classList.add('output__servo-search-result-input');

			item.value = this.assets[index];
			label.value = item.value;
			icon.addEventListener('click', this.servoCallback);
			this.allResults.push(item);

			item.appendChild(icon);
			item.appendChild(label);

			item.addEventListener('click', this.selectCallback);

			this.searchResults.appendChild(item);
		}
		this.element.appendChild(this.searchResults);
		this.searchInput.addEventListener('keyup', this.filterResults.bind(this));
	}

	hide() {
		this.element.style.display = 'none';
		this.searchResults.className = 'output__servo-search-results';
		this.searchInput.className = 'output__servo-search-input';
		this.backButton.className = 'output__servo-back';

		this.allResults.forEach((item) => {
			let icon = item.children[0];
			icon.className = 'output__servo-search-result-icon';
		});
		this.visible = false;
	}

	show(classId) {
		this.element.style.display = 'block';
		this.searchResults.classList.add(`output__servo-search-results--${classId}`);
		this.searchInput.classList.add(`output__servo-search-input--${classId}`);
		this.backButton.classList.add(`output__servo-back--${classId}`);

		this.allResults.forEach((item) => {
			let icon = item.children[0];
			icon.classList.add(`output__servo-search-result-icon--${classId}`);
		});
		this.searchInput.focus();
		this.visible = true;
	}

	filterResults() {
		let phrase = this.searchInput.value;
		let showAll = false;

		if (phrase.length === 0) {
			showAll = true;
		}

		this.allResults.forEach((item) => {
			if (showAll) {
				item.style.display = 'block';
			}else if (item.value.toLowerCase().indexOf(phrase.toLowerCase()) > -1) {
				item.style.display = 'block';
			}else {
				item.style.display = 'none';
			}
		});
	}
}

export default ServoSearch;