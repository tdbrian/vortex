// vortex.js v1.0-alpha-1
// copyright 2017 Thomas Brian

(function () {

    // Options 
    var verbose = true;

    // App store
    var store = {
        states: {}
    };

    // Element names
    const prefix = 'vx';
    const prefixDivider = '-';

    // The initial page render on startup.
    function initRender() {
        info('Rendering app');
        var templateContents = document.querySelector('template').content;
        removePreLoaders();
        setStates(templateContents);
        info('states: ')
        info(store.states);
        document.querySelector('body').appendChild(templateContents);
    }

    // All vx preLoaders are removed from the dom.
    const preloaderElName = prefix + prefixDivider + 'preloader';
    function removePreLoaders() {
        document.querySelectorAll(preloaderElName).forEach(function (el) { el.remove() }, this);
    }

    // States are retrieved from the template and extracted out to the page states.
    const statesElName = prefix + prefixDivider + 'states';
    const groupElName = prefix + prefixDivider + 'group';
    const stateElName = prefix + prefixDivider + 'state';
    const stateElDefault = prefix + prefixDivider + 'default';
    function setStates(templateContents) {
        
        // Get all state groups
        templateContents.querySelectorAll(statesElName).forEach(function (stateEl) {
            var groupName = stateEl.getAttribute(groupElName).toString();
            if (groupName == null) groupName = 'default';
            
            // Gets sub-states of state group
            var subStates = [].slice.call(stateEl.getElementsByTagName(stateElName));
            let innerStates = subStates.map(function (innerStateEl) {
                var isDefault = innerStateEl.attributes.getNamedItem(stateElDefault) !== null;
                var stateName = innerStateEl.innerText.toLowerCase().trim();
                return {
                    stateName,
                    active: isDefault
                };
            });
            store.states[groupName] = innerStates;
            stateEl.remove()
        }, this);
    }

    // Logs out info messages to the console when verbosity is on.
    function info(message) {
        if (verbose) console.info(message);
    }

    info('Starting Vortex :)');
    initRender();
})();
