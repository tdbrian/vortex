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
        setStore(templateContents);
        document.querySelector('body').appendChild(templateContents);
    }

    var runStack = [
        hideShowEl
    ];

    function updateState(state) {
        info('Running state update loop');
        runStack.forEach(function(fn) {
            fn();
        });
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

            // No sub-states defaults to boolean state
            if(subStates.length === 0) { innerStates = false }

            store.states[groupName] = innerStates;
            stateEl.remove();
        }, this);

        info('states: ');
        info(store.states);
    }
    
    // Creates initial store based on attributes and elements   
    const elBindAttr = prefix + prefixDivider + 'bind';
    const elInputAttr = prefix + prefixDivider + 'input';
    function setStore(templateContents) {
        info('setting store');
        templateContents.querySelectorAll("[" + elInputAttr + "]").forEach(function (inputEl) {
            info(inputEl)
            var inputData = inputEl.getAttribute(elInputAttr);
            setWith(store, inputData, null);
            info(inputData)
        });
        info(store);
    }

    function hideShowEl() {

    }

    // Logs out info messages to the console when verbosity is on.
    function info(message) {
        if (verbose) console.info(message);
    }

    // Assigns value to object based on properties
    function setWith(obj, prop, value) {
        if (typeof prop === "string") {
            prop = prop.split(".");
        }
        if (prop.length > 1) {
            var e = prop.shift();
            setWith(obj[e] = Object.prototype.toString.call(obj[e]) === "[object Object]" ? obj[e] : {}, prop, value);
        } else {
            obj[prop[0]] = value;
        }
    }

    info('Starting Vortex :)');
    initRender();
})();
