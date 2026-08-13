
/**
 * @param {HTMLElement[]} containers
 */ 
function setUpToggles(containers) {
    containers.forEach(container => {
        const button = container.querySelector('.gw-button');
        const iframe = container.querySelector('.gw-iframe');

        button.addEventListener('click', () => togglePlayer(button, iframe));
    });
}

/**
 * @param {HTMLElement} button
 * @param {HTMLElement} iframe 
 */ 
function togglePlayer(button, iframe) {
    if (iframe.getAttribute('src') == '') {
        iframe.setAttribute('src', iframe.getAttribute('data-src'));
        button.textContent = 'stop';
    }
    else {
        iframe.setAttribute('src', '');
        button.textContent = 'start';
    }

}


setUpToggles(Array.from(document.getElementsByClassName('godot-web-container')));