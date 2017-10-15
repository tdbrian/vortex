// vortex.js v1.0-alpha-1
// copyright 2017 Thomas Brian

(function () {
    
    // Options 
    var verbose = true;
    
    // App State
    var states = {};

    // Element names
    const prefix = 'vx';
    const prefixDivider = '-';
    const preloaderElementName = prefix + prefixDivider + 'preloader';
    const statesElementName = prefix + prefixDivider + 'states';
    const groupElementName = prefix + prefixDivider + 'group';

    /**
     * The initial page render on startup.
     */
    function initRender() {
        info('Rendering app');
        var templateContents = document.querySelector('template').content;
        removePreLoaders();
        setStates(templateContents);
        info('states: ')
        info(states);
        document.querySelector('body').appendChild(templateContents);
    }

    /**
     * All vx preLoaders are removed from the dome.
     */
    function removePreLoaders() {
        document.querySelectorAll(preloaderElementName).forEach(function(element) { element.remove() }, this);
    }

    /**
     * States are retrieved from the template and extracted out to the page states.
     */
    function setStates(templateContents) {
        templateContents.querySelectorAll(statesElementName).forEach(function(stateElement) {
            var groupName = stateElement.getAttribute(groupElementName).toString();
            if (groupName == null) groupName = 'default';
            states[groupName] = {};
            stateElement.remove() 
        }, this);
    }

    /**
     * Logs out info messages to the console when verbosity is on.
     */
    function info(message) {
        if (verbose) console.info(message);
    }

    info('Starting Vortex :)');
    initRender();
})();
