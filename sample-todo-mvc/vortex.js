// vortex.js v1.0-alpha-1
// copyright 2017 Thomas Brian

(function () {

    // Options 
    var verbose = true;

    // App store
    var store = {
        states: {}
    };

    // App event listeners
    var treeListeners = {};

    // Element names
    const prefix = 'vx';
    const prefixDivider = '-';

    // The stack of element functions to be run
    var runStack = [
        handleForms,
        showEl,
        hideEl
    ];

    // The initial page render on startup.
    function initRender() {
        info('rendering app');
        var templateContents = document.querySelector('template').content;
        setStates(templateContents);
        setStore(templateContents);
        setListenersTree(templateContents);
        runStack.forEach(function(fn) {
            fn(templateContents).setup();
        });
        info('listeners')
        info(treeListeners);
        removePreLoaders();
        document.querySelector('body').appendChild(templateContents);
    }

    // Update state tree
    function updateState(path, state) {
        info('running state update loop');
        runStack.forEach(function(fn) {
            fn.update(path, state);
        });
    }

    // All vx preLoaders are removed from the dom.
    const preloaderElName = prefix + prefixDivider + 'preloader';
    function removePreLoaders() {
        info('removing pre-loaders')
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
    const elListAttr = prefix + prefixDivider + 'list';
    function setStore(templateContents) {
        info('setting store');
        templateContents.querySelectorAll("[" + elInputAttr + "]").forEach(function (inputEl) {
            var inputData = inputEl.getAttribute(elInputAttr);
            // inputEl.onkeyup = function(evt) {
            //     if (evt.key == "Enter") {
            //         info(inputEl.textContent)
            //         setWith(store, inputData, inputEl.textContent);
            //     }
            // };
            setWith(store, inputData, null);
        });
        templateContents.querySelectorAll("[" + elListAttr + "]").forEach(function (listEl) {
            var listData = listEl.getAttribute(elListAttr);
            var listParts = listData.split(":");
            var listPath = listParts[0];
            var listFilteredPath = listParts[1];
            info(listParts)
            setWith(store, listPath, []);
            setWith(store, listFilteredPath, []);
        });
        info(store);
    }
    
    // Creates a tree of event listeners
    function setListenersTree(templateContents) {
       info('setting up listeners tree');
        templateContents.querySelectorAll("[" + showElAttr + "]").forEach(function (showEl) { 
            
        });
    }

    // Hides or shows elements based on store value
    const showElAttr = prefix + prefixDivider + 'show';
    function showEl(templateContents) {
        return {
            setup: function() {
                info('running show');
                templateContents.querySelectorAll("[" + showElAttr + "]").forEach(function (el) { 
                    // Set dom
                    var showStatePath = el.getAttribute(showElAttr);
                    var state = objectGet(store, showStatePath);
                    if (state == false) { el.style.display = "none" }
                    else { el.style.display = "" };
                    addListener(showStatePath, el);
                });
            },
            update: function(state, value) {
                
                info("hide updating");
            }
        }
    }

    // Hides or shows elements based on store value
    const hideElAttr = prefix + prefixDivider + 'hide';
    function hideEl(templateContents) {
        return {
            setup: function() {
                info('running hide')
                templateContents.querySelectorAll("[" + hideElAttr + "]").forEach(function (el) { 
                    var hideStatePath = el.getAttribute(hideElAttr);
                    var state = objectGet(store, hideStatePath);
                    if (state == false) { el.style.display = "" }
                    else { el.style.display = "none" };
                    addListener(hideStatePath, el);
                });
            },
            update: function(state, value) {
                info("hide updating");
            }
        }
    }

    // Handle forms
    const actionElAttr = prefix + prefixDivider + 'action';
    function handleForms(templateContents) {
        return {
            setup: function() {
                templateContents.querySelectorAll("form[" + actionElAttr + "]").forEach(function (actionEl) { 
                    info('handling forms');
                    var actionState = actionEl.getAttribute(actionElAttr);
                    var formActionParts = actionState.split(":");
                    var formActionType = formActionParts[0];
                    var formActionState = formActionParts[1];
                    var formActionStorePath = formActionParts[2];
                    actionEl.onsubmit = function(evt) {
                        evt.preventDefault();
                        var inputs = [].slice.call(actionEl.getElementsByTagName("input"));
                        inputs.forEach(function(inputEl) {
                            var inputAttribute = inputEl.getAttribute(elInputAttr);
                            var inputValue = inputEl.value;
                            if (typeof inputValue == "string" && inputValue.toLowerCase() == "true") { inputValue = true; }
                            if (typeof inputValue == "string" &&  inputValue.toLowerCase() == "false") { inputValue = false; }
                            setWith(store, inputAttribute, inputValue);
                        });
                        switch (formActionType) {
                            case "push":
                                var pushList = objectGet(store, formActionStorePath);                                        
                                var pushState = objectGet(store, formActionState);
                                pushList.push(pushState);
                                updateState(formActionStorePath, pushList);
                                break;
                            default:
                                break;
                        }      
                        info(store);
                        actionEl.reset();
                        return false;
                    };
                    info(actionEl)
                });
            },
            update: function(state, value) {
                info("forms updating");
            }
        }
    }

    // Add listener to the listeners tree
    function addListener(statePath, el) {
        var listeners = objectGet(treeListeners, statePath);
        if (listeners == false) {
            setWith(treeListeners, statePath, []);
        }
        listeners = objectGet(treeListeners, statePath);
        listeners.push(el);
    }

    // Logs out info messages to the console when verbosity is on.
    function info(message) {
        if (verbose) console.info(message);
    }

    // Assigns value to object based on properties as string
    function setWith(obj, prop, value) {
        if (typeof prop === "string") { prop = prop.split("."); }
        if (prop.length > 1) {
            var e = prop.shift();
            setWith(obj[e] = Object.prototype.toString.call(obj[e]) === "[object Object]" ? obj[e] : {}, prop, value);
        } else {
            obj[prop[0]] = value;
        }
    }

   // Gets value from object based on nested properties as string
    function objectGet(obj, prop) {
        if(typeof obj === 'undefined') { return false; }
        var _index = prop.indexOf('.')
        if(_index > -1) { return objectGet(obj[prop.substring(0, _index)], prop.substr(_index + 1)); }
        return obj[prop];
    }

    info('Starting Vortex :)');
    initRender();
})();
