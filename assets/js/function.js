function boom() {
	alert('AAAA!!!');
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