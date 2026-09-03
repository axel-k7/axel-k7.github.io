/* i dont really wanna use async but whatever */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * @param {HTMLElement} _label 
 * @param {string} _text
 * @param {number} _timeout
 */ 
async function typeWriterAppend(_label, _text, _timeout) {
	for (var i = 0; i < _text.length; i++) {
		_label.innerHTML += _text[i];
		await delay(_timeout);
	}
}

/**
* @param {HTMLElement} _label 
* @param {number} _timeout
*/
async function typeWriterRemove(_label, _timeout) {
	while (_label.innerHTML.length > 0 ) {
		_label.innerHTML = _label.innerHTML.slice(0, -1);
		await delay(_timeout)
	}
}

/**
 * @param {HTMLElement} _label 
 * @param {string} _text
 * @param {number} _timeout
 */ 
async function typeWriterSwitch(_label, _text, _timeout) {
	await typeWriterAppend(_label, _text, _timeout);
	await delay(1500);
	await typeWriterRemove(_label, _timeout*0.5);
}

var rotation_controller = {
	rotate : true,
	stopped : true,
	/* better name for AI programmer lol, leaves a bad taste nowadays */
	titles : ["Systems", "AI (NPCs!!)", "Tools", "Games"],
	index : 0,
	label : document.getElementsByClassName('title-label')[0],
	timeout : 150,
};

async function rotateTitles() {
	if (!rotation_controller.stopped)
		return;

	rotation_controller.stopped = false;

	let i = rotation_controller.index;
	let titles = rotation_controller.titles;

	while (rotation_controller.rotate) {
		await typeWriterSwitch(
			rotation_controller.label, 
			titles[i],
			rotation_controller.timeout
		);

		rotation_controller.index = i;
		i = (i + 1) % titles.length; 
		await delay(500);
	}

	rotation_controller.stopped = true;
}

function startRotation(entry) {
	rotation_controller.rotate = true;
	rotateTitles();
	return true;
}

function stopRotation(entry) {
	rotation_controller.rotate = false;
	return true;
}


/**
 * @param {IntersectionObserverEntry} entry 
 */
function elementBelow(entry) {
	const rect = entry.boundingClientRect;
	const root = entry.rootBounds;

	if (!root) return;

	return rect.top >= root.bottom;
}

/**
 * @param {IntersectionObserverEntry} entry 
 */
function hasScrolled(entry) {
	return window.scrollY != 0;
}


/**
 * @param {IntersectionObserverEntry} entry 
 * @param {Map} predicateMap
 */ 
// Searches the predicate map with the intersection entries target classes
function classPredicatesMet(entry, predicateMap) {
	return Array.from(entry.target.classList).every(
		className => {
			//pretty sure 'get()' uses string hashes, so it shouldn't be too slow
			const predicate = predicateMap.get(className);

			if (!predicate) return true; 
			return predicate(entry);
		}
	);
}

/**
 * @param {IntersectionObserverEntry[]} entries 
 * @param {Boolean} callback
 */ 
// called every time the IntersectionObserver detects change in any of its observed elements
// controls whether an element should be regarded as active or not
// checks activation predicates when an element enters view, checks deactivation when it exits
function observableChange(entries) {
	entries.forEach(entry => {
		
		const element = entry.target;
		const hasTag = element.classList.contains('is-active');
		const reverse = element.classList.contains('reverse');

		if (entry.isIntersecting && !reverse || reverse && !entry.isIntersecting) {
			console.log("activation check: ", element)
			if (!hasTag && classPredicatesMet(entry, ActivationPredicates)) {
				element.classList.add('is-active');	
			}
		} else {
			console.log("deactivation check: ", element)
			if (hasTag && classPredicatesMet(entry, DeactivationPredicates)) {
				element.classList.remove('is-active');
			}
		}
	});
}

const ActivationPredicates = new Map();
const DeactivationPredicates = new Map();

// any class with 'side-menu' should only be deactivated
// if the element is currently below the users view
DeactivationPredicates.set('side-menu', elementBelow)

ActivationPredicates.set('header', hasScrolled);

//always stay active after initial trigger
DeactivationPredicates.set('slider-container', () => false);

ActivationPredicates.set('title-label', startRotation);
DeactivationPredicates.set('title-label', stopRotation);



const options = {
	root: null,
	threshold: 0,
};

const observer = new IntersectionObserver(observableChange, options);

document.querySelectorAll('.observable').forEach(element => {
	if (element instanceof HTMLElement) {
		observer.observe(element);
	} else {
		console.warn('tried to observe non-html element');
	}
});


document.querySelectorAll('a[href*="#"]').forEach(element => {
	var target_class = element.getAttribute('href');
	var target_element = document.getElementsByClassName(target_class)[0];

	if (target_element instanceof HTMLElement) {
		element.addEventListener('click', () => {
			target_element.scrollIntoView({behavior: 'smooth'});
		});
	}
});

