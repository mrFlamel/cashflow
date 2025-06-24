
//Retrieve language
const urlParams = new URLSearchParams(window.location.search);
var language = urlParams.get('lang');
const supported_lang = ["en", "et"]
if (!supported_lang.includes(language)){
    language = "en";
}

//UI translations that are needed before ui.json is loaded
var translations = {
  "en": {
    "title": "Play CASHFLOW® Classic Here.",
    "loading": "Loading...",
    "name": "Name"
  },
  "et": {
    "title": "Mängi mängu CASHFLOW® Classic siin.",
    "loading": "Laadin...",
    "name": "Nimi"
  },
};

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll("[data-i18n-key]")
    .forEach(translateElement);
});
function translateElement(element) {
  const key = element.getAttribute("data-i18n-key");
  const translation = translations[language][key];
  element.innerText = translation;
}





/**
 * @constructor
 */

var EventDispatcher = (function () {

    var m_polos = {};

    function EventDispatcher() {
        "use strict";
        var _this = this;

        var m_listeners = [];

        this.on = function (type, callback, once) {
            if (!callback) {
                console.error("[EventDispatcher] unable to addEventListener, callback is null for event '" + type + "'");
                return;
            }
            callback = callback.bind(this);
            callback.once = (once === true);

            m_listeners[type] = m_listeners[type] || [];
            if (m_listeners[type].indexOf(callback) === -1) {
                m_listeners[type].push(callback);
            }
        };
        this.addEventListener = this.on;

        this.off = function (type, callback) {
            var list = m_listeners[type];
            if (!list) {
                return;
            }

            var i = list.indexOf(callback);
            if (i !== -1) {
                list.splice(i, 1);
            }
        };
        this.removeEventListener = this.on;

        this.offAll = function (type) {
            delete (m_listeners[type]);
        };
        this.removeAllListeners = this.offAll;

        this.emit = function (o) {
            var event = o.type || o
            var args = null;
            if (arguments.length > 1) {
                args = Array.prototype.splice.call(arguments, 1);
            }
            if (m_listeners[event]) {
                var callbacks = m_listeners[event].slice();
                for (var i = 0; i < callbacks.length; i++) {
                    callbacks[i].apply(null, args); // apply null because its been bound
                    
                    if (callbacks[i].once === true) {
                        var tempIndex = m_listeners[event].indexOf(callbacks[i]);
                        if (tempIndex > -1) {
                            m_listeners[event].splice(tempIndex, 1);
                            if (m_listeners[event].length === 0) { delete m_listeners[event]; }
                        }
                    }
                }
            }
        };
        this.dispatchEvent = this.emit;


        var m_memberPolos = {}; // TODO clean up polos

        this.polo = function (event, callback, once) {
            if (!callback) {
                console.error("[EventDispatcher] unable to add polo, callback is null for event '" + event + "'");
                return;
            }

            callback = callback.bind(this);
            callback.once = (once === true);

            // var dispatch = [this, callback, once];

            var eventCalls = m_polos[event];
            var localEventCalls = m_memberPolos[event];

            if (eventCalls) {
                if (eventCalls.indexOf(callback) === -1) {
                    eventCalls.push(callback);
                    if (localEventCalls) {
                        localEventCalls.push(callback);
                    } else {
                        m_memberPolos[event] = [callback];
                    }
                }
            } else {
                m_memberPolos[event] = m_polos[event] = [callback];
            }
        }
        this.listen = this.polo;

        this.marco = function (o) {
            var event = o.type || o;
            var args = null;
            if (arguments.length > 1) {
                args = Array.prototype.splice.call(arguments, 1);
            }

            if (m_polos[event]) {
                var callbacks = m_polos[event].slice();
                for (var i = 0; i < callbacks.length; i++) {
                    callbacks[i].apply(null, args);
                    // if (callbacks[i].once === true) {
                    //     callbacks.splice(i, 1);
                    //     if (callbacks.length === 0) { delete m_polos[event]; }
                    // }
                }
            } else {
                console.warn("unhandled marco", event);
            }

            // var localCallbacks = m_memberPolos[event];
            // if (localCallbacks) {
            //     for (var i = 0; i < callbacks.length; i++) {
            //         if (localCallbacks[i].once === true) {
            //             localCallbacks.splice(i, 1);
            //             if (localCallbacks.length === 0) { delete m_memberPolos[event]; }
            //         }
            //     }
            // }
        }
        this.shout = this.marco;

        this.removePolos = function () {


            var globalPolos = m_polos;
            var localPolos = m_memberPolos;

            Object.keys(localPolos).forEach(function (localPolo) {
                var globalCallbacks = globalPolos[localPolo];
                var localCallbacks = localPolos[localPolo];
                if (globalCallbacks && localCallbacks) {
                    var length = localCallbacks.length;
                    for (var i = 0; i < length; i++) {
                        var globalIndex = globalCallbacks.indexOf(localCallbacks[i]);
                        if (globalIndex > -1) {
                            globalCallbacks.splice(globalIndex, 1);
                            if (globalCallbacks.length === 0) delete m_polos[localPolo];
                        }
                        localCallbacks.splice(i, 1);
                        if (localCallbacks.length === 0) delete m_memberPolos[localPolo];
                    }
                }
            });
        }

    }

    return EventDispatcher;
})()
/* globals EventDispatcher */

/**
 * @param {Function} subType - thing
 * @param {Function} parentType - thing
 */
var inherit = function (subType, parentType) { };


/**
 * @class
 */
var CoreElement = (function () { //jshint ignore:line
    "use strict";

    var m_types = [];
    CoreElement.registerType = function (type) {
        var n = type.name;
        if (!m_types[n]) {
            m_types[n] = type;
        }
    };

    CoreElement.stype = function (s) {
        return m_types[s];
    };

    inherit = function (subType, parentType) {
        parentType = parentType || CoreElement;
        subType.prototype = Object.create(parentType.prototype);
        subType.prototype.constructor = subType;

        CoreElement.registerType(subType);
    };

    inherit(CoreElement, EventDispatcher);


    var _id = 0;
    function CoreElement() {
        var m_self = this;

        function stype(s) {
            return m_types[s];
        }

        EventDispatcher.call(this);

        var m_id = ++_id;
        this.getId = function () { return m_id; };
        Object.defineProperty(this, '_id', { get: this.getId });

        this.toString = function () {
            return "[" + this.constructor.name + "." + this._id + "]";
        };

        var m_creations = [];
        var m_creator = null;

        /**
         * @description constructs a T
         * @template T
         * @constructs {T}
         * @param {{new(): T}} t - the type to construct
         * @returns {T}
         */
        this.create = function (t) {
            if (t === null) {
                console.warn("attempting to create null type");
                return;
            }
            var type;
            if (typeof t === 'string') {
                type = stype(t);
            } else {
                type = t;
            }

            if (!type) {
                throw "[create] invalid type: " + t;
            }

            var o = new type();
            // if(o instanceof GameElement == false) {
            //     console.log("unable to spawn thing. it's not a thing");
            //     return;
            // }

            if (o instanceof CoreElement) {
                o.creator = m_self;
                o.callMethod('onCreate');
            }
            return o;
        };

        var m_released = false;
        this.release = function () {
            if (!m_released) {
                // m_released = true; // BEFORE??!
                this.callMethodOnCreations('release');
                this.callMethod('onRelease');
                this._cleanup();
                this.creator = null;
                m_released = true; // AFTER?!
                this.removeAllListeners();
                this.removePolos();
            }

        };

        this._cleanup = function () {

        };

        this.update = function () {

            this.callMethodOnCreations('update');
            this.callMethod('onUpdate');

        };

        this.callMethod = function (methodName) {
            // if (this.hasOwnProperty(methodName)) {
            if (this[methodName] !== undefined) {
                if (arguments.length > 1) {
                    this[methodName].apply(this, Array.prototype.splice.call(arguments, 1));
                } else {
                    // this[methodName].call(this);
                    this[methodName]();
                }
            }
        };

        this.callMethodOnCreations = function (methodName) {
            var args;
            if (arguments.length > 1) {
                args = Array.prototype.splice.call(arguments, 1);
            }

            var temp = m_creations.slice();
            var len = temp.length;
            for (var i = 0; i < len; i++) {
                // if (temp[i].hasOwnProperty(methodName)) {
                if (temp[i][methodName] !== undefined) {
                    if (args) {
                        temp[i][methodName].apply(temp[i], args);
                    } else {
                        // temp[i][methodName].call(this);
                        temp[i][methodName]();
                    }
                }
            }
        };


        this.addCreation = function (child) {
            m_creations.push(child);
        };

        this.removeCreation = function (child) {
            var i = m_creations.indexOf(child);
            if (i > -1) {
                m_creations.splice(i, 1);
            }
        };

        Object.defineProperty(this, "creations", {
            get: function () {
                return m_creations;
            }
        });

        Object.defineProperty(this, "creator", {
            get: function () {
                return m_creator;
            },
            set: function (value) {
                if (m_creator) {
                    m_creator.removeCreation(m_self);
                }
                m_creator = value;

                if (m_creator === null) {
                    return;
                }

                m_creator.addCreation(m_self);
            }
        });


        Object.defineProperty(this, "released", {
            get: function () {
                return m_released;
            }
        });

        // this.delay = function (ms, callback) { }; 
    }

    return CoreElement;
}());
var AssetLoader = (function () {
    inherit(AssetLoader, CoreElement);
    function AssetLoader() {
        CoreElement.call(this);

        /** @type AssetLoader */
        var m_this = this;

        var m_loadQueue = null;


        this.loadQueue = null;
        Object.defineProperties(Main, {
            loadQueue: { get: function () { return m_loadQueue; } }
        });

        this.onCreate = function () {

        }

        this.onRelease = function () {
        }
    }

    AssetLoader.prototype.publicFunction = function () {
    }

    return AssetLoader;
})();

function getManifest(basePath) {

    return {
        path: basePath,
        "manifest": [

            // data
            { "id": "uiVocab", "src": "assets/data/"+ language + "/ui.json", "type": "json" },
            { "id": "vocabEnUS", "src": "assets/data/"+ language + "/vocabulary.json", "type": "json" },
            { "id": "careers", "src": "assets/data/"+ language + "/careers.json", "type": "json" },
            { "id": "smallDeal", "src": "assets/data/"+ language + "/smalldeal.json", "type": "json" },
            { "id": "bigDeal", "src": "assets/data/"+ language + "/bigdeal.json", "type": "json" },
            { "id": "doodads", "src": "assets/data/"+ language + "/doodads.json", "type": "json" },
            { "id": "market", "src": "assets/data/"+ language + "/market.json", "type": "json" },
            { "id": "fastTrack", "src": "assets/data/"+ language + "/fasttrack.json", "type": "json" },

            // templates
            { "id": "cardTemplate", "src": "assets/data/"+ language + "/templates/card_template.json", "type": "json" },
            { "id": "dreamSelectorScreen", "src": "assets/data/"+ language + "/templates/dream_selector_screen.json", "type": "json" },
            { "id": "endGameWidget", "src": "assets/data/"+ language + "/templates/end_game_widget.json", "type": "json" },
            { "id": "gameScreen", "src": "assets/data/"+ language + "/templates/game_screen.json", "type": "json" },
            { "id": "lobbyScreen", "src": "assets/data/"+ language + "/templates/lobby_screen.json", "type": "json" },
            { "id": "modeSelectScreen", "src": "assets/data/"+ language + "/templates/mode_select_screen.json", "type": "json" },
            { "id": "partySetupScreen", "src": "assets/data/"+ language + "/templates/party_setup_screen.json", "type": "json" },
            { "id": "playerHeader", "src": "assets/data/"+ language + "/templates/player_header.json", "type": "json" },
            { "id": "splashScreen", "src": "assets/data/"+ language + "/templates/splash_screen.json", "type": "json" },
            { "id": "statementSheetTemplate", "src": "assets/data/"+ language + "/templates/statement_sheet_template.json", "type": "json" },
            { "id": "titleScreen", "src": "assets/data/"+ language + "/templates/title_screen.json", "type": "json" },


            // // spritesheets
            { "id": "titleImage", "src": "assets/img/loadingscreen.json", isSpritesheet: "true", "type": "json" },
            { "id": "dice", "src": "assets/img/dice.json", isSpritesheet: "true", "type": "json" },
            { "id": "board", "src": "assets/img/board.json", isSpritesheet: "true", "type": "json" },
            { "id": "background", "src": "assets/img/background_01.json", isSpritesheet: "true", "type": "json" },
            { "id": "statement", "src": "assets/img/statement.json", isSpritesheet: "true", "type": "json" },
            { "id": "ui", "src": "assets/img/ui.json", isSpritesheet: "true", "type": "json" },
            { "id": "fastTrackSheet", "src": "assets/img/fasttrack.json", isSpritesheet: "true", "type": "json" },
            { "id": "ui2", "src": "assets/img/ui2.json", "type": "json", isSpritesheet: "true"},
            { "id": "chat", "src": "assets/img/chat.json", "type": "json", isSpritesheet: "true"},

            // fonts
            { "id": "grantAvenue", "src": "assets/fonts/GrantAvenue-Regular.otf", "type": "font" },


            //sound
            { "id": "babyLand", "src": "assets/audio/baby_land.mp3", "type": "mp3" },
            { "id": "bidDealSmallDeal", "src": "assets/audio/bigdeal_smalldeal.mp3", "type": "mp3" },
            { "id": "botToOpen", "src": "assets/audio/bot_to_open.mp3", "type": "mp3" },
            { "id": "buttonPush", "src": "assets/audio/button_push.mp3", "type": "mp3" },
            { "id": "cashFlowDayLandv1", "src": "assets/audio/cashflow_day_land_v1.mp3", "type": "mp3" },
            { "id": "cashFlowDayLandv2", "src": "assets/audio/cashflow_day_land_v2.mp3", "type": "mp3" },
            { "id": "charityLand", "src": "assets/audio/charity_land.mp3", "type": "mp3" },
            { "id": "diceRoll", "src": "assets/audio/dice_roll.mp3", "type": "mp3" },
            { "id": "divorceLand", "src": "assets/audio/divorce_land.mp3", "type": "mp3" },
            { "id": "doodaLand", "src": "assets/audio/doodad_land.mp3", "type": "mp3" },
            { "id": "downsizedLand", "src": "assets/audio/downsized_land.mp3", "type": "mp3" },
            { "id": "financialStatementsIn", "src": "assets/audio/financial_statments_in.mp3", "type": "mp3" },
            { "id": "financialStatementsOut", "src": "assets/audio/financial_statments_out.mp3", "type": "mp3" },
            { "id": "humanToBot", "src": "assets/audio/human_to_bot.mp3", "type": "mp3" },
            { "id": "lawsuitLand", "src": "assets/audio/lawsuit_land.mp3", "type": "mp3" },
            { "id": "leaveRatRaceEnterFastTrack", "src": "assets/audio/leave_rat_race_enter_fast_track.mp3", "type": "mp3" },
            { "id": "marketLand", "src": "assets/audio/market_land.mp3", "type": "mp3" },
            { "id": "nextPlayer", "src": "assets/audio/next_player.mp3", "type": "mp3" },
            { "id": "online", "src": "assets/audio/online.mp3", "type": "mp3" },
            { "id": "openToHumanv1", "src": "assets/audio/open_to_human_v1.mp3", "type": "mp3" },
            { "id": "openToHumanv2", "src": "assets/audio/open_to_human_v2.mp3", "type": "mp3" },
            { "id": "passAndPlayer", "src": "assets/audio/pass_and_play.mp3", "type": "mp3" },
            { "id": "paydayLand", "src": "assets/audio/payday_land.mp3", "type": "mp3" },
            { "id": "pieceMovementv1", "src": "assets/audio/piece_movement_v1.mp3", "type": "mp3" },
            { "id": "pieceMovementv2", "src": "assets/audio/piece_movement_v2.mp3", "type": "mp3" },
            { "id": "pieceMovementv3", "src": "assets/audio/piece_movement_v3.mp3", "type": "mp3" },
            { "id": "pressToBegin", "src": "assets/audio/press_to_begin.mp3", "type": "mp3" },
            { "id": "taxAuditLand", "src": "assets/audio/tax_audit_land.mp3", "type": "mp3" },


        ]
    }
}
var ContainerElement = (function () {

    inherit(ContainerElement, CoreElement);

    function ContainerElement() {

        CoreElement.call(this);
        var m_self = this;
        var m_transform = new createjs.Container();

        Object.defineProperty(this, "transform", {
            get: function () { return m_transform; }
        });

        this.resize = function () {
            this.callMethod('onResize');
            this.callMethodOnCreations('resize');
        };



        var CoreElement_cleanup = this._cleanup;
        this._cleanup = function () {
            CoreElement_cleanup.call(this);
            this.detach();
        };

        var EventDispatcher_removeAllListeners = this.removeAllListeners;
        this.removeAllListeners = function () {
            EventDispatcher_removeAllListeners.call(this);
            this.transform.removeAllEventListeners();
        };
    }

    // ContainerElement.prototype.addTag = function() {
    //     if (arguments.length != 0) {
    //         for (var i = 0; i < arguments.length; i++) {
    //             var tag = arguments[i];
    //             if (typeof tag != 'string') continue;
    //             else if (!this.hasTag(tag)) this.tags.push(tag);
    //         }
    //     }
    // };

    // ContainerElement.prototype.removeTag = function() {
    //     if (arguments.length != 0) {
    //         for (var i = 0; i < arguments.length; i++) {
    //             var tag = arguments[i];
    //             if (typeof tag != 'string') continue;
    //             if (this.hasTag(tag)) {
    //                 var k = this.tags.indexOf(tag);
    //                 if (k > -1) {
    //                     this.tags.splice(k, 1);
    //                 }
    //             }
    //         }
    //     }
    // };

    // ContainerElement.prototype.hasTag = function() {
    //     if (arguments.length === 0) return false;
    //     for (var i = 0; i < arguments.length; i++) {
    //         var tag = arguments[i];
    //         if (typeof tag != 'string') continue;
    //         else if (this.tags.indexOf(tag) > -1) return true;
    //     }
    //     return false;
    // };


    ContainerElement.prototype.attach = function (parent, index) {
        if (index == null) {
            parent.transform.addChild(this.transform);
        } else {
            parent.transform.addChildAt(this.transform, index);
        }

        return this;
    };

    function _detach(transform) {
        if (transform.numChildren > 0) {
            transform.children.forEach(function (child) {
                child.removeAllEventListeners();
                _detach(child);
            }, this);
            transform.removeAllEventListeners();
            transform.removeAllChildren();
        }
    }

    ContainerElement.prototype.detach = function () {
        _detach(this.transform);
    };

    /** @param {createjs.DisplayObject} displayObject */
    ContainerElement.prototype.center = function (displayObject) {
        var bounds = displayObject.getBounds();
        displayObject.regX = bounds.width * 0.5;
        displayObject.regY = bounds.height * 0.5;
    }
    ContainerElement.prototype.fetchSprite = function (frame, attach, properties) {
        properties = properties || {};
        var sheetName = properties.sheet || "ui";
        var sprite = new createjs.Sprite(Main.loadQueue.getResult(sheetName));
        sprite.gotoAndStop(frame);
        if (properties) {
            var bounds = sprite.getBounds();
            if (properties.width || properties.height) {
                var usedScale = 1;
                var w = properties.width || bounds.width;
                var h = properties.height || bounds.height;
                var spriteScaleX = w / bounds.width;
                var spriteScaleY = h / bounds.height;
                if (spriteScaleX < spriteScaleY) {
                    //apply scalex
                    usedScale = spriteScaleX;
                }
                else {
                    //apply ScaleY
                    usedScale = spriteScaleY;
                }
                sprite.scaleX = 0.5; //usedScale;
                sprite.scaleY = 0.5; //usedScale;
            }
            if (properties.alpha != null) { sprite.alpha = properties.alpha; }
            if (properties.x != null) { sprite.x = properties.x; }
            if (properties.y != null) { sprite.y = properties.y; }

        }
        if (attach === true) this.transform.addChild(sprite);
        return sprite;
    }

    ContainerElement.prototype.tintSprite = function (sprite, color) {
        var convertedColor = Colors.convertToRGB(color);
        var bounds = sprite.getBounds();
        sprite.filters = [new createjs.ColorFilter(0, 0, 0, 1, convertedColor.r, convertedColor.g, convertedColor.b)];
        sprite.cache(bounds.x, bounds.y, bounds.width, bounds.height);
        sprite.updateCache();
    }

    return ContainerElement;
})();
var GroupElement = (function () {
    inherit(GroupElement, ContainerElement)

    function GroupElement() {
        ContainerElement.call(this)

        this.onCreate = function () {
        }
    }
    return GroupElement;
})()
var ScreenElement = (function () {

    inherit(ScreenElement, ContainerElement);

    var m_prototype = ScreenElement.prototype;
    var m_superPrototype = ContainerElement.prototype;
    /**
     * @class ScreenElement
     * @prop {number} width - This ScreenElement's width in pixels
     */
    function ScreenElement() {
        var m_self = this;
        ContainerElement.call(this);

        var m_canvas = Main.canvas;

        Object.defineProperty(this, "stageWidth", {
            get: function () { return m_canvas.width; }
        });
        Object.defineProperty(this, "stageHeight", {
            get: function () { return m_canvas.height; }
        });

        var m_rect = null;
        Object.defineProperty(this, "rect", {
            get: function () {
                if (!m_rect) {
                    m_rect = new createjs.Rectangle(0, 0, this.stageWidth, this.stageHeight);
                }
                return m_rect;
            }
        });

        /** @var {number} width - This ScreenElement's width in pixels */
        Object.defineProperty(this, "width", {
            // get: function() { console.warn("ScreenElement.width is Deprecated. please use ScreenElement.stageWidth instead."); return this.stageWidth }
            get: function () { return this.rect.width; },
            set: function (v) { this.rect.width = v; }
        });

        /** @prop {number} height - This ScreenElement's height in pixels */
        Object.defineProperty(this, "height", {
            // get: function () { console.warn("ScreenElement.height is Deprecated. please use ScreenElement.stageHeight instead."); return this.stageWidth; }
            get: function () { return this.rect.height; },
            set: function (v) { this.rect.height = v; }
        });
    }

    m_prototype.calcX = function (subunit, unit) {
        var percent = subunit / unit;
        return percent * this.stageWidth;
    };

    m_prototype.calcY = function (subunit, unit) {
        var percent = subunit / unit;
        return percent * this.stageHeight;
    };

    m_prototype.calcPosition = function (subunitX, unitX, subunitY, unitY) {
        return new createjs.Point(this.calcX(subunitX, unitX), this.calcY(subunitY, unitY));
    };

    return ScreenElement;
})();
var StageElement = (function() {

    inherit(StageElement, CoreElement);

    var m_transform = null;
    var m_canvas = null;

    function StageElement(id) {

        CoreElement.call(this);

        m_transform = new createjs.Stage(id);
        m_canvas = m_transform.canvas;

        Object.defineProperties(this, {
            transform: { get: function() { return m_transform; } },
            canvas: { get: function() { return m_canvas; } }
        });
    }

    return StageElement;
})();
var Types = (function() {

    function Types() {}

    Object.defineProperties(Types, {
        NUMBER: { value: "number", writable: false },
        UNDEFINED: { value: "undefined", writable: false },
        BOOLEAN: { value: "boolean", writable: false },
        OBJECT: { value: "object", writable: false },
        FUNCTION: { value: "function", writable: false },
        STRING: { value: "string", writable: false }
    })

    return Types;
})()
var DOMElement = (function () {

    inherit(DOMElement, CoreElement);

    function DOMElement() {
        CoreElement.call(this);

        var m_html = null;
        var m_transform = null;
        var m_uiLayer = document.getElementById("ui");

        this.tag = "";

        this.set = function (value, callback) {
            m_html = value;
            m_uiLayer.appendChild(m_html);
            m_html.hidden = true;
            m_transform = new createjs.DOMElement(m_html);
            callback(m_html);
            return this;
        };


        // this.makeRelative = function() {
        //     m_html.style.position = "relative";
        // }

        this.attach = function (parent, show) {
            var s = typeof show === Types.BOOLEAN ? show : true;
            if (parent instanceof DOMElement) {
                parent.html.appendChild(m_html);
            } else {
                parent.transform.addChild(m_transform);
            }
            setTimeout(function () { m_html.hidden = !s }, 1);
            return this;
        }

        this.detach = function (parent) {
            parent.transform.removeChild(this.transform);
            return this;
        }

        this.onRelease = function () {
            while (m_html.firstChild) {
                m_html.removeChild(m_html.firstChild);
            }
            this.parent.removeChild(m_html);
            if (this.removeFocus) window.removeEventListener("click", this.removeFocus);
            if (this.replaceWithNumbers) m_html.removeEventListener("input", this.replaceWithNumbers);
            if (this.preventPaste) m_html.removeEventListener("paste", this.preventPaste);
            if (this.listItemClicked) m_html.removeEventListener("click", this.listItemClicked);
            if (this.preventDefault) m_html.removeEventListener("submit", this.preventDefault)

            m_html = null;
            m_transform = null;
        }

        this.adjust = function (callback) {
            callback(m_html);
            return this;
        }

        this.removeFocus = null;
        this.preventPaste = null;
        this.replaceWithNumbers = null;


        Object.defineProperties(this, {
            html: { get: function () { return m_html; } },
            transform: { get: function () { return m_transform; } },
            parent: { get: function () { return m_html.parentElement } }
        });
    }

    return DOMElement;
})();
var ItemGroup = (function () {

    inherit(ItemGroup, DOMElement)

    function ItemGroup() {

        DOMElement.call(this);

        var m_items = [];

        this.set(document.createElement("div"), function (element) {
            element.className = "group";
            element.style.position = "relative";
        });

        this.getItemByTag = function (tag, index) {
            var i = index || 0;
            var t = tag || "";

            return m_items.filter(function (element) {
                return element.tag === t;
            })[i];
        }

        this.addItem = function (type) {
            var item = this.create(ListItem);
            item.type = type;
            m_items.push(item);
            item.attach(this);
            return item;
        }

        this.removeItem = function (tag, index) {
            var item = this.getItemByTag(tag, index);
            item.release();
            // remove(this, item);
        }

        // function remove(parent, child) {
        //     parent.html.removeChild(child.html);
        // }

        this.onRelease = function () {
            m_items.forEach(function (item) {
                this.removeItem(item.tag);
            }, this);

            m_items = null;
        }

        Object.defineProperties(this, {
            items: { get: function () { return m_items; } }
        })
    }

    return ItemGroup;
})()
var ListItem = (function() {
	inherit(ListItem, DOMElement);

	var prototype = ListItem.prototype;

	function ListItem() {
		DOMElement.call(this);
		var m_type = "";
		var m_this = this;
		var topHeader = "top-header";
		var header = "header";
		var def = "default";
		var liability = "liability";
		var lobby = "lobby";
		var m_leftText = null;
		var m_rightText = null;
		var m_tag = "";
		var m_index = -1;

		this.setRoomData = null;

		Object.defineProperties(this, {
			type: {
				get: function() {
					return m_type;
				},
				set: function(value) {
					m_type = value;
					this.set(document.createElement("div"), function(element) {
						m_type = value;
						element.className = "item";
						element.style.position = "relative";

						if (m_type != lobby) {
							var classes = ["left", "center-left", "center-right", "right"];
							var columns = [];

							var LEFT = 0;
							var CENTER_LEFT = 1;
							var CENTER_RIGHT = 2;
							var RIGHT = 3;

							switch (m_type) {
								case topHeader:
									columns = [CENTER_LEFT, CENTER_RIGHT, RIGHT];
									break;
								case header:
									columns = [CENTER_LEFT, CENTER_RIGHT, RIGHT];
									break;
								case def:
									columns = [CENTER_LEFT, RIGHT];
									break;
								case liability:
									columns = [CENTER_LEFT, RIGHT];
									// var checkbox = document.createElement("input");

									// m_this.html.appendChild()
									break;
							}

							element.className = "item";
							element.style.position = "relative";

							var type = " " + m_type;
							columns.forEach(function(column) {
								classes[column] += type;
							});

							classes.forEach(function(c) {
								var column = document.createElement("div");
								column.className = "column " + c;
								m_this.html.appendChild(column);
								if (c === classes[CENTER_LEFT]) m_leftText = column;
								else if (c === classes[RIGHT]) m_rightText = column;
							});
						}
					});
				}
			},
			leftText: {
				get: function() {
					return m_leftText.innerText;
				},
				set: function(value) {
					m_leftText.innerText = value;
				}
			},
			rightText: {
				get: function() {
					return m_rightText.innerText;
				},
				set: function(value) {
					m_rightText.innerText = value;
				}
			},
			setText: {
				value: text,
				writable: false
			},
			setTag: {
				value: tag,
				writable: false
			},
			tag: {
				get: function() {
					return m_tag;
				}
			},
			index: {
				get: function() {
					return m_index;
				},
				set: function(value) {
					m_index = value;
				}
			}
		});

		function text(left, right, isMoney) {
			m_this.leftText = left;
			m_this.rightText = isMoney
				? translations[language]["currency2"] + right.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + translations[language]["currency"]
				: right;
			return this;
		}

		function tag(tag) {
			m_tag = tag;
			return this;
		}
	}

	Object.defineProperties(ListItem, {
		TOP_HEADER: {
			value: "top-header",
			writable: false
		},
		HEADER: {
			value: "header",
			writable: false
		},
		DEFAULT: {
			value: "default",
			writable: false
		},
		LIABILITY: {
			value: "liability",
			writable: false
		},
		LOBBY: {
			value: "lobby",
			writable: false
		}
	});

	return ListItem;
})();

var StatementList = (function () {

    inherit(StatementList, DOMElement)

    function StatementList() {

        var m_items = [];
        var m_groups = [];

        DOMElement.call(this);

        this.onCreate = function () {
            this.set(document.createElement("div"), function (element) {
                element.className = "list";
            });
        }

        this.addItem = function (type, tag) {
            var item = this.create(ListItem);
            item.type = type;
            item.tag = tag;
            m_items.push(item);
            item.attach(this);
            // this.html.appendChild(item.html);
            return item;
        }

        this.addGroup = function (tag) {
            var group = this.create(ItemGroup);
            group.tag = tag;
            m_groups.push(group);
            group.attach(this);
            return group;
        }

        this.getItemByTag = function (tag, index) {
            return getByTag(m_items, tag, index);
        }

        this.getGroupByTag = function (tag, index) {
            return getByTag(m_groups, tag, index);
        }

        this.getItemFromGroup = function (group, tag, index) {
            return group.getItemByTag(tag, index);
        }

        this.removeItem = function (tag, index) {
            var item = this.getItemByTag(tag, index);
            item.release();
            //remove(this, item);
        }

        this.removeItemFromGroup = function (groupTag, tag, index) {
            var group = this.getGroupByTag(groupTag);
            var item = this.getItemFromGroup(group, tag, index);
            item.release();
            remove(group, item);
        }

        this.removeGroup = function (tag, index) {
            var group = this.getGroupByTag(tag, index);
            group.release();
            //remove(this, group);
        }

        function remove(parent, child) {
            parent.html.removeChild(child.html);
        }

        function getByTag(collection, tag, index) {
            var i = index || 0;
            var t = tag || "";

            return collection.filter(function (element) {
                // console.log(element)
                return element.tag === t;
            })[i];
        }

        Object.defineProperties(this, {
            items: { get: function () { return m_items; } },
            groups: { get: function () { return m_items; } }
        });

    }


    return StatementList;
})()
/** 
 * @prop {BoardElement} instance - singleton
*/
var BoardElement = (function () {

    inherit(BoardElement, ContainerElement);

    /** 
     * @prop {Array} fastTrack - list of fasttrack objects pulled from the 'game_screen' template
    */
    function BoardElement() {
        ContainerElement.call(this);

        /** @type {createjs.Sprite} */
        var m_board = null;

        /** @type {BoardTile[]} */
        this.ratRace = [];

        /** @type {BoardTile[]} */
        this.fastTrack = [];

        /** @type {BoardData} */
        var m_boardData = null;

        Object.defineProperties(this, {
            boardData: { get: function () { return m_boardData; } },
            fastTrack: { get: function () { return m_boardData.fastTrack; } },
            ratRace: { get: function () { return m_boardData.ratRace; } },
            board: { get: function () { return m_board; } }
        });

        this.onCreate = function () {
            m_instance = this;

            m_boardData = new BoardData();

            m_board = new createjs.Sprite(Main.loadQueue.getResult("board"));
            this.transform.addChild(m_board);
        }
    }

    /** @type {BoardElement} */
    var m_instance = null;

    /** @type {BoardElement} */
    BoardElement.instance = null;
    Object.defineProperties(BoardElement, {
        instance: { get: function () { return m_instance; } }
    })


    return BoardElement;
})()
var ButtonElement = (function () {

    inherit(ButtonElement, ContainerElement)

    function ButtonElement() {

        ContainerElement.call(this);

        var m_template = TemplateParser.parseTemplate("cardTemplate");

        /** @type {createjs.Sprite} */
        var m_backplate = null;

        /** @type {createjs.Text} */
        var m_text = null;

        /** @type {template Name} */
        var m_subtemplate = null;

        this.onCreate = function () {

        };


        // Object.defineProperty(this, "setSubTemplate", {
        //     set: function (value) {
        //         m_subtemplate = value;
        //     }
        // })

        this.setup = function (spriteName, spriteTemplate, text, textColor, textTemplate, subtemplate) {
            subtemplate = subtemplate || "cardTemplate";
            spriteName = spriteName || "popup_btn_bk2";
            //console.log(spriteTemplate)
            spriteTemplate = spriteTemplate || m_template.buyBtn;
            text = text || "Button";
            // textColor = textColor || null; // the templateparser will handle this...
            textTemplate = textTemplate || "buyText";

            m_backplate = new createjs.Sprite(Main.loadQueue.getResult("ui"));
            // var templateData = m_template.buyBtn;
            m_backplate.gotoAndStop(spriteName);
            m_backplate.scaleX = spriteTemplate.width / m_backplate.getBounds().width;
            m_backplate.scaleY = spriteTemplate.height / m_backplate.getBounds().height;
            // m_backplate.x = spriteTemplate.x;
            // m_backplate.y = spriteTemplate.y;
            this.transform.addChild(m_backplate);

            // var templateData = m_template.buyText;
            m_text = TemplateParser.formatTextFromTemplate(subtemplate, textTemplate, textColor);
            m_text.text = text;
            // m_text.color = textColor;

            m_text.x -= spriteTemplate.x;
            m_text.y -= spriteTemplate.y;
            // m_text.x = (m_backplate.getBounds().width / 4);
            // m_text.y = (m_backplate.getBounds().height / 8);
            this.transform.addChild(m_text);
        };


        Object.defineProperties(this, {
            backplate: { get: function () { return m_backplate; } },
            text: {
                get: function () { return m_text; },
                set: function (value) { m_text.text = value; }
            },
            textColor: {
                set: function (c) { m_text.color = c; }
            }
        })

    }

    return ButtonElement;
})()
var CardConfig = (function () {

    function CardConfig(o) {
        var m_this = this;

        this.everyoneButtons = false;

        this.buyButton = null;
        this.passButton = null;
        this.sellButton = null;

        this.borrowButton = null;
        this.repayButton = null;

        this.cardDropDown = null;
        this.card = null;
        // this.queueTop = null;


        this.cardTitle = null;
        this.cardDescription = null;
        this.cardInformation = null;
        this.cardSymbol = null;

        this.buySharesTitle = null;
        this.buySharesAmount = null;
        this.borrowAmount = null;

        this.stockCostAmount = null;
        this.stockCostTitle = null;

        this.upbtn = null;
        this.uparw = null;
        this.downbtn = null;
        this.downarw = null;

        this.rightButton = null;
        this.leftButton = null;
        this.leftArrow = null;
        this.rightArrow = null;

        if (o == null) return;
        Object.keys(o).forEach(function (key) {
            m_this[key] = o[key];
        })
    }

    CardConfig.prototype.shouldHaveDropDown = function () {
        return Boolean(this.buyButton || this.passButton || this.sellButton || this.cardDropDown);
    }
    return CardConfig;
})();

var CardElement = (function () {

    inherit(CardElement, ContainerElement);

    var s_template = null;
    var m_template = "cardTemplate";
    Object.defineProperty(CardElement, "makeButton", {
        value: createButton
    })

    CardElement.showCard = function (creator, cardType, cardData) {
        // var creator = Main.screen;
        console.log("creating card", cardType, "\nwith data:", cardData);
        var cardElement = creator.create(cardType);
        cardElement.setup(cardData);
        cardElement.transform.x = 656;
        cardElement.transform.y = 98;
        cardElement.attach(creator);
        return cardElement;
    }

    function getTemplate() {
        s_template = s_template || TemplateParser.parseTemplate(m_template);
        return s_template;
    }

    function CardElement() {
        var m_this = this;

        ContainerElement.call(this);

        this.onCreate = function () { }

        var isStartTurnCard = Main.gameSession.turnState.id === "StartTurnCard";
        var isEndCard = Main.gameSession.turnState.id === "EndCard";
        var isDreamSelectCard = Main.gameSession.turnState.id === "DreamSelectCard";
        // console.log("is start turn card ", isStartTurnCard)
        // console.log("is end card ", isEndCard)
        // console.log("is dream select ", isDreamSelectCard)

        if (Main.gameSession.isMyTurn) {
            if (!isStartTurnCard && !isEndCard && !isDreamSelectCard) {
                this.marco("onStatementSheetOpen")
            } else {
                this.marco("onStatementSheetClose")
            }
        }

        /**
         * @param {CardConfig} config 
         */
        this.configure = function (config) {
            if (!(config instanceof CardConfig)) { config = new CardConfig(config); }

            var template = getTemplate();

            var isMyTurn = Main.gameSession.isMyTurn;

            // if(!isMyTurn)

            // TODO: check whether local player turn and just hide/show the buttons
            //@dillon should these all be this. instead of m_ or only if we need to use them elsewhere? like the buttons?
            //if that is the case we can get rid of a bunch of the this' at the top

            /*
            _Queue Displaying_
            if is my turn... show the card
            if my turn and card was QUEUED, show the header
            if not my turn and card is QUEUE-ABLE, show the header AND footer
            */

            var isCardRemoteQueue = false;
            var isCardLocalQueue = false;
            if (Main.gameSession.getCurrentPlayerBlob().inQueue) {

            }

            if (Main.gameSession.cardData && Main.gameSession.cardData.queued == true) {
                isCardRemoteQueue = true;
            }

            if (config.shouldHaveDropDown()) {
                if (isMyTurn || config.everyoneButtons === true) {
                    var m_cardDropdown = this.fetchSprite("card_btn_back_full", true, {
                        width: template.cardDropDown.width,
                        height: template.cardDropDown.height,
                        alpha: .9,
                        x: template.cardDropDown.x,
                        y: template.cardDropDown.y
                    });
                    this.tintSprite(m_cardDropdown, config.cardDropDown.color);
                }

                if (!isMyTurn && isCardRemoteQueue) {
                    // show dropbdown text
                }
            }

            // if (Main.gameSession.getCurrentPlayerBlob().inQueue) {
            if (isCardRemoteQueue) {
                var m_topQueue = this.fetchSprite("card_btn_back_full", true, {
                    width: template.cardDropDown.width,
                    height: template.cardDropDown.height,
                    alpha: .9,
                    x: template.cardDropDown.x,
                    y: template.cardDropDown.y - 145
                });
                // this.tintSprite(m_topQueue, config.queueTop.color);
                this.tintSprite(m_topQueue, Colors.getCurrentPlayerColor());


                /* scene.createStarlingTextNode("queueTopText").fromTemplateAs("sellText");
                scene.queueTopText.text = Vocab.copy("sharedOpp", "copy")
                scene.queueTopText.color = Color.WHITE;
                scene.queueTopText.y = scene.queueTop.y;
                scene.queueTopText.width = 250;
                scene.queueTopText.y += 18;
                scene.queueTopText.x -= 70; */

                var m_topQueueText = createText(m_this, Data.getVocab("sharedOpp", "copy"), Colors.WHITE, "sellText");
                m_topQueueText.lineWidth = 250;
                m_topQueueText.maxWidth = 250;
                // m_topQueueText.x -= 80;
                m_topQueueText.y = m_topQueue.y + 18;
            }

            if (config.card) {
                var m_card = this.fetchSprite("popup_bk", true, {
                    width: template.card.width,
                    height: template.card.height,
                    x: template.card.x,
                    y: template.card.y
                });
            }


            if (config.cardTitle) {
                this.cardTitle = createText(m_this, config.cardTitle.text, config.cardTitle.color, "cardTitle");
            }
            if (config.cardDescription) {
                this.cardDescription = createText(m_this, config.cardDescription.text, config.cardDescription.color, "cardDescription");
            }
            if (config.cardInformation && isMyTurn) {
                this.cardInformation = createText(m_this, config.cardInformation.text, config.cardInformation.color, "cardInformation");
            }

            if (config.cardSymbol) {
                this.cardSymbol = this.fetchSprite(config.cardSymbol.sprite, true, {
                    width: template.cardSymbol.width,
                    height: template.cardSymbol.height,
                    x: template.cardSymbol.x,
                    y: template.cardSymbol.y,
                    sheet: config.cardSymbol.sheet
                });
                this.tintSprite(this.cardSymbol, config.cardSymbol.color);
            }

            if (isMyTurn == false && config.everyoneButtons != true) {
                return;
            }

            if (config.upbtn) {
                this.upbtn = this.fetchSprite('popbtn_smgld_nrm', true, {
                    width: template.upbtn.width,
                    height: template.upbtn.height,
                    x: template.upbtn.x,
                    y: template.upbtn.y
                });
                var m_uparw = this.fetchSprite('play_whiteUP', true, {
                    width: template.uparw.width,
                    height: template.uparw.height,
                    x: template.uparw.x,
                    y: template.uparw.y
                });
                m_uparw.alpha = .8;
                m_uparw.scaleX = m_uparw.scaleY *= .8;
            }

            if (config.downbtn) {
                this.downbtn = this.fetchSprite('popbtn_smgld_nrm', true, {
                    width: template.downbtn.width,
                    height: template.downbtn.height,
                    x: template.downbtn.x,
                    y: template.downbtn.y
                });
                var m_downarw = this.fetchSprite('play_whiteUP', true, {
                    width: template.downarw.width,
                    height: template.downarw.height,
                    x: template.downarw.x,
                    y: template.downarw.y,
                });
                m_downarw.alpha = .8;
                m_downarw.scaleX = m_downarw.scaleY *= .8;
                //TODO: @dillon make this better?
                m_downarw.regX = m_downarw.getBounds().width / 2;
                m_downarw.regY = m_downarw.getBounds().height / 2;
                m_downarw.scaleY = m_downarw.scaleY * -1;
                m_downarw.x += ((m_downarw.getBounds().width / 2) * Math.abs(m_downarw.scaleX));
                m_downarw.y += ((m_downarw.getBounds().height / 2) * Math.abs(m_downarw.scaleY));
            }

            if (config.leftButton) {
                this.leftButton = this.fetchSprite('popbtn_smgld_nrm', true, {
                    width: template.leftButton.width,
                    height: template.leftButton.height,
                    x: template.leftButton.x,
                    y: template.leftButton.y
                });
                var m_leftArrow = this.fetchSprite('play_white', true, {
                    width: template.leftArrow.width,
                    height: template.leftArrow.height,
                    x: template.leftArrow.x,
                    y: template.leftArrow.y,
                });
                m_leftArrow.alpha = .8;
                m_leftArrow.scaleX = m_leftArrow.scaleY *= .8;

                m_leftArrow.regX = m_leftArrow.getBounds().width / 2;
                m_leftArrow.regY = m_leftArrow.getBounds().height / 2;
                m_leftArrow.scaleX = m_leftArrow.scaleX * -1;
                m_leftArrow.x += ((m_leftArrow.getBounds().width / 2) * Math.abs(m_leftArrow.scaleX));
                m_leftArrow.y += ((m_leftArrow.getBounds().height / 2) * Math.abs(m_leftArrow.scaleY));
            }

            if (config.rightButton) {
                this.rightButton = this.fetchSprite('popbtn_smgld_nrm', true, {
                    width: template.rightButton.width,
                    height: template.rightButton.height,
                    x: template.rightButton.x,
                    y: template.rightButton.y
                });
                var m_rightArrow = this.fetchSprite('play_white', true, {
                    width: template.rightArrow.width,
                    height: template.rightArrow.height,
                    x: template.rightArrow.x,
                    y: template.rightArrow.y,
                });
                m_rightArrow.alpha = .8;
                m_rightArrow.scaleX = m_rightArrow.scaleY *= .8;

                m_rightArrow.regX = m_rightArrow.getBounds().width / 2;
                m_rightArrow.regY = m_rightArrow.getBounds().height / 2;
                m_rightArrow.x += ((m_rightArrow.getBounds().width / 2) * Math.abs(m_rightArrow.scaleX));
                m_rightArrow.y += ((m_rightArrow.getBounds().height / 2) * Math.abs(m_rightArrow.scaleY));
            }


            // building the 'dropdown' buttons
            if (config.buyButton) {
                this.buyButton = createButton(this, "popup_btn_bk2", template.buyBtn, config.buyButton.text, config.buyButton.color, "buyText");
            }
            if (config.sellButton) {
                this.sellButton = createButton(this, "popup_btn_bk2", template.sellBtn, config.sellButton.text, config.sellButton.color, "sellText");
            }
            if (config.passButton) {
                this.passButton = createButton(this, "popup_btn_bk2", template.passBtn, config.passButton.text, config.passButton.color, "passText");
            }

            if (config.repayButton) {
                this.repayButton = createButton(this, "bank_gld_btn_nrm", template.repay /* Btn */, config.repayButton.text, config.repayButton.color, "repayText");
            }

            if (config.borrowButton) {
                this.borrowButton = createButton(this, "bank_gld_btn_nrm", template.borrow /* Btn */, config.borrowButton.text, config.borrowButton.color, "borrowText");
            }



            if (config.borrowAmount) {
                this.borrowAmount = createTextbox(m_this, config.borrowAmount.text, "borrowAmount", function (element) {
                    element.id = "borrowAmount";
                });
                //@dillon this is really bad hah
                this.borrowAmount.transform.x += 14;
            }

            if (config.stockCostTitle) {
                this.stockCostTitle = createText(m_this, config.stockCostTitle.text, config.stockCostTitle.color, "stockCostTitle");
                //TODO: Move this in a better way
                this.stockCostTitle.x += 55;
            }

            if (config.stockCostAmount) {
                this.stockCostAmount = createText(m_this, config.stockCostAmount.text, config.stockCostAmount.color, "stockCostAmount");
                //TODO: Move this in a better way
                this.stockCostAmount.x += 55;
            }

            if (config.buySharesTitle) {
                this.buySharesTitle = createText(m_this, config.buySharesTitle.text, config.buySharesTitle.color, "buySharesTitle");
            }

            if (config.buySharesAmount) {
                this.buySharesAmount = createTextbox(m_this, config.buySharesAmount.text, "buySharesAmount", function (element) { element.id = "buySharesAmount" });
            }


            this.optimizeLayout();

            //things that get color shifted
            //cardSymbol 
            //cardDropDown 
            //buyText 
            //passText 
            //sellText 
            //cardTitle

            // TODO:  @dillon we probably need a optimizeLayout() function like in cardwidget of old game
            // m_cardTitle.y = m_cardSymbol.y + m_cardSymbol.height + 15;
            // m_cardDescription.y = m_cardTitle.y + m_cardTitle.textHeight + 10;
            // m_cardInformation.y = m_cardDescription.y + m_cardDescription.textHeight + 10;
            // if (m_cardDescription.text == "")
            //     m_cardInformation.y -= 10;
        }

        this.optimizeLayout = function () {
            var height = 0;
            if (this.cardSymbol) {
                // var symbolHeight = (this.cardSymbol.bitmapCache || this.cardSymbol.getBounds()).height * this.cardSymbol.scaleY;
                // if(symbolHeight > CardElement.maxSymbolHeight) {
                //     CardElement.maxSymbolHeight = symbolHeight;
                //     console.log("new tallest symbol:", CardElement.maxSymbolHeight);
                // }

                var symbolHeight = 80;

                height = this.cardSymbol.y + symbolHeight + 15;
            }

            if (this.cardTitle) {
                this.cardTitle.y = height;
                height += this.cardTitle.getMeasuredHeight() + 10;
            }

            if (this.cardDescription) {
                this.cardDescription.y = height;
                height += this.cardDescription.getMeasuredHeight() + 10;
            }
            if (this.cardInformation) {
                this.cardInformation.y = height;
                height += this.cardInformation.getMeasuredHeight() + 10;
            }
        }

    }
    CardElement.maxSymbolHeight = -1;

    function createButton(self, spriteName, spriteTemplate, text, textColor, textTemplate) {
        var button = self.create(ButtonElement);
        button.setup(spriteName, spriteTemplate, text, textColor, textTemplate);

        var bounds = button.backplate.getBounds();
        button.transform.x = spriteTemplate.x;
        button.transform.y = spriteTemplate.y;
        button.scaleX = spriteTemplate.width / bounds.width;
        button.scaleY = spriteTemplate.height / bounds.height;

        button.attach(self);
        return button;
    }

    function createText(self, text, color, subTemplateName, callback) {
        /**
         * @type {createjs.Text}
         */
        var textObject = TemplateParser.formatTextFromTemplate(m_template, subTemplateName);
        if (color) {
            textObject.color = color;
        }
        textObject.text = text;
        self.transform.addChild(textObject);

        return textObject;
    }

    function createTextbox(self, initialText, subTemplateName, onSet) {
        var template = getTemplate()[subTemplateName];
        var textbox = self.create(DOMElement).set(document.createElement("input"), onSet);
        textbox.html.type = "number";

        textbox.preventPaste = function (event) { event.preventDefault(); }
        textbox.preventDefault = function (event) { event.preventDefault(); }

        textbox.html.value = initialText;
        textbox.html.pattern = "[0-9]*";

        textbox.removeFocus = function (event) {
            if (event.target != textbox.html) {
                textbox.html.blur();
                var number = parseInt(textbox.html.value);
                if (number < self.min) textbox.html.value = self.min;
                else if (number > self.max) textbox.html.value = self.max;
            }
        }

        textbox.replaceWithNumbers = function (event) {
            textbox.html.value = textbox.html.value.replace('[^0-9]', "");
            self.marco("updateAmount");
        }

        textbox.html.addEventListener("input", textbox.replaceWithNumbers);
        textbox.html.addEventListener("paste", textbox.preventPaste);
        textbox.html.addEventListener("submit", textbox.preventDefault);
        window.addEventListener("click", textbox.removeFocus);

        var transform = textbox.transform;

        transform.x = template.x;
        transform.y = template.y - (31.3 / 4);

        textbox.attach(self);
        return textbox;
    }
    return CardElement;
})();
var ChatLogElement = (function () {
	inherit(ChatLogElement, ContainerElement);

	function ChatLogElement() {
		ContainerElement.call(this);

		this.onCreate = function () {
			createLog.call(this);
			this.polo("onLogAction", onLogAction);
			Main.gameSession.roomRef.child("chatlog").once("value", function (snap) { });
		};

		function createLog() {
			var log = this.create(DOMElement);
			log.set(document.createElement("div"), function (element) {
				element.className = "chatlog";
			});
			log.attach(this);
		}
	}

	function onLogAction(log) {
		console.log("log: ", log);
	}

	return ChatLogElement;
})();

var PlayerDreamPieceElement = (function () {
	inherit(PlayerDreamPieceElement, ContainerElement);

	var templateID = "gameScreen";
	var fastTrackDreamTiles = [];

	function PlayerDreamPieceElement() {
		var m_template = TemplateParser.parseTemplate(templateID).boardPiece;
		ContainerElement.call(this);
		var m_this = this;
		var m_number = 0;
		/** @type {createjs.Sprite} */
		var m_sprite = null;

		this.onCreate = function () {
			fastTrackDreamTiles = BoardElement.instance.fastTrack.filter(function (tile) {
				return tile.type === "ft_dream";
			});

			// BoardData.getInstance().
		};

		this.setNumber = function (number) {
			cleanup();
			m_number = number;

			m_sprite = this.fetchSprite("cheese_" + Colors.ARRAYSTRING[number], true, {
				width: m_template.width,
				height: m_template.height
			});

			console.log("dreamtoken", m_number, "number set");
			m_dreamIdRef = Main.gameSession.getPlayerRefByIndex(m_number).child("dreamId");
			m_dreamIdRef.on("value", onDreamSelectUpdated);
		};

		var m_dreamIdRef = null;

		function cleanup() {
			if (m_sprite) {
				m_this.transform.removeChild(m_sprite);
				// m_sprite.parent.removeChild(m_sprite);
			}
			m_sprite = null;

			if (m_dreamIdRef) {
				m_dreamIdRef.off("value", onDreamSelectUpdated);
			}
			m_dreamIdRef = null;
		}

		this.onRelease = function () {
			cleanup();

			m_number = null;
			m_this = null;
		}

		function onDreamSelectUpdated(id) {
			var dreamId = id.val();
			console.log("dreamtoken", m_number, "id updated", dreamId);

			if (dreamId < 0) {
				dreamId = 0;
			}
			if (dreamId >= fastTrackDreamTiles.length) {
				dreamId = 0;
			}

			var tile = fastTrackDreamTiles[dreamId];
			var tilePosition = tile.position;
			console.log("dreamtoken", m_number, "id updated, tile: ", tile);
			var bounds = m_this.transform.getBounds();

			if (bounds != null) {
				var newX = tilePosition.x - bounds.width / 2;
				var newY = tilePosition.y - bounds.height / 2;
				m_this.transform.x = newX;
				m_this.transform.y = newY;
			}
			//self.marco("onLocalDreamArrivedAtSpace", tile);
		}
	}

	return PlayerDreamPieceElement;
})();

var PlayerGamePieceElement = (function () {
	inherit(PlayerGamePieceElement, ContainerElement);

	function PlayerGamePieceElement() {
		ContainerElement.call(this);

		/** @type {PlayerGamePieceElement} */
		var m_this = this;
		/** @type {createjs.Sprite} */
		var m_token = null;

		var m_colorName = "";

		var m_number = 0;
		var m_color = "";

		var m_position = -1;
		var m_lastPosition = -1;

		/** @type {firebase.database.Reference} */
		var m_playerRef = null;

		var m_isFastTrack = false;

		// this.index = 0;

		this.number = 0;
		this.color = "";
		this.colorName = "";

		this.polo("onShowPayday", onShowPayday);

		Object.defineProperties(this, {
			number: {
				get: function () {
					return m_number;
				}
			},
			color: {
				get: function () {
					return m_color;
				}
			},
			colorName: {
				get: function () {
					return m_colorName;
				}
			}
		});

		this.onRelease = function () {
			if (m_playerRef) {
				m_playerRef.child("fastTrack").off("value", onPlayerFastTrackUpdated);
				m_playerRef.child("position").off("value", onPlayerPositionUpdated);
			}
			m_playerRef = null;
		};

		this.setNumber = function (number) {
			m_number = number;
			m_color = Colors.getPlayerColor(m_number);

			m_this.setToken(Colors.ARRAYSTRING[m_number]);

			m_playerRef = Main.gameSession.getPlayerRefByIndex(m_number);
			m_playerRef.child("fastTrack").on("value", onPlayerFastTrackUpdated);
			m_playerRef.child("position").on("value", onPlayerPositionUpdated);
		};

		this.setToken = function (value) {
			m_colorName = value;
			if (!m_token) {
				m_token = this.fetchSprite("plyrActive_" + value, true);
				this.center(m_token);
				m_token.scaleX = 0.5;
				m_token.scaleY = 0.5;
			} else {
				m_token.gotoAndStop("plyrActive_" + value);
			}
		};

		function onShowPayday(paydayAmount) {
			if (
				Main.gameSession.isMyTurn === true &&
				m_number === Main.gameSession.playerData.index
			) {
				// console.log("Is it my turn? ", Main.gameSession.isMyTurn);
				var text = new createjs.Text(
					"$" + paydayAmount.toString(),
					"20px Arial",
					Colors.WHITE
				);
				text.x = this.transform.x;
				text.y = this.transform.y;

				var container = GameScreen.instance.transform;

				container.addChild(text);

				createjs.Tween.get(text)
					.to(
						{
							alpha: 0,
							y: text.y - 20
						},
						2000,
						createjs.Ease.quintInOut
					)
					.call(function () {
						container.removeChild(text);
						text = null;
					});
			}
		}

		function onPlayerFastTrackUpdated(snap) {
			m_isFastTrack = snap.val();
		}

		function onPlayerPositionUpdated(snap) {
			setTimeout(function () {
				m_lastPosition = m_position;

				var tileIndex = snap.val();

				if (tileIndex == null) {
					return;
				}
				if (BoardElement.instance) {
					/** @type {BoardTile} */
					var tile = null;
					if (m_isFastTrack) {
						tile = BoardElement.instance.fastTrack[tileIndex];
					} else {
						tile = BoardElement.instance.ratRace[tileIndex];
					}
					var tilePosition = tile.position;
					var newX =
						tilePosition.x + 4 * 2 * Math.sin(60 * m_number * (Math.PI / 180));
					var newY =
						tilePosition.y + 4 * 2 * Math.sin(60 * m_number * (Math.PI / 180));
					// m_this.emit({ type: "onPositionChanged", x: newX, y: newY })

					createjs.Tween.get(m_this.transform)
						.to(
							{
								x: newX,
								y: newY
							},
							500,
							createjs.Ease.circInOut
						)
						.call(function () {
							console.log("arrived", tile);
							setTimeout(function () {
								onGamePieceArrived(tile);
							}, 1);
						});
				}
			}, 1);
		}

		/**
		 * callback fired when a player gamepiece arrives at its tweened position
		 * @param {BoardTile} tile
		 */
		function onGamePieceArrived(tile) {
			if (Main.gameSession.isParticipating()) {
				if (m_this.number == Main.gameSession.playerData.index) {
					m_this.marco("onLocalPlayerArrivedAtSpace", tile);
				}
			}
		}
	}
	return PlayerGamePieceElement;
})();

var NudgeTool = (function () {
	inherit(NudgeTool, CoreElement);
	function NudgeTool() {
		CoreElement.call(this);

		/** @type NudgeTool */
		var m_this = this;

		var m_speed = 1;
		var m_target = null;
		var m_keycode = null;

		this.onCreate = function () { };

		this.setup = function (keycode, target) {
			m_keycode = keycode;
			m_target = target;
			window.addEventListener("keypress", _handleKeyPress);
		};
		/**
		 * @param {KeyboardEvent} event
		 */
		function _handleKeyPress(event) {
			m_speed = event.getModifierState("Shift") ? 10 : 1;
			switch (event.code) {
				case "KeyS":
				case "ArrowDown":
					nudge(0, 1);
					break;
				case "KeyW":
				case "ArrowUp":
					nudge(0, -1);
					break;
				case "KeyA":
				case "ArrowLeft":
					nudge(-1, 0);
					break;
				case "KeyD":
				case "ArrowRight":
					nudge(1, 0);
					break;
				case "Equal":
					nudge(0, 0, 1);
					break;
				case "Minus":
					nudge(0, 0, -1);
					break;
			}
		}

		function nudge(dx, dy, s) {
			m_target.x += dx * m_speed;
			m_target.y += dy * m_speed;
			if (s != null) {
				var newScale = m_target.scaleX + s * m_speed * 0.1;
				m_target.scaleX = newScale;
				m_target.scaleY = newScale;
			}
			console.log(
				"Nudged",
				m_keycode,
				"newpos:",
				m_target.x,
				m_target.y,
				"newscale:",
				m_target.scaleX,
				m_target.scaleY
			);
		}

		this.onRelease = function () {
			m_target = null;
			window.removeEventListener("keypress", _handleKeyPress);
		};
	}

	NudgeTool.prototype.publicFunction = function () { };

	return NudgeTool;
})();

var StatementElement = (function () {
	inherit(StatementElement, ContainerElement);

	var m_templateID = "statementSheetTemplate";
	var m_item = "item";
	var m_group = "group";
	/**@type {Bool} */
	var state = false;

	function StatementElement() {

		ContainerElement.call(this);

		var m_playerData = null;
		var m_income = null;
		var m_expenses = null;
		var m_assets = null;
		var m_liabilities = null;
		var m_vocab = Main.loadQueue.getResult("vocabEnUS").vocab.statementList;
		var m_vocabWidget = Main.loadQueue.getResult("vocabEnUS").vocab.statementWidget;
		var m_this = this;
		var playerColor = null;

		this.setPlayerData = function (value) {
			// console.log("onsetting player data");
			m_playerData = value;
			playerColor = Colors.getPlayerColor(m_playerData.index);
			this.refresh();
			return this;
		};

		//TODO: @Dillon check unhandled marcos onPlayerDataUpdated and onGameStateUpdated
		this.polo("onPlayerDataUpdated", this.setPlayerData);
		this.polo(
			"onSetupClickListenersOnLiabityItems",
			onSetupClickListenersOnLiabityItems
		);
		this.polo(
			"onCleanupLiabilityClickListeners",
			onCleanupLiabilityClickListeners
		);
		this.polo(
			"onSetupClickListenersOnAssetItems",
			onSetupClickListenersOnAssetItems
		);
		this.polo("onSetupClickListenersAssetKey", onSetupClickListenersAssetKey);
		this.polo("onCleanupAssetClickListeners", onCleanupAssetClickListeners);
		this.polo("onCleanupBankruptClickListeners", onCleanupBankruptClickListeners);
		this.polo("onSetupBankruptClickListeners", onSetupBankruptClickListeners);
		this.polo("onStatementSheetOpen", onStatementSheetOpen);
		this.polo("onStatementSheetClose", onStatementSheetClose);

		var playerColor = Colors.getPlayerColor();

		this.addToList = function (list, elements, callback) {
			var element = null;
			var type = "";
			var properties = null;
			if (elements.length) {
				var length = elements.length;
				var items = [];
				for (var i = 0; i < length; i++) {
					element = elements[i];
					type = element.type || m_item;
					tag = element.tag || "";
					if (type === m_item) {
						properties = element.properties || {};
						addItemToList(list, properties, callback);
					} else if (type === m_group) {
						properties = element.items || [];
						addGroupToList(list, properties, tag, callback);
					}
				}
			} else {
				type = elements.type || m_item;
				if (type === m_item) {
					properties = elements.properties || {};
					addItemToList(list, properties, callback);
				} else if (type === m_group) {
					properties = elements.items || [];
					var tag = elements.tag;
					addGroupToList(list, properties, tag, callback);
				}
			}
		};

		var m_template = TemplateParser.parseTemplate(m_templateID);
		var m_backplate = function () {
			var backplate = new createjs.Sprite(Main.loadQueue.getResult("statement"));
			var backplateTemplate = m_template.background;
			backplate.scaleX = backplateTemplate.width / 1392;
			backplate.scaleY = backplateTemplate.height / 1424;
			backplate.alpha = 0.9;
			this.transform.addChild(backplate);
			return backplate;
		}.call(this);

		var fsText = function () {
			var text = formatAndAttachText("financialStatementLabel");
			text.color = playerColor;
			text.rotation = 90;
			return text;
		}.call(this);

		var m_incomeList = null;
		var m_expensesList = null;
		var m_assetList = null;
		var m_liabilitiesList = null;
		var m_cashflowDayIncomeRecord = null;

		this.refresh = function () {
			clearAllLists.call(this);
			populateLists.call(this);
		};

		this.tween = function (condition) {
			// condition===false ? Main.playSound("financialStatementsOut") : Main.playSound("financialStatementsIn")

			var tx = this.transform.x;
			var c = typeof condition === Types.BOOLEAN ? condition : tx === -652;

			createjs.Tween.get(this.transform)
				.to(
					{
						x: c ? 0 : -652
					},
					1,
					createjs.Ease.quintInOut
				)
				.call(function () {

					if (c === true) {
						if (state != c) {
							Main.playSound("financialStatementsOut");
							state = c;
						}
					} else {
						if (state != c) {
							Main.playSound("financialStatementsIn");
							state = c;
						}
					}

					if (m_incomeList) m_incomeList.html.hidden = !c;
					if (m_expensesList) m_expensesList.html.hidden = !c;
					if (m_assetList) m_assetList.html.hidden = !c;
					if (m_liabilitiesList) m_liabilitiesList.html.hidden = !c;
					if (m_cashflowDayIncomeRecord) m_cashflowDayIncomeRecord.html.hidden = !c;

				});
		};

		function clearAllLists() {
			// if (m_playerData.fastTrack === false) {
			if (m_incomeList) {
				m_incomeList.detach(this).release();
				m_incomeList = null;
			}
			if (m_expensesList) {
				m_expensesList.detach(this).release();
				m_expensesList = null;
			}
			if (m_assetList) {
				m_assetList.detach(this).release();
				m_assetList = null;
			}
			if (m_liabilitiesList) {
				m_liabilitiesList.detach(this).release();
				m_liabilitiesList = null;
			}
			if (m_cashflowDayIncomeRecord) {
				m_cashflowDayIncomeRecord.detach(this).release();
				m_cashflowDayIncomeRecord = null;
			}

			if (m_playerData.fastTrack) {
				this.removePolos();
				this.polo("onPlayerDataUpdated", this.setPlayerData);
				this.polo("onStatementSheetOpen", onStatementSheetOpen);
				this.polo("onStatementSheetClose", onStatementSheetClose);
			}

			this.transform.removeAllChildren();

			m_backplate = function () {
				var backplate = new createjs.Sprite(Main.loadQueue.getResult("statement"));
				var backplateTemplate = m_template.background;
				backplate.scaleX = backplateTemplate.width / 1392;
				backplate.scaleY = backplateTemplate.height / 1424;
				backplate.alpha = 0.9;
				this.transform.addChild(backplate);
				return backplate;
			}.call(this);

			fsText = function () {
				var text = formatAndAttachText("financialStatementLabel");
				text.color = playerColor;
				text.rotation = 90;
				return text;
			}.call(this);
			// var layer = document.getElementById("ui");
			// while (layer.firstChild) {
			//     layer.removeChild(layer.firstChild);
			// }
		}

		function populateLists() {
			if (!m_playerData.fastTrack) {
				makeRatRaceLists.call(this);
				addContentsToRatRaceLists.call(this);
				refreshRatRaceText.call(this);
			} else {
				m_cashflowDayIncomeRecord = makeAndAttachList(
					"incomeList_fasttrack"
				).adjust(function (element) {
					element.className += " fastTrack";
				});
				addContentsToFastTrackLists.call(this);
				refreshFastTrackText.call(this);
			}
		}

		function addContentsToFastTrackLists() {
			for (var i = 0; i < m_playerData.investments.length; i++) {
				/** @type {Investment} */
				var investment = m_playerData.investments[i];
				this.addToList(m_cashflowDayIncomeRecord, {
					type: m_item,
					properties: {
						// type: "asdlkfjoadsifjoaidsjf",
						leftText: investment.title,
						rightText: MathHelper.formatNumber(investment.cashflow),
						isMoney: true,
						// tag: investment.title,
						index: i,
						callback: function (element) {
							var length = element.html.children.length;
							for (var i = 0; i < length; i++) {
								var child = element.html.children[i];
								child.className += " fastTrack";
							}
						}
					}
				});
			}

			addEmpties([
				{
					list: m_cashflowDayIncomeRecord,
					cap: 15,
					callback: function (element) {
						var length = element.children.length;
						for (var i = 0; i < length; i++) {
							var child = element.children[i];
							child.className += " fastTrack";
						}
					}
				}
			]);
		}

		function refreshFastTrackText() {
			var progressBarBackground = makeAndAttachRect(
				"progressBarBackground_fasttrack",
				playerColor
			);
			var progressWhite = makeAndAttachRect(
				"progressWhite_fasttrack",
				Colors.WHITE
			);


			var headerRect = makeAndAttachRect(
				"incomeHeader_fasttrack",
				playerColor,
				0.9
			);

			var headerText = (function () {
				var text = formatAndAttachText("incomeHeaderTitle_fasttrack");
				text.text = m_vocabWidget.cfincomerecord;
				return text;
			})();

			var or = formatAndAttachText("orText_fasttrack");
			var dreamText = formatAndAttachText("dreamBuy");
			var cashflowText = formatAndAttachText("cashflowText_fasttrack");
			var cash = (function () {
				var text = formatAndAttachText("fasttrackCash_fasttrack");
				text.text = m_vocabWidget.cash + MathHelper.formatNumber(m_playerData.cash) + translations[language]["currency"];
				return text;
			})();

			var cashflowDayIncomeText = (function () {
				var text = formatAndAttachText("cashflowHeaderTitle_fasttrack");
				text.text =
					m_vocabWidget.cfincome +
					MathHelper.formatNumber(m_playerData.passiveIncome) + translations[language]["currency"];
				return text;
			})();

			var incomeGoal = function () {
				var text = formatAndAttachText("totalExpensesBar_fasttrack");
				text.text =
					m_vocabWidget.incomegoal +
					MathHelper.formatNumber(m_playerData.winPassiveIncome) + translations[language]["currency"];
				return text;
			}.call(this);

			var passiveIncome = function () {
				var text = formatAndAttachText("passiveIncomeBar_fasttrack");
				text.text =
					text.text + "\n" + MathHelper.formatNumber(m_playerData.passiveIncome) + translations[language]["currency"];
				return text;
			}.call(this);

			var progressRect = function () {
				var rect = makeAndAttachRect("progressBar_fasttrack", playerColor);
				rect.scaleX = m_playerData.cashflowRatio;
				return rect;
			}.call(this);

			var progressArrow = function () {
				var sprite = makeAndAttachSprite("progressArrow_fasttrack", "play_whiteUP");
				var color = Colors.convertToRGB(playerColor);
				var bounds = sprite.getBounds();
				var rectBounds = progressRect.getBounds();
				sprite.x =
					progressRect.x + rectBounds.width * progressRect.scaleX - bounds.width / 4;
				sprite.scale *= 0.8;
				sprite.filters = [
					new createjs.ColorFilter(0, 0, 0, 1, color.r, color.g, color.b)
				];
				sprite.cache(0, 0, bounds.width, bounds.height);
				sprite.updateCache();
				passiveIncome.x = sprite.x + bounds.width / 4;
				return sprite;
			}.call(this);


			var symbol = function () {
				var template = m_template.cardSymbol;
				var sprite = this.fetchSprite(
					Data.getDream(m_playerData.dreamId < 0 ? 0 : m_playerData.dreamId).icon,
					true,
					{
						sheet: "fastTrackSheet",
						width: template.width,
						height: template.height,
						x: template.x,
						y: template.y
					}
				);
				this.tintSprite(sprite, playerColor);
				return sprite;
			}.call(this);

			progressRect.scaleX = m_playerData.cashflowRatio;
		}

		function formatAndAttachText(subtemplate) {
			var text = TemplateParser.formatTextFromTemplate(m_templateID, subtemplate);
			m_this.transform.addChild(text);
			return text;
		}

		function makeAndAttachRect(subtemplate, color, alpha) {
			var rect = TemplateParser.makeRectFromTemplate(
				m_templateID,
				subtemplate,
				color
			);
			rect.alpha = alpha ? alpha : 1;
			m_this.transform.addChild(rect);
			return rect;
		}

		function makeAndAttachSprite(subtemplate, frame) {
			var sprite = TemplateParser.makeSpriteFromTemplate(
				m_templateID,
				subtemplate,
				frame
			);
			m_this.transform.addChild(sprite);
			return sprite;
		}

		function makeAndAttachList(subtemplate) {
			var list = TemplateParser.makeListFromTemplate(
				m_this,
				m_templateID,
				subtemplate
			);
			list.attach(m_this, m_this.transform.x === 0);
			return list;
		}

		function addItemToList(list, item, callback) {
			var type = item.type || ListItem.DEFAULT;
			var leftText = item.leftText || "";
			var rightText = item.rightText || "";
			var isMoney = item.isMoney || false;
			var callback = item.callback || null;
			var tag = item.tag || "";
			var index = item.index;
			if (index === undefined) {
				index = -1;
			}
			var i = list
				.addItem(type)
				.setText(leftText, rightText, isMoney)
				.setTag(tag);
			i.index = index;
			if (callback) callback(i);
		}

		function addItemToGroup(group, item, groupCallback, itemCallback) {
			addItemToList(group, item, itemCallback);
			if (groupCallback) groupCallback(group);
		}

		function addGroupToList(list, items, tag, callback) {
			var group = list.addGroup(tag);

			items.forEach(function (item) {
				addItemToGroup(group, item);
			});

			if (callback) callback(group);
		}

		function addEmpties(objs) {
			objs.forEach(function (obj) {
				var list = obj.list;
				var length = list.items.length;
				var cap = obj.cap;
				var callback = obj.callback;
				for (var i = length; i < cap; i++) {
					m_this.addToList(list, {});
					if (callback) callback(list.items[i].html);
				}
			});
		}

		function bottomBorderException(lists) {
			lists.forEach(function (list) {
				if (!list.items || list.items.length === 0) return;
				var lastItem = list.items[list.items.length - 1];
				if (
					lastItem.type != ListItem.DEFAULT &&
					lastItem.type != ListItem.LIABILITY
				)
					return;

				var length = lastItem.html.children.length;
				for (var i = 0; i < length; i++) {
					var child = lastItem.html.children[i];
					// console.log("child: ", child);
					child.style.borderBottom = "0px";
				}
				// lastItem.html.childNodes.forEach(function (child) {
				//     child.style.borderBottom = "0px";
				// });
			});
		}

		function refreshRatRaceText() {
			var goalHeader = function () {
				var text = formatAndAttachText("goalText");
				text.text = Main.loadQueue.getResult(
					"vocabEnUS"
				).vocab.statementWidget.goal;
				return text;
			}.call(this);

			//@dillon, had to move cashflow calculations from top of function to bottom for calcuation to work.

			var incomeHeader = makeAndAttachRect("incomeHeader", playerColor, 0.8);
			var expensesHeader = makeAndAttachRect("expensesHeader", playerColor, 0.8);
			var assetHeader = makeAndAttachRect("assetHeader", playerColor, 0.8);
			var liabilitiesHeader = makeAndAttachRect(
				"liabilitiesHeader",
				playerColor,
				0.8
			);
			var progressBarBackground = makeAndAttachRect(
				"progressBarBackground",
				playerColor
			);
			var progressWhite = makeAndAttachRect("progressWhite", Colors.WHITE);

			var line = makeAndAttachRect("line", Colors.BLACK);

			var passiveIncomeBarText = formatAndAttachText("passiveIncomeBar");
			passiveIncomeBarText.text =
				translations[language]["passiveIncome"] + m_playerData.passiveIncome.toString() + translations[language]["currency"];

			var cashText = formatAndAttachText("cashHeaderTitle");
			var cashAmountText = formatAndAttachText("cashAmount");
			var paydayText = formatAndAttachText("paydayTitle");
			var paydayAmountText = formatAndAttachText("cashflowAmount");
			var totalIncomeText = formatAndAttachText("totalIncomeHeaderTitle");
			var incomeAmountText = formatAndAttachText("totalIncomeAmount");
			var totalExpensesText = formatAndAttachText("totalExpensesHeaderTitle");
			var expensesAmountText = formatAndAttachText("totalExpensesAmount");
			var incomeHeaderText = formatAndAttachText("incomeHeaderTitle");
			var expensesHeaderText = formatAndAttachText("expensesHeaderTitle");
			var assetsHeaderText = formatAndAttachText("assetHeaderTitle");
			var liabilitiesHeaderText = formatAndAttachText("liabilitiesHeaderTitle");
			var totalExpensesBarText = formatAndAttachText("totalExpensesBar");

			cashAmountText.text = translations[language]["currency2"] + MathHelper.formatNumber(m_playerData.cash) + translations[language]["currency"];
			paydayAmountText.text = translations[language]["currency2"] + MathHelper.formatNumber(m_playerData.payday) + translations[language]["currency"];
			incomeAmountText.text = translations[language]["currency2"] + MathHelper.formatNumber(m_playerData.totalIncome) + translations[language]["currency"];
			expensesAmountText.text = translations[language]["currency2-"] + MathHelper.formatNumber(m_playerData.totalExpenses) + translations[language]["currency"];
			totalExpensesBarText.text =
				translations[language]["total-expenses"] + MathHelper.formatNumber(m_playerData.totalExpenses) + translations[language]["currency"];

			var progressRect = function () {
				var rect = makeAndAttachRect("progressBar", playerColor);
				rect.scaleX = m_playerData.cashflowRatio;
				return rect;
			}.call(this);

			var progressArrow = function () {
				var sprite = makeAndAttachSprite("progressArrow", "play_whiteUP");
				var color = Colors.convertToRGB(playerColor);
				var bounds = sprite.getBounds();
				var rectBounds = progressRect.getBounds();
				sprite.x =
					progressRect.x + rectBounds.width * progressRect.scaleX - bounds.width / 4;
				sprite.scale *= 0.8;
				sprite.filters = [
					new createjs.ColorFilter(0, 0, 0, 1, color.r, color.g, color.b)
				];
				sprite.cache(0, 0, bounds.width, bounds.height);
				sprite.updateCache();
				passiveIncomeBarText.x = sprite.x + bounds.width / 4;
				return sprite;
			}.call(this);
		}

		function makeRatRaceLists() {
			m_incomeList = makeAndAttachList("incomeList");
			m_expensesList = makeAndAttachList("expensesList");
			m_assetList = makeAndAttachList("assetList");
			m_liabilitiesList = makeAndAttachList("liabilitiesList");
		}

		function addContentsToRatRaceLists() {
			this.addToList(m_incomeList, [
				{
					type: m_item,
					properties: {
						type: ListItem.TOP_HEADER,
						rightText: m_vocab.cashflow
					}
				},
				{
					type: m_item,
					properties: {
						type: ListItem.DEFAULT,
						leftText: m_playerData.careerGenitive + m_vocab.salary,
						rightText: MathHelper.formatNumber(m_playerData.salary), //m_playerData.income.salary, //TODO: convert
						isMoney: true,
						tag: "salary"
					}
				},
				{
					type: m_group,
					tag: "interest",
					items: [
						{
							type: ListItem.HEADER,
							leftText: m_vocab.interests
						}
					]
				},
				{
					type: m_group,
					tag: "business",
					items: [
						{
							type: ListItem.HEADER,
							leftText: m_vocab.realestate
						}
					]
				}
			]);

			this.addToList(m_assetList, [
				{
					type: m_group,
					tag: "stockAsset",
					items: [
						{
							type: ListItem.TOP_HEADER,
							leftText: m_vocab.stocks,
							rightText: m_vocab.costshare
						}
					]
				},
				{
					type: m_group,
					tag: "realEstateAsset",
					items: [
						{
							type: ListItem.HEADER,
							leftText: m_vocab.realestate,
							rightText: m_vocab.cost
						}
					]
				}
			]);

			var stocks = m_playerData.stocks;
			var interest = m_incomeList.getGroupByTag("interest");

			var stockAssets = m_assetList.getGroupByTag("stockAsset");
			var realEstateAssets = m_assetList.getGroupByTag("realEstateAsset");

			stocks.forEach(function (stock, index) {
				if (stock.cashflow) {
					this.addToList(interest, {
						type: m_item,
						properties: {
							type: ListItem.DEFAULT,
							//TODO: get the vocab
							leftText:
								stock.quantity.toString() +
								(stock.quantity === 1 ? translations[language]["share-of"] : translations[language]["shares-of"]) +
								stock.key + (stock.quantity === 1 ? translations[language]["share-of-end"] : translations[language]["shares-of-end"]),
							rightText: MathHelper.formatNumber(stock.cashflow),
							tag: stock.key,
							isMoney: true
						}
					});
				}
				this.addToList(stockAssets, {
					type: m_item,
					properties: {
						type: ListItem.DEFAULT,
						//TODO: get the vocab
						leftText:
							stock.quantity.toString() +
							(stock.quantity === 1 ? translations[language]["share-of"] : translations[language]["shares-of"]) +
							stock.key + (stock.quantity === 1 ? translations[language]["share-of-end"] : translations[language]["shares-of-end"]),
						rightText: MathHelper.formatNumber(stock.cost),
						tag: stock.key,
						index: index,
						isMoney: true
					}
				});
			}, this);

			var business = m_incomeList.getGroupByTag("business");
			var properties = m_playerData.properties;

			var debts = m_playerData.debts;

			debts.forEach(function (debt, index) {
				if (debt.expense)
					this.addToList(m_expensesList, {
						type: m_item,
						properties: {
							type: ListItem.DEFAULT,
							leftText: (function () {
								switch (debt.id) {
									case "taxes":
										return m_vocab.taxes;
									case "home":
										return m_vocab.homepayment;
									case "carloan":
										return m_vocab.carpayment;
									case "creditcard":
										return m_vocab.creditpayment;
									case "retail":
										return m_vocab.retailpayment;
									case "other":
										return m_vocab.otherexpenses;
									case "boat":
										return m_vocab.boatpayment;
									case "loan":
										return m_vocab.loanpayment;
								}
							})(),
							rightText: MathHelper.formatNumber(debt.expense),
							isMoney: true,
							tag: debt.id
						}
					});

				if (debt.liability)
					this.addToList(m_liabilitiesList, {
						type: m_item,
						properties: {
							type: ListItem.LIABILITY,
							leftText: (function () {
								switch (debt.id) {
									case "home":
										return m_vocab.homemortgage;
									case "carloan":
										return m_vocab.car;
									case "creditcard":
										return m_vocab.credit;
									case "retail":
										return m_vocab.retail;
									case "boat":
										return m_vocab.boat;
									case "loan":
										return m_vocab.loan;
								}
							})(),
							rightText: MathHelper.formatNumber(debt.liability),
							isMoney: true,
							tag: debt.id
						}
					});
			}, this);

			if(m_playerData.numberOfChildren > 0){
				addItemToList(m_expensesList,{
					type: m_item,
						leftText: m_vocab.childexpenses + m_playerData.numberOfChildren + ")",
						rightText: m_playerData.numberOfChildren * m_playerData.childPerExpense,
						isMoney: true,
						tag: "child"
				})
			}

			this.addToList(m_liabilitiesList, {
				type: m_group,
				tag: "propertyLiab",
				items: [
					{
						type: ListItem.HEADER,
						leftText: m_vocab.realestate,
						rightText: m_vocab.liability
					}
				]
			});

			var busLiab = m_liabilitiesList.getGroupByTag("propertyLiab");

			properties.forEach(function (property, index) {
				if (property.cashflow)
					this.addToList(business, {
						type: m_item,
						properties: {
							leftText: property.key,
							rightText: MathHelper.formatNumber(property.cashflow),
							isMoney: true
						}
					});

				if (property.mortgage) {
					this.addToList(busLiab, {
						type: m_item,
						properties: {
							leftText: property.key,
							rightText: MathHelper.formatNumber(property.mortgage),
							isMoney: true
						}
					});
				}
				if (property.cost) {
					this.addToList(realEstateAssets, {
						type: m_item,
						properties: {
							leftText: property.key,
							rightText: MathHelper.formatNumber(property.cost),
							tag: property.key,
							index: index,
							isMoney: true
						}
					});
				}
			}, this);
			addEmpties([
				{
					list: interest,
					cap: 2
				},
				{
					list: business,
					cap: 3
				},
				{
					list: m_expensesList,
					cap: 7
				},
				{
					list: stockAssets,
					cap: 4
				},
				{
					list: realEstateAssets,
					cap: 4
				},
				{
					list: busLiab,
					cap: 4
				}
			]);

			bottomBorderException([
				m_incomeList,
				stockAssets,
				m_liabilitiesList,
				interest
			]);
		}

		function setupClickListenersOnLiabilityItems() {
			m_liabilitiesList.items.forEach(function (item) {
				item.listItemClicked = function (event) {
					m_this.marco("onListItemSelected", item.tag);
				};
				item.html.addEventListener("click", item.listItemClicked);
				item.html.style.backgroundColor = Colors.YELLOW + "BF";
			});
		}

		function onCleanupLiabilityClickListeners() {
			m_liabilitiesList.items.forEach(function (item) {
				item.html.removeEventListener("click", item.listItemClicked);
				item.html.style.backgroundColor = "";
			});
		}

		function onSetupClickListenersOnLiabityItems() {
			setupClickListenersOnLiabilityItems();
		}

		function onSetupClickListenersOnAssetItems() {
			//all assets
			var stockAssets = m_assetList.getGroupByTag("stockAsset");
			var realEstateAssets = m_assetList.getGroupByTag("realEstateAsset");

			stockAssets.items.forEach(function (item) {
				if (
					item.type === ListItem.HEADER ||
					item.type === ListItem.TOP_HEADER ||
					item.tag === ""
				) {
					return;
				}
				item.listItemClicked = function (event) {
					m_this.marco("onListItemAssetSelected", item.index);
				};
				item.html.addEventListener("click", item.listItemClicked);
				item.html.style.backgroundColor = "#00000040";
			});

			realEstateAssets.items.forEach(function (item) {
				if (
					item.type === ListItem.HEADER ||
					item.type === ListItem.TOP_HEADER ||
					item.tag === ""
				) {
					return;
				}
				item.listItemClicked = function (event) {
					m_this.marco("onListItemAssetSelected", item.index);
				};
				item.html.addEventListener("click", item.listItemClicked);
				item.html.style.backgroundColor = "#00000040";
			});
		}

		function onSetupClickListenersAssetKey(key) {
			// console.log("onSetupClickListenersAssetKey", key);
			var stockAssets = m_assetList.getGroupByTag("stockAsset");
			var realEstateAssets = m_assetList.getGroupByTag("realEstateAsset");

			stockAssets.items.forEach(function (item) {
				if (item.tag === key) {
					item.listItemClicked = function (event) {
						m_this.marco("onListItemAssetSelected", item.index);
					};
					item.html.addEventListener("click", item.listItemClicked);
					item.html.style.backgroundColor = "#00000040";
				}
			});
			realEstateAssets.items.forEach(function (item) {
				if (item.tag === key) {
					item.listItemClicked = function (event) {
						m_this.marco("onListItemAssetSelected", item.index);
					};
					item.html.addEventListener("click", item.listItemClicked);
					item.html.style.backgroundColor = "#00000040";
				}
			});
		}

		function onCleanupBankruptClickListeners() {
			onCleanupAssetClickListeners();
			onCleanupLiabilityClickListeners();
		}

		function onCleanupAssetClickListeners() {
			var stockAssets = m_assetList.getGroupByTag("stockAsset");
			var realEstateAssets = m_assetList.getGroupByTag("realEstateAsset");

			stockAssets.items.forEach(function (item) {
				item.html.removeEventListener("click", item.listItemClicked);
				item.html.style.backgroundColor = "";
			});
			realEstateAssets.items.forEach(function (item) {
				item.html.removeEventListener("click", item.listItemClicked);
				item.html.style.backgroundColor = "";
			});
		}

		function onStatementSheetOpen() {
			m_this.tween(true);
		}

		function onStatementSheetClose() {
			m_this.tween(false);
		}

		function onSetupBankruptClickListeners() {
			//all assets
			var stockAssets = m_assetList.getGroupByTag("stockAsset");
			var realEstateAssets = m_assetList.getGroupByTag("realEstateAsset");

			stockAssets.items.forEach(function (item) {
				if (
					item.type === ListItem.HEADER ||
					item.type === ListItem.TOP_HEADER ||
					item.tag === ""
				) {
					return;
				}
				item.listItemClicked = function (event) {
					m_this.marco("onBankruptAssetClicked", item.index);
				};
				item.html.addEventListener("click", item.listItemClicked);
				item.html.style.backgroundColor = "#00000040";
			});

			realEstateAssets.items.forEach(function (item) {
				if (
					item.type === ListItem.HEADER ||
					item.type === ListItem.TOP_HEADER ||
					item.tag === ""
				) {
					return;
				}
				item.listItemClicked = function (event) {
					m_this.marco("onBankruptAssetClicked", item.index);
				};
				item.html.addEventListener("click", item.listItemClicked);
				item.html.style.backgroundColor = "#00000040";
			});
			m_liabilitiesList.items.forEach(function (item) {
				item.listItemClicked = function (event) {
					m_this.marco("onBankruptLiabilityClicked", item.tag);
				};
				item.html.addEventListener("click", item.listItemClicked);
				item.html.style.backgroundColor = "#00000040";
			});
		}
	}

	return StatementElement;
})();

var BabyCard = (function () {

    inherit(BabyCard, CardElement);

    function BabyCard() {
        var m_this = this;
        var m_kidCount = 0;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            Main.playSound("babyLand")
            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {
            var color = Colors.getCurrentPlayerColor();

            m_kidCount = Main.gameSession.getCurrentPlayerBlob().numberOfChildren;

            var config = new CardConfig();

            config.cardDropDown = {
                color: color
            };

            config.cardSymbol = {
                sprite: 'icon_popup_baby',
                color: color
            }
            if (m_kidCount === 3) {

                config.cardTitle = {
                    text: Data.getVocab("babyCard", "title1"),
                    color: color
                };
                config.cardDescription = {
                    text: Data.getVocab("babyCard", "copy1"),
                    color: color
                };
            }
            else {
                config.cardTitle = {
                    text: Data.getVocab("babyCard", "title2"),
                    color: color
                };
                config.cardDescription = {
                    text: Data.getVocab("babyCard", "copy2")
                };

                config.cardInformation = {
                    text: Data.getVocab("babyCard", "copy3") + MathHelper.formatNumber(Main.gameSession.getCurrentPlayerBlob().childPerExpense) + translations[language]["currency"] + translations[language]["baby-second-part"]
                };
            }

            config.buyButton = {

                text: Data.getVocab("ok", "copy"),
                color: color
            };

            config.card = true;
            this.configure(config);
            if (this.buyButton) { this.buyButton.transform.on('click', this.onOkClicked); }
        }

        this.onOkClicked = function (event) {
            Main.playSound("openToHumanv1")
            if (m_kidCount === 3) {
                m_this.marco("onShowEndCard");
            } else {
                m_this.marco("onAddChild");
            }

            m_this.release();
        }
    }
    return BabyCard;
})()
var BankruptCard = (function () {

    inherit(BankruptCard, CardElement);

    function BankruptCard() {
        var m_this = this;
        var spectate = true
        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {
            //get the player color
            var color = Colors.getCurrentPlayerColor()

            var config = new CardConfig();
            // config.cardDropDown = {
            //     color: color
            // };
            config.card = true;
            config.cardSymbol = {
                sprite: 'icon_popup_bankrupt',
                color: color
            }
            var player = Main.gameSession.getCurrentPlayerBlob();
            var income = (player.salary + player.passiveIncome - player.totalExpenses);

            config.cardTitle = {
                text: Data.getVocab("bankruptCard", "title"),
                color: color
            };
            config.cardDescription = {
                text: Data.getVocab("bankruptCard", "copy1") + MathHelper.formatNumber(income) + translations[language]["currency"] + "\n" + Data.getVocab("bankruptCard", "copy2")
            };
            config.cardInformation = {
                text: Data.getVocab("bankruptCard", "copy3") + "\n" + Data.getVocab("bankruptCard", "copy4") + "\n" + Data.getVocab("bankruptCard", "copy5")
            };

            this.configure(config);

            if (Main.gameSession.isMyTurn) {
                this.marco("onSetupBankruptClickListeners");
            }
        }
    }
    return BankruptCard;
})()
var BankruptCompleteCard = (function () {

    inherit(BankruptCompleteCard, CardElement);

    function BankruptCompleteCard() {
        var m_this = this;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {
            //get the player color
            var color = Colors.getCurrentPlayerColor()

            var config = new CardConfig();
            config.buyButton = {
                text: Data.getVocab("ok", "copy"),
                color: color
            };
            config.cardDropDown = {
                color: color
            };

            config.card = true;
            config.cardSymbol = {
                sprite: 'icon_popup_bankrupt',
                color: color
            }
            config.cardTitle = {
                text: Data.getVocab("bankruptCompleteCard", "title"),
                color: color
            };
            config.cardDescription = {
                text: Data.getVocab("bankruptCompleteCard", "copy1")
            };


            config.cardInformation = {
                text: Data.getVocab("bankruptCompleteCard", "copy2"),
            };

            this.configure(config);
            if (this.buyButton) { this.buyButton.transform.on('click', this.onOkClicked); }
        }

        this.onOkClicked = function (event) {
            Main.playSound("openToHumanv1")
            m_this.marco("onBankruptCompleteClicked")
            m_this.release();
        }
    }
    return BankruptCompleteCard;
})()
var BankruptHalveCard = (function () {

    inherit(BankruptHalveCard, CardElement);

    function BankruptHalveCard() {
        var m_this = this;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {
            //get the player color
            var color = Colors.getCurrentPlayerColor()

            var config = new CardConfig();
            config.buyButton = {
                text: Data.getVocab("ok", "copy"),
                color: color
            };
            config.cardDropDown = {
                color: color
            };

            config.card = true;
            config.cardSymbol = {
                sprite: 'icon_popup_bankrupt',
                color: color
            }
            config.cardTitle = {
                text: Data.getVocab("bankruptHalveCard", "title"),
                color: color
            };
            config.cardDescription = {
                text: Data.getVocab("bankruptHalveCard", "copy1")
            };

            config.cardInformation = {
                text: Data.getVocab("bankruptHalveCard", "copy2")
            };

            this.configure(config);
            if (this.buyButton) { this.buyButton.transform.on('click', this.onOkClicked); }
        }

        this.onOkClicked = function (event) {
            Main.playSound("openToHumanv1")
            m_this.marco("onBankruptHalveClicked");
            m_this.release();
        }
    }
    return BankruptHalveCard;
})()
var BankruptLoseCard = (function () {

    inherit(BankruptLoseCard, CardElement);

    function BankruptLoseCard() {
        var m_this = this;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {
            //get the player color
            var color = Colors.getCurrentPlayerColor()

            var config = new CardConfig();
            config.buyButton = {
                text: Data.getVocab("ok", "copy"),
                color: color
            };
            config.cardDropDown = {
                color: color
            };

            config.card = true;
            config.cardSymbol = {
                sprite: 'icon_popup_bankrupt',
                color: color
            }
            config.cardTitle = {
                text: Data.getVocab("bankruptLoseCard", "title"),
                color: color
            };
            config.cardDescription = {
                text: Data.getVocab("bankruptLoseCard", "copy1")
            };

            this.configure(config);
            if (this.buyButton) { this.buyButton.transform.on('click', this.onBuyClicked); }
        }

        this.onBuyClicked = function (event) {
            Main.playSound("openToHumanv1")
            m_this.marco("onBankruptLoseClicked");
            m_this.release();
        }
    }
    return BankruptLoseCard;
})()
var BankruptPayCard = (function () {

    inherit(BankruptPayCard, CardElement);

    function BankruptPayCard() {
        var m_this = this;
        var m_cost = 0;
        var m_cash = 0;
        var m_repayAmount = 0;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {
            //get the player color
            var color = Colors.getCurrentPlayerColor()

            var config = new CardConfig();
            m_cash = Main.gameSession.getCurrentPlayerBlob().cash
            var debts = Main.gameSession.getCurrentPlayerBlob().debts;
            for (var i = 0; i < debts.length; i++) {
                if (debts[i].id == cardData.loanToRepay) {
                    m_cost = debts[i].liability;
                }
            }

            config.cardTitle = {
                text: Data.getVocab("payoffLoanCard", "title"),
                color: color
            };

            if (cardData.loanToRepay == "loan") {
                //do a loan repay
                if (m_cash >= 1000) { //they have enough cash to pay part of it back
                    config.buySharesTitle = {
                        text: Data.getVocab("amount", "copy")
                    };
                    config.borrowAmount = {
                        text: '1000'
                    };
                    config.cardDescription = {
                        text: Data.getVocab("payoffLoanCard", "copy2")
                    };
                    config.cardInformation = {
                        text: Data.getVocab("payoffLoanCard", "copy3")
                    };

                    config.upbtn = true; //up button to change amount in increments of 1000
                    config.downbtn = true; //down button to change amount in increments of 1000


                    config.buyButton = {
                        text: Data.getVocab("pay", "copy"),
                        color: color
                    };
                }
            }
            else {
                //do an other repay
                if (m_cash >= m_cost) {
                    config.cardDescription = {
                        text: Data.getVocab("loanamount", "copy") + MathHelper.formatNumber(m_cost) + translations[language]["currency"]
                    };
                    config.cardInformation = {
                        text: Data.getVocab("payoffLoanCard", "copy6")
                    };
                    config.buyButton = {
                        text: Data.getVocab("pay", "copy"),
                        color: color
                    };
                }
                else {
                    config.cardDescription = {
                        text: Data.getVocab("loanamount", "copy") + MathHelper.formatNumber(m_cost) + translations[language]["currency"]
                    };
                    config.cardInformation = {
                        text: Data.getVocab("payoffLoanCard", "copy7")
                    };
                }
            }

            config.passButton = {
                text: Data.getVocab("cancel", "copy"),
                color: color
            };
            config.cardDropDown = {
                color: color
            };
            config.card = true;
            config.cardSymbol = {
                sprite: 'icon_popup_repay',
                color: color
            }

            if (this.borrowAmount) {
                m_repayAmount = 1000;
            }

            this.configure(config);

            if (this.passButton) { this.passButton.transform.on('click', this.onPassClicked); }
            if (this.buyButton) { this.buyButton.transform.on('click', this.onPayClicked); }

            if (this.upbtn) { this.upbtn.on('click', this.onUpClicked); }
            if (this.downbtn) { this.downbtn.on('click', this.onDownClicked); }

            if (this.borrowAmount) {
                this.textboxAmount = 1000;
                m_repayAmount = 1000;
            }
        }

        this.onPayClicked = function (event) {
            Main.playSound("openToHumanv1")
            m_this.textboxAmount = (Math.round((m_this.textboxAmount) / 1000) * 1000);
            if (isNaN(m_this.textboxAmount)) {
                m_this.borrowAmount.html.value = 1000;
            }
            else {
                m_this.textboxAmount = (Math.round((m_this.textboxAmount) / 1000) * 1000);
            }

            if (m_this.textboxAmount > m_cost) { // we are assuming the loan's cost is always good.
                m_this.textboxAmount = m_cost;
            }
            if (m_this.textboxAmount > Main.gameSession.getCurrentPlayerBlob().cash) {
                m_this.textboxAmount = (Math.floor((Main.gameSession.getCurrentPlayerBlob().cash) / 1000) * 1000);
            }

            if (m_this.textboxAmount < 1000)
                m_this.textboxAmount = 1000;

            m_this.marco("onBankruptPayOffClicked", m_cost, m_this.textboxAmount);
            m_this.release();
        }

        this.onPassClicked = function (event) {
            Main.playSound("openToHumanv1")
            m_this.marco("onBankruptPayOffCanceled");
            m_this.release();
        }
        this.onUpClicked = function (event) {
            Main.playSound("openToHumanv1")

            if (isNaN(m_this.textboxAmount)) {
                m_this.borrowAmount.html.value = 1000;
            }
            else {
                m_this.textboxAmount = (Math.round((m_this.textboxAmount) / 1000) * 1000);
                if (Math.floor(m_this.textboxAmount) < m_cost) {
                    m_this.textboxAmount = (m_this.textboxAmount) + 1000;
                    if (m_this.textboxAmount > m_cash) {
                        m_this.textboxAmount = m_cash;
                    }
                }
                m_repayAmount = m_this.textboxAmount;
            }
        }
        this.onDownClicked = function (event) {
            Main.playSound("openToHumanv1")

            if (isNaN(m_this.textboxAmount)) {
                m_this.borrowAmount.html.value = 1000;
            }
            else {
                m_this.textboxAmount = (Math.round((m_this.textboxAmount) / 1000) * 1000);
                if (Math.floor(m_this.textboxAmount) > 1000) {
                    m_this.textboxAmount = (m_this.textboxAmount) - 1000;
                } else {
                    m_this.textboxAmount = 1000;
                }
                m_repayAmount = m_this.textboxAmount;
            }
        }

        Object.defineProperties(this, {
            textboxAmount: {
                get: function () {
                    if (m_this.borrowAmount) { return Math.floor(parseInt(m_this.borrowAmount.html.value)); }
                    else {
                        return -1;
                    }
                },
                set: function (value) { if (m_this.borrowAmount) { m_this.borrowAmount.html.value = value; } }
            },
            min: { value: 1000, writable: false },
            max: { value: 9999000, writable: false }
        })
    }
    return BankruptPayCard;
})()
var BankruptSellCard = (function () {

    inherit(BankruptSellCard, CardElement);

    function BankruptSellCard() {
        var m_this = this;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {
            //get the player color
            var color = Colors.getCurrentPlayerColor()

            var config = new CardConfig();
            config.buyButton = {
                text: Data.getVocab("sell", "copy"),
                color: color
            };
            config.passButton = {
                text: Data.getVocab("back", "copy"),
                color: color
            };
            config.cardDropDown = {
                color: color
            };
            config.card = true;
            config.cardSymbol = {
                sprite: 'icon_popup_bankrupt',
                color: color
            }
            config.cardTitle = {
                text: Data.getVocab("bankruptSellCard", "title"),
                color: color
            };
            config.cardDescription = {
                text: Data.getVocab("sellamount", "copy") + MathHelper.formatNumber(Main.gameSession.getCurrentPlayerBlob().properties[cardData.propertyIndex].downpay * 0.5) + translations[language]["currency"]
            };

            this.configure(config);
            if (this.buyButton) { this.buyButton.transform.on('click', this.onSellClicked); }
            if (this.passButton) { this.passButton.transform.on('click', this.onBackClicked); }

        }
        this.onSellClicked = function (event) {
            Main.playSound("openToHumanv1")
            m_this.marco("onBankruptSellProperty");
            m_this.release();
        }
        this.onBackClicked = function (event) {
            Main.playSound("openToHumanv1")
            m_this.marco("onBankruptSellBackClicked");
            m_this.release();
        }
    }
    return BankruptSellCard;
})()
var BorrowCardEndTurn = (function() {

    inherit(BorrowCardEndTurn, CardElement);

    function BorrowCardEndTurn() {
        var m_this = this;
        var m_vocab = Main.loadQueue.getResult("vocabEnUS").vocab;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function() {
            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function(cardData) {
            //get the player color
            var color = Colors.getCurrentPlayerColor()

            var config = new CardConfig();
            config.buyButton = {
                text: m_vocab.borrow.copy,
                color: color
            };
            config.passButton = {
                text: m_vocab.cancel.copy,
                color: color
            };
            config.cardDropDown = {
                color: color
            };
            config.card = true;
            config.cardSymbol = {
                sprite: 'icon_popup_borrow',
                color: color
            }
            config.cardTitle = {
                text: m_vocab.borrowCard.title,
                color: color
            };
            config.cardDescription = {
                text: m_vocab.borrowCard.copy1,
            };
            config.buySharesTitle = {
                text: m_vocab.amount.copy,
            };
            config.borrowAmount = {
                text: '1000',
            };


            config.upbtn = true; //up button to change amount in increments of 1000
            config.downbtn = true; //down button to change amount in increments of 1000

            this.configure(config);

            if(this.buyButton){ this.buyButton.transform.on('click', this.onBorrowClicked); }
            if(this.passButton){ this.passButton.transform.on('click', this.onCancelClicked); }
            if(this.upbtn){ this.upbtn.on('click', this.onUpClicked); }
            if(this.downbtn){ this.downbtn.on('click', this.onDownClicked); }
            
            this.textboxAmount = config.borrowAmount.text;
        }

        this.onBorrowClicked = function(event) {
            Main.playSound("openToHumanv1")
            if(isNaN(m_this.textboxAmount)){
                m_this.borrowAmount.html.value = 1000;
            }
            else{
                m_this.textboxAmount = (Math.round((m_this.textboxAmount) / 1000) * 1000);
            }
            m_this.marco("onBorrowCardEndTurnClicked",m_this.textboxAmount);
            m_this.release();
        }
        this.onCancelClicked = function(event) {
            Main.playSound("openToHumanv1")
            m_this.marco('onShowEndCard');
            m_this.release();
        }
        this.onUpClicked = function(event) {
            Main.playSound("openToHumanv1")
            if(isNaN(m_this.textboxAmount)){
                m_this.borrowAmount.html.value = 1000;
            }
            else{
                m_this.textboxAmount = (Math.round((m_this.textboxAmount) / 1000) * 1000);
                if (m_this.textboxAmount < 9999000) {
                    m_this.textboxAmount = (m_this.textboxAmount) + 1000;
                } else {
                    m_this.textboxAmount = 9999000;
                }
            }
        }
        this.onDownClicked = function(event) {
            Main.playSound("openToHumanv1")
            if(isNaN(m_this.textboxAmount)){
                m_this.borrowAmount.html.value = 1000;
            }
            else{
                m_this.textboxAmount = (Math.round((m_this.textboxAmount) / 1000) * 1000);
                if (m_this.textboxAmount > 1000) {
                    m_this.textboxAmount -= 1000;
                } else {
                    m_this.textboxAmount = 1000;
                }
            }
        }

        Object.defineProperties(this, {
            textboxAmount: {
                get: function () {
                    if (m_this.borrowAmount) {
                        return Math.floor(parseInt(m_this.borrowAmount.html.value));
                    }
                    return -1;
                },
                set: function (value) {
                    if (m_this.borrowAmount) {
                        m_this.borrowAmount.html.value = value;
                    }
                }
            },
            min: { value: 1000, writable: false },
            max: { value: 9999000, writable: false }
        })
    }

    return BorrowCardEndTurn;
})()
var BorrowCardStartTurn = (function () {

    inherit(BorrowCardStartTurn, CardElement);

    function BorrowCardStartTurn() {
        var m_this = this;
        var m_vocab = Main.loadQueue.getResult("vocabEnUS").vocab;


        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {

            //get the player color
            var color = Colors.getCurrentPlayerColor()

            var config = new CardConfig();
            config.buyButton = {
                text: m_vocab.borrow.copy,
                color: color
            };
            config.passButton = {
                text: m_vocab.cancel.copy,
                color: color
            };
            config.cardDropDown = {
                color: color
            };
            config.card = true;
            config.cardSymbol = {
                sprite: 'icon_popup_borrow',
                color: color
            }
            config.cardTitle = {
                text: m_vocab.borrowCard.title,
                color: color
            };
            config.cardDescription = {
                text: m_vocab.borrowCard.copy1,
            };
            config.buySharesTitle = {
                text: m_vocab.amount.copy,
            };
            config.borrowAmount = {
                text: '1000',
            };

            config.upbtn = true; //up button to change amount in increments of 1000
            config.downbtn = true; //down button to change amount in increments of 1000

            this.configure(config);

            if (this.buyButton) { this.buyButton.transform.on('click', this.onBorrowClicked); }
            if (this.passButton) { this.passButton.transform.on('click', this.onCancelClicked); }
            if (this.upbtn) { this.upbtn.on('click', this.onUpClicked); }
            if (this.downbtn) { this.downbtn.on('click', this.onDownClicked); }

            this.textboxAmount = config.borrowAmount.text;
        }

        this.onBorrowClicked = function (event) {
            Main.playSound("openToHumanv1")
            if (isNaN(m_this.textboxAmount)) {
                m_this.borrowAmount.html.value = 1000;
            }
            else {
                m_this.textboxAmount = (Math.round((m_this.textboxAmount) / 1000) * 1000);
            }


            m_this.marco("onBorrowCardStartTurnClicked", m_this.textboxAmount)
            m_this.release();
        }
        this.onCancelClicked = function (event) {
            Main.playSound("openToHumanv1")

            m_this.marco('onShowStartTurnCard');
            m_this.release();
        }
        this.onUpClicked = function (event) {
            Main.playSound("openToHumanv1")

            if (isNaN(m_this.textboxAmount)) {
                m_this.borrowAmount.html.value = 1000;
            }
            else {
                m_this.textboxAmount = (Math.round((m_this.textboxAmount) / 1000) * 1000);
                if (m_this.textboxAmount < 9999000) {
                    m_this.textboxAmount = (m_this.textboxAmount) + 1000;
                } else {
                    m_this.textboxAmount = 9999000;
                }
            }
        }
        this.onDownClicked = function (event) {
            Main.playSound("openToHumanv1");

            if (isNaN(m_this.textboxAmount)) {
                m_this.borrowAmount.html.value = 1000;
            }
            else {
                m_this.textboxAmount = (Math.round((m_this.textboxAmount) / 1000) * 1000);
                if (m_this.textboxAmount > 1000) {
                    m_this.textboxAmount -= 1000;
                } else {
                    m_this.textboxAmount = 1000;
                }
            }
        }

        Object.defineProperties(this, {
            textboxAmount: {
                get: function () {
                    if (m_this.borrowAmount) {
                        return Math.floor(parseInt(m_this.borrowAmount.html.value));
                    }
                    return -1;
                },
                set: function (value) {
                    if (m_this.borrowAmount) {
                        m_this.borrowAmount.html.value = value;
                    }
                }
            },
            min: { value: 1000, writable: false },
            max: { value: 9999000, writable: false }
        })
    }

    return BorrowCardStartTurn;
})()
var CharityCard = (function () {

    inherit(CharityCard, CardElement);

    function CharityCard() {
        var m_this = this;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            Main.playSound("charityLand")
            
            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {
            

            
            //get the player color
            var color = Colors.getCurrentPlayerColor()

            var config = new CardConfig();
            config.cardTitle = {
                text: Data.getVocab("charityCard", "title"),
                color: color
            };

            config.cardDropDown = {
                color: color
            };
            config.card = true;
            config.cardSymbol = {
                sprite: 'icon_popup_charity',
                color: color
            }

            var playerCash = Main.gameSession.getCurrentPlayerBlob().cash;

            var fastTrack = Main.gameSession.getCurrentPlayerBlob().fastTrack;
            if (fastTrack) {
                //TODO: do we want to make the fast track card seperate? if not do the fast track logic
                config.cardDescription = {text : Data.getVocab("charityCard","copy1")};
                config.cardInformation = {text : Data.getVocab("charityCard","copy2")};
				if(playerCash >= 100000)
				{
                    config.buyButton = {
                        text: Data.getVocab("donate", "copy"),
                        color: color
                    };
				}
            } else {
                var amountToDonate = (Main.gameSession.getCurrentPlayerBlob().salary + Main.gameSession.getCurrentPlayerBlob().passiveIncome) * 0.1;
                if (amountToDonate < 1) {
                    amountToDonate = 1;
                }

                if (playerCash >= amountToDonate) {
                    config.cardInformation = {
                        text: Data.getVocab("charityCard", "copy4") + MathHelper.formatNumber(amountToDonate) + translations[language]["currency"]
                    };

                    config.buyButton = {
                        text: Data.getVocab("donate", "copy"),
                        color: color
                    };
                }
                else {
                    config.cardInformation = {
                        text: Data.getVocab("charityCard", "copy5")
                    };
                }

                config.cardDescription = {
                    text: Data.getVocab("charityCard", "copy3")
                };
            }

            config.passButton = {
                text: Data.getVocab("pass", "copy"),
                color: color
            };

            this.configure(config);
            
            if (this.buyButton) { this.buyButton.transform.on('click', this.onDonateClicked); }
            if (this.passButton) { this.passButton.transform.on('click', this.onPassClicked); }
        }

        this.onDonateClicked = function (event) {
            Main.playSound("openToHumanv1")
            
            m_this.marco("onDonateClicked")
            m_this.release();
        }

        this.onPassClicked = function (event) {
            Main.playSound("openToHumanv1")
            
            m_this.marco("onShowEndCard");
            m_this.release();
        }
    }
    return CharityCard;
})();
var DealCard = (function () {

    inherit(DealCard, CardElement);

    function DealCard() {
        var m_this = this;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            Main.playSound("bidDealSmallDeal")
            
            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {
            

            
            //get the player color
            var color = Colors.getCurrentPlayerColor()

            var config = new CardConfig();
            config.buyButton = {
                text: Data.getVocab("dealCard", "copy2"),
                color: color
            };
            config.passButton = {
                text: Data.getVocab("dealCard", "copy3"),
                color: color
            };
            config.cardDropDown = {
                color: color
            };
            config.card = true;
            config.cardSymbol = {
                sprite: 'icon_popup_deal',
                color: color
            }
            config.cardTitle = {
                text: Data.getVocab("dealCard", "title"),
                color: color
            };
            config.cardDescription = {
                text: Data.getVocab("dealCard", "copy1") + '\n' + Data.getVocab("dealCard", "small") + '\n' + Data.getVocab("dealCard", "big"),
            };

            this.configure(config);
            if (this.buyButton) { this.buyButton.transform.on('click', this.onSmallDealClicked); }
            if (this.passButton) { this.passButton.transform.on('click', this.onBigDealClicked); }
        }

        this.onSmallDealClicked = function (event) {
            Main.playSound("openToHumanv1")
            
            m_this.marco("onDrawCard", DeckNames.smalldealDeck);
            m_this.release();
        }

        this.onBigDealClicked = function (event) {
            Main.playSound("openToHumanv1")
            
            m_this.marco("onDrawCard", DeckNames.bigdealDeck);
            m_this.release();
        }
    }
    return DealCard;
})()
var DivorceCard = (function () {

    inherit(DivorceCard, CardElement);

    function DivorceCard() {
        var m_this = this;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            Main.playSound("divorceLand")
            
            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {
            

            
            //get the player color
            var color = Colors.getCurrentPlayerColor()

            var config = new CardConfig();
            config.buyButton = {
                text: Data.getVocab("ok", "copy"),
                color: color
            };
            config.cardDropDown = {
                color: color
            };
            config.card = true;
            config.cardSymbol = {
                sprite: 'icon_popup_divorce',
                color: color
            }
            config.cardTitle = {
                text: Data.getVocab("losecashCard", "divorce"),
                color: color
            };
            config.cardDescription = {
                text: Data.getVocab("losecashCard", "copy2")
            };

            this.configure(config);
            
            if (this.buyButton) { this.buyButton.transform.on('click', this.onBuyClicked); }
        }

        this.onBuyClicked = function (event) {
            Main.playSound("openToHumanv1");
            m_this.marco("onDivorceClicked");
            m_this.release();
        }
    }
    return DivorceCard;
})()
var DoodadCard = (function () {

    inherit(DoodadCard, CardElement);

    function DoodadCard() {
        var m_this = this;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            Main.playSound("doodaLand")
            
            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {
            
            var color = Colors.getCurrentPlayerColor()

            var config = new CardConfig();

            if(cardData.child === 'has'){
                config.cardInformation = {
                    text: Data.getVocab("doodadCard", "copy2")
                };
                var numChildren = Main.gameSession.getCurrentPlayerBlob().numberOfChildren;
                if(numChildren === 0){
                    config.passButton = {
                        text: Data.getVocab("pass", "copy"),
                        color: color
                    };
                }
                else{
                    config.buyButton = {
                        text: Data.getVocab("pay", "copy"),
                        color: color
                    };
                }
            }
            else{
                config.buyButton = {
                    text: Data.getVocab("pay", "copy"),
                    color: color
                }; 
            }

            config.cardDropDown = {
                color: color
            };
        
            config.card = true;
            config.cardSymbol = {
                sprite: 'icon_popup_dodad',
                color: color
            }
            config.cardTitle = {
                text: cardData.title,
                color: color
            };
            config.cardDescription = {
                text: Data.getVocab("doodadCard", "copy1") + MathHelper.formatNumber(cardData.cost) + translations[language]["currency"]
            };

            this.configure(config);
            if(this.buyButton){ this.buyButton.transform.on('click', this.onPayClicked); }
            if(this.passButton){ this.passButton.transform.on('click', this.onPassClicked); }
        }

        this.onPayClicked = function (event) {
            Main.playSound("openToHumanv1")
            
            m_this.marco("onDoodadPayClicked");
            m_this.release();
        }

        this.onPassClicked = function (event) {
            Main.playSound("openToHumanv1")
            
            m_this.marco("onShowEndCard");
            m_this.release();
        }
    }
    return DoodadCard;
})()
var DownsizeCard = (function () {

    inherit(DownsizeCard, CardElement);

    function DownsizeCard() {
        var m_this = this;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            Main.playSound("downsizeLand")
            
            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {
            

            
            //get the player color
            var color = Colors.getCurrentPlayerColor()

            var config = new CardConfig();
            config.buyButton = {
                text: Data.getVocab("pay", "copy"),
                color: color
            };
            config.cardDropDown = {
                color: color
            };
            config.card = true;
            config.cardSymbol = {
                sprite: 'icon_popup_downsizing',
                color: color
            }
            config.cardTitle = {
                text: Data.getVocab("downsizeCard", "title1"),
                color: color
            };
            config.cardDescription = {
                text: Data.getVocab("downsizeCard", "copy2")
            };

            config.cardInformation = {
                text: Data.getVocab("downsizeCard", "copy1") + MathHelper.formatNumber(cardData.cost) + translations[language]["currency"]
            };

            this.configure(config);
            
            if(this.buyButton){ this.buyButton.transform.on('click', this.onPayClicked); }
        }

        this.onPayClicked = function (event) {
            Main.playSound("openToHumanv1")
            
            m_this.marco("onDownsizeClicked");
            m_this.release();
        }
    }
    return DownsizeCard;
})()
var DreamCard = (function () {

    inherit(DreamCard, CardElement);

    function DreamCard() {
        var m_this = this;

        CardElement.call(this);

        this.setup = function (cardData) {

            



            //get the player color
            var color = Colors.getCurrentPlayerColor()
            var m_playerData = Main.gameSession.getCurrentPlayerBlob();
            var playerName = m_playerData.name;

            var config = new CardConfig();
            config.cardDropDown = {
                color: color
            };
            config.card = true;
            //@push: get the correct starting dream symbol or just pick a random one on the board place the symbol on the board for all players
            config.cardSymbol = {
                // sprite: 'icon_popup_borrow',
                sprite: cardData.icon,
                sheet: "fastTrackSheet",
                color: color
            }
            config.cardTitle = {
                text: cardData.title,
                color: color
            };
            config.cardDescription = {
                // text: Data.vocab().borrowCard.copy1,
                text: cardData.copy1
            };

            /* 
            show dream
            whether win or lose, add to dream count
            check cost before dream     
             */

            if (Main.gameSession.isMyTurn) {
                var dreamIndex = Data.getDreamIndex(cardData.id);

                // TODO: 'dreampiecetext' whatever that means
                var isMyDream = dreamIndex == Main.gameSession.getCurrentPlayerBlob().dreamId;

                // var win: int = shout("IsPlayerDream", cardData)[0];

                config.cardInformation = { /* color: color */ };

                if (isMyDream) {
                    // var dreamMultiplier = Main.gameSession.roomBlob.fastTrackSpaces[Number(cardData.id)];
                    var dreamMultiplier = Main.gameSession.getCurrentPlayerBlob().dreamCostMultiplier;

                    cardData.cost *= dreamMultiplier;
                    if (Main.gameSession.getCurrentPlayerBlob().cash >= cardData.cost) {
                        config.buyButton = {
                            text: Data.getVocab("buy", "copy"),
                            color: color
                        }
                        config.cardInformation.text = Data.getVocab("dreamCard", "copy1") + "\n" + Data.getVocab("cost", "copy") + MathHelper.formatNumber(cardData.cost) + translations[language]["currency"];
                    } else {
                        config.cardInformation.text = Data.getVocab("dreamCard", "copy2") + "\n" + Data.getVocab("cost", "copy") + MathHelper.formatNumber(cardData.cost) + translations[language]["currency"];
                    }
                    config.passButton = {
                        text: Data.getVocab("pass", "copy"),
                        color: color
                    }

                // } else if (Main.gameSession.isAnotherPlayersDream(dreamIndex)) {

                } else {
                    config.cardInformation.text = Data.getVocab("dreamCard", "copy3"); // TODO: copy4 if no one has the dream
                    config.passButton = {
                        text: Data.getVocab("pass", "copy"),
                        color: color
                    }
                }

                // if (win > 0) {
                //     enableButton("buy");
                //     enableButton("pass");
                //     cardData.cost *= win;
                //     var cash: Number = link.player.cash;
                //     if (cash >= cardData.cost) {
                //         scene.cardInformation.text = Vocab.copy("dreamCard", "copy1") + "\n" + Vocab.copy("cost", "copy") + gtNumbers.formatNumber(cardData.cost);
                //         scene.buyText.text = Vocab.copy("buy", "copy");
                //     }
                //     else {
                //         scene.cardInformation.text = Vocab.copy("dreamCard", "copy2") + "\n" + Vocab.copy("cost", "copy") + gtNumbers.formatNumber(cardData.cost);
                //         disableButton("buy");
                //     }

                //     scene.passText.text = Vocab.copy("pass", "copy");
                // }
                // else if (win == 0) {
                //     enableButton("pass");

                //     scene.cardInformation.text = Vocab.copy("dreamCard", "copy3");
                //     disableButton("buy");
                //     scene.passText.text = Vocab.copy("pass", "copy");
                // }
                // else {
                //     enableButton("pass");
                //     disableButton("buy");

                //     scene.cardInformation.text = Vocab.copy("dreamCard", "copy4");
                //     // Double the cost here
                //     scene.passText.text = Vocab.copy("pass", "copy");
                // }
            }


            this.configure(config);

            if (this.buyButton) {
                this.buyButton.transform.on('click', this.onBuyClicked);
            }
            if (this.passButton) {
                this.passButton.transform.on('click', this.onPassClicked);
            }
        }

        this.onBuyClicked = function (event) {
            
            Main.playSound("buttonPush")
            m_this.marco('onAttemptDreamPurchase');
        }

        this.onPassClicked = function (event) {
            
            Main.playSound("buttonPush")
            m_this.marco('onDreamPassed');
        }
    }
    return DreamCard;
})()




var DreamSelectCard = (function () {
	inherit(DreamSelectCard, CardElement);

	function DreamSelectCard() {
		var m_this = this;

		CardElement.call(this);

		var base_onCreate = this.onCreate;
		this.onCreate = function () {
			if (base_onCreate) base_onCreate.call(this);
		};

		this.setup = function (dreamIndex) {


			var dreamData = Data.getDream(dreamIndex);


			//get the player color
			var color = Colors.getCurrentPlayerColor();
			var currentPlayerblob = Main.gameSession.getCurrentPlayerBlob();// Main.gameSession.playerData;
			var playerName = currentPlayerblob.name;

			var config = new CardConfig();
			config.buyButton = {
				text: Data.vocab().startGameCard.button,
				color: color
			};
			config.cardDropDown = {
				color: color
			};
			config.card = true;
			//@push: get the correct starting dream symbol or just pick a random one on the board place the symbol on the board for all players
			config.cardSymbol = {
				// sprite: 'icon_popup_borrow',
				sprite: dreamData.icon,
				sheet: "fastTrackSheet",
				color: color
			};
			config.cardTitle = {
				text:
					Main.gameSession.getCurrentPlayerBlob().name +
					Data.vocab().startGameCard.title,
				color: color
			};
			config.cardDescription = {
				// text: Data.vocab().borrowCard.copy1,
				text: dreamData.title + ": " + dreamData.copy1
			};

			//TODO: polish, show other player's career information
			if (Main.gameSession.isMyTurn) {
				if (
					currentPlayerblob.careerTitle == "Airline Pilot" ||
					currentPlayerblob.careerTitle == "Engineer"
				) {
					config.cardInformation = {
						text:
							Data.vocab().startGameCard.copy6 +
							currentPlayerblob.careerTitle +
							".\n" +
							Data.vocab().startGameCard.copy2 +
							MathHelper.formatNumber(currentPlayerblob.salary) +
							translations[language]["money_format"] +
							Data.vocab().startGameCard.copy3 +
							MathHelper.formatNumber(currentPlayerblob.savings) +
							Data.vocab().startGameCard.copy4 +
							".\n" +
							Data.vocab().startGameCard.copy5 +
							MathHelper.formatNumber(currentPlayerblob.cash) +
                            translations[language]["money_format"]
					};
				} else {
					config.cardInformation = {
						text:
							Data.vocab().startGameCard.copy1 +
							currentPlayerblob.careerTitle +
							".\n" +
							Data.vocab().startGameCard.copy2 +
							MathHelper.formatNumber(currentPlayerblob.salary) +
							translations[language]["money_format"] +
							Data.vocab().startGameCard.copy3 +
							MathHelper.formatNumber(currentPlayerblob.savings) +
							Data.vocab().startGameCard.copy4 +
							".\n" +
							Data.vocab().startGameCard.copy5 +
							MathHelper.formatNumber(currentPlayerblob.cash) +
                            translations[language]["money_format"]
					};
				}
			}

			config.leftButton = true; //left to change the dream
			config.rightButton = true; //right to change the dream

			this.configure(config);

			if (this.buyButton) {
				this.buyButton.transform.on("click", this.onDreamSelected);
			}
			if (this.leftButton) {
				this.leftButton.on("click", this.onLeftClicked);
			}
			if (this.rightButton) {
				this.rightButton.on("click", this.onRightClicked);
			}
		};

		this.onDreamSelected = function (event) {

			Main.playSound("buttonPush");
			m_this.marco("onDreamSelected");
		};

		this.onLeftClicked = function (event) {
			Main.playSound("openToHumanv1");

			//@push: change dream to left and push to firebase so all players see the updated peice on the board
			m_this.marco("onCycleDreamSelect", -1);
		};

		this.onRightClicked = function (event) {
			Main.playSound("openToHumanv1");

			//@push: change dream to right and push to firebase so all players see the updated peice on the board
			m_this.marco("onCycleDreamSelect", 1);
		};
	}
	return DreamSelectCard;
})();

var EndCard = (function () {

    inherit(EndCard, CardElement);

    function EndCard() {
        var m_this = this;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {

            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {



            //get the player color
            var color = Colors.getCurrentPlayerColor()
            var currentBlob = Main.gameSession.getCurrentPlayerBlob();

            var config = new CardConfig();
            config.passButton = {
                text: Data.getVocab("endCard", "button"),
                color: color
            };
            config.cardDropDown = {
                color: color
            };
            config.card = true;
            config.cardSymbol = {
                sprite: 'icon_popup_endturn',
                color: color
            }
            config.cardTitle = {
                text: Data.getVocab("endCard", "title"),
                color: color
            };

            if (currentBlob.fastTrack) {
                config.cardInformation = {
                    text: Data.getVocab("endCard", "copy2"),
                };
            } else {
                config.cardInformation = {
                    text: Data.getVocab("endCard", "copy1"),
                };

                config.repayButton = {
                    text: Data.getVocab("statementWidget", "repay"),
                };

                config.borrowButton = {
                    text: Data.getVocab("statementWidget", "borrow"),
                };
            }


            this.configure(config);
            if (this.passButton) {
                this.passButton.transform.on('click', this.onPassClicked);
            }
            if (this.repayButton) {
                this.repayButton.transform.on('click', this.onRepayClicked);
            }
            if (this.borrowButton) {
                this.borrowButton.transform.on('click', this.onBorrowClicked);
            }
        }

        this.onPassClicked = function (event) {
            Main.playSound("openToHumanv1")

            m_this.marco("onEndTurn");
            m_this.release();
        }

        this.onRepayClicked = function (event) {
            Main.playSound("openToHumanv1")

            m_this.marco("onRepayClicked", "EndCard");
            m_this.release();
        }

        this.onBorrowClicked = function (event) {
            Main.playSound("openToHumanv1")

            m_this.marco("onShowBorrowCardEndTurn");
            m_this.release();
        }
    }
    return EndCard;
})()
var EnterFastTrackCard = (function () {

    inherit(EnterFastTrackCard, CardElement);

    function EnterFastTrackCard() {
        var m_this = this;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            
            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {
            

            
            //get the player color
            var color = Colors.getCurrentPlayerColor()

            var config = new CardConfig();
            //TODO: add the button and card drop down back in
            config.buyButton = {
                text: Data.getVocab("ok", "copy"),
                color: color
            };
            config.cardDropDown = {
                color: color
            };
            config.card = true;
            config.cardSymbol = {
                sprite: 'icon_popup_fasttrack',
                color: color
            }
            config.cardTitle = {
                text: Data.getVocab("enterFastTrackCard", "title") +"\n" +Data.getVocab("enterFastTrackCard", "title2"),
                color: color
            };
            config.cardDescription = {
                text: Main.gameSession.getCurrentPlayerBlob().name + Data.getVocab("enterFastTrackCard", "copy1")+"\n" +Data.getVocab("enterFastTrackCard", "copy2"),
            };
            config.cardInformation = {
                text: Data.getVocab("enterFastTrackCard", "copy3"),
            };

            
            this.configure(config);
            
            if(this.buyButton){
                this.buyButton.transform.on('click', this.onOkClicked);
            }
        }

        this.onOkClicked = function (event) {
            Main.playSound("openToHumanv1")
            
            m_this.marco("onEnterFastTrackClicked");
            m_this.release();
        }
    }
    return EnterFastTrackCard;
})()
var EveryoneBankruptCard = (function () {

    inherit(EveryoneBankruptCard, CardElement);

    function EveryoneBankruptCard() {
        var m_this = this;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {

            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {



            //get the player color
            var color = Colors.getLocalPlayerColor() // get MY color for this one

            var config = new CardConfig();

            config.everyoneButtons = true;

            config.buyButton = {
                text: Data.getVocab("quit", "copy"),
                color: color
            };
            // config.passButton = {
            //     text: Data.getVocab("cancel", "copy"),
            // };
            config.cardDropDown = {
                color: color
            };
            config.card = true;
            // config.queueTop = {
            //     text: "this is a queue",
            //     color: color,
            //     template: "sellText"
            // };
            config.cardSymbol = {
                sprite: 'icon_popup_bankrupt',
                color: color
            }
            config.cardTitle = {
                text: Data.getVocab("everyoneBankruptCard", "title"),
                color: color
            };
            config.cardDescription = {
                text: ''
            };
            config.cardInformation = {
                text: ''
            };


            this.configure(config);

            if (this.buyButton) {
                this.buyButton.transform.on('click', this.onBuyClicked);
            }

        }

        this.onBuyClicked = function (event) {
            Main.playSound("openToHumanv1")
            Main.logic.exitGame();
        }
    }




    //     {
    //         onSetCardClickable(true);

    //         //scene.gotoTemplate("everyonebankrupt");

    //         var color:uint = shout("GetPlayerColor")[0];

    //         scene.cardSymbol.image.color = color;
    //         scene.cardDropDown.image.color = color//link.player.color;// = Constants.YELLOW;
    //         scene.cardTitle.color = color//link.player.color;
    //         scene.buyText.color = color//link.player.color;
    //         scene.passText.color = color//link.player.color;
    //         scene.sellText.color = color//link.player.color;

    // //			scene.cardSymbol.image.color = link.player.color;
    // //			scene.cardDropDown.image.color = link.player.color;// = Constants.YELLOW;
    // //			scene.cardTitle.color = link.player.color;
    // //			scene.buyText.color = link.player.color;
    // //			scene.passText.color = link.player.color;
    // //			scene.sellText.color = link.player.color;

    //         scene.cardTitle.text = Vocab.copy("everyoneBankruptCard","title");
    //         scene.cardDescription.text = "";
    //         scene.cardInformation.text  = "";

    //         scene.buyText.text = Vocab.copy("quit","copy");

    //         enableButton("buy");
    //         disableButton("sell");
    //         disableButton("pass");

    //         scene.buySharesTitle.detach();
    //         scene.buySharesAmount.detach();
    //         scene.cardSymbol.gotoAndStop("bankrupt");
    //     }



    return EveryoneBankruptCard;
})()
var InvestmentCard = (function () {

    inherit(InvestmentCard, CardElement);

    function InvestmentCard() {
        var m_this = this;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            
            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {
            //get the player color
            var color = Colors.getCurrentPlayerColor()

            var config = new CardConfig();
            config.card = true;
            config.cardDropDown = {
                color: color
            };
            // config.queueTop = {
            //     text: "this is a queue",
            //     color: color,
            //     template: "sellText"
            // };
            config.cardSymbol = {
                sprite: cardData.icon,
                sheet: "fastTrackSheet",
                color: color
            }
            config.cardTitle = {
                text: cardData.title,
                color: color
            };
            config.cardDescription = {
                text: cardData.copy1
                /* color: color */
            };


            config.passButton = {
                text: Data.getVocab("pass", "copy"),
                color: color
            };

            config.cardInformation = {/*  color: color */ };

            if (Main.gameSession.isMyTurn) {

                if (Main.gameSession.getCurrentPlayerBlob().cash >= cardData.cost) {

                    if (Main.gameSession.playerCanPurchaseInvesment(cardData)) {

                        config.buyButton = { color: color };
                        if (cardData.rolllMin == null) {
                            config.buyButton.text = Data.getVocab("buy", "copy");
                        } else {
                            config.buyButton.text = Data.getVocab("roll", "copy");
                        }

                        if (cardData.stock == "true") {
                            config.cardInformation.text =
                                Data.getVocab("cost", "copy") + MathHelper.formatNumber(cardData.cost) + translations[language]["currency"] + "\n" +
                                Data.getVocab("return", "copy") + MathHelper.formatNumber(cardData.reward) + translations[language]["currency"];
                        } else {
                            config.cardInformation.text =
                                Data.getVocab("cost", "copy") + MathHelper.formatNumber(cardData.cost) + translations[language]["currency"] + "\n" +
                                Data.getVocab("cashflow", "copy") + MathHelper.formatNumber(cardData.cashflow) + translations[language]["currency"];
                        }
                    } else {
                        config.cardInformation.text = Data.getVocab("investmentCard", "copy1");
                    }
                } else {
                    if (cardData.stock == "true") {
                        config.cardInformation.text =
                            Data.getVocab("cost", "copy") + MathHelper.formatNumber(cardData.cost) + translations[language]["currency"] + "\n" +
                            Data.getVocab("return", "copy") + MathHelper.formatNumber(cardData.reward) + translations[language]["currency"];
                    } else {
                        config.cardInformation.text =
                            Data.getVocab("cost", "copy") + MathHelper.formatNumber(cardData.cost) + translations[language]["currency"] + "\n" +
                            Data.getVocab("cashflow", "copy") + MathHelper.formatNumber(cardData.cashflow) + translations[language]["currency"];
                    }
                }
            } else {
                if (cardData.stock == "true") {
                    config.cardInformation.text =
                        Data.getVocab("cost", "copy") + MathHelper.formatNumber(cardData.cost) + translations[language]["currency"] + "\n" +
                        Data.getVocab("return", "copy") + MathHelper.formatNumber(cardData.reward) + translations[language]["currency"];
                } else {
                    config.cardInformation.text =
                        Data.getVocab("cost", "copy") + MathHelper.formatNumber(cardData.cost) + translations[language]["currency"] + "\n" +
                        Data.getVocab("cashflow", "copy") + MathHelper.formatNumber(cardData.cashflow) + translations[language]["currency"];
                }
            }

            this.configure(config);
            
            if (this.buyButton) {
                this.buyButton.transform.on('click', this.onBuyClicked);
            }
            if (this.passButton) {
                this.passButton.transform.on('click', this.onPassClicked);
            }
        }

        this.onBuyClicked = function (event) {
            
            m_this.marco("onAttemptInvestmentPurchase");
            m_this.release();
        }

        this.onPassClicked = function (event) {
            Main.playSound("openToHumanv1")
            
            m_this.marco("onShowEndCard");
            m_this.release();
        }
    }

    return InvestmentCard;
})()
var InvestmentRollCard = (function () {

    inherit(InvestmentRollCard, CardElement);

    function InvestmentRollCard() {
        var m_this = this;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            
            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {
            

            
            //get the player color
            var color = Colors.getCurrentPlayerColor()

            var diceResult = 0;
            Main.gameSession.turnState.dice.forEach(function (d) { diceResult += d; })

            var config = new CardConfig();

            config.cardDropDown = {
                color: color
            };

            config.card = true;
            // config.queueTop = {
            //     text: "this is a queue",
            //     color: color,
            //     template: "sellText"
            // };
            config.cardSymbol = {
                sprite: cardData.icon,
                sheet: "fastTrackSheet",
                color: color
            }
            config.cardTitle = {
                text: cardData.title,
                color: color
            };

            config.cardDescription = { color: color };
            config.cardInformation = { color: color };

            // var spaceType:String = "";
            if (diceResult >= cardData.rollmin) {
                config.cardDescription.text = Data.getVocab("investmentRollCard", "copy1") + diceResult;
                if (cardData.stock == "true")
                    config.cardInformation.text = Data.getVocab("investmentRollCard", "copy2") + MathHelper.formatNumber(cardData.reward);
                else
                    config.cardInformation.text = Data.getVocab("investmentRollCard", "copy2") + MathHelper.formatNumber(cardData.cashflow) + " " + Data.getVocab("investmentRollCard", "copy3");

                config.buyButton = {
                    text: Data.getVocab("ok", "copy"),
                    color: color
                };
                // 	spaceType = "investmentRollWin";
            }
            else {
                config.cardDescription.text = Data.getVocab("investmentRollCard", "copy1") + diceResult;
                if (cardData.stock == "true")
                    config.cardInformation.text = Data.getVocab("investmentRollCard", "copy2") + "0";
                else
                    config.cardInformation.text = Data.getVocab("investmentRollCard", "copy2") + "0 " + Data.getVocab("investmentRollCard", "copy3");

                config.passButton = {
                    text: Data.getVocab("ok", "copy"),
                    color: color
                };
                // 	spaceType = "investmentRollLose";
            }

            // TODO: show sheet
            // action.delayMS(500,"showSheet");
            // if(link.player.isAIPlayer)
            // {
            // 	scene.cardDropDown.alpha = 0;
            // 	disableButton("buy");
            // 	disableButton("pass");
            // 	disableButton("sell");

            // 	action.cancel("makeBotDecision");
            // 	action.delayS(1, "makeBotDecision",spaceType);
            // } 

            this.configure(config);
            
            if (this.buyButton) {
                this.buyButton.transform.on('click', this.onBuyClicked);
            }
            if (this.passButton) {
                this.passButton.transform.on('click', this.onPassClicked);
            }
        }

        this.onBuyClicked = function (event) {
            
            m_this.marco("onAttemptInvestmentChancePurchase")
            m_this.release();
        }

        this.onPassClicked = function (event) {
            
            //TODO: LogActions
            // m_this.marco("LogAction",link.player.playerName + Vocab.copy("faildeal","copy"));
            m_this.marco("onShowEndCard");
            m_this.release();
        }
    }


    // public function $investmentRollCard_onEnter():void
    // {
    //     shout("HideSheet");
    //     //scene.gotoTemplate("investmentroll");



    //     scene.cardTitle.text = cardData.title;
    //     scene.cardDescription.text = "";
    //     scene.cardInformation.text = "";

    //     scene.cardSymbol.gotoAndStop(cardData.icon);

    //     disableButton("buy");
    //     disableButton("sell");
    //     disableButton("pass");
    // }
    return InvestmentRollCard;
})()
var LawsuitCard = (function () {

    inherit(LawsuitCard, CardElement);

    function LawsuitCard() {
        var m_this = this;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            Main.playSound("lawsuitLand");
            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {



            //get the player color
            var color = Colors.getCurrentPlayerColor()

            var config = new CardConfig();
            config.buyButton = {
                text: Data.getVocab("ok", "copy"),
                color: color
            };
            // config.passButton = {
            //     text: Data.getVocab("LawsuitCard", "copy3"),
            //     color: color
            // };
            config.cardDropDown = {
                color: color
            };
            config.card = true;
            // config.queueTop = {
            //     text: "this is a queue",
            //     color: color,
            //     template: "sellText"
            // };
            config.cardSymbol = {
                sprite: 'icon_popup_lawsuit',
                color: color
            }
            config.cardTitle = {
                text: Data.getVocab("losecashCard", "lawsuit"),
                color: color
            };
            config.cardDescription = {
                text: Data.getVocab("losecashCard", "copy1")
                // color: "black"
            };


            config.cardInformation = {
                text: ""
            };

            this.configure(config);

            if (this.buyButton) { this.buyButton.transform.on('click', this.onBuyClicked); }
        }

        this.onBuyClicked = function (event) {
            Main.playSound("openToHumanv1");
            m_this.marco("onLawsuitClicked");
            m_this.release();
        }
    }




    // ////scene.gotoTemplate("losecash");
    // 		scene.cardDropDown.image.color = link.player.color;// = Constants.BLUE;
    // 		scene.cardInformation.text = "";
    // 		scene.buyText.text = Vocab.copy("ok","copy");

    // 		if(displayedType == "Lawsuit")
    // 			scene.cardSymbol.gotoAndStop("audit");
    // 		else if(displayedType == "lawsuit")
    // 			scene.cardSymbol.gotoAndStop("lawsuit");
    // 		else 
    // 			scene.cardSymbol.gotoAndStop("divorce");

    // 		enableButton("buy");
    // 		disableButton("sell");
    // 		disableButton("pass");
    // 	}


    return LawsuitCard;
})()
var LoanCard = (function () {

    inherit(LoanCard, CardElement);

    function LoanCard() {
        var m_this = this;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            
            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {
            

            
            //get the player color
            var color = Colors.getCurrentPlayerColor()

            var config = new CardConfig();
            config.buyButton = {
                text: Data.getVocab("yes", "copy"),
                color: color
            };
            config.passButton = {
                text: Data.getVocab("no", "copy"),
                color: color
            };
            config.cardDropDown = {
                color: color
            };
            config.card = true;
            config.cardSymbol = {
                sprite: 'icon_popup_borrow',
                color: color
            }
            config.cardTitle = {
                text: Data.getVocab("loanCard", "title"),
                color: color
            };
            config.cardDescription = {
                text: Data.getVocab("loanCard", "copy1")
            };
            config.cardInformation = {
                text: Data.getVocab("loanCard", "copy2") + MathHelper.formatNumber(cardData.loan) + Data.vocab().loanCard.copy3 + MathHelper.formatNumber(cardData.loan*0.1) + translations[language]["currency"]
            };

            
            this.configure(config);
            
            if(this.buyButton){
                this.buyButton.transform.on('click', this.onYesClicked);
            }
            if(this.passButton){
                this.passButton.transform.on('click', this.onNoClicked);
            }
        }

        this.onYesClicked = function (event) {
            Main.playSound("openToHumanv1")
            
            m_this.marco("onLoanBorrowClicked")
            m_this.release();
        }
        this.onNoClicked = function (event) {
            Main.playSound("openToHumanv1")
            
            m_this.marco("onLoanCancelClicked")
            m_this.release();
        }
    }
    return LoanCard;
})()
var MarketCard = (function () {

    inherit(MarketCard, CardElement);

    function MarketCard() {
        var m_this = this;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            Main.playSound("marketLand")

            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {



            //get the player color
            var color = Colors.getCurrentPlayerColor()

            var config = new CardConfig();
            config.passButton = {
                text: Data.getVocab("done", "copy"),
                color: color
            };
            config.cardDropDown = {
                color: color
            };
            config.card = true;
            config.cardSymbol = {
                sprite: 'icon_popup_mrkt',
                color: color
            }
            config.cardTitle = {
                text: cardData.title,
                color: color
            };
            if (cardData.type === "brother") {
                config.cardDescription = {
                    text: cardData.copy1
                };
                config.cardInformation = {
                    text: cardData.copy2 + " " + Data.getVocab("marketCard", "copy1")
                };
            }
            else {
                config.cardDescription = {
                    text: cardData.copy1 + " " + cardData.copy2
                };
                config.cardInformation = {
                    text: Data.getVocab("marketCard", "copy1")
                };
            }

            this.configure(config);
            if (this.passButton) {
                this.passButton.transform.on('click', this.onDoneClicked);
            }

            if (Main.gameSession.isMyTurn) {
                this.marco("onSetupClickListenersAssetKey", cardData.key);
            }
        }

        this.onDoneClicked = function (event) {
            Main.playSound("openToHumanv1")
            m_this.marco("onCleanupAssetClickListeners");
            m_this.marco("onShowEndCard");
            m_this.release();
        }
    }
    return MarketCard;
})()
var MarketMustCard = (function () {

    inherit(MarketMustCard, CardElement);

    function MarketMustCard() {
        var m_this = this;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            Main.playSound("marketLand")
            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {
            
            var color = Colors.getCurrentPlayerColor()

            var config = new CardConfig();
            if(cardData.type === "market_fee"){
                config.buyButton = {
                    text: Data.getVocab("pay", "copy"),
                    color: color
                };
            }
            else{
                config.buyButton = {
                    text: Data.getVocab("ok", "copy"),
                    color: color
                };
            }
           
            config.cardDropDown = {
                color: color
            };
        
            config.card = true;
            config.cardSymbol = {
                sprite: 'icon_popup_mrkt',
                color: color
            }
            config.cardTitle = {
                text:  cardData.title,
                color: color
            };
            config.cardDescription = {
                text: cardData.copy1 + " " + cardData.copy2
            };

            this.configure(config);
            if(this.buyButton){
                this.buyButton.transform.on('click', this.onMarketMustClicked);
            }
        }

        this.onMarketMustClicked = function (event) {
            Main.playSound("openToHumanv1")
            
            m_this.marco("onMarketMustClicked");
            m_this.release();
        }
    }
    return MarketMustCard;
})()
var MarketNoOpportunityCard = (function () {

    inherit(MarketNoOpportunityCard, CardElement);

    function MarketNoOpportunityCard() {
        var m_this = this;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            Main.playSound("marketLand")
            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {

            
            //get the player color
            var color = Colors.getCurrentPlayerColor();

            var config = new CardConfig();
            config.passButton = {
                text: Data.getVocab("done", "copy"),
                color: color
            };
            config.cardDropDown = {
                color: color
            };
            config.card = true;
            config.cardSymbol = {
                sprite: 'icon_popup_mrkt',
                color: color
            }
            config.cardTitle = {
                text: cardData.title,
                color: color
            };
            config.cardDescription = {
                text: cardData.copy1 + " " + cardData.copy2,
            };
            config.cardInformation = {
                text: Data.getVocab("marketCard", "copy2"),
            };

            this.configure(config);
            if(this.passButton){
                this.passButton.transform.on('click', this.onDoneClicked);
            }
        }

        this.onDoneClicked = function (event) {
            Main.playSound("openToHumanv1")
			
            m_this.marco("onShowEndCard");
            m_this.release();
        }
    }
    return MarketNoOpportunityCard;
})()
var MarketSellCard = (function () {

    inherit(MarketSellCard, CardElement);

    function MarketSellCard() {
        var m_this = this;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            Main.playSound("marketLand")
            
            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {
            

            
            //get the player color
            var color = Colors.getCurrentPlayerColor()

            var config = new CardConfig();
            config.card = true;
            config.cardDropDown = {
                color: color
            };
            config.cardSymbol = {
                sprite: 'icon_popup_mrkt',
                color: color
            }

            var property = Main.gameSession.getCurrentPlayerBlob().properties[cardData.propertyIndex];
            var amount = 1;
            if(cardData.key == translations[language]["plex"] || cardData.key == translations[language]["apthouse"]){
                amount = property.units;
            }

            config.cardTitle = {
                text: Data.getVocab("marketSellCard", "title") + cardData.title,
                color: color
            };

            if(cardData.key == translations[language]["coin"]){
                config.cardInformation = {
                    text: Data.getVocab("sellamount", "copy") + MathHelper.formatNumber(cardData.cost * 8) + translations[language]["currency"]
                };
            }
            else if(cardData.key == translations[language]["gold"]){
                config.cardInformation = {
                    text: Data.getVocab("sellamount", "copy") + MathHelper.formatNumber(cardData.cost * 10) + translations[language]["currency"]
                };
            }
            else if(cardData.type == "market_selladd"){
                config.cardInformation = {
                    text: Data.getVocab("sellamount", "copy") + MathHelper.formatNumber((cardData.cost + property.cost) - property.mortgage) + translations[language]["currency"]
                };
                config.cardDescription = {
                    text: Data.getVocab("marketSellCard", "copy1") + "\n" +
                        MathHelper.formatNumber(cardData.cost) + Data.getVocab("marketSellCard", "copy2") + MathHelper.formatNumber(property.cost) + Data.getVocab("marketSellCard", "copy3") + MathHelper.formatNumber(property.mortgage)
                        + Data.getVocab("marketSellCard", "copy4") + MathHelper.formatNumber((cardData.cost + property.cost) - property.mortgage) + translations[language]["currency"]
                };
            }
            else if(cardData.type == "market_sell"){
                config.cardInformation = {
                    text: Data.getVocab("sellamount", "copy") + MathHelper.formatNumber((cardData.cost * amount) - property.mortgage) + translations[language]["currency"]
                };
                config.cardDescription = {
                    text: Data.getVocab("marketSellCard", "copy5") + "\n" +
                        MathHelper.formatNumber(cardData.cost) + " * " + MathHelper.formatNumber(amount) + " - " + MathHelper.formatNumber(property.mortgage)
                        + Data.getVocab("marketSellCard", "copy4") + MathHelper.formatNumber((cardData.cost * amount) - property.mortgage) + translations[language]["currency"]
                };
            }
            else if(cardData.type == "market_brother"){
                config.cardInformation = {
                    text: Data.getVocab("cashflow", "copy") + -cardData.cost
                };
            }

            config.buyButton = {
                text: Data.getVocab("sell", "copy"),
                color: color
            };

            config.passButton = {
                text: Data.getVocab("back", "copy"),
                color: color
            };
            
            this.configure(config);
            
            if(this.buyButton){
                this.buyButton.transform.on('click', this.onSellClicked);
            }
            if(this.passButton){
                this.passButton.transform.on('click', this.onBackClicked);
            }
        }

        this.onSellClicked = function (event) {
            Main.playSound("openToHumanv1")
            
            m_this.marco("onSellMarketCard");
            m_this.release();
        }

        this.onBackClicked = function (event) {
            Main.playSound("openToHumanv1")
            
            m_this.marco("onMarketSellBackClicked");
            m_this.release();
        }
    }
    return MarketSellCard;
})()
var PayDayCard = (function () {

    inherit(PayDayCard, CardElement);

    function PayDayCard() {
        var m_this = this;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            Main.playSound("paydayLand")
            
            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {
            

            //TODO: check what happens in the old game when you actually land on the payday does it show a card?

            
            //get the player color
            var color = Colors.getCurrentPlayerColor()

            var config = new CardConfig();
            config.buyButton = {
                text: Data.getVocab("collect", "copy"),
            };
            // config.passButton = {
            //     text: Data.getVocab("cancel", "copy"),
            // };
            config.cardDropDown = {
                color: color
            };
            config.card = true;
            // config.queueTop = {
            //     text: "this is a queue",
            //     color: color,
            //     template: "sellText"
            // };
            config.cardSymbol = {
                sprite: 'icon_popup_PayDay',
                color: color
            }
            config.cardTitle = {
                text: Data.getVocab("paydayCard", "title"),
                color: color
            };
            config.cardDescription = {
                text: Data.getVocab("paydayCard", "copy1")
                // color: "black"
            };
            config.cardInformation = {
                text: Data.getVocab("amount", "copy") + " expense"
            };


            this.configure(config);
            
            if (this.buyButton) { this.buyButton.transform.on('click', this.onBuyClicked); }

        }

        this.onBuyClicked = function (event) {
            Main.playSound("openToHumanv1")
            
        }
    }


    // //    	public function $paydayCard_onEnter():void
    // 		{
    // 			shout("PlaySound","payday_land");

    // 			////scene.gotoTemplate("payday");

    // 			scene.cardTitle.text = Vocab.copy("paydayCard","title");
    // 			scene.cardDescription.text = Vocab.copy("paydayCard","copy1");
    // 			scene.cardInformation.text = Vocab.copy("amount","copy") + gtNumbers.formatNumber((link.player.salary + link.player.passiveIncome - link.player.totalExpenses));

    // 			if(((link.player.salary + link.player.passiveIncome - link.player.totalExpenses)) >= 0)
    // 				scene.buyText.text = Vocab.copy("collect","copy");
    // 			else
    // 				scene.buyText.text = Vocab.copy("pay","copy");


    // 			enableButton("buy");
    // 			disableButton("sell");
    // 			disableButton("pass");

    // 			scene.cardSymbol.gotoAndStop("payday");
    // 		}

    return PayDayCard;
})()
var PayOffLoanCard = (function () {

    inherit(PayOffLoanCard, CardElement);

    function PayOffLoanCard() {
        var m_this = this;
        var m_cost = 0;
        var m_cash = 0;
        var m_repayAmount = 0;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            // Main.playSound("paydayLand")
            Main.playSound("openToHumanv1")

            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {



            //get the player color
            var color = Colors.getCurrentPlayerColor()

            var config = new CardConfig();
            m_cash = Main.gameSession.getCurrentPlayerBlob().cash
            var debts = Main.gameSession.getCurrentPlayerBlob().debts;
            for (var i = 0; i < debts.length; i++) {
                if (debts[i].id == cardData.loanToRepay) {
                    m_cost = debts[i].liability;
                }
            }

            config.cardTitle = {
                text: Data.getVocab("payoffLoanCard", "title"),
                color: color
            };

            if (cardData.loanToRepay == "loan") {
                //do a loan repay
                if (m_cash >= 1000) { //they have enough cash to pay part of it back
                    config.buySharesTitle = {
                        text: Data.getVocab("amount", "copy")
                    };
                    config.borrowAmount = {
                        text: '1000'
                    };
                    config.cardDescription = {
                        text: Data.getVocab("payoffLoanCard", "copy2")
                    };
                    config.cardInformation = {
                        text: Data.getVocab("payoffLoanCard", "copy3")
                    };

                    config.upbtn = true; //up button to change amount in increments of 1000
                    config.downbtn = true; //down button to change amount in increments of 1000


                    config.buyButton = {
                        text: Data.getVocab("pay", "copy"),
                        color: color
                    };
                }
            }
            else {
                //do an other repay
                if (m_cash >= m_cost) {
                    config.cardDescription = {
                        text: Data.getVocab("loanamount", "copy") + MathHelper.formatNumber(m_cost) + translations[language]["currency"]
                    };
                    config.cardInformation = {
                        text: Data.getVocab("payoffLoanCard", "copy6")
                    };
                    config.buyButton = {
                        text: Data.getVocab("pay", "copy"),
                        color: color
                    };
                }
                else {
                    config.cardDescription = {
                        text: Data.getVocab("loanamount", "copy") + MathHelper.formatNumber(m_cost) + translations[language]["currency"]
                    };
                    config.cardInformation = {
                        text: Data.getVocab("payoffLoanCard", "copy7")
                    };
                }
            }

            config.passButton = {
                text: Data.getVocab("cancel", "copy"),
                color: color
            };
            config.cardDropDown = {
                color: color
            };
            config.card = true;
            config.cardSymbol = {
                sprite: 'icon_popup_repay',
                color: color
            }

            if (this.borrowAmount) {
                m_repayAmount = 1000;
            }

            this.configure(config);

            if (this.passButton) {
                this.passButton.transform.on('click', this.onPassClicked);
            }
            if (this.buyButton) {
                this.buyButton.transform.on('click', this.onPayClicked);
            }

            if (this.upbtn) {
                this.upbtn.on('click', this.onUpClicked);
            }
            if (this.downbtn) {
                this.downbtn.on('click', this.onDownClicked);
            }

            if (this.borrowAmount) {
                this.textboxAmount = 1000;
                m_repayAmount = 1000;
            }
        }

        this.onPayClicked = function (event) {
            Main.playSound("paydayLand")
            m_this.textboxAmount = (Math.round((m_this.textboxAmount) / 1000) * 1000);
            if (isNaN(m_this.textboxAmount)) {
                m_this.borrowAmount.html.value = 1000;
            }
            else {
                m_this.textboxAmount = (Math.round((m_this.textboxAmount) / 1000) * 1000);
            }

            if (m_this.textboxAmount > m_cost) {// we are assuming the loan's cost is always good.
                m_this.textboxAmount = m_cost;
            }
            if (m_this.textboxAmount > Main.gameSession.getCurrentPlayerBlob().cash) {
                m_this.textboxAmount = (Math.floor((Main.gameSession.getCurrentPlayerBlob().cash) / 1000) * 1000);
            }

            if (m_this.textboxAmount < 1000)
                m_this.textboxAmount = 1000;

            m_this.marco("onPayOffLoanPayClicked", m_cost, m_this.textboxAmount);
            m_this.release();
        }

        this.onPassClicked = function (event) {
            Main.playSound("openToHumanv1")

            m_this.marco("onPayOffLoanCanceled");
            m_this.release();
        }
        this.onUpClicked = function (event) {
            Main.playSound("openToHumanv1")
            if (isNaN(m_this.textboxAmount)) {
                m_this.borrowAmount.html.value = 1000;
            }
            else {
                m_this.textboxAmount = (Math.round((m_this.textboxAmount) / 1000) * 1000);

                if (Math.floor(m_this.textboxAmount) < m_cost) {
                    m_this.textboxAmount = (m_this.textboxAmount) + 1000;
                    if (m_this.textboxAmount > m_cash) {
                        m_this.textboxAmount = m_cash;
                    }
                }
                m_repayAmount = m_this.textboxAmount;
            }
        }
        this.onDownClicked = function (event) {

            Main.playSound("openToHumanv1")

            if (isNaN(m_this.textboxAmount)) {
                m_this.borrowAmount.html.value = 1000;
            }
            else {
                m_this.textboxAmount = (Math.round((m_this.textboxAmount) / 1000) * 1000);
                if (Math.floor(m_this.textboxAmount) > 1000) {
                    m_this.textboxAmount = (m_this.textboxAmount) - 1000;
                } else {
                    m_this.textboxAmount = 1000;
                }
                m_repayAmount = m_this.textboxAmount;
            }
        }

        Object.defineProperties(this, {
            textboxAmount: {
                get: function () {
                    if (m_this.borrowAmount) { return Math.floor(parseInt(m_this.borrowAmount.html.value)); }
                    else {
                        return -1;
                    }
                },
                set: function (value) {
                    if (m_this.borrowAmount) { m_this.borrowAmount.html.value = value; }
                }
            },
            min: { value: 1000, writable: false },
            max: { value: 9999000, writable: false }
        })
    }
    return PayOffLoanCard;
})()
var PickLoanCard = (function () {

    inherit(PickLoanCard, CardElement);

    function PickLoanCard() {
        var m_this = this;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {

            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {



            //get the player color
            var color = Colors.getCurrentPlayerColor()

            var config = new CardConfig();

            config.cardTitle = {
                text: Data.getVocab("payoffLoanCard", "title"),
                color: color
            };
            config.cardDescription = {
                text: Data.getVocab("payoffLoanCard", "copy1")
            };
            config.passButton = {
                text: Data.getVocab("cancel", "copy"),
                color: color
            };
            config.cardDropDown = {
                color: color
            };
            config.card = true;
            config.cardSymbol = {
                sprite: 'icon_popup_repay',
                color: color
            }

            this.configure(config);

            if (this.passButton) {
                this.passButton.transform.on('click', this.onPassClicked);
            }

            if (Main.gameSession.isMyTurn) {
                this.marco("onSetupClickListenersOnLiabityItems");
            }
        }

        this.onPassClicked = function (event) {
            Main.playSound("openToHumanv1")

            m_this.marco("onPickLoanCanceled")
            m_this.release();
        }
    }
    return PickLoanCard;
})()
var PropertyBigDealCard = (function () {

    inherit(PropertyBigDealCard, CardElement);

    function PropertyBigDealCard() {
        CardElement.call(this);

        var m_this = this;
        this.setup = function (cardData) {

            
            //get the player color
            var color = Colors.getCurrentPlayerColor();

            var config = new CardConfig();
            config.buyButton = {
                text: Data.getVocab("buy", "copy"),
                color: color
            };
            config.passButton = {
                text: Data.getVocab("pass", "copy"),
                color: color
            };
            config.cardDropDown = {
                color: color
            };
            config.card = true;
            config.cardSymbol = {
                sprite: 'icon_popup_bgDeal',
                color: color
            }
            config.cardTitle = {
                text: cardData.title, 
                color: color
            };
            config.cardDescription = {
                text: cardData.copy1,
            };
            config.cardInformation = {
                text: Data.getVocab("cost", "copy") +
                    MathHelper.formatNumber(cardData.cost) + translations[language]["currency"] + "\n" +
                    Data.getVocab("cashflow", "copy") +
                    MathHelper.formatNumber(cardData.cashflow) + translations[language]["currency"] + "\n" +
                    Data.getVocab("downpay", "copy") +
                    MathHelper.formatNumber(cardData.downpay) + translations[language]["currency"]
                // color: "black"
            };

            this.configure(config);
            
            if(this.buyButton) {this.buyButton.transform.on('click', this.onBuyClicked);}
            if(this.passButton) {this.passButton.transform.on('click', this.onPassClicked);}
        }

        this.onBuyClicked = function (event) {
            Main.playSound("openToHumanv1")
            
            m_this.marco("onAttemptDealPurchase");
            m_this.release();
        }

        this.onPassClicked = function (event) {
            Main.playSound("openToHumanv1")
            
            m_this.marco("onShowEndCard");
            m_this.release();
        }
    }
    return PropertyBigDealCard;
})();
var PropertySmallDealCard = (function () {

    inherit(PropertySmallDealCard, CardElement);

    function PropertySmallDealCard() {
        CardElement.call(this);

        var m_this = this;
        this.setup = function (cardData) {

            
            //get the player color
            var color = Colors.getCurrentPlayerColor()

            var config = new CardConfig();
            config.buyButton = {
                text: Data.getVocab("buy", "copy"),
                color: color
            };
            config.passButton = {
                text: Data.getVocab("pass", "copy"),
                color: color
            };
            config.cardDropDown = {
                color: color
            };
            config.card = true;
            config.cardSymbol = {
                sprite: 'icon_popup_smDeal',
                color: color
            }
            config.cardTitle = {
                text: cardData.title, // this is the logic...
                color: color
            };
            config.cardDescription = {
                text: cardData.copy1
            };
            config.cardInformation = {
                text: Data.getVocab("cost", "copy") +
                    MathHelper.formatNumber(cardData.cost) + translations[language]["currency"] + "\n" +
                    Data.getVocab("cashflow", "copy") +
                    MathHelper.formatNumber(cardData.cashflow) + translations[language]["currency"] + "\n" +
                    Data.getVocab("downpay", "copy") +
                    MathHelper.formatNumber(cardData.downpay) + translations[language]["currency"]
            };

            this.configure(config);
            
            if(this.buyButton){
                this.buyButton.transform.on('click', this.onBuyClicked);
            }
            if(this.passButton){
                this.passButton.transform.on('click', this.onPassClicked);
            }
        }

        this.onBuyClicked = function (event) {
            Main.playSound("openToHumanv1")
            
            m_this.marco("onAttemptDealPurchase");
            m_this.release();
        }

        this.onPassClicked = function (event) {
            Main.playSound("openToHumanv1")
            
            m_this.marco("onShowEndCard");
            m_this.release();
        }
    }


    return PropertySmallDealCard;
})();
var SkipTurnCard = (function () {

    inherit(SkipTurnCard, CardElement);

    function SkipTurnCard() {
        var m_this = this;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            
            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {
            

            
            var color = Colors.getCurrentPlayerColor()

            var config = new CardConfig();
            config.buyButton = {
                text: Data.getVocab("ok", "copy"),
                color: color
            };
            config.cardDropDown = {
                color: color
            };
            config.card = true;
            config.cardSymbol = {
                sprite: 'icon_popup_skipturn',
                color: color
            }
            config.cardTitle = {
                text: Data.getVocab("skipTurnCard", "title"),
                color: color
            };
            config.cardDescription = {
                text: Main.gameSession.getCurrentPlayerBlob().name + Data.getVocab("skipTurnCard", "copy1"),
            };


            this.configure(config);
            
            if (this.buyButton) { this.buyButton.transform.on('click', this.onOkClicked); }
        }

        this.onOkClicked = function (event) {
            Main.playSound("openToHumanv1")
            
            m_this.marco("onSkipTurnOkClicked")
            m_this.release();
        }
    }
    return SkipTurnCard;
})()
var SpecialDoodadCard = (function () {

    inherit(SpecialDoodadCard, CardElement);

    function SpecialDoodadCard() {
        var m_this = this;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            
            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {
            

            
            //get the player color
            var color = Colors.getCurrentPlayerColor()

            var config = new CardConfig();

            if (Main.gameSession.getCurrentPlayerBlob().cash > cardData.cost) {
                config.buyButton = {
                    text: Data.getVocab("pay", "copy"),
                    color: color
                };
            }

            if (cardData.title === "New Boat") {
                config.passButton = {
                    text: Data.getVocab("loan", "copy"),
                    color: color
                };
            }
            else {
                config.passButton = {
                    text: Data.getVocab("credit", "copy"),
                    color: color
                };
            }

            config.cardDropDown = {
                color: color
            };

            config.card = true;
            config.cardSymbol = {
                sprite: 'icon_popup_dodad',
                color: color
            }
            config.cardTitle = {
                text: cardData.title,
                color: color
            };
            config.cardDescription = {
                text: Data.getVocab("doodadCard", "copy1") + MathHelper.formatNumber(cardData.cost) + translations[language]["currency"],
                color: color
            };
            config.cardInformation = {
                text: cardData.copy
            };

            this.configure(config);
            if (this.buyButton) { this.buyButton.transform.on('click', this.onPayClicked); }
            if (this.passButton) { this.passButton.transform.on('click', this.onLoanClicked); }
        }

        this.onPayClicked = function (event) {
            Main.playSound("openToHumanv1")
            
            m_this.marco("onDoodadPayClicked");
            m_this.release();
        }

        this.onLoanClicked = function (event) {
            Main.playSound("openToHumanv1")
            
            m_this.marco("onDoodadLoanNeeded");
            m_this.release();
        }
    }
    return SpecialDoodadCard;
})()
var SpecialStockCard = (function () {

    inherit(SpecialStockCard, CardElement);

    function SpecialStockCard() {
        CardElement.call(this);

        var m_this = this;
        
        this.setup = function (cardData) {

            
            //get the player color
            var color = Colors.getCurrentPlayerColor()

            //TODO: highlight all the stocks that pertain to this current stock type "key"

            var config = new CardConfig();
            config.passButton = {
                text: Data.getVocab("ok", "copy"),
                color: color
            };
            config.cardDropDown = {
                color: color
            };
            config.card = true;
            config.cardSymbol = {
                sprite: 'icon_popup_smDeal',
                color: color
            }
            config.cardTitle = {
                text: cardData.title, // this is the logic...
                color: color
            };
            config.cardDescription = {
                text: cardData.copy1
            };
            var s = null;
            if(cardData.cost === -1){
                s = Data.getVocab("stockSpecialCard", "copy1");
            }
            else if(cardData.cost === -2){
                s = Data.getVocab("stockSpecialCard", "copy2");
            }
            config.cardInformation = {
                text: s
            };

            this.configure(config);
            if(this.passButton){ this.passButton.transform.on('click', this.onOkClicked); }
        }

        this.onOkClicked = function (event) {
            Main.playSound("openToHumanv1")
            
            m_this.marco("onSpecialStockCardClicked");
            m_this.release();
        }
    }
    return SpecialStockCard;
})();
var StartTurnCard = (function () {
	inherit(StartTurnCard, CardElement);

	function StartTurnCard() {
		var m_this = this;

		CardElement.call(this);

		var base_onCreate = this.onCreate;
		this.onCreate = function () {

			if (base_onCreate) base_onCreate.call(this);
		};

		this.setup = function (cardData) {



			//get the player color
			var color = Colors.getCurrentPlayerColor();

			var config = new CardConfig();
			config.cardDropDown = {
				color: color
			};
			config.card = true;
			config.cardSymbol = {
				sprite: "icon_beginturn",
				color: color
			};
			config.cardTitle = {
				text:
					Main.gameSession.getCurrentPlayerBlob().name +
					Data.getVocab("turn", "copy"),
				color: color
			};

			//TODO: if fast track
			// config.cardInformation = {
			//     text: Data.getVocab("startTurnCard", "copy7"),
			// };

			var currentBlob = Main.gameSession.getCurrentPlayerBlob();
			if (currentBlob.charityCount > 0) {
				//TODO: add fast track check to roll 3 dice

				if (currentBlob.fastTrack) {

					config.cardDescription = {
						text:
							Data.getVocab("startTurnCard", "copy3") +
							"\n" +
							Data.getVocab("startTurnCard", "copy35")
					};

					config.buyButton = {
						color: color,
						text: "1 " + Data.getVocab("startTurnCard", "copy5")
					};
					config.sellButton = {
						color: color,
						text: "2 " + Data.getVocab("startTurnCard", "copy55")
					};
					config.passButton = {
						color: color,
						text: "3 " + Data.getVocab("startTurnCard", "copy55")
					};

				} else {
					//rat race
					config.buyButton = {
						color: color,
						text: "1 " + Data.getVocab("startTurnCard", "copy5")
					};

					config.sellButton = {
						color: color,
						text: "2 " + Data.getVocab("startTurnCard", "copy55")
					};

					config.cardDescription = {
						text:
							Data.getVocab("startTurnCard", "copy4") +
							"\n" +
							Data.getVocab("startTurnCard", "copy45")
						// color: "black"
					};
				}
			} else {
				config.buyButton = {
					color: color,
					text: Data.getVocab("startTurnCard", "copy6")
				};
				config.cardDescription = {
					text: Data.getVocab("startTurnCard", "copy2")
				};
			}

			if (currentBlob.fastTrack) {
				config.cardInformation = {
					text: Data.getVocab("startTurnCard", "copy7")
				};

			} else {

				config.cardInformation = {
					text: Data.getVocab("startTurnCard", "copy1")
				};

				config.repayButton = {
					text: Data.getVocab("statementWidget", "repay")
				};

				config.borrowButton = {
					text: Data.getVocab("statementWidget", "borrow")
				};
			}

			this.configure(config);
			if (this.buyButton) {
				this.buyButton.transform.on("click", this.onRollOneClicked);
			}

			if (this.sellButton) {
				this.sellButton.transform.on("click", this.onRollTwoClicked);
			}

			if (this.passButton) {
				this.passButton.transform.on("click", this.onRollThreeClicked);
			}

			if (this.repayButton) {
				this.repayButton.transform.on("click", this.onRepayClicked);
			}

			if (this.borrowButton) {
				this.borrowButton.transform.on("click", this.onBorrowClicked);
			}
		};

		this.onRollOneClicked = function (event) {
			Main.playSound("diceRoll");

			m_this.marco("onRollTurnDice", 1);
			m_this.release();
		};

		this.onRollTwoClicked = function (event) {
			Main.playSound("diceRoll");

			m_this.marco("onRollTurnDice", 2);
			m_this.release();
		};

		this.onRollThreeClicked = function (event) {
			Main.playSound("diceRoll");

			m_this.marco("onRollTurnDice", 3);
			m_this.release();
		};

		this.onRepayClicked = function (event) {
			Main.playSound("openToHumanv1");

			m_this.marco("onRepayClicked", "StartTurnCard");
			m_this.release();
		};

		this.onBorrowClicked = function (event) {
			Main.playSound("openToHumanv1");

			m_this.marco("onShowBorrowCardStartTurn");
			m_this.release();
		};
	}
	return StartTurnCard;
})();

var StockBuyCard = (function () {

    inherit(StockBuyCard, CardElement);

    function StockBuyCard() {
        var m_this = this;
        var m_cost = null;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {


            if (base_onCreate) base_onCreate.call(this);
            this.polo("updateAmount", onUpdateAmount);
        }

        this.setup = function (cardData) {




            m_cost = cardData.cost;

            //get the player color
            var color = Colors.getCurrentPlayerColor()

            var config = new CardConfig();
            config.card = true;
            config.buyButton = {
                text: Data.getVocab("buy", "copy"),
                color: color
            };
            config.passButton = {
                text: Data.getVocab("cancel", "copy"),
                color: color
            };
            config.cardDropDown = {
                color: color
            };
            config.cardSymbol = {
                sprite: 'icon_popup_smDeal',
                color: color
            }
            config.cardTitle = {
                text: cardData.title,
                color: color
            };
            config.cardDescription = {
                text: cardData.copy1
            };
            config.buySharesTitle = {
                text: Data.getVocab("stockBuyCard", "copy1"),
            };
            config.buySharesAmount = {
                text: '1'
            };
            config.upbtn = true;
            config.downbtn = true;

            config.stockCostTitle = {
                text: Data.getVocab("stockBuyCard", "copy2"),
            };
            config.stockCostAmount = {
                text: translations[language]["currency2"] + cardData.cost + translations[language]["currency"]
            };

            var count = 0;
            if (Main.gameSession.isParticipating()) {
                count = Main.gameSession.playerData.getStockAmount(cardData.key);
            }
            config.cardInformation = {
                text: Data.getVocab("cost", "copy") + MathHelper.formatNumber(cardData.cost) + translations[language]["currency"] + "\n" +
                    Data.getVocab("cashflow", "copy") + MathHelper.formatNumber(cardData.cashflow) + translations[language]["currency"] + "\n" +
                    cardData.traderange + "\n" +
                    Data.getVocab("shares", "copy") + " " + MathHelper.formatNumber(count)
            };

            this.configure(config);

            if (this.buyButton) { this.buyButton.transform.on('click', this.onBuyClicked); }
            if (this.passButton) { this.passButton.transform.on('click', this.onPassClicked); }
            if (this.upbtn) { this.upbtn.on('click', this.onUpClicked); }
            if (this.downbtn) { this.downbtn.on('click', this.onDownClicked); }

            if (m_this.buySharesAmount) {
                m_this.buySharesAmount.html.addEventListener('input', onTextInput);
            }
        }

        function onTextInput(evt) {
            checkInputAmount(this.value)
        };

        function checkInputAmount(a) {
            var amount = a;
            if (amount < m_this.min) m_this.textboxAmount = m_this.min;
            else if (amount > m_this.max) m_this.textboxAmount = m_this.max;
            m_this.stockCostAmount.text = translations[language]["currency2"] + MathHelper.formatNumber((m_this.textboxAmount) * parseInt(m_cost)) + translations[language]["currency"];
        }

        this.onBuyClicked = function (event) {
            Main.playSound("openToHumanv1")
            var amount = m_this.textboxAmount;
            if (amount < m_this.min) m_this.textboxAmount = m_this.min;
            else if (amount > m_this.max) m_this.textboxAmount = m_this.max;

            m_this.marco("onAttemptDealPurchase", m_this.textboxAmount);
            if (m_this.buySharesAmount) {
                m_this.buySharesAmount.html.removeEventListener('input', onTextInput);
            }
            m_this.release();
        }

        this.onPassClicked = function (event) {
            Main.playSound("openToHumanv1")

            m_this.marco("onShowStockCard");
            if (m_this.buySharesAmount) {
                m_this.buySharesAmount.html.removeEventListener('input', onTextInput);
            }
            m_this.release();
        }

        this.onUpClicked = function (event) {
            Main.playSound("openToHumanv1")

            if ((m_this.textboxAmount) < m_this.max) {
                m_this.textboxAmount = (m_this.textboxAmount) + 1;
            } else {
                m_this.textboxAmount = 99999;
            }
            m_this.stockCostAmount.text = translations[language]["currency2"] + MathHelper.formatNumber((m_this.textboxAmount) * parseInt(m_cost)) + translations[language]["currency"];

        }
        this.onDownClicked = function (event) {
            Main.playSound("openToHumanv1")

            if ((m_this.textboxAmount) > m_this.min) {
                m_this.textboxAmount = (m_this.textboxAmount) - 1;
            } else {
                m_this.textboxAmount = 1;
            }
            m_this.stockCostAmount.text = translations[language]["currency2"] + MathHelper.formatNumber((m_this.textboxAmount) * parseInt(m_cost)) + translations[language]["currency"];
        }

        Object.defineProperties(this, {
            textboxAmount: {
                get: function () {
                    if (m_this.buySharesAmount) {
                        return parseInt(m_this.buySharesAmount.html.value);
                    }
                    else {
                        return -1;
                    }
                },
                set: function (value) { m_this.buySharesAmount.html.value = value; }
            },
            min: { value: 1, writable: false },
            max: { value: 99999, writable: false }
        })

        function onUpdateAmount() {
            m_this.stockCostAmount.text = translations[language]["currency2"] + MathHelper.formatNumber((m_this.textboxAmount) * parseInt(m_cost)) + translations[language]["currency"];
        }
    }
    return StockBuyCard;
})()
var StockCard = (function () {

    inherit(StockCard, CardElement);

    function StockCard() {
        var m_this = this;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            Main.playSound("openToHumanv2")

            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {



            var color = Colors.getCurrentPlayerColor()

            var config = new CardConfig();

            // if this is a queued carddon't show buy
            // if this is 

            var queued = Main.gameSession.getCurrentPlayerBlob().inQueue;

            if (queued == false || (queued && cardData.type == DeckCardTypes.smalldeal_anystock)) {
                config.buyButton = {
                    text: Data.getVocab("buy", "copy"),
                    color: color
                };
            }
            config.passButton = {
                text: Data.getVocab("pass", "copy"),
                color: color
            };

            //TODO: this is a queue card do we want to do that check here or just make a new StockCardQueue
            //TODO: loop thru stocks and get the player's count for the stock with this cardData.key 
            var count = 0;
            if (Main.gameSession.isParticipating()) {
                count = Main.gameSession.playerData.getStockAmount(cardData.key);
            }
            if (count > 0) {
                config.sellButton = {
                    text: Data.getVocab("sell", "copy"),
                    color: color
                };
            }

            config.cardDropDown = {
                color: color
            };
            config.card = true;
            config.cardSymbol = {
                sprite: 'icon_popup_smDeal',
                color: color
            }
            config.cardTitle = {
                text: cardData.title,
                color: color
            };
            config.cardDescription = {
                text: cardData.copy1
            };
            config.cardInformation = {
                text: Data.getVocab("cost", "copy") + MathHelper.formatNumber(cardData.cost) + translations[language]["currency"] + "\n" +
                    Data.getVocab("cashflow", "copy") + MathHelper.formatNumber(cardData.cashflow) + translations[language]["currency"] + "\n" +
                    cardData.traderange + "\n" +
                    Data.getVocab("shares", "copy") + ' ' + MathHelper.formatNumber(count)
            };

            this.configure(config);

            if (this.buyButton) { this.buyButton.transform.on('click', this.onBuyClicked); }
            if (this.passButton) { this.passButton.transform.on('click', this.onPassClicked); }
            if (this.sellButton) { this.sellButton.transform.on('click', this.onSellClicked); }
        }

        this.onBuyClicked = function (event) {
            Main.playSound("openToHumanv1")

            m_this.marco("onShowStockBuyCard");
            m_this.release();
        }

        this.onSellClicked = function (event) {
            Main.playSound("openToHumanv1")

            m_this.marco("onShowStockSellCard");
            m_this.release();
        }

        this.onPassClicked = function (event) {
            Main.playSound("openToHumanv1")

            m_this.marco("onShowEndCard");
            m_this.release();
        }
    }
    return StockCard;
})()
var StockSellCard = (function () {

    inherit(StockSellCard, CardElement);

    function StockSellCard() {
        var m_this = this;
        var m_count = 0;
        var m_cost = null;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            if (base_onCreate) base_onCreate.call(this);
            this.polo("updateAmount", onUpdateAmount);
        }

        this.setup = function (cardData) {

            //get the player color

            var color = Colors.getCurrentPlayerColor()

            //TODO:loop thru the stock array and add to the count any stock of cardData.key

            if (Main.gameSession.isParticipating()) {
                m_count = Main.gameSession.playerData.getStockAmount(cardData.key); //set this equal to the amount
            }
            
            m_cost = cardData.cost;

            var config = new CardConfig();
            config.buyButton = {
                text: Data.getVocab("sell", "copy"),
                color: color
            };
            config.passButton = {
                text: Data.getVocab("cancel", "copy"),
                color: color
            };
            config.cardDropDown = {
                color: color
            };
            config.card = true;
            config.cardSymbol = {
                sprite: 'icon_popup_smDeal',
                color: color
            }
            config.cardTitle = {
                text: cardData.title,
                color: color
            };
            config.cardDescription = {
                text: cardData.copy1
            };

            Data.vocab().cost.copy
            config.cardInformation = {
                text:
                    Data.vocab().cost.copy + MathHelper.formatNumber(cardData.cost) + translations[language]["currency"] + "\n" +
                    Data.vocab().cashflow.copy + MathHelper.formatNumber(cardData.cashflow) + translations[language]["currency"] + "\n" +
                    cardData.traderange + "\n" +
                    Data.vocab().shares.copy + " " + MathHelper.formatNumber(m_count)
            };
            config.buySharesTitle = {
                text: Data.getVocab("stockSellCard", "copy1"),
            };

            //config.borrowAmount = {
            //  text: m_count
            // };

            config.stockCostTitle = {
                text: Data.getVocab("stockSellCard", "copy2")
            };
            config.stockCostAmount = {
                text: translations[language]["currency2"] + MathHelper.formatNumber(cardData.cost * m_count) + translations[language]["currency"]
            };
            config.buySharesAmount = {
                text: m_count
            };

            config.upbtn = true; //up button to change amount in increments of 1000
            config.downbtn = true; //down button to change amount in increments of 1000

            this.configure(config);

            if (this.buyButton) { this.buyButton.transform.on('click', this.onSellClicked); }
            if (this.passButton) { this.passButton.transform.on('click', this.onCancelClicked); }
            if (this.upbtn) { this.upbtn.on('click', this.onUpClicked); }
            if (this.downbtn) { this.downbtn.on('click', this.onDownClicked); }

            if (m_this.buySharesAmount) {
                m_this.buySharesAmount.html.addEventListener('input', onTextInput);
            }
        }

        function onTextInput(evt) {
            checkInputAmount(this.value)
        };

        function checkInputAmount(a) {
            var amount = a;
            if (amount < m_this.min) m_this.textboxAmount = m_this.min;
            else if (amount > m_count) m_this.textboxAmount = m_count;
            m_this.stockCostAmount.text = translations[language]["currency2"] + MathHelper.formatNumber((m_this.textboxAmount) * parseInt(m_cost)) + translations[language]["currency"];
        }

        this.onSellClicked = function (event) {
            Main.playSound("openToHumanv1")
            var amount = m_this.textboxAmount;
            if (amount < m_this.min) m_this.textboxAmount = m_this.min;
            else if (amount > m_count) m_this.textboxAmount = m_count;

            m_this.marco("onAttemptDealPurchase", -m_this.textboxAmount);
            if (m_this.buySharesAmount) {
                m_this.buySharesAmount.html.removeEventListener('input', onTextInput);
            }
            m_this.release();
        }
        this.onCancelClicked = function (event) {
            Main.playSound("openToHumanv1")
            m_this.marco('onShowStockCard');
            if (m_this.buySharesAmount) {
                m_this.buySharesAmount.html.removeEventListener('input', onTextInput);
            }
            m_this.release();
        }
        this.onUpClicked = function (event) {
            Main.playSound("openToHumanv1")

            if (Math.floor(m_this.textboxAmount) < m_count) {
                m_this.textboxAmount = parseInt(m_this.textboxAmount) + 1;
            } else {
                m_this.textboxAmount = m_count;
            }
            m_this.stockCostAmount.text = translations[language]["currency2"] + MathHelper.formatNumber((m_this.textboxAmount) * parseInt(m_cost)) + translations[language]["currency"];
        }
        this.onDownClicked = function (event) {
            Main.playSound("openToHumanv1")

            if (Math.floor(m_this.textboxAmount) > m_this.min) {
                m_this.textboxAmount = parseInt(m_this.textboxAmount) - 1;
            } else {
                m_this.textboxAmount = 1;
            }
            m_this.stockCostAmount.text = translations[language]["currency2"] + MathHelper.formatNumber((m_this.textboxAmount) * parseInt(m_cost)) + translations[language]["currency"];

        }

        Object.defineProperties(this, {
            textboxAmount: {
                get: function () {
                    if (m_this.buySharesAmount) {
                        return parseInt(m_this.buySharesAmount.html.value);
                    }
                    else {
                        return -1;
                    }
                },
                set: function (value) { m_this.buySharesAmount.html.value = value; }
            },
            min: { value: 1, writable: false },
            max: { value: 99999, writable: false }
        })

        function onUpdateAmount() {
            m_this.stockCostAmount.text = translations[language]["currency2"] + MathHelper.formatNumber((m_this.textboxAmount) * parseInt(m_cost)) + translations[language]["currency"];
        }
    }
    return StockSellCard;
})()
var TaxCard = (function () {

    inherit(TaxCard, CardElement);

    function TaxCard() {
        var m_this = this;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            Main.playSound("taxAuditLand");
            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (cardData) {
            

            
            //get the player color
            var color = Colors.getCurrentPlayerColor()

            var config = new CardConfig();
            config.buyButton = {
                text: Data.getVocab("ok", "copy"),
                color: color
            };
            // config.passButton = {
            //     text: Data.getVocab("TaxCard", "copy3"),
            //     color: color
            // };
            config.cardDropDown = {
                color: color
            };
            config.card = true;
            // config.queueTop = {
            //     text: "this is a queue",
            //     color: color,
            //     template: "sellText"
            // };
            config.cardSymbol = {
                sprite: 'icon_popup_tax_audit',
                color: color
            }
            config.cardTitle = {
                text: Data.getVocab("losecashCard", "tax"),
                color: color
            };
            config.cardDescription = {
                text: Data.getVocab("losecashCard", "copy1")
                // color: "black"
            };


            config.cardInformation = {
                text: ""
            };

            this.configure(config);
            
            if (this.buyButton) { this.buyButton.transform.on('click', this.onBuyClicked); }
        }

        this.onBuyClicked = function (event) {
            Main.playSound("openToHumanv1");
            m_this.marco("onTaxClicked");
            m_this.release();
        }
    }




    // ////scene.gotoTemplate("losecash");
    // 		scene.cardDropDown.image.color = link.player.color;// = Constants.BLUE;
    // 		scene.cardInformation.text = "";
    // 		scene.buyText.text = Vocab.copy("ok","copy");

    // 		if(displayedType == "tax")
    // 			scene.cardSymbol.gotoAndStop("audit");
    // 		else if(displayedType == "lawsuit")
    // 			scene.cardSymbol.gotoAndStop("lawsuit");
    // 		else 
    // 			scene.cardSymbol.gotoAndStop("divorce");

    // 		enableButton("buy");
    // 		disableButton("sell");
    // 		disableButton("pass");
    // 	}


    return TaxCard;
})()
var WinDreamCard = (function () {

    inherit(WinDreamCard, CardElement);

    function WinDreamCard() {
        var m_this = this;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {

            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (playerIndex) {

            //get the player color
            var currentColor = Colors.getCurrentPlayerColor()
            var myColor = Colors.getLocalPlayerColor();

            var winner = Main.gameSession.getPlayerBlobByIndex(playerIndex);
            var dreamData = Data.getDream(winner.dreamId);

            var config = new CardConfig();
            config.everyoneButtons = true;
            config.buyButton = {
                text: Data.getVocab("quit", "copy"),
                color: currentColor
            };
            // config.passButton = {
            //     text: Data.getVocab("cancel", "copy"),
            // };
            config.cardDropDown = {
                color: currentColor
            };
            config.card = true;
            // config.queueTop = {
            //     text: "this is a queue",
            //     color: color,
            //     template: "sellText"
            // };
            config.cardSymbol = {
                sprite: dreamData.icon,
                sheet: "fastTrackSheet",
                color: currentColor
            }
            config.cardTitle = {
                text: winner.name + Data.getVocab("winDreamCard", "title"),
                color: currentColor
            };
            config.cardDescription = {
                text: winner.name + Data.getVocab("winDreamCard", "copy1"),
            };
            // config.cardInformation = {
            //     text: ""
            // };


            this.configure(config);

            if (this.buyButton) { this.buyButton.transform.on('click', this.onBuyClicked); }
        }

        this.onBuyClicked = function (event) {
            Main.playSound("openToHumanv1");
            Main.logic.exitGame();
        }
    }


    //     onSetCardClickable(true);
    //     //scene.gotoTemplate("win");

    //     if(spectate)
    //     {
    //         scene.cardTitle.text = winner + Vocab.copy("winwinDreamCard","title");
    //         scene.cardDescription.text = winner + Vocab.copy("winwinDreamCard","copy1");
    //         scene.cardInformation.text  = "";
    //     }
    //     else
    //     {
    //         scene.cardTitle.text = link.player.playerName + Vocab.copy("winwinDreamCard","title");
    //         scene.cardDescription.text = link.player.playerName + Vocab.copy("winwinDreamCard","copy1");
    //         scene.cardInformation.text  = "";
    //     }

    //     scene.buyText.text = Vocab.copy("quit","copy");

    //     enableButton("buy");
    //     disableButton("sell");
    //     disableButton("pass");

    //     scene.buySharesTitle.detach();
    //     scene.buySharesAmount.detach();

    //     scene.stockCostTitle.detach();
    //     scene.stockCostAmount.detach();
    //     //scene.borrowAmountZeros.detach();
    //     scene.borrowAmount.detach();

    //     scene.cardSymbol.gotoAndStop(link.player.winDream);
    // }


    return WinDreamCard;
})()
var WinPassiveCard = (function () {

    inherit(WinPassiveCard, CardElement);

    function WinPassiveCard() {
        var m_this = this;

        CardElement.call(this);

        var base_onCreate = this.onCreate;
        this.onCreate = function () {
            
            if (base_onCreate) base_onCreate.call(this);
        }

        this.setup = function (playerIndex) {
            
            //get the player color
            var currentColor = Colors.getCurrentPlayerColor();
            var myColor = Colors.getLocalPlayerColor();
            var winner = Main.gameSession.getPlayerBlobByIndex(playerIndex);

            var config = new CardConfig();
            config.everyoneButtons = true;
            config.buyButton = {
                text: Data.getVocab("quit", "copy"),
                color: currentColor
            };
            // config.passButton = {
            //     text: Data.getVocab("cancel", "copy"),
            // };
            config.cardDropDown = {
                color: currentColor
            };
            config.card = true;
            // config.queueTop = {
            //     text: "this is a queue",
            //     color: color,
            //     template: "sellText"
            // };
            config.cardSymbol = {
                sprite: 'icon_popup_bgDeal',
                color: currentColor
            }
            config.cardTitle = {
                text: winner.name + Data.getVocab("winPassiveCard", "title"),
                color: currentColor
            };
            config.cardDescription = {
                text: winner.name + Data.getVocab("winPassiveCard", "copy1"),
                // color: "black"
            };

            this.configure(config);
            
            if (this.buyButton) { this.buyButton.transform.on('click', this.onBuyClicked); }
        }

        this.onBuyClicked = function (event) {
            Main.playSound("openToHumanv1");
            Main.logic.exitGame();
        }
    }


    // public function $winPassiveCard_onEnter():void
    // {
    //     onSetCardClickable(true);

    //     //scene.gotoTemplate("win");

    //  

    //     if(spectate)
    //     {	

    //         scene.cardTitle.text = winner + Vocab.copy("winPassiveCard","title");
    //         scene.cardDescription.text = winner + Vocab.copy("winPassiveCard","copy1");
    //         scene.cardInformation.text  = "";
    //     }
    //     else
    //     {
    //         scene.cardTitle.text = link.player.playerName + Vocab.copy("winPassiveCard","title");
    //         scene.cardDescription.text = link.player.playerName + Vocab.copy("winPassiveCard","copy1");
    //         scene.cardInformation.text  = "";
    //     }

    //     scene.buyText.text = Vocab.copy("quit","copy");

    //     enableButton("buy");
    //     disableButton("sell");
    //     disableButton("pass");

    //     scene.buySharesTitle.detach();
    //     scene.buySharesAmount.detach();

    //     scene.stockCostTitle.detach();
    //     scene.stockCostAmount.detach();
    //     //scene.borrowAmountZeros.detach();
    //     scene.borrowAmount.detach();

    //     scene.cardSymbol.gotoAndStop("bigDeal");
    // }


    return WinPassiveCard;
})()
function Career() {
    this.careerTitle = null;
    this.childPerExpense = null;
    this.savings = null;
    this.salary = null;

    /** @type {CustomDebt[]} */
    this.debts = [];

    this.fromFirebase = function (o) {
        this.careerTitle = o.careerTitle;
        this.careerGenitive = o.careerGenitive
        this.childPerExpense = o.childPerExpense;
        this.savings = o.savings;
        this.salary = o.salary;

        this.debts = [];
        (function () {
            if (!o.debts) { return; }
            for (var i = 0; i < o.debts.length; i++) {
                var d = o.debts[i];
                this.debts.push(new CustomDebt(d.id, d.expense, d.liability));
            }
        }).call(this);
    }

    this.fromData = function (o) {
        this.careerTitle = o.careerTitle;
        this.careerGenitive = o.careerGenitive
        this.childPerExpense = o.childPerExpense;
        this.savings = o.savings;
        this.salary = o.salary;

        this.debts = [
            new CustomDebt("taxes", o.taxes, 0),
            new CustomDebt("home", o.mortgagePayment, o.mortgageLiability),
            new CustomDebt("carloan", o.carLoanPayment, o.carLoanLiability),
            new CustomDebt("creditcard", o.creditCardPayment, o.creditCardLiability),
            new CustomDebt("retail", o.retailPayment, o.retailDebtLiability),
            new CustomDebt("other", o.otherExpenses, 0),
        ];
    }
}

Career.fromFirebase = function (o) {
    var career = new Career();
    career.fromFirebase(o);
    return career;
}

Career.fromData = function (o) {
    var career = new Career();
    career.fromData(o);
    return career;
}

// var firebaseTest = { "childPerExpense": 380, "debts": [{ "expense": 1830, "id": "taxes", "liability": 0 }, { "expense": 1100, "id": "home", "liability": 115000 }, { "expense": 220, "id": "carloan", "liability": 11000 }, { "expense": 180, "id": "creditcard", "liability": 6000 }, { "expense": 50, "id": "retail", "liability": 1000 }, { "expense": 1650, "id": "other", "liability": 0 }], "salary": 7500, "savings": 400, "title": "Lawyer" };
// var jstest = { "title": "Lawyer", "salary": 7500, "taxes": 1830, "mortgagePayment": 1100, "schoolLoanPayment": 390, "carLoanPayment": 220, "creditCardPayment": 180, "retailPayment": 50, "otherExpenses": 1650, "savings": 400, "childPerExpense": 380, "mortgageLiability": 115000, "schoolLoanLiability": 78000, "carLoanLiability": 11000, "creditCardLiability": 6000, "retailDebtLiability": 1000 }

// console.log("career firebaseTest", Career.fromFirebase(firebaseTest));
// console.log("career jstest", Career.fromData(jstest));

function IFinancialAsset()
{
    this.type = "";
    this.key = "";
    this.cost = 0;  
    this.downpay = 0;
    this.quantity = 0;
    this.cashFlow = 0;
    this.highlight = true;
}
var Investment = (function() {

    function Investment(obj, amount) {
        obj = obj || {};
        this.type = obj.type;
		// this.key = obj.key;
        this.cost = obj.cost;
        this.title = obj.title;
        this.cashflow = obj.cashflow;
        this.quantity = amount;
        this.highlight = true;
        this.downpay = obj.downpay >= 0 ? obj.downpay : -1;
    }

    return Investment
})()
// literally everything, and it's all public.
function PlayerBlob() {

    /** @type {Boolean} */
    this.isActive = false;
    /** @type {Boolean} */
    this.isHost = false;
    /** @type {Boolean} */
    this.isReady = false;
    /** @type {string} */
    this.userId = null;
    /** @type {Number} */
    this.index = -1;
    /** @type {Number} */
    this.indexLobby = -1;
    /** @type {string} */
    this.name = null;
    /** @type {Number} */
    this.position = 16;
    // this.position = {fastTrack: false, index: 0};

    /** @type {string} */
    this.careerTitle = null;


    /** @type {string} */
    this.careerTitle = null;
    /** @type {string} */
    this.careerGenitive = null;
    /** @type {Number} */
    this.childPerExpense = null;
    /** @type {Number} */
    this.savings = null;
    /** @type {Number} */
    this.salary = null;
    /** @type {Number} */
    this.charityCount = 0;
    /** @type {Number} */
    this.downsizeCount = 0;
    /** 
     * 0, if not bankrupt
     * >0 for how many turns bankrupt
     * -1 if gameover
     * @type {Number} 
     */
    this.bankruptCount = 0;

    /** @type {Number} */
    this.passiveIncome = null;
    /** @type {Number} */
    this.totalExpenses = null;
    /** @type {Number} */
    this.winPassiveIncome = null;

    /** @type {Number} */
    this.cashflowRatio = null;

    /** @type {Number} */
    this.dreamId = -1;

    /** @type {Boolean} */
    this.fastTrack = false; // modifies cashflowratio when toggled to true  in GameSession.onEnterFastTrackClicked

    /** @type {CustomDebt[]} */
    this.debts = []; // modifies cashflowratio
    /** @type {Stocks[]} */
    this.stocks = []; // modifies cashflowratio
    /** @type {Property[]} */
    this.properties = []; // modifies cashflowratio
    /** @type {Investment[]} */
    this.investments = []; // modifies cashflowratio

    this.dreamWin = false;
    this.inQueue = false;

    this.dreamCostMultiplier = 1;

    /** @type {Number} */
    this.numberOfChildren = 0; // modifies cashflowratio

    /** @type {Number} */
    this.cash = 0;



    /**
     * a list of CardQueueItem s representing shared opportunity cards
     *  @type {CardData[]} 
     */
    this.cardQueue = [];
}

function CardData() {
    this.type = "";
    // this.title = "";
    // this.cost = 0;
    this.queued = false;
}

/**
 * some notes on cardQueues
 * 
 * some market and smalldeal cards can be queued
 * if your turn is skipped, you miss the opportunity
 * 
 * TODO: when skipping next player's turns, make sure to clear their entries from the queue if relevant
 * 
 */
function CardQueueItem(cardData) {
    this.cardData = cardData || null;
}

PlayerBlob.createFromCareerData = function (o) {
    var player = new PlayerBlob();
    player.careerGenitive = o.titleGenitive;
    player.careerTitle = o.title;
    player.childPerExpense = o.childPerExpense;
    player.savings = o.savings;
    player.salary = o.salary;

    player.cash = player.savings;
    player.debts = [
        new CustomDebt("taxes", o.taxes, 0),
        new CustomDebt("home", o.mortgagePayment, o.mortgageLiability),
        new CustomDebt("carloan", o.carLoanPayment, o.carLoanLiability),
        new CustomDebt("creditcard", o.creditCardPayment, o.creditCardLiability),
        new CustomDebt("retail", o.retailPayment, o.retailDebtLiability),
        new CustomDebt("other", o.otherExpenses, 0),
    ];

    return player;
}

/**
 * This should parse/copy all the things from a serialized firebase player object into a game-ready one.
 * @param {Object} o - firebase json format object containing all player data
 */
PlayerBlob.prototype.fromFirebase = function (o) {
    var self = this;

    var remoteKeys = Object.keys(o);
    var localKeys = Object.keys(self);
    //clear myself up
    localKeys.forEach(function (key) {
        if (self[key]) {
            // if (self[key].constructor.name === "Array") {
            if (self[key] instanceof Array) {
                self[key] = [];
                return;
            }
        }
        delete self[key];
    });

    remoteKeys.forEach(function (key) {
        if (key === "debts") {
            self.debts = [];
            o.debts.forEach(function (debt) {
                self.debts.push(applyProperties(new CustomDebt(), debt));
            })
        } else if (key === "properties") {
            self.properties = [];
            o.properties.forEach(function (property) {
                self.properties.push(applyProperties(new Property(), property));
            })
        } else if (key === "stocks") {
            self.stocks = [];
            o.stocks.forEach(function (stock) {
                self.stocks.push(applyProperties(new Stocks(), stock));
            })

        } else if (key === "investments") {
            self.investments = [];
            o.investments.forEach(function (investment) {
                self.investments.push(applyProperties(new Investment(), investment));
            })

        } else {
            self[key] = o[key]
        }
    });


    // //TODO: fill this out handling the rest of the player properties.

    // // var player = new PlayerBlob();
    // this.careerTitle = o.careerTitle;
    // this.childPerExpense = o.childPerExpense;
    // this.savings = o.savings;
    // this.salary = o.salary;

    // this.debts = [];
    // (function () {
    //     if (!o.debts) { return; }
    //     for (var i = 0; i < o.debts.length; i++) {
    //         var d = o.debts[i];
    //         this.debts.push(new CustomDebt(d.id, d.expense, d.liability));
    //     }
    // }).call(this);
}

PlayerBlob.createStub = function (index) {
    var stub = new PlayerBlob();
}

function applyProperties(dest, source) {
    Object.keys(source).forEach(function (key) {
        dest[key] = source[key];
    });

    return dest;
}

function CustomDebt(id, expense, liability) {
    this.id = id;
    this.expense = expense || 0;
    this.liability = liability || 0;
    this.fullAmountOnly = (id !== "loan");
    this.highlight = true;
}

var Property = (function() {

    function Property(obj, amount) {
        obj = obj || {};
        this.type = obj.type || null;
        this.key = obj.key || null;
        this.cost = obj.cost || null;
        this.title = obj.title || null;
        this.units = obj.units || null; // TODO: firebase doesn't like undefined default values
        this.cashflow = obj.cashflow || 0;
        this.quantity = amount;
        this.downpay =  obj.downpay >= 0 ? obj.downpay : -1;
        this.statement = obj.statement || null;
        this.mortgage = obj.mortgage || 0;
        this.highlight = true;
    }
    return Property
})()
/**
 * This is the model for the entire Room/Game
 */
function RoomBlob() {
    this.timeCreated = null;
    this.maxPlayers = -1;
    this.name = "";
    this.password = "";

    /** @type {PlayerBlob[]} */
    this.players = [];
    this.decks = {};
    /**
     * Array containing information for each space in the fasttrack (only investments & dreams)
     * investment spaces start with value -1, and when purchased
     *  get set to the player index who bought them.
     * Deprected: dream spaces start with value 0 and each time they are landed on
     *  the value is incremented
     */
    this.fastTrackSpaces = [];

    this.gameState = new GameState();

    /** @type {Number[]} */
    this.playerOrder = [];
}

/**
 * Carries the info for the turn.
 */
function GameState() {
    this.turn = 0;
    this.turnState = new TurnState();
    this.gameStarted = false;
}

function TurnState(id) {
    this.id = "";
    if (id) {
        this.id = (typeof id === "function") ? id.name : id.toString();
    }

    /** @type {Object} */
    this.data = null;

    /** @type {Number[]} */
    this.dice = [];

    this.statementSelectionData = null;
}

GameState.fromFirebase = function (o) {
    var gameState = new GameState();
    gameState.turn = o.turn;
    gameState.turnState = o.turnState;
    gameState.gameStarted = o.gameStarted;
    return gameState;
}


RoomBlob.prototype.fromFirebase = function (o) {
    var self = this;

    Object.keys(o).forEach(function (key) {
        if (key === "players") {
            self.players = [];
            o.players.forEach(function (player) {
                var playerBlob = new PlayerBlob();
                playerBlob.fromFirebase(player);
                self.players.push(playerBlob);
            })
        } else {
            self[key] = o[key]
        }
    });
}
var settings = null;



/*!
* JavaScript Cookie v2.2.0
* https://github.com/js-cookie/js-cookie
*
* Copyright 2006, 2015 Klaus Hartl & Fagner Brack
* Released under the MIT license
*/
; (function (factory) {
    var registeredInModuleLoader;
    if (typeof define === 'function' && define.amd) {
        define(factory);
        registeredInModuleLoader = true;
    }
    if (typeof exports === 'object') {
        module.exports = factory();
        registeredInModuleLoader = true;
    }
    if (!registeredInModuleLoader) {
        var OldCookies = window.Cookies;
        var api = window.Cookies = factory();
        api.noConflict = function () {
            window.Cookies = OldCookies;
            return api;
        };
    }
}(function () {
    function extend() {
        var i = 0;
        var result = {};
        for (; i < arguments.length; i++) {
            var attributes = arguments[i];
            for (var key in attributes) {
                result[key] = attributes[key];
            }
        }
        return result;
    }

    function init(converter) {
        function api(key, value, attributes) {
            if (typeof document === 'undefined') {
                return;
            }

            // Write

            if (arguments.length > 1) {
                attributes = extend({
                    path: '/'
                }, api.defaults, attributes);

                if (typeof attributes.expires === 'number') {
                    attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
                }

                // We're using "expires" because "max-age" is not supported by IE
                attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

                try {
                    var result = JSON.stringify(value);
                    if (/^[\{\[]/.test(result)) {
                        value = result;
                    }
                } catch (e) { }

                value = converter.write ?
                    converter.write(value, key) :
                    encodeURIComponent(String(value))
                        .replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

                key = encodeURIComponent(String(key))
                    .replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
                    .replace(/[\(\)]/g, escape);

                var stringifiedAttributes = '';
                for (var attributeName in attributes) {
                    if (!attributes[attributeName]) {
                        continue;
                    }
                    stringifiedAttributes += '; ' + attributeName;
                    if (attributes[attributeName] === true) {
                        continue;
                    }

                    // Considers RFC 6265 section 5.2:
                    // ...
                    // 3.  If the remaining unparsed-attributes contains a %x3B (";")
                    //     character:
                    // Consume the characters of the unparsed-attributes up to,
                    // not including, the first %x3B (";") character.
                    // ...
                    stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
                }

                return (document.cookie = key + '=' + value + stringifiedAttributes);
            }

            // Read

            var jar = {};
            var decode = function (s) {
                return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
            };
            // To prevent the for loop in the first place assign an empty array
            // in case there are no cookies at all.
            var cookies = document.cookie ? document.cookie.split('; ') : [];
            var i = 0;

            for (; i < cookies.length; i++) {
                var parts = cookies[i].split('=');
                var cookie = parts.slice(1).join('=');

                if (!this.json && cookie.charAt(0) === '"') {
                    cookie = cookie.slice(1, -1);
                }

                try {
                    var name = decode(parts[0]);
                    cookie = (converter.read || converter)(cookie, name) ||
                        decode(cookie);

                    if (this.json) {
                        try {
                            cookie = JSON.parse(cookie);
                        } catch (e) { }
                    }

                    jar[name] = cookie;

                    if (key === name) {
                        break;
                    }
                } catch (e) { }
            }

            return key ? jar[key] : jar;
        }

        api.set = api;
        api.get = function (key) {
            return api.call(api, key);
        };
        api.getJSON = function () {
            return api.apply({
                json: true
            }, arguments);
        };
        api.remove = function (key, attributes) {
            api(key, '', extend(attributes, {
                expires: -1
            }));
        };

        api.defaults = {};

        api.withConverter = init;

        return api;
    }

    return init(function () { });
}));


var SettingsHelper = (function () {
    function SettingsHelper() { }

    if (!settings) {

        settings = Cookies.getJSON('rdid'); // => 'value'

        if (!settings) {
            settings = {
                userID: Math.round(Math.random() * 1000),
                gameHandle: translations[language]["name"]
            };

            Cookies.set('rdid', settings);
            console.log("[Setting]", "generating and setting new cookies", Cookies.getJSON('rdid'));
        } else {
            console.log("[Setting]", "read cookies", settings);
        }
    } else {
        console.log("[Setting]", "already existed", settings);
    }

    return SettingsHelper;
})();




var Stocks = (function() {

    function Stocks(obj, amount) {
        obj = obj || {};
        this._cashflow = obj.cashflow;

        /** @type {string} */
        this.type = obj.type;
        /** @type {string} */
        this.key = obj.key;
        /** @type {Number} */
        this.cost = obj.cost;
        /** @type {Number} */
        this.cashflow = null;
        /** @type {Number} */
        this.quantity = amount;
        /** @type {Boolean} */
        this.highlight = true;
        /** @type {Number} */
        this.downpay = -1;

        Object.defineProperties(this, {
            cashflow: { get: function() { return this._cashflow * this.quantity } },
        });
    }

    return Stocks
})()
var Main = (function () {

    var m_stage = null;
    var m_transform = null;
    var m_loadQueue = null;
    var m_screen = null;
    var m_ui = null;



    var m_firebase = null;
    var m_bg = null;

    /** @type Bool*/
    var m_isMute = false;

    function Main() { }

    var m_gameUrl = null;
    Main.getRoomUrl = function () {
        return m_gameUrl;
    }

    Main.showRoomId = function () {

    }

    Main.setRoomId = function (roomId) {
        insertUrlParam('rid', roomId);
        m_gameUrl = window.location.href;
        // alert("New URL: " + url);

        var container = document.getElementById("room-url");
        // container.

        var input = document.querySelector("#room-url input");
        input.value = m_gameUrl;
        var button = document.querySelector("#room-url button.btn");
        var bg = document.getElementById("#room-url #bar");
        button.addEventListener("click", function () {
            input.select();
            document.execCommand("Copy");
            input.remove();
            button.remove();
        });


        /* 
        var input = document.createElement('input');
        var btn = document.createElement('button');
        btn.classList.add("btn");
        var attr = document.createAttribute("data-clipboard-target");
        attr.value = "urlInput"
        btn.attributes.setNamedItem(attr);
         */
        /* 
        <input id="foo" value="https://github.com/zenorocha/clipboard.js.git">
        <button class="btn" data-clipboard-target="#foo">
            <img src="assets/clippy.svg" alt="Copy to clipboard">
        </button> 
        */
    }

    Object.defineProperties(Main, {
        stage: { get: function () { return m_stage; } },
        canvas: { get: function () { return m_stage.canvas; } },
        transform: { get: function () { return m_transform; } },
        loadQueue: { get: function () { return m_loadQueue; } },
        screen: { get: function () { return m_screen; } },
        ui: { get: function () { return m_ui; } },
        firebase: { get: function () { return m_firebase; } },
        versionNumber: { value: "1.0.0(0.0.8)", writable: false }
    });

    /** @type {GameLogic} */
    Main.logic = null;
    /** @type {GameSession} */
    Main.gameSession = null;

    /** 
     * @description the asset root directory
     * @type {string} 
     */
    Main.basePath = null;

    Main.TIMESTAMP = firebase.database.ServerValue.TIMESTAMP;

    Main.load = function () {

        /** @type {string} */
        var scriptUrl = document.getElementById("siph").src;
        Main.basePath = scriptUrl.replace("Preloader.js", "");

        m_stage = new StageElement("stage");
        m_stage.transform.enableMouseOver();

        // onResize(new createjs.Event('resize', false, false));
        // window.addEventListener(window.orientation ? "orientationchange" : 'resize', function(event) {

        // });
        // window.addEventListener("orientationchange", onResize, false);
        // UI.setState(MainMenuUI);

        var ticker = createjs.Ticker;
        ticker.setFPS(60);
        ticker.on("tick", m_stage.transform);


        m_loadQueue = new createjs.LoadQueue(true, Main.basePath);
        m_loadQueue.installPlugin(createjs.Sound);
        m_loadQueue.addEventListener("fileload", function (e) {
            // console.log("onload", e.item);

            if (e.item.isSpritesheet) {
                var sprites = e.result.images;
                for (var i = 0; i < sprites.length; i++) {
                    sprites[i] = Main.basePath + sprites[i];
                    var loadItem = { id: sprites[i], src: sprites[i], type: createjs.Types.IMAGE, sheetId: e.item.id };
                    // console.log("manually loading sheet", loadItem);
                    m_loadQueue.loadFile(loadItem);
                }
            } else if (e.item.sheetId) {
                // console.log("manually inserting completed sheet", e.item.sheetId);
                m_loadQueue._loadedResults[e.item.sheetId] = new createjs.SpriteSheet(m_loadQueue.getResult(e.item.sheetId));
            }
        });
        m_loadQueue.addEventListener("fileerror", function (e) {
            console.error("fileerror", e.item);
        });
        m_loadQueue.addEventListener("error", function (e) {
            console.error("error", e.data);
        });
        m_loadQueue.addEventListener("progress", function (e) {
            // console.log("progress", e);
            //title.text = "Loading assets... " + Math.floor(e.progress * 100) + "%";
        });

        m_loadQueue.addEventListener("complete", function (e) {

            translations[language] = Main.loadQueue.getResult("uiVocab");

            m_bg = (function () {
                var bg = new createjs.Sprite(m_loadQueue.getResult("background"));
                var m_template = m_loadQueue.getResult("splashScreen").template.splashBackground;
                // bg.scaleX = m_template.width / bg.getBounds().width;
                // bg.scaleY = bg.scaleX;
                bg.x = 
                m_stage.transform.addChild(bg);
                return bg;
            }).call(this);

            Main.playSound("diceRoll");

            (async () => {
                try {
                    const response = await fetch('config.json');
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    var config = await response.json();
                } catch (error) {
                    console.error('Config file doesn\'t exist, assigning default value...');
                    var config = {
                        apiKey: "AIzaSyDOqT0lKhsFIbNJAO1wI_n2j2wKEgjwoAs",
                        authDomain: "cashflow-a13fb.firebaseapp.com",
                        databaseURL: "https://cashflow-a13fb.firebaseio.com",
                        projectId: "cashflow-a13fb",
                        storageBucket: "cashflow-a13fb.appspot.com",
                        messagingSenderId: "1096267079473"
                    };
                }
            

                document.getElementById("preloader").remove();

                Main.firebaseApp = firebase.initializeApp(config);
                console.log("firebase.SDK_VERSION", firebase.SDK_VERSION);
                m_firebase = firebase;

                // Main.canvas.width = window.innerWidth;
                // Main.canvas.height = window.innerHeight;
                m_transform = m_stage.transform;
                m_ui = document.getElementById("ui");

                // Main.gameSession = m_stage.create(GameSession);
                Main.logic = m_stage.create(GameLogic);

            })();
        });

        m_loadQueue.setMaxConnections(10);
        // m_loadQueue.loadManifest({ id: 'data', src: 'assets/manifest.json', type: 'manifest' }, true, Main.basePath);
        m_loadQueue.loadManifest(getManifest(Main.basePath), true, Main.basePath)
        m_loadQueue.load();

        delete Main.load;
    }

    function getTypeName(type) {
        var name = null;
        if (typeof type == "function") {
            name = type.toString().match(/^function\s*([^\s(]+)/)[1];
        } else {
            name = type.constructor.toString().match(/^function\s*([^\s(]+)/)[1];
        }
        // console.log("found name", name);
        return name;
    }

    Main.changeScreen = function (screenType) {
        if (m_screen) {
            console.log("changeScreen", "from:", getTypeName(m_screen), "to:", getTypeName(screenType));
            m_screen.release();
            m_transform.removeChild(m_screen.transform);
        } else {
            console.log("changeScreen", "to:", getTypeName(screenType));
        }
        m_screen = m_stage.create(screenType);
        m_screen.resize();
        m_transform.addChild(m_screen.transform);
    }


    Main.flipFlopMute = function () {

        if (m_isMute) {
            m_isMute = false
        }
        else {
            m_isMute = true;
        }
        return m_isMute;
    }

    /**soundName = string */
    Main.playSound = function (soundName) {
        if (m_isMute) return;
        createjs.Sound.play(soundName)

    }




    return Main;
})();

window.addEventListener("load", Main.load, { once: true, passive: true });
var chatLog = (function () {

    var m_room = null;
    var txtChatLog = null;
    function chatLog(room) {
        //database = firebase.database().ref("/chat")

        m_room = room;
        txtChatLog = document.getElementById("chatLog")

        //  throw siph.Errors.STATIC;
        if (m_room) {
            m_room.child("/chat").on("child_added", messageLog)
        }
        else {
             
             
        }


        this.addText = function (name, text) {
            m_room.child("/chat").push().set(
                {
                    name: name,
                    text: text
                }
            )

        }

        function messageLog(snap) {
           
           txtChatLog.innerText = snap.val().name+ ":  "+ snap.val().text+"\n"+" "+txtChatLog.innerText



        }

    }










    return chatLog;
})()


var Colors = (function () {
	function Colors() { }

	function convert(hex) {
		var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function (m, r, g, b) {
			return r + r + g + g + b + b;
		});

		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			}
			: null;
	}

	Colors.getPlayerColors = function () {
		var index = Main.gameSession.playerData.index;
		return Colors.ARRAYSTRING[index];
	};

	/** @returns {string} an HTML Color */
	Colors.getPlayerColor = function (i) {
		return Colors.ARRAY[i];
	};

	Colors.getCurrentPlayerColor = function () {
		var index = Main.gameSession.whoseTurn;
		return Colors.ARRAY[index];
	};


	Colors.getLocalPlayerColor = function () {
		if (Main.gameSession.isParticipating()) {
			var index = Main.gameSession.playerData.index;
			return Colors.ARRAY[index];
		}
		return Colors.DARK_TAN;
	};

	Object.defineProperties(Colors, {
		PURPLE: {
			value: "#775478",
			writable: false
		},
		GREEN: {
			value: "#a8b240",
			writable: false
		},
		ORANGE: {
			value: "#db753c",
			writable: false
		},
		BLUE: {
			value: "#769ba3",
			writable: false
		},
		RED: {
			value: "#ee4136",
			writable: false
		},
		GREY: {
			value: "#81888f",
			writable: false
		},
		YELLOW: {
			value: "#ffb111",
			writable: false
		},
		DARK_TAN: {
			value: "#9E9380",
			writable: false
		},
		LIGHT_TAN: {
			value: "#DEC9B4",
			writable: false
		},
		BLACK: {
			value: "#000000",
			writable: false
		},
		WHITE: {
			value: "#ffffff",
			writable: false
		},
		ARRAY: {
			get: function () {
				return [
					Colors.PURPLE,
					Colors.GREEN,
					Colors.ORANGE,
					Colors.BLUE,
					Colors.RED,
					Colors.GREY
				];
			}
		},
		convertToRGB: {
			value: convert,
			writable: false
		},

		ARRAYSTRING: {
			get: function () {
				return ["purple", "green", "orange", "blue", "red", "grey"];
			}
		}
	});

	return Colors;
})();

var DeckNames = {
    smalldealDeck: "smalldealDeck",
    bigdealDeck: "bigdealDeck",
    marketDeck: "marketDeck",
    doodadDeck: "doodadDeck"
};

var DeckCardTypes = {
    // smalldeals
    smalldeal_sell: "smalldeal_sell",
    smalldeal_startup: "smalldeal_startup",
    smalldeal_stock: "smalldeal_stock",
    smalldeal_anystock: "smalldeal_anystock",
    smalldeal_property: "smalldeal_property",

    // bigdeal
    bigdeal_property: "bigdeal_property",

    // market
    market_sell: "market_sell",
    market_startup: "market_startup",
    market_lose: "market_lose",
    market_selladd: "market_selladd",
    market_sellmultiply: "market_sellmultiply",
    market_fee: "market_fee",
    market_brother: "market_brother",

    // doodads
    doodad: "doodad",
    specialDoodad: "specialDoodad",

    fasttrack_dream: "dream",
    fasttrack_investment: "investment",
}

var GameBoards = {
    ratrace: "ratrace",
    fasttrack: "fasttrack"
};

var TileTypes = {
    rr_baby: "rr_baby",
    rr_charity: "rr_charity",
    rr_deal: "rr_deal",
    rr_doodad: "rr_doodad",
    rr_downsize: "rr_downsize",
    rr_market: "rr_market",
    rr_payday: "rr_payday",

    ft_cashflowday: "ft_cashflowday",
    ft_charity: "ft_charity",
    ft_deal: "ft_deal",
    ft_dream: "ft_dream",
    ft_divorce: "ft_divorce",
    ft_lawsuit: "ft_lawsuit",
    ft_tax: "ft_tax"
};


/* 
var Views = {
    rr_smalldeal: "rr_smalldeal",
    rr_deal: "rr_deal",
}
 */

var GameStates = {
    turnStart: "turnStart",
    moving: "moving",
    rolling: "rolling",
    rollingInvestment: "rollingInvestment",
    stockSplit: "stockSplit"
}

var DeckBuilder = (function () {
    function DeckBuilder() { }

    DeckBuilder.smalldealDeck = null;
    DeckBuilder.bigdealDeck = null;
    DeckBuilder.marketDeck = null;
    DeckBuilder.doodadDeck = null;

    function _loadDecks() {
        if (!DeckBuilder.smalldealDeck) {
            DeckBuilder.smalldealDeck = Main.loadQueue.getResult("smallDeal").smalldealDeck.cards;
        }
        if (!DeckBuilder.bigdealDeck) {
            DeckBuilder.bigdealDeck = Main.loadQueue.getResult("bigDeal").bigdealDeck.cards;
        }
        if (!DeckBuilder.marketDeck) {
            DeckBuilder.marketDeck = Main.loadQueue.getResult("market").marketDeck.cards;
        }
        if (!DeckBuilder.doodadDeck) {
            DeckBuilder.doodadDeck = Main.loadQueue.getResult("doodads").doodadDeck.cards;
        }
    }



    DeckBuilder.getDeck = function (deckName) {
        _loadDecks();
        return DeckBuilder[deckName].slice();
    }

    DeckBuilder.getCard = function (deckName, cardId) {
        _loadDecks();
        return DeckBuilder[deckName][cardId];
    }

    DeckBuilder.buildDeck = function (deckName) {
        _loadDecks();

        var length = DeckBuilder[deckName].length;
        var deckObject = {
            index: 0,
            cards: new Array(length)
        };
        for (var i = 0; i < length; i++) {
            deckObject.cards[i] = i;
        }

        MathHelper.shuffleArray2(deckObject.cards);
        return deckObject;
    };

    DeckBuilder.buildDecks = function () {
        _loadDecks();
        var decks = {
            // dontmindme
        };
        decks[DeckNames.smalldealDeck] = DeckBuilder.buildDeck(DeckNames.smalldealDeck);
        decks[DeckNames.bigdealDeck] = DeckBuilder.buildDeck(DeckNames.bigdealDeck);
        decks[DeckNames.marketDeck] = DeckBuilder.buildDeck(DeckNames.marketDeck);
        decks[DeckNames.doodadDeck] = DeckBuilder.buildDeck(DeckNames.doodadDeck);
        return decks;
    };


    DeckBuilder.getDeckNameFromCardType = function (cardType) {
        switch (cardType) {
            case DeckCardTypes.smalldeal_anystock:
            case DeckCardTypes.smalldeal_property:
            case DeckCardTypes.smalldeal_sell:
            case DeckCardTypes.smalldeal_startup:
            case DeckCardTypes.smalldeal_stock:
                return DeckNames.smalldealDeck;

            case DeckCardTypes.bigdeal_property:
                return DeckNames.bigdealDeck;

            case DeckCardTypes.market_brother:
            case DeckCardTypes.market_fee:
            case DeckCardTypes.market_lose:
            case DeckCardTypes.market_sell:
            case DeckCardTypes.market_selladd:
            case DeckCardTypes.market_sellmultiply:
            case DeckCardTypes.market_startup:
                return DeckNames.marketDeck;

            case DeckCardTypes.doodad:
            case DeckCardTypes.specialDoodad:
                return DeckNames.doodadDeck;

            case DeckCardTypes.fasttrack_dream:
            case DeckCardTypes.fasttrack_investment:
                return "fasttrackDeck";
        }
    }

    DeckBuilder.getCardIndex = function (cardType) {

    }

    DeckBuilder.debugGetCardOfTypeFromDeck = function (deckName, cardType, index) {
        var deck = DeckBuilder[deckName];
        if (!deck) { console.warn("unable to find deck", deckName); }

        var cards = deck.filter(function (card) {
            return card.type == cardType;
        });
        return cards[index || 0];
    };

    return DeckBuilder;
})();

function BoardTile(key, object) {
    /** the key of the space, i.e. 'ft_cashflowday_21' */
    this.key = key;

    /** the template positioning information */
    this.object = object;

    var temp = key.split("_");

    /** either 'ft' or 'rr' 
     * @type {String}
     */
    this.board = temp[0];

    /** either 'ft' or 'rr' */
    this.id = Number(temp[2]);

    /** the type from {TileTypes} 
     * something like 'rr_deal', or 'ft_cashflowday'
     */
    this.type = this.board + "_" + temp[1];
    // this.specificType = this.board + "_" + this.type;

    this.position = { x: 0, y: 0 };
}

Object.defineProperties(BoardTile.prototype, {
    position: { get: function () { return { x: this.object.x, y: this.object.y }; } },
})

var BoardData = (function () {
    function BoardData() {
        /** @type {BoardData} */
        var m_this = this;
        s_instance = this;
        var m_template = Main.loadQueue.getResult("gameScreen").template;

        /** @type {BoardTile[]} */
        this.fastTrack = [];

        /** @type {BoardTile[]} */
        this.ratRace = [];

        Object.keys(m_template).forEach(/** @param {string} key */function (key) {
            if (key.indexOf("_") > -1) {
                var tile = m_template[key];
                if (tile.asset === "FastTrackSlot") m_this.fastTrack.push(new BoardTile(key, tile));
                else if (tile.asset === "RatRaceSlot") m_this.ratRace.push(new BoardTile(key, tile));
            }
        });

        this.fastTrack.sort(sortTiles);
        this.ratRace.sort(sortTiles);
    }

    /** @type {BoardData} */
    var s_instance = null;

    /** @returns {BoardData} */
    BoardData.getInstance = function () {
        if (!s_instance) {
            s_instance = new BoardData();
        }
        return s_instance;
    }

    /**
     * @param {Number} index
     * @returns {BoardTile} position
     */
    BoardData.prototype.getRatRaceSpot = function (index) {
        return this.ratRace[index];
    }

    BoardData.prototype.debugGetRRTilesByType = function (type) {
        return this.ratRace.filter(function (tile) {
            return tile.type == type;
        });
    }

    /**
     * @param {string} type - {TileTypes}
     */
    BoardData.prototype.getTilesByType = function (type) {
        var target = null;
        if (type.match(/^ft_/)) { target = this.fastTrack; }
        if (type.match(/^rr_/)) { target = this.ratRace; }
        return target.filter(function (tile) {
            return tile.type == type;
        });
    }

    /**
     * @param {string} type - {TileTypes}
     */
    BoardData.prototype.getDreamTiles = function (type) {
        var target = null;
        if (type.match(/^ft_/)) { target = this.fastTrack; }
        if (type.match(/^rr_/)) { target = this.ratRace; }
        return this.fastTrack.filter(function (tile) {
            return tile.type == DeckCardTypes.fasttrack_dream;
        });
    }

    




    /**
     * @param {BoardTile} a 
     * @param {BoardTile} b 
     */
    function sortTiles(a, b) {
        if (a.id < b.id) return -1;
        else if (a.id > b.id) return 1;
        return 0;
    }

    return BoardData;
})();

var Data = (function () {
    function Data() { }

    var m_dreamList = null;
    Data.getDreams = function () {
        if (!m_dreamList) {
            var deck = Main.loadQueue.getResult("fastTrack").fasttrack.spaces;
            m_dreamList = deck.filter(function (card) {
                return card.type == DeckCardTypes.fasttrack_dream;
            }).sort(function (a, b) {
                return a.id - b.id;
            })
        }
        return m_dreamList;
    };

    Data.getDreamIndex = function (id) {
        var dreams = Data.getDreams();
        var index = -1;
        for (var i = 0; i < dreams.length; i++) {
            if (dreams[i].id == id) {
                return i;
            }
        }
        return -1;
    }

    /**
     * @param {BoardTile} tile - the space landed on
     * @returns {Object}
     */
    Data.getFastTrackCard = function (tile) {
        var deck = Main.loadQueue.getResult("fastTrack").fasttrack.spaces;

        var result = deck.filter(function (card) {
            return card.id == tile.id;
        })[0];

        return result;
    };


    /**
     * Generates the Thing
     * @returns {Number[]}
     */
    Data.createFastTrackSpacesList = function () {
        // /** @type {BoardTile[]} */
        var spaces = BoardData.getInstance().fastTrack;
        var fastTrackSpaces = new Array(spaces.length);
        for (var i = 0; i < fastTrackSpaces.length; i++) {
            if (spaces[i].type == TileTypes.ft_dream) { fastTrackSpaces[i] = 1; }
            else { fastTrackSpaces[i] = -1; }
        }
        return fastTrackSpaces;
    };

    Data.testData = function () {
        var jsons = [
            Main.loadQueue.getResult("smallDeal").smalldealDeck.cards,
            Main.loadQueue.getResult("bigDeal").bigdealDeck.cards,
            Main.loadQueue.getResult("doodads").doodadDeck.cards,
            Main.loadQueue.getResult("market").marketDeck.cards,
            Main.loadQueue.getResult("fastTrack").fasttrack.spaces
        ]

        var occurences = {};
        var numCards = 0;
        jsons.forEach(function (cards) {
            cards.forEach(function (card) {
                Object.keys(card).forEach(function (key) {
                    occurences[key] = (occurences[key] || 0) + 1;
                })
                numCards++;
            })
        })

        console.log("data results:", "num cards", numCards, occurences)
    }


    Data.getDream = function (i) {
        var dreams = Data.getDreams();
        return dreams[i];
    }

    var m_vocab = null;
    Data.vocab = function () {
        if (!m_vocab) {
            m_vocab = Main.loadQueue.getResult("vocabEnUS").vocab;
        }
        return m_vocab;
    };

    Data.getVocab = function (key, subKey) {
        return Data.vocab()[key][subKey];
    }

    return Data;
})();
var FooterWidget = (function () {
    inherit(FooterWidget, ContainerElement)





    function FooterWidget() {
        ContainerElement.call(this);
        var m_this = this
        /**@type {create js Stage} */
        var footerStage = null
        var FooterTemplateName = "gameScreen"
        var FooterTemplate = TemplateParser.parseTemplate(FooterTemplateName);

        var divFooter = document.createElement("div")

        /** @type {string} */
        var m_playerName = null
        /** firebase path string 
         * @type {string} */
        var m_roomName = null
        /**@type {HTMLInputElement} */
        var inputChat = null
        /**@type {HTMLElement} */
        var textLog = null;
        /** @type {Boolean} */
        var enableChat = false;

        /** @type {DOMElement input} */
        var DOMinputChat = null;
        /** @type {html div} */
        var divTextLog = null

        ///** @type {createjs sprite} */
        var chatUpArrow = null;

        /** @type {createjs sprite} */
        var backGround = null

        this.onCreate = function () {

            footerStage = new createjs.Stage("footerStage");

            backGround = m_this.fetchSprite("msg_bk", false, {
                x: FooterTemplate.logo.x + 550,
                y: FooterTemplate.logo.y - 60,
                height: FooterTemplate.logo.height,
                width: FooterTemplate.logo.width,
                sheet: "chat",


            })
            //  console.log("BG", backGround)


            if (Main.gameSession.isParticipating()) {
                inputChat = document.createElement("input")
                // var attr = document.createAttribute("type");
                // attr.value = "button"
                // inputChat.attributes.setNamedItem(attr);

                inputChat.placeholder = translations[language]["chat-placeholder"]
                inputChat.id = "inputChat"
                inputChat.maxLength = 64 * 4;



                inputChat.addEventListener("submit", function () {
                    event.preventDefault();
                    return false;
                })

                inputChat.addEventListener('keydown', function (event) {
                    if (event.keyCode === 13) {
                        event.preventDefault();
                        if (inputChat.value && inputChat.value != "") {
                            Main.gameSession.roomRef.child("chatlog").push({
                                name: m_playerName,
                                message: inputChat.value,
                            });
                            inputChat.value = "";
                        }
                    }
                })

                DOMinputChat = new createjs.DOMElement(inputChat);
                DOMinputChat.x = FooterTemplate.chatInput.x;
                DOMinputChat.y = FooterTemplate.chatInput.y - 40;

                DOMinputChat.htmlElement.hidden = true
                // console.log(DOMinputChat.htmlElement.style.visibility)
            }

            var chatTitleText = TemplateParser.formatTextFromTemplate("gameScreen", "chatTitleText", "#000000", false)
            chatTitleText.text = Data.getVocab("chatTitle", "copy")
            chatTitleText.y -= 10;


            // var chatSend = TemplateParser.formatTextFromTemplate("gameScreen", "chatSend", "#000000", false)
            // chatSend.x = FooterTemplate.chatSend.x
            // chatSend.text = "Send"
            var popBg = m_this.fetchSprite("popbtn_smgld_nrm", false, {
                x: FooterTemplate.chatUpArrow.x - 6,
                y: FooterTemplate.chatUpArrow.y - 6,
                width: FooterTemplate.chatUpArrow.width,
                height: FooterTemplate.chatUpArrow.height,

            })

            chatUpArrow = m_this.fetchSprite("play_whiteUP", false, {
                x: FooterTemplate.chatUpArrow.x,
                y: FooterTemplate.chatUpArrow.y + 2,
                width: FooterTemplate.chatUpArrow.width,
                height: FooterTemplate.chatUpArrow.height,

            })

            var arrowBounds = (chatUpArrow.bitmapCache || chatUpArrow.getBounds());
            chatUpArrow.regX = arrowBounds.width / 2;
            chatUpArrow.regY = arrowBounds.height / 2;
            // chatUpArrow.scaleY = chatUpArrow.scaleY * -1;
            chatUpArrow.x += ((arrowBounds.width / 2) * Math.abs(chatUpArrow.scaleX));
            chatUpArrow.y += ((arrowBounds.height / 2) * Math.abs(chatUpArrow.scaleY));
            chatUpArrow.scaleX = chatUpArrow.scaleY *= .8;


            //console.log("cool ", chatUpArrow.regX, chatUpArrow.regY)
            //chatUpArrow.regX = FooterTemplate.chatUpArrow.x
            //chatUpArrow.regY = FooterTemplate.chatUpArrow.y

            this.tintSprite(chatUpArrow, "#000000")
            popBg.addEventListener("click", enablingChat)


            divTextLog = document.createElement("div");
            divTextLog.id = "textLog";
            divTextLog.hidden = true;
            textLog = document.createElement("a");
            //  textLog.innerText = "Mehoi Meboi!!!!!!"
            divTextLog.style.height = "55px";
            //textLog.clientHeight = 50;



            var textLogDOM = new createjs.DOMElement(divTextLog)
            textLogDOM.x = FooterTemplate.chatTitleText.x;
            textLogDOM.y = FooterTemplate.chatTitleText.y + 10;


            divTextLog.appendChild(textLog)
            divFooter.appendChild(divTextLog)

            footerStage.addChild(backGround);


            footerStage.addChild(chatTitleText);

            footerStage.addChild(textLogDOM)

            if (inputChat) {
                divFooter.appendChild(inputChat)
            }

            m_this.transform.addChild(footerStage)
            if (DOMinputChat) {
                m_this.transform.addChild(DOMinputChat)
            }
            m_this.transform.addChild(popBg)
            m_this.transform.addChild(chatUpArrow)


            Main.ui.appendChild(divFooter)

            setTimeout(function () {
                textLogDOM.htmlElement.hidden = false;
                textLog.hidden = false;
            }, 1)

            createjs.Ticker.addEventListener("tick", tickHandler)
            //  console.log("name ", Main.gameSession.playerData.name)

            if (Main.gameSession.isSpectating()) {
                m_playerName = "Spectator";
            } else {
                m_playerName = Main.gameSession.playerData.name || "Test";
            }

            updateTextLog();
            // Main.gameSession.roomRef.child("chatlog").once("value", function (snap) {
            //     var archive = snap.val();
            //     if (!archive) { return; }

            //     Object.keys(archive).forEach(function (entry) {
            //         addEntryToChatLog(archive[entry]);
            //     })

            //     // for (var i = 0; i < archive.length; i++) {
            //     //     addEntryToChatLog(archive[i]);
            //     // }

            // })

        }

        this.addTextLog = function (log) {
            Main.gameSession.roomRef.child("chatlog").push({
                name: m_playerName,
                message: log,
            })

        }

        this.onRelease = function () {
            createjs.Ticker.removeEventListener("tick", tickHandler)
            Main.ui.removeChild(divFooter)
            m_this.transform.removeChild(footerStage)
            Main.gameSession.roomRef.child("chatlog").off("child_added", _onChatlogUpdated);

            //divFooter = null;
            //footerStage = null;

        }

        function updateTextLog() {
            Main.gameSession.roomRef.child("chatlog").on("child_added", _onChatlogUpdated)
        }

        function _onChatlogUpdated(snap) {
            //textLog.innerText = ""
            //Object.keys(snap.val()).forEach(function (p) {
            // textLog.innerText += snap.val().name + ": " + snap.val().message + "\n";
            //})

            addEntryToChatLog(snap.val());
        }

        function addEntryToChatLog(o) {
            if (!o) { return; }

            var entry = document.createElement("span");
            entry.innerText = o.name + ": " + o.message;
            entry.classList.add("chatlog-entry");

            textLog.appendChild(entry);


            while (textLog.children.length > 50) {
                textLog.removeChild(textLog.children[0]);
            }


            updateScroll();
        }

        function enablingChat() {


            // var arrowBounds = (chatUpArrow.bitmapCache || chatUpArrow.getBounds());
            // chatUpArrow.regX = arrowBounds.width / 2;
            // chatUpArrow.regY = arrowBounds.height / 2;
            // chatUpArrow.scaleY = chatUpArrow.scaleY * -1;
            // chatUpArrow.x += ((arrowBounds.width / 2) * Math.abs(chatUpArrow.scaleX));
            // chatUpArrow.y += ((arrowBounds.height / 2) * Math.abs(chatUpArrow.scaleY));

            createjs.Tween.removeTweens(footerStage);

            if (enableChat === false) {
                createjs.Tween.get(chatUpArrow).to({ rotation: 180, override: true }, 0);
                createjs.Tween.get(footerStage).to({ y: -150, override: true }, 500, createjs.Ease.quintInOut).call(function () {
                    enableChat = true;

                    if (DOMinputChat) {
                        DOMinputChat.htmlElement.hidden = false;
                    }
                    divTextLog.style.height = "145px"
                    updateScroll();
                })
            }
            else {
                if (DOMinputChat) {
                    DOMinputChat.htmlElement.hidden = true
                }
                divTextLog.style.height = "55px";
                updateScroll();
                createjs.Tween.get(chatUpArrow).to({ rotation: 0, override: true }, 0);
                createjs.Tween.get(footerStage).to({ y: 0, override: true }, 500, createjs.Ease.quintInOut).call(function () {
                    enableChat = false
                })
                //footerStage.removeChild(DOMinputChat)
            }
        }


        function updateScroll() {
            var out = document.getElementById("textLog");
            out.scrollTop = out.scrollHeight;
        }


        function tickHandler(e) {
            footerStage.update()
        }

    }








    return FooterWidget;
})()
var GameLogic = (function () {
    inherit(GameLogic, CoreElement);
    var ROOM_ID = 'game';

    function GameLogic() {
        CoreElement.call(this);

        /** @type GameLogic */
        var m_this = this;

        var m_titleClicked = false;

        this.roomId = null;

        /*
            if no roomId,
                offer roomCreation
                    if create room, set pageto roomId and wait
                offer room List
                    if join click, set roomId
            
            if roomId
                grab data
                if password, verify
                if game is started
                    join as spectator
                else if game is full
                    join as spectoator
                else 
                    join as player

        */

        this.onCreate = function () {
            m_this.polo("onGameCreated", _handleGameCreated);
            m_this.polo("onRoomJoinSucceeded", _handleRoomJoinSucceeded);
            m_this.polo("onRoomJoinFailed", _handleRoomJoinFailed);

            checkState();
        }

        this.onRelease = function () {
        }


        function _handleGameCreated(roomId) {
            insertUrlParam(ROOM_ID, roomId);
        }

        this.onTitleClicked = function () {
            m_titleClicked = true;
            checkState();
        }

        this.onCreateNewRoomClicked = function () {
            Main.changeScreen(RoomScreen)
        }

        this.onJoinGameClicked = function (roomId) {

        }

        function _handleRoomJoinSucceeded() {
            insertUrlParam(ROOM_ID, m_this.roomId);
        }

        function _handleRoomJoinFailed(reason) {
            m_this.exitGame();
        }

        function checkState() {
            var roomId = getRoomId();

            if (!roomId) {
                if (!m_titleClicked) {
                    Main.changeScreen(TitleScreen);
                } else {
                    Main.changeScreen(LobbyScreen);
                }
            } else {

                m_this.joinRoom(roomId, "");
                // if (Main.roomId) {
                //     Main.changeScreen(TitleScreen);
                // } else {
                //     Main.changeScreen(TitleScreen);
                //     // Main.changeScreen(GameScreen);
                // }
            }
        }



        this.createRoom = function (maxPlayers, roomName, password) {
            if (Main.gameSession) {
                Main.gameSession.release();
                Main.gameSession = null;
            }
            Main.gameSession = m_this.create(GameSession);
            Main.gameSession.createRoom(maxPlayers, roomName, password);
        }

        this.joinRoom = function (roomName, password) {
            m_this.roomId = roomName;
            if (Main.gameSession) {
                Main.gameSession.release();
                Main.gameSession = null;
            }
            Main.gameSession = m_this.create(GameSession);
            Main.gameSession.joinRoom(roomName, password);
        }

        this.exitGame = function () {
            m_titleClicked = false;
            removeUrlParam(ROOM_ID);
            this.roomId = null;

            Main.changeScreen(TitleScreen);
            if (Main.gameSession) {
                Main.gameSession.release()
                Main.gameSession = null;
            };
        }



        function getRoomId() {
            var urlParams = getUrlParams();
            if (urlParams[ROOM_ID] != undefined) {
                m_this.roomId = urlParams[ROOM_ID];
            }
            return m_this.roomId
        }


        function getUrlParams() {
            var search = window.location.search;
            var hashes = search.slice(search.indexOf('?') + 1).split('&');
            var params = {};
            var key, val, h;
            hashes.map(function (hash) {
                h = hash.split('=');
                key = h[0];
                val = h[1];
                if (key) {
                    params[key.toLowerCase()] = decodeURIComponent(val);
                }
            });
            return params;
        }

        function insertUrlParam(key, value) {
            key = encodeURI(key);
            value = encodeURI(value);
            var kvp = document.location.search.substr(1).split('&').filter(function (p) { return p });
            var i = kvp.length; var x; while (i--) {
                x = kvp[i].split('=');
                if (x[0] == key) {
                    x[1] = value;
                    kvp[i] = x.join('=');
                    break;
                }
            }
            if (i < 0) { kvp[kvp.length] = [key, value].join('='); }
            //this will reload the page, it's likely better to store this until finished
            // document.location.search = kvp.join('&');
            window.history.pushState(null, null, window.location.pathname + "?" + kvp.join("&"));
        }

        function removeUrlParam(key) {
            key = encodeURI(key);
            var kvp = document.location.search.substr(1).split('&').filter(function (p) { return p });
            var i = kvp.length;
            while (i--) {
                var x = kvp[i].split('=');
                if (x[0] == key) {
                    // kvp[i] = null;
                    kvp.splice(i, 1);
                    break;
                }
            }

            // if (i < 0) { kvp[kvp.length] = [key, value].join('='); }

            var newUrl = "";
            if (kvp.length > 0) {
                newUrl = "?" + kvp.join("&");
            }

            if (window.location.search != newUrl) {
                console.log("adding history...", newUrl)
                window.history.pushState(null, null, window.location.pathname + newUrl);
                console.log("newUrl", window.location.href);
            } else {
                console.log("not touching history", window.location.href);
            }
        }
    }

    return GameLogic;
})();
var hacks = (function () {
    function hacks() { }
    hacks.add = function (name, fn) {
        hacks[name] = fn;
    }
    //TODO: add this to hacks firebase.database().ref(“/rooms”).set(null)
    return hacks;
})();

var GameSession = (function () {
    inherit(GameSession, CoreElement);

    function GameSession() {
        CoreElement.call(this);

        var log = "onLogAction";

        /** @type {GameSession} */
        var m_this = this;

        /** @type {firebase.database.Reference} */
        this.roomRef = null;
        /** @type {string} */
        this.roomId = null;
        /** @type {RoomBlob} */
        this.roomBlob = null;

        /** @type {firebase.database.Reference} */
        this.localPlayerRef = null;

        /** @type {PlayerData} */
        this.playerData = null;

        /** @type {firebase.database.Reference} */
        var m_gameStateRef = null;
        /** @type {firebase.database.Reference} */
        var m_turnStateRef = null;

        /** @type {GameState} */
        this.gameState = null;
        /** @type {TurnState} */
        this.turnState = null;
        /** @type {Object} */
        this.cardData = null;

        /** @type {Boolean} */
        this.isMyTurn = false;
        this.whoseTurn = 0;

        // var m_activePlayerIndex = -1;
        var m_isMyTurn = false;

        var m_spectating = false;

        Object.defineProperties(this, {
            gameState: {
                get: function () { return m_this.roomBlob.gameState; }
            },
            turnState: {
                get: function () { return m_this.roomBlob.gameState.turnState; }
            },
            cardData: {
                get: function () { return m_this.roomBlob.gameState.turnState.data; }
            },
            isMyTurn: {
                get: function () { return m_isMyTurn; }
            },
            whoseTurn: {
                // get: function () { return m_activePlayerIndex; }
                get: function () { return m_this.getCurrentPlayerIndex(); }
            }
        })

        this.isSpectating = function () { return m_spectating == true; }
        this.isParticipating = function () { return m_spectating == false; }

        this.onCreate = function () {

            this.polo("onSkipTurnOkClicked", onSkipTurnOkClicked);
            this.polo("onStartGameClicked", onStartGameClicked);

            this.polo("onRollTurnDice", onRollTurnDice);
            this.polo("onLocalPlayerArrivedAtSpace", onLocalPlayerArrivedAtSpace);

            this.polo("onCycleDreamSelect", onCycleDreamSelect);
            this.polo("onDreamSelected", onDreamSelected);
            this.polo("onDrawCard", onDrawCard);

            this.polo("onShowEndCard", onShowEndCard);
            this.polo("onShowStartTurnCard", onShowStartTurnCard);

            this.polo("onShowBorrowCardStartTurn", onShowBorrowCardStartTurn);
            this.polo("onShowBorrowCardEndTurn", onShowBorrowCardEndTurn);

            this.polo("onCancelBorrowCardStartTurn", onCancelBorrowCardStartTurn);

            this.polo("onAttemptInvestmentPurchase", onAttemptInvestmentPurchase);
            this.polo("onAttemptInvestmentChancePurchase", onAttemptInvestmentChancePurchase);
            this.polo("onAttemptDealPurchase", onAttemptDealPurchase);
            this.polo("onAttemptDreamPurchase", onAttemptDreamPurchase);
            this.polo("onDreamPassed", onDreamPassed);
            this.polo("onDoodadPayClicked", onDoodadPayClicked);
            this.polo("onShowStockBuyCard", onShowStockBuyCard);
            this.polo("onShowStockSellCard", onShowStockSellCard);
            this.polo("onDoodadLoanNeeded", onDoodadLoanNeeded);
            this.polo("onShowStockCard", onShowStockCard);
            this.polo("onAddChild", onAddChild);
            this.polo("onDonateClicked", onDonateClicked);
            this.polo("onDownsizeClicked", onDownsizeClicked);
            this.polo("onDivorceClicked", onDivorceClicked);
            this.polo("onLawsuitClicked", onLawsuitClicked);
            this.polo("onTaxClicked", onTaxClicked);
            this.polo("onBorrowCardStartTurnClicked", onBorrowCardStartTurnClicked);
            this.polo("onBorrowCardEndTurnClicked", onBorrowCardEndTurnClicked);
            this.polo("onLoanCancelClicked", onLoanCancelClicked);
            this.polo("onLoanBorrowClicked", onLoanBorrowClicked);
            this.polo("onPayOffLoanCanceled", onPayOffLoanCanceled);
            this.polo("onPayOffLoanPayClicked", onPayOffLoanPayClicked);

            this.polo("onSpecialStockCardClicked", onSpecialStockCardClicked);

            this.polo("onMarketSellBackClicked", onMarketSellBackClicked);
            this.polo("onSellMarketCard", onSellMarketCard);

            this.polo("onBankruptPayOffCanceled", onBankruptPayOffCanceled);
            this.polo("onBankruptPayOffClicked", onBankruptPayOffClicked);
            this.polo("onBankruptAssetClicked", onBankruptAssetClicked);
            this.polo("onBankruptLiabilityClicked", onBankruptLiabilityClicked);
            this.polo("onBankruptSellBackClicked", onBankruptSellBackClicked);
            this.polo("onBankruptSellProperty", onBankruptSellProperty);
            this.polo("onBankruptCompleteClicked", onBankruptCompleteClicked);
            this.polo("onBankruptHalveClicked", onBankruptHalveClicked);
            this.polo("onBankruptLoseClicked", onBankruptLoseClicked);

            this.polo("onListItemSelected", onListItemSelected);
            this.polo("onListItemAssetSelected", onListItemAssetSelected);
            this.polo("onMarketMustClicked", onMarketMustClicked);
            this.polo("onPickLoanCanceled", onPickLoanCanceled);
            this.polo("onRepayClicked", onRepayClicked);
            this.polo("onEnterFastTrackClicked", onEnterFastTrackClicked);

            this.polo("onEndTurn", onEndTurn);
        }

        function createPlayerBlobStub(index) {
            var stub = new PlayerBlob();
            stub.index = index;
            stub.indexLobby = index;
            return stub;
        }

        this.createPlayerBlobStub = createPlayerBlobStub;

        function pickCareer() {
            var careers = Main.loadQueue.getResult("careers").careers.careerData;
            var careerJson = careers[Math.floor(Math.random() * careers.length)];
            return careerJson;
        }

        this.createRoom = function (maxPlayers, roomName, password) {
            this.playerData = this.create(PlayerData);
            /** @type {PlayerBlob} */
            var hostPlayerBlob = this.playerData.init(0, true, settings.userID, settings.gameHandle.substr(0, 8), pickCareer());

            /// hacks to hard code assets on your player at the start of the game
            /// hack1
            //hostPlayerBlob.stocks.push(new Stocks(DeckBuilder.getCard(DeckNames.smalldealDeck, 10),20));
            /// hack2
            // hostPlayerBlob.properties.push(new Property({
            //     "title": "CAR WASH FOR SALE",
            //     "copy1": "Family car wash for sale. Family feuding. Wants out ASAP. Prime location in high-growth area.",
            //     "rule": "Use this yourself or sell to another player. 36% ROI, may sell for 12-25 times annual cash flow.",
            //     "type": "bigdeal_property",
            //     "key": "CARWASH",
            //     "cost": 350000,
            //     "downpay": 50000,
            //     "cashflow": 1500,
            //     "mortgage": 300000
            //   }, 1));

            var roomBlob = new RoomBlob();
            roomBlob.timeCreated = Main.TIMESTAMP;
            roomBlob.maxPlayers = maxPlayers;
            roomBlob.name = roomName;
            roomBlob.password = password || "";
            roomBlob.decks = DeckBuilder.buildDecks();
            roomBlob.fastTrackSpaces = Data.createFastTrackSpacesList();

            roomBlob.players = [hostPlayerBlob];
            for (var i = 1; i < maxPlayers; i++) {
                roomBlob.players.push(createPlayerBlobStub(i));
            }

            m_this.roomBlob = roomBlob;

            /*
                new players take first empty spot
                if player disconnects during 'lobby'
                    set position in array to empty
                    flatten list when game starts
                if player disconnects during 'game'
                    do nothing
            */

            var roomRef = null;
            // push the player object into the list
            firebase.database().ref("/rooms/").push(this.roomBlob).then(function (newRoomRef) {
                roomRef = newRoomRef;
                // return newRoomRef.child("players").push(hostPlayerBlob);
            })
                // add the player's key to the playerOrder list
                .then(function () {
                   return roomRef.child("chatlog").push({
                        name: translations[language]["version"],
                        message: Main.versionNumber,
                    })
                })
                // carry on my wayword son
                .then(function () {
                    m_this.marco("onGameCreated", roomRef.key)
                    m_this.setupRoomReferences(roomRef);

                    // return thenableRef.child("timeCreated").once("value", function (timeCreatedSnap) {
                    //     console.log("timestamp", roomBlob.timeCreated, timeCreatedSnap.val());
                    //     roomBlob.timeCreated = timeCreatedSnap.val();
                    //     return thenableRef;
                    // });
                });
        }

        this.joinRoom = function (roomId, password) {
            // if fails to join... something.
            var roomRef = firebase.database().ref("/rooms/" + roomId);
            roomRef.once("value", function (snap) {
                /** @type {RoomBlob} */
                var o = snap.val();
                if (!o) {
                    m_this.marco("onRoomJoinFailed", "noroom");
                    // m_this.release();
                    // Main.logic.exitGame();
                    return;
                }

                var roomBlob = new RoomBlob();
                try {
                    roomBlob.fromFirebase(snap.val());
                } catch (e) {
                    m_this.marco("onRoomJoinFailed", "badroomdata");
                    // m_this.release();
                    // Main.logic.exitGame();
                    return;
                }

                if (roomBlob.password) {
                    if (roomBlob.password != password) {
                        console.log("joinRoom failed", "wrong password");
                        m_this.marco("onRoomJoinFailed", "password");
                        // m_this.release();
                        // Main.logic.exitGame();
                        return;
                    }
                }

                if (roomBlob.gameState.gameStarted) {
                    // check whether we are already in the game...
                    var index = -1;
                    for (var i = 0; i < roomBlob.players.length; i++) {
                        if (roomBlob.players[i].userId === settings.userID) {
                            index = i;
                            break;
                        }
                    }

                    if (index > -1) { //rejoin
                        m_this.roomBlob = roomBlob;
                        m_this.playerData = m_this.create(PlayerData);
                        m_this.playerData.join(roomBlob.players[index]);
                        // set isActive to true

                    m_this.marco("onRoomJoinSucceeded");
                        return roomRef.child("players/" + m_this.playerData.indexLobby).child("isActive").set(true).then(function () {
                            return m_this.setupRoomReferences(roomRef);
                        });
                    }
                    // spectate...
                    // just go to the game screen and don't do anything...

                    m_this.marco("onRoomJoinSucceeded");
                    m_spectating = true;
                    m_this.roomBlob = roomBlob;
                    m_this.setupRoomReferences(roomRef);

                    // console.log("joinRoom failed", "alreadyStarted");
                    // m_this.marco("onRoomJoinFailed", "alreadyStarted");
                    // // m_this.release();
                    // // Main.logic.exitGame();
                    return;
                }



                m_this.roomBlob = roomBlob;

                // find existing player slot:
                var index = -1;
                for (var i = 0; i < roomBlob.players.length; i++) {
                    if (roomBlob.players[i].userId === settings.userID) {
                        index = i;
                        break;
                    }
                }

                // or... find empty spot
                if (index < 0) {
                    for (var i = 0; i < roomBlob.players.length; i++) {
                        if (roomBlob.players[i].isActive == false || roomBlob.players[i].userId == null) {
                            index = i;
                            break;
                        }
                    }
                }

                if (index < 0) {
                    // console.error("unable to find free spot. should probably spectate here...")
                    // /** @type {PlayerBlob[]} */
                    // var plist = roomBlob.players[i];
                    // console.log("joinRoom failed", "full", settings.userID, plist.map(function (p) { return p.userId }));
                    m_this.marco("onRoomJoinFailed", "full");
                    // m_this.release();
                    // Main.logic.exitGame();
                    return;
                }

                var playerRef = roomRef.child("players/" + index);
                // playerRef.update({
                //     isActive: true,
                //     userId: settings.userID,
                //     name: settings.gameHandle
                // }).then(function () {
                //     Main.changeScreen(WaitingScreen);
                // })

                m_this.playerData = m_this.create(PlayerData);
                var tempPlayerBlob = m_this.playerData.init(index, false, settings.userID, settings.gameHandle.substr(0, 8), pickCareer());

                m_this.marco("onRoomJoinSucceeded");
                // tempPlayerBlob.stocks.push(new Stocks(DeckBuilder.getCard(DeckNames.smalldealDeck, 20),20));
                playerRef.set(tempPlayerBlob).then(function (/* thenableRef */ /* only works on pushes */) {
                    // m_this.setupRoomReferences(thenableRef.ref);
                    m_this.setupRoomReferences(roomRef);

                    // return thenableRef.child("timeCreated").once("value", function (timeCreatedSnap) {
                    //     console.log("timestamp", roomBlob.timeCreated, timeCreatedSnap.val());
                    //     roomBlob.timeCreated = timeCreatedSnap.val();
                    //     return thenableRef;
                    // });
                })//.then(function (timeCreatedSnap) { });

            });
        }

        function _joinRoom() {

        }

        function _setupHacks() {
            if (m_spectating) {
                return;
            }

            hacks.add("ft", function () {
                // straight to the fasttrack hack:
                var cards = DeckBuilder.getDeck(DeckNames.bigdealDeck);

                var properties = m_this.playerData.properties;
                cards.forEach(function (bigDeal) {
                    if (bigDeal.type == DeckCardTypes.bigdeal_property) {
                        properties.push(new Property(bigDeal, 1));
                    }
                })

                m_this.localPlayerRef.update({
                    properties: properties,
                    cash: 300000
                }).then(function () {
                    return onShowEndCard();
                })
            });

            hacks.add("cash", function (amount) {
                amount = amount || 1000000;
                m_this.localPlayerRef.update({
                    cash: m_this.playerData.cash + amount
                });
            })
        }

        this.setupRoomReferences = function (roomRef) {
            m_this.roomRef = roomRef;
            m_this.roomId = roomRef.key;

            _setupHacks();

            console.log("room Key Set", m_this.roomId);

            // handle spectate mode...
            if (this.isParticipating()) {
                m_this.localPlayerRef = roomRef.child("players/" + m_this.playerData.indexLobby);

                // TODO: handle isActive player migration here
                m_this.localPlayerRef.child("isActive").onDisconnect().set(false);
                // m_this.localPlayerRef.child("isHost").onDisconnect().set(false, Main.changeHost);
                // var index = m_this.playerData.index;
                // m_this.localPlayerRef.onDisconnect().set(createPlayerBlobStub(index));


                m_this.localPlayerRef.on("value", function (snap) {
                    m_this.playerData.fromFirebaseBlob(snap.val());
                    /*if (m_this.playerData.isActive == false) {
                        console.log("local player isActive lost");
                        m_this.localPlayerRef.off("value");
                        Main.logic.exitGame();
                        return;
                    }*/
                    console.log("onlocalplayer updated");
                    setTimeout(function () {
                        m_this.marco("onPlayerDataUpdated", m_this.playerData);
                    }, 1);
                })
            }

            m_gameStateRef = m_this.roomRef.child("gameState");
            m_turnStateRef = m_this.roomRef.child("gameState/turnState");

            // for (var i = 0; i < m_this.roomBlob.players.length; i++) {
            m_this.roomBlob.players.forEach(function (player, i) {
                roomRef.child("players/" + i).on("value", function (snap) {
                    m_this.roomBlob.players[i].fromFirebase(snap.val());
                });

                roomRef.child("players/" + i + "/dreamId").on("value", function (snap) {
                    var dreamId = snap.val();
                    if (dreamId != -1) {
                        // setPlayerTurnState('DreamSelectCard', dreamId);
                        m_this.marco("onDreamSelectUpdated", dreamId)
                    }
                })

                // other things we care about listening for...
                roomRef.child("players/" + i + "/cardQueue").on("value", function (snap) {
                    // var cashflowRatio = snap.val();
                    console.log("cardQueue updated", snap.val());
                })

                roomRef.child("players/" + i + "/cashflowRatio").on("value", function (snap) {
                    var cashflowRatio = snap.val();
                    // console.log("cashflowRatio updated", cashflowRatio);
                })

                roomRef.child("players/" + i + "/fastTrack").on("value", function (snap) {
                    var isFastTrack = snap.val();
                    // console.log("isFastTrack updated", isFastTrack);
                    m_this.marco("onFastTrackSwitched", i, isFastTrack);
                })
            });

            // TODO: listen for Deck index list and currentIndex separately (for efficiency's sake)

            Object.keys(DeckNames).forEach(function (deckName) {
                m_this.roomRef.child("decks/" + deckName).on("value", function (snap) {
                    // console.log("deck updated", deckName);
                    m_this.roomBlob.decks[deckName] = snap.val();
                    //m_this[deckName] = snap.val();
                });
            });

            m_this.roomRef.child("fastTrackSpaces").on("value", function (snap) {
                m_this.roomBlob.fastTrackSpaces = snap.val();
                // console.log("board fastTrackSpaces updated", m_this.roomBlob.fastTrackSpaces);
            });
            m_this.roomRef.child("playerOrder").on("value", function (snap) {
                m_this.roomBlob.playerOrder = snap.val();
                console.log("playerOrder 4onvalue", m_this.roomBlob.playerOrder);
            });

            // get players objects...
            /* promises.push(m_this.roomRef.child("players").on("value", function (snap) {
                m_players = snap.val();
                console.log("playerListUpdated", m_players.length, m_players);
            })); */

            m_gameStateRef.on("value", onGameStateUpdated);
        }

        this.onRelease = function () {
            //TODO: 'off' the remaining listeners
            console.log("GameSession", "releasing");


            // if (m_this.localPlayerRef) {
            //     m_this.localPlayerRef.child("isActive").set(false);
            // }

            if (m_this.localPlayerRef) {

                console.log("GameSession", "releasing", "localPlayerRef");
                m_this.localPlayerRef.child("isActive").onDisconnect().cancel();
                m_this.localPlayerRef.child("isActive").off();
                m_this.localPlayerRef.off();
                m_this.localPlayerRef.child("isActive").set(false);
            }
            m_this.localPlayerRef = null;

            if (m_this.roomRef) {
                console.log("GameSession", "releasing", "roomRef");
                m_this.roomRef.child("playerOrder").off();
                // m_this.roomRef.child("cardQueue").off();
                m_this.roomRef.child("fastTrackSpaces").off();

                m_this.roomRef.child("decks/" + DeckNames.smalldealDeck).off();
                m_this.roomRef.child("decks/" + DeckNames.bigdealDeck).off();
                m_this.roomRef.child("decks/" + DeckNames.marketDeck).off();
                m_this.roomRef.child("decks/" + DeckNames.doodadDeck).off();

                m_this.roomBlob.players.forEach(function (player, i) {
                    console.log("GameSession", "releasing", "player", i);
                    m_this.roomRef.child("players/" + i).off();
                    m_this.roomRef.child("players/" + i + "/dreamId").off();
                    m_this.roomRef.child("players/" + i + "/cashflowRatio").off();
                    m_this.roomRef.child("players/" + i + "/fastTrack").off();
                })
            }
            m_this.roomRef = null;


            if (m_gameStateRef) {
                console.log("GameSession", "releasing", "gamestate");
                m_gameStateRef.off("value", onGameStateUpdated);
            }
            m_gameStateRef = null;
            m_turnStateRef = null;
        }

        /**
         * 
         * @returns {Number}
         */
        this.getNumberOfPlayers = function () {
            // return m_this.roomBlob.players.length;
            return m_this.roomBlob.playerOrder.length;
        }

        /**
         * 
         * @param {Number} index - player index
         * @returns {PlayerBlob}
         */
        this.getPlayerBlobByIndex = function (index) {
            index = m_this.roomBlob.playerOrder[index];
            return m_this.roomBlob.players[index];
        }

        /**
         * 
         * @param {Number} index - player index
         * @returns {firebase.database.Reference}
         */
        this.getPlayerRefByIndex = function (index) {
            index = m_this.roomBlob.playerOrder[index];
            return m_this.roomRef.child("players/" + index);
        }


        /**
         * @returns {PlayerBlob}
         */
        this.getCurrentPlayerBlob = function () {
            // return m_this.roomBlob.players[m_activePlayerIndex];
            return m_this.roomBlob.players[m_this.getCurrentPlayerIndex()];
        }

        /**
         * 
         * @returns {Number}
         */
        this.getCurrentPlayerIndex = function () {
            // return m_this.roomBlob.playerOrder[m_this.gameState.turn];
            return m_this.gameState.turn;
        }



        /**
         * @returns {PlayerBlob[]}
         */
        this.getPlayerBlobs = function () {
            // return m_this.roomBlob.players;
            var playerBlobs = new Array(m_this.roomBlob.playerOrder.length);
            for (var i = 0; i < m_this.roomBlob.playerOrder.length; i++) {
                playerBlobs[i] = m_this.roomBlob.players[m_this.roomBlob.playerOrder[i]];
            }
            return playerBlobs;
        }

        /**
         * @returns {firebase.database.Reference[]}
         */
        this.getPlayerRefs = function () {// return m_this.roomBlob.players;
            var playerRefs = new Array(m_this.roomBlob.playerOrder.length);
            for (var i = 0; i < m_this.roomBlob.playerOrder.length; i++) {
                playerRefs[i] = m_this.roomRef.child("players/" + m_this.roomBlob.playerOrder[i]);
            }
            return playerRefs;
        }

        /**
         * @returns {PlayerBlob}
         */
        this.getWinner = function () {
            for (var i = 0; i < m_this.roomBlob.players.length; i++) {
                if (m_this.roomBlob.players[i].passiveIncome >= m_this.roomBlob.players[i].winPassiveIncome) {
                    return m_this.roomBlob.players[i];
                }
                else if (m_this.roomBlob.players[i].dreamWin) {
                    return m_this.roomBlob.players[i];
                }
            }
            return null;
        }

        // /**
        //  * 
        //  * @param {string} id - player id
        //  */
        // this.getPlayerBlobById = function (index) {
        //     return null;
        // }

        var m_isLocalPlayersTurn = false;
        this.setIsLocalPlayersTurn = function (bool) {
            if (bool) {
                if (!m_isLocalPlayersTurn) {
                    m_isLocalPlayersTurn = true;
                    // here we do our turn start stuff.
                    //m_this.startTurn();
                }
            } else {
                if (m_isLocalPlayersTurn) {
                    m_isLocalPlayersTurn = false;
                    // at end of turn WE SHOULD SET THIS FALSE. PROBABLY. 
                    // do anything at the start of a remote player turn that we might want to do...
                }
            }
        }



        function onGameStateUpdated(snapshot) {
            var o = snapshot.val();

            if (o == null) {
                console.error("gamestate not set yet", m_this.roomRef.key, m_gameStateRef);
                return;
            }

            var newGameState = GameState.fromFirebase(o);

            setTimeout(function () {
                var newTurn = newGameState.turn;

                // m_activePlayerIndex = newTurn % m_this.roomBlob.players.length;
                if (m_this.isParticipating()) {
                    m_isMyTurn = (m_this.playerData.index === newTurn);
                } else {
                    m_isMyTurn = false;
                }

                m_this.roomBlob.gameState = newGameState;
                // setTimeout(function () {
                //     m_this.setIsLocalPlayersTurn(m_isMyTurn);
                // }, 1);

                // changes the view...
                if (newGameState.gameStarted) {
                    if (!(Main.screen instanceof GameScreen)) {
                        Main.changeScreen(GameScreen);
                    }
                } else {
                    if (!(Main.screen instanceof WaitingScreen)) {
                        Main.changeScreen(WaitingScreen);
                    }
                }

                if (m_this.turnState.id == GameStates.turnStart) {
                    if (m_isMyTurn) {
                        if (m_this.playerData.dreamId == -1) {
                            // this one is a little awkward, we just set the dreamId
                            // and the game assumes if it has just been set, that 
                            // we are in the dreamselect phase
                            m_this.localPlayerRef.child("dreamId").set(0).then(function () {
                                return setPlayerTurnState(DreamSelectCard, 0);
                            });
                        } else {
                            //TODO: Card Queue
                            if (m_this.playerData.downsizeCount > 0) {
                                if (m_this.playerData.downsizeCount == 2) {
                                    m_this.marco("onLogAction", m_this.playerData.name + Data.getVocab("skipturndownsize", "copy1"));// + 1 + Data.getVocab("skipturndownsize","copy3"));
                                } else {
                                    m_this.marco("onLogAction", m_this.playerData.name + Data.getVocab("skipturndownsize", "copy1"));// + (session.activePlayer.downsizeCount-1) + Data.getVocab("skipturndownsize","copy2"));
                                }
                                m_this.localPlayerRef.update({ cardQueue: [], inQueue: false }).then(function () {
                                    return setPlayerTurnState(SkipTurnCard);
                                })
                            } else if (m_this.playerData.bankruptCount > 0) {
                                m_this.marco("onLogAction", m_this.playerData.name + Data.getVocab("skipturnbankrupt", "copy"));
                                m_this.localPlayerRef.update({ cardQueue: [], inQueue: false }).then(function () {
                                    return setPlayerTurnState(SkipTurnCard);
                                })
                            } else {
                                // clear out irrelevant cards from the queue.

                                console.log("cardqueue", "filtering...", m_this.playerData.getBlob().cardQueue);
                                var filteredQueue = null;

                                if (m_this.playerData.fastTrack) {
                                    filteredQueue = [];
                                }
                                else {
                                    filteredQueue = m_this.playerData.getBlob().cardQueue.filter(function (tempCardData, i) {
                                        if (tempCardData.type.indexOf("market") > -1) {
                                            console.log("cardqueue", "found market card:", tempCardData);
                                            if (m_this.playerData.playerCanUseMarketOpportunity(tempCardData.key) == false) {
                                                console.log("cardqueue", "keeping market");
                                                return false;
                                            }
                                        }
                                        else if (tempCardData.type.indexOf("smalldeal") > -1) {
                                            console.log("cardqueue", "found smalldeal card:", tempCardData);
                                            // if (session.activePlayer.StockAmount(tempCardData.key) == 0 && tempCardData.type != "anystock")
                                            if (m_this.playerData.getStockAmount(tempCardData.key) == 0 && tempCardData.type != DeckCardTypes.smalldeal_anystock) {
                                                console.log("cardqueue", "keeping smalldeal");
                                                return false;
                                            }
                                        }
                                        else {
                                            console.log("cardqueue", "invalid card info, removing...", tempCardData);
                                            return false;
                                        }
                                        console.log("cardqueue", "keeping card");
                                        return true;
                                    });
                                }

                                if (filteredQueue.length != m_this.playerData.getBlob().cardQueue.length) {
                                    console.log("cardqueue", "length mismatch", filteredQueue.length != m_this.playerData.getBlob().cardQueue.length, filteredQueue.length, m_this.playerData.getBlob().cardQueue.length);
                                }
                                m_this.localPlayerRef.child("cardQueue").set(filteredQueue).then(function () {
                                    var queue = m_this.playerData.getBlob().cardQueue;
                                    console.log("cardqueue", "filtered queue complete. new value:", queue);
                                    console.log("cardqueue", "filtered queue complete. old value:", filteredQueue);

                                    if (queue.length > 0) {
                                        var tempCardData = queue.shift();
                                        tempCardData.queued = true;
                                        return m_this.localPlayerRef.update({ cardQueue: queue, inQueue: true }).then(function () {
                                            return handleCardDrawn(tempCardData);
                                        })
                                    } else {
                                        return m_this.localPlayerRef.update({ inQueue: false }).then(function () {
                                            return setPlayerTurnState(StartTurnCard);
                                        })
                                    }
                                });
                            }
                        }
                    }
                } else if (m_this.turnState.id == GameStates.rollingInvestment) {
                    if (!m_isMyTurn) { return; }
                    // setTimeout(function () {
                    //     setPlayerTurnState(InvestmentRollCard );
                    // }, 1000)
                } else if (m_this.turnState.id == GameStates.rolling) {

                    if (!m_isMyTurn) { return; }

                    /** @type {Number[]} */
                    var rolls = m_this.turnState.data;

                    var distance = 0;
                    rolls.forEach(function (roll) { distance += roll; });

                    var boardData = new BoardData();
                    var board = null;

                    var payday = 0;
                    if (m_this.playerData.fastTrack) {
                        board = boardData.fastTrack;
                        payday = m_this.playerData.payday; // TODO: what is the fastTrack payment amount
                    } else {
                        board = boardData.ratRace;
                        payday = m_this.playerData.payday;
                    }

                    //TODO: actually do the steps required for moving the player in steps to payday then continue
                    var numPaydays = 0;
                    var currentPos = m_this.playerData.position;
                    for (var i = 0; i < distance; i++) {
                        var pos = (currentPos + (i + 1)) % (board.length);
                        if (board[pos].type == TileTypes.rr_payday || board[pos].type == TileTypes.ft_cashflowday) {
                            numPaydays++;
                        }
                    }

                    var newPosition = (m_this.playerData.position + distance) % (board.length);
                    var newCash = m_this.playerData.cash + (payday * numPaydays);
                    var tempCash = newCash;
                    if (tempCash < 0) {
                        tempCash = 0;
                    }
                    m_this.localPlayerRef.update({
                        cash: tempCash,
                        position: newPosition
                    }).then(function () {
                        if (numPaydays > 0) {
                            m_this.marco("onShowPayday", (payday * numPaydays))
                        }
                        if (newCash < 0) {
                            return stillBankruptCheck();
                        }
                    })

                    // m_myPlayerPiece.index += roll;
                    // var position = m_myPlayerPiece.index % m_board.ratRace.length;

                    // var position = (m_this.playerData.index + roll) % boardLength;
                    // m_this.localPlayerRef.child("position").set(position);
                    // } else if (m_this.turnState.id == GameStates.stockSplit) {
                    //     specialStockEvent();
                } else {
                    m_this.marco("onGameStateUpdated");
                }
            }, 1);
        }
        /**
         * checks if turn should be skipped
         * bankrupt/downsized/GG
         * @returns {Boolean}
         */
        function shouldSkipMyTurn() {
            return false;
        }

        function setPlayerTurnState(state, data) {

            if (state == DreamSelectCard) {
                console.log("i'm dreaming!!!");
            }

            var stateName = (typeof state === "function") ? state.name : state.toString();
            // var o = { id: stateName };
            var o = new TurnState();
            o.id = stateName;
            if (data != undefined) {
                o.data = data;
            }

            console.log("setting state: ", o)
            return m_turnStateRef.set(o);
        }

        function setPlayerTurnStateManual(turnState) {
            return m_turnStateRef.set(turnState);
        }

        function onSkipTurnOkClicked() {
            m_this.marco(log, Main.gameSession.getCurrentPlayerBlob().name + "'s skipped their turn.")
            var updater = null;
            if (m_this.playerData.bankruptCount > 0) {
                updater = {
                    bankruptCount: m_this.playerData.bankruptCount - 1
                }
            } else if (m_this.playerData.downsizeCount > 0) {
                updater = {
                    downsizeCount: m_this.playerData.downsizeCount - 1
                }
            }

            if (updater) {
                m_this.localPlayerRef.update(updater).then(function () {
                    return onEndTurn();
                })
            }
        }

        function onStartGameClicked() {

            m_this.marco(log, "The game has started!");

            m_this.roomBlob.gameState.gameStarted = true;

            var turnState = new TurnState();
            turnState.id = GameStates.turnStart;
            m_this.roomBlob.gameState.turnState = turnState;

            var playerOrder = [];
            return m_this.roomRef.child("players").once("value", function (snap) {
                var promises = [];
                snap.val().forEach(function (player, i) {
                    if (!player.isActive) {
                        promises.push(m_this.roomRef.child("players/" + i + "/index").set(-1))
                        // promises.push(m_this.roomRef.child("players/" + i).set(false)); // this blows up
                        return false;
                    }
                    playerOrder.push(i);
                    return true;
                });

                for (var i = 0; i < playerOrder.length; i++) {
                    promises.push(m_this.roomRef.child("players/" + playerOrder[i] + "/index").set(i));
                };

                return firebase.Promise.all(promises);
            }).then(function () {
                console.log("playerOrder 1setting", playerOrder);

                // [ null, p1, null, p2] => [1, 3]

                //TODO: hack re-ordering player list and re-set up the listeners...
                return m_this.roomRef.child("playerOrder").set(playerOrder, function () {
                    console.log("playerOrder 2complete", playerOrder);
                });
            }).then(function () {
                console.log("playerOrder 3then", playerOrder);
                return m_gameStateRef.set(m_this.roomBlob.gameState);
            });
        }

        /**
         * @param {string} deckName 
         * @returns {firebase.Promise} a promise representing the final value.
         */
        this.drawCard = function (deckName /* , onCardDrawn */) {
            // var deck = m_this[deckName];
            var deck = m_this.roomBlob.decks[deckName];

            // len : 2, index: 0 
            if (deck.index + 1 <= deck.cards.length) {
                var index = deck.index;
                var cardId = deck.cards[deck.index];
                deck.index++;

                return m_this.roomRef.child("decks/" + deckName + "/index").set(deck.index).then(function () {
                    return _completeDrawCard(deckName, cardId, index)
                });
            } else {
                deck = DeckBuilder.buildDeck(deckName);
                var index = deck.index;
                var cardId = deck.cards[deck.index];
                deck.index++;

                return m_this.roomRef.child("decks/" + deckName).set(deck).then(function () {
                    return _completeDrawCard(deckName, cardId, index)
                });
            }
            return null;
        }

        function _completeDrawCard(deckName, cardId, index) {
            // console.log("draw complete", deckName, index, cardId /* , DeckBuilder[deckName][cardId] */);
            // return DeckBuilder[deckName][cardId];
            return DeckBuilder.getCard(deckName, cardId);

            //do the add card to queue stuff here
        }


        /**
         * @param {{id:Number}} investmentData
         */
        this.playerCanPurchaseInvesment = function (investmentData) {
            var val = m_this.roomBlob.fastTrackSpaces[investmentData.id];
            // console.log("can purchase investment", investmentData, "?", val < 0);
            return val < 0;
        }

        function purchaseInvestment(hasReward) {
            var tempCardData = m_this.cardData;
            var fastTrackSpaces = m_this.roomBlob.fastTrackSpaces;
            fastTrackSpaces[Number(tempCardData.id)] = m_this.playerData.index;

            m_this.roomRef.update({
                fastTrackSpaces: fastTrackSpaces
            }).then(function () {
                if (hasReward === true) {
                    return m_this.localPlayerRef.child("cash").set(m_this.playerData.cash + tempCardData.reward).then(function () {
                        onShowEndCard();
                    });
                }
                else {
                    onAttemptDealPurchase();
                }
            });
        }

        function onAttemptInvestmentPurchase() {
            if (m_this.cardData.rollmin != null) {
                // roll dice
                /* 
                m_this.marco("onLogAction", link.player.playerName + Data.getVocab("purchased", "copy") + gtNumbers.formatNumber(cardData.cost) + ".");
                link.player.cash += -cardData.cost;
                shout("RefreshStatement");
                shout("RefreshHeader");
                shout("HideSheet");
                shout("ShowCard", "investmentRollCard");
     
                if (link.player.isAIPlayer)
                    shout("RollMathChance");
                else
                    shout("RollDie3DChance"); // does the dice roll stuff...
                */

                var newCash = m_this.playerData.cash - m_this.cardData.cost;
                m_this.localPlayerRef.update({
                    cash: newCash
                }).then(function () {
                    // manually set cost to 0, we've already paid.
                    m_this.cardData.cost = 0;

                    // onRollInvestmentDice();
                    var newState = new TurnState(InvestmentRollCard);
                    newState.data = m_this.cardData;
                    newState.dice = rollDice(1);
                    return setPlayerTurnStateManual(newState);
                })

            } else {

                /* inputAmount = 1;
                shout("PurchaseInvestment", cardData);
                shout("AttemptDealPurchase", cardData, inputAmount); */
                purchaseInvestment();
            }
        }

        function onAttemptInvestmentChancePurchase() {
            if (m_this.cardData.stock == "true") {
                m_this.marco("onLogAction", m_this.playerData.name + Data.getVocab("purchased", "copy") + MathHelper.formatNumber(m_this.cardData.cost) + ".");
                purchaseInvestment(true)
                // shout("RefreshStatement");
                // shout("RefreshHeader");
                // shout("OfferEndTurn");
            }
            else {
                m_this.cardData.cost = 0;
                // inputAmount = 1;
                // shout("PurchaseInvestment", cardData);
                // shout("AttemptDealPurchase", cardData, inputAmount);
                purchaseInvestment();
            }
        }

        /**
         * @returns {Promise}
         */
        function _increaseDreamCountPromise() {
            var tempCardData = m_this.cardData;
            var fastTrackSpaces = m_this.roomBlob.fastTrackSpaces;

            var promises = [];
            m_this.roomBlob.players.forEach(function (player, i) {
                if (i == m_this.playerData.index) {
                    return;
                }
                var dream = Data.getDream(m_this.roomBlob.players[i].dreamId);
                if (dream && dream.id == tempCardData.id) {
                    var p = m_this.roomRef.child("players/" + i + "/dreamCostMultiplier").set(
                        m_this.roomBlob.players[i].dreamCostMultiplier + 1
                    );
                    promises.push(p);
                }
            })

            return firebase.Promise.all(promises);

            // fastTrackSpaces[Number(tempCardData.id)]++;
            // if (fastTrackSpaces[Number(tempCardData.id)] > 10) {
            //     fastTrackSpaces[Number(tempCardData.id)] = 10;
            // }

            // return m_this.roomRef.update({
            //     fastTrackSpaces: fastTrackSpaces
            // });
        }

        // TODO: don't increase cost when we land on our own dreams, only for other players.
        function onAttemptDreamPurchase() {
            return _increaseDreamCountPromise()
                .then(function () {
                    onAttemptDealPurchase();
                })
        }

        function onDreamPassed() {
            return _increaseDreamCountPromise().then(function () {
                return onShowEndCard();
            })
        }

        function onAttemptDealPurchase( /* dealData,  */ quantity) {
            quantity = quantity || 1;
            var newAsset = null;
            var dealData = m_this.cardData;

            // TODO: smalldeal_startup

            if (dealData.type == DeckCardTypes.smalldeal_property || dealData.type == DeckCardTypes.bigdeal_property) {
                newAsset = new Property(dealData, quantity);
            } else if (dealData.type == DeckCardTypes.smalldeal_stock || dealData.type == DeckCardTypes.smalldeal_anystock) {
                newAsset = new Stocks(dealData, quantity);
            } else if (dealData.type == DeckCardTypes.fasttrack_investment) {
                newAsset = new Investment(dealData, quantity);
            } else { // NOTE: this is probably only for 'dreams'
                newAsset = new Property(dealData, quantity);
            }

            var totalCost = 0;
            // if (newAsset.downpay != null) {
            if (newAsset.downpay != -1) {
                totalCost = newAsset.downpay * quantity;
            } else {
                totalCost = newAsset.cost * quantity;
            }

            if (m_this.playerData.cash >= totalCost || quantity < 0) {
                m_this.playerData.cash -= totalCost;

                // console.log("adding asset:", newAsset);
                var updater = {
                    cash: m_this.playerData.cash
                };

                if (newAsset instanceof Stocks) {
                    if (newAsset.quantity < 0) { // we are selling
                        m_this.playerData.sellStocks(newAsset);
                    } else {
                        m_this.playerData.stocks.push(newAsset);
                    }

                    updater.stocks = m_this.playerData.stocks;

                } else if (newAsset instanceof Investment) {
                    m_this.playerData.investments.push(newAsset);
                    updater.investments = m_this.playerData.investments;
                } else if (newAsset.type == DeckCardTypes.fasttrack_dream) {
                    updater.dreamWin = true;
                } else {
                    m_this.playerData.properties.push(newAsset);
                    updater.properties = m_this.playerData.properties;
                }

                m_this.playerData.refresh();
                updater.passiveIncome = m_this.playerData.passiveIncome;
                updater.totalExpenses = m_this.playerData.totalExpenses;
                updater.cashflowRatio = m_this.playerData.cashflowRatio;
                return m_this.localPlayerRef.update(updater).then(function () {
                    onShowEndCard();
                });
            } else {
                var cashNeeded = totalCost - m_this.playerData.cash;
                offerLoan(cashNeeded);
            }
        }

        function offerLoan(cashNeeded) {
            var loan = Math.ceil(cashNeeded / 1000);
            loan *= 1000;
            m_this.cardData.loan = loan;
            m_this.cardData.previousCard = m_this.turnState.id;
            return setPlayerTurnState(LoanCard, m_this.cardData);
        }

        this.addCardToQueue = function (card) {
            //check the current card if it meets the criteria to be added to the queue
            var cardQueued = false;
            if (card === 'market') {
                cardQueued = true;
                //push the card to the queue along with the player ID
                //we need the player ID so that when the it becomes this players turn again
                //and we check the start queue this user will pop it out of the queue

                //the checks for if a player can use the market opportunity on their turn are in gamesession
                //at the shout onPlayerCanUseMarketOpportunity
                //key is the key from the market.json
                //then it loops through the players properties and uses property.key to check for opportunities
            }
            if (card === "smallDeal") {
                if (card.type === 'anystock') {
                    cardQueued = true;

                    //push the opportunity to firebase
                }
            }
            if (!cardQueued) {
                //dont add card to the queue
            }
            //continue game logice
        }

        function onDrawCard(deckName) {
            return Main.gameSession.drawCard(deckName).then(function (cardData) {
                return handleCardDrawn(cardData);
            });
        }

        /**
         * handled drawing card
         * @param {Object} cardData the cardData from json
         */
        function handleCardDrawn(cardData) {
            var cardState = null;
            var shouldQueue = false;
            var deckName = DeckBuilder.getDeckNameFromCardType(cardData.type);
            if (deckName == DeckNames.smalldealDeck) {
                //hack to draw a specific card
                // cardData = {
                //     "cost": -1,
                //     "copy1": "Business is up dramatically and the company is doing so well their shares have just split!",
                //     "title": "STOCK - MYT4U ELECTRONICS CO.",
                //     "traderange": 0,
                //     "key": "MYT4U",
                //     "type": "smalldeal_stock",
                //     "cashflow": 0,
                //     "rule": "Everyone who owns MYT4U shares doubles the number of shares they own. (Pay no money, your total cost does not change.) No dividends. No one may buy or sell at this time.",
                //     "queue": "true"
                // };
                if (cardData.type == DeckCardTypes.smalldeal_stock || cardData.type == DeckCardTypes.smalldeal_anystock) {
                    if (Number(cardData.cost) < 0) {
                        // cardState = GameStates.stockSplit;
                        cardState = SpecialStockCard;
                    } else {
                        cardState = StockCard;
                    }
                } else if (cardData.downpay != undefined) {
                    cardState = PropertySmallDealCard;
                } else {
                    //This should never happen
                    console.warn("this smalldeal this case shouldn't happen what went wrong?!, data:", cardData);
                }
            } else if (deckName == DeckNames.doodadDeck) {
                //cardData = DeckBuilder.debugGetCardOfTypeFromDeck(DeckNames.doodadDeck, DeckCardTypes.specialDoodad, 0);
                if (cardData.title == 'BUY BIG SCREEN TV' || cardData.title == 'NEW BOAT') {
                    cardState = SpecialDoodadCard;
                } else {
                    cardState = DoodadCard;
                }
            } else if (deckName == DeckNames.bigdealDeck) {
                cardState = PropertyBigDealCard;
            } else if (deckName == DeckNames.marketDeck) {
                shouldQueue = true;
                //market_sell, market_startup, market_lose, market_selladd, market_sellmultiply, market_fee, market_brother
                if (cardData.queued != true) {
                    // cardData = DeckBuilder.debugGetCardOfTypeFromDeck(DeckNames.marketDeck, DeckCardTypes.market_sell, 0);
                    // cardData = DeckBuilder.debugGetCardOfTypeFromDeck(DeckNames.marketDeck, DeckCardTypes.market_brother, 0);
                    // cardData = {
                    //     "title": "CONDO BUYER – 2BR/1BA",
                    //     "copy1": "You are offered $65,000 for a 2/1 rental condo. Buyer has their own financing.",
                    //     "copy2": "If you sell, pay off the related mortgage and give up the cash flow you currently receive on this property.",
                    //     "rule": "Everyone may sell at this price.",
                    //     "type": "market_sell",
                    //     "key": "2/1CONDO",
                    //     "cost": 65000,
                    //     "queue": "true"
                    // };
                }
                if (m_this.playerData.playerCanUseMarketOpportunity(cardData.key)) {
                    if (cardData.type === "market_startup" || cardData.type === "market_lose" || cardData.type === "market_sellmultiply" || cardData.type === "market_fee") {
                        cardState = MarketMustCard;
                    } else {
                        cardState = MarketCard;
                    }
                } else {
                    cardState = MarketNoOpportunityCard;
                }
            }

            // if this isn't already a card that's been queued...
            if (cardData.queue == "true" && cardData.queued != true) {
                console.log("queuing card...", cardData);
                return addCardtoCardQueue(cardData).then(function () {
                    return setPlayerTurnState(cardState, cardData);
                })
            }

            return setPlayerTurnState(cardState, cardData);
        }

        function addCardtoCardQueue(cardData) {
            var promises = [];
            for (var i = 0; i < m_this.getNumberOfPlayers(); i++) {
                if (i == m_this.playerData.index) {
                    continue;
                }
                var queue = m_this.getPlayerBlobByIndex(i).cardQueue;
                queue.push(cardData);
                var p = m_this.getPlayerRefByIndex(i).update({ cardQueue: queue, inQueue: true });

                promises.push(p);
            }
            return firebase.Promise.all(promises);
        }

        function onRollTurnDice(numDice) {
            var rolls = null;
            if (m_this.playerData.charityCount < 4 && m_this.playerData.charityCount > 0) { //charity count 4 is fast track and doesnt go down;
                var charityCount = m_this.playerData.charityCount - 1;
                if (charityCount > -1) {
                    var updater = {
                        charityCount: charityCount
                    }
                    m_this.localPlayerRef.update(updater).then(function () {
                        rolls = rollDice(numDice);
                        _logRollResult(rolls);
                        writeDiceResult(rolls);
                    });
                }
            } else {
                rolls = rollDice(numDice);
                _logRollResult(rolls);
                writeDiceResult(rolls);
            }
        }

        function _logRollResult(rolls) {
            var message = Main.gameSession.getCurrentPlayerBlob().name + " rolled a" + (rolls.length > 1 ? rolls[0].toString() + " and a " + rolls[1].toString() : rolls[0].toString());
            m_this.marco(log, message)
        }

        function onRollInvestmentDice() {
            if (!m_isMyTurn) { console.warn("can't roll dice. not your turn"); return; }
            var rolls = rollDice(1);
            // console.log("investing...")
            var message = Main.gameSession.getCurrentPlayerBlob().name + " rolled a" + (rolls.length > 1 ? rolls[0].toString() + " and a " + rolls[1].toString() : rolls[0].toString());

            m_this.marco(log, message)
            // setPlayerTurnState(InvestmentRollCard, rolls);
        }

        /** 
         * @param {Number} numDice - how many dice do we roll?
         * @returns {Number[]} */
        function rollDice(numDice) {
            var rolls = [];
            // console.log("rolling", numDice, " dice...");
            for (var i = 0; i < numDice; i++) {
                rolls.push(MathHelper.randomInt(1, 6));
            }
            console.log("Rolled", rolls);
            return rolls;
        }

        hacks.add("roll", function (spaces) {
            writeDiceResult([spaces]);
        })

        function writeDiceResult(rolls, state) {
            state = state || GameStates.rolling;
            if (!m_isMyTurn) { console.warn("can't roll dice. not your turn"); return; }
            setPlayerTurnState(state, rolls);
        }

        function stillBankruptCheck() {
            console.log("BankruptFlow", "stillBankruptCheck");
            if ((m_this.playerData.salary + m_this.playerData.passiveIncome - m_this.playerData.totalExpenses) > 0) {
                //this check determines if they are ready to get out of bankruptcy
                setPlayerTurnState(BankruptCompleteCard);
                //return BankruptCompleteCard;
            }

            else if (!m_this.playerData.playerHasAssets()) {
                console.log("BankruptFlow", "hasAssets");
                if (!m_this.playerData.playerCanPayOffDebt()) {
                    console.log("BankruptFlow", "cannot pay off debt");
                    //the player does not have assets and they do not have enough cash to pay off any of their debts
                    //first halve their payments
                    //then show the bankrupt halve card and highlight the car loans retail debt and credit cards
                    m_this.playerData.bankruptHalveDebts();
                    var updater = {
                        debts: m_this.playerData.debts,
                        passiveIncome: m_this.playerData.passiveIncome,
                        totalExpenses: m_this.playerData.totalExpenses,
                        cashflowRatio: m_this.playerData.cashflowRatio
                    };

                    m_this.localPlayerRef.update(updater).then(function () {
                        //return BankruptHalveCard;
                        setPlayerTurnState(BankruptHalveCard);
                    });
                    //return;
                } else {
                    console.log("BankruptFlow", "can pay a debt");
                    setPlayerTurnState(BankruptCard);
                }
            }
            else {
                //otherwise show the bankruptcy card an go thru the process of selling assets and paying off debts
                setPlayerTurnState(BankruptCard);
                //return BankruptCard;
            }
        }

        /**
         * The Tile Landed on
         * @param {BoardTile} tile 
         */
        function onLocalPlayerArrivedAtSpace(tile) {
            if (!m_isMyTurn) { return; }
            if (m_this.turnState.id != GameStates.rolling) {
                console.warn("ignoring roll. current state:", m_this.turnState);
                return;
            }

            // hacky mchackerson
            // tile = BoardElement.instance.getTilesByType(TileTypes.rr_deal)[0];

            var tempCardData = null;

            // ratrace
            if (tile.type == TileTypes.rr_deal) {
                setPlayerTurnState(DealCard);
            } else if (tile.type == TileTypes.rr_market) {
                onDrawCard(DeckNames.marketDeck);
            } else if (tile.type == TileTypes.rr_doodad) {
                onDrawCard(DeckNames.doodadDeck)
            } else if (tile.type == TileTypes.rr_payday) { //TODO: give the player money and show the pop up cash
                onShowEndCard();
            } else if (tile.type == TileTypes.rr_baby) {
                setPlayerTurnState(BabyCard);
            } else if (tile.type == TileTypes.rr_charity) {
                setPlayerTurnState(CharityCard);
            } else if (tile.type == TileTypes.rr_downsize) {
                m_this.cardData.cost = m_this.playerData.totalExpenses;
                setPlayerTurnState(DownsizeCard, m_this.cardData);
            }

            // fasttrack
            else if (tile.type == TileTypes.ft_cashflowday) {
                // TODO: handle this better.
                onShowEndCard();
            } else if (tile.type == TileTypes.ft_deal) {
                tempCardData = Data.getFastTrackCard(tile);
                setPlayerTurnState(InvestmentCard, tempCardData);
            } else if (tile.type == TileTypes.ft_dream) {
                tempCardData = Data.getFastTrackCard(tile);
                setPlayerTurnState(DreamCard, tempCardData);
            } else if (tile.type == TileTypes.ft_charity) {
                setPlayerTurnState(CharityCard);
            } else if (tile.type == TileTypes.ft_divorce) {
                setPlayerTurnState(DivorceCard);
            } else if (tile.type == TileTypes.ft_lawsuit) {
                setPlayerTurnState(LawsuitCard);
            } else if (tile.type == TileTypes.ft_tax) {
                setPlayerTurnState(TaxCard);
            } else {
                onShowEndCard();
            }


            m_this.marco(log, Main.gameSession.getCurrentPlayerBlob.name + " landed on a" + tile.type + " tile!");

            /*
                ft_cashflowday: "ft_cashflowday",
                ft_charity: "ft_charity",
                ft_deal: "ft_deal",
                ft_divorce: "ft_divorce",
                ft_dream: "ft_dream",
                ft_lawsuit: "ft_lawsuit",
                ft_tax: "ft_tax"
            */
        }



        function onCycleDreamSelect(dir) {
            var numDreams = Data.getDreams().length;

            var newDreamId = (m_this.playerData.dreamId + dir);
            if (newDreamId < 0) {
                newDreamId = numDreams - 1;
            } else {
                newDreamId = newDreamId % numDreams;
            }

            m_this.localPlayerRef.child("dreamId").set(newDreamId).then(function () {
                console.log("dreamId set arguments", arguments);
                return setPlayerTurnState(DreamSelectCard, newDreamId);
            });
        }

        function onDreamSelected() {
            setPlayerTurnState(GameStates.turnStart);
        }

        function onShowEndCard() {
            if (!m_this.playerData.fastTrack && m_this.playerData.passiveIncome > m_this.playerData.totalExpenses) {
                //TODO: put this check in the correct spot it is for taking them out of the rat race
                //it might not be a bad idea to have it here but its possible the player could pay off a loan on start turn card to get out of the ratrace and it wouldnt check until end of their turn
                //this is still probably ok the only thing that really hurts them would be boat doodad card
                return setPlayerTurnState(EnterFastTrackCard);
            }

            if (m_this.playerData.inQueue) {
                // hide card
                // shout("HideCard");
                // onRefreshStatement();
                // log("In Queue end turn - Begin Turn");
                // request(BeginTurn);
                return setPlayerTurnState(GameStates.turnStart);
            }

            if (m_this.playerData.fastTrack) {
                if (m_this.playerData.passiveIncome >= m_this.playerData.winPassiveIncome || m_this.playerData.dreamWin) {
                    // WIN THE GAME!
                    //shout("BroadcastGameOver", activePlayer.dreamWin);
                    return winGame();
                }
            }
            return setPlayerTurnState(EndCard);
        }

        function onShowStartTurnCard() {
            setPlayerTurnState(StartTurnCard);
        }

        function onShowBorrowCardStartTurn() {
            setPlayerTurnState(BorrowCardStartTurn);
        }

        function onShowBorrowCardEndTurn() {
            setPlayerTurnState(BorrowCardEndTurn);
        }

        function onCancelBorrowCardStartTurn() {
            setPlayerTurnState(StartTurnCard);
        }

        function onCancelBorrowCardEndTurn() {
            onShowEndCard();
        }

        function onLoanCancelClicked() {
            setPlayerTurnState(m_this.cardData.previousCard, m_this.cardData);
        }

        function onShowStockBuyCard() {
            setPlayerTurnState(StockBuyCard, m_this.cardData);
        }

        function onShowStockSellCard() {
            setPlayerTurnState(StockSellCard, m_this.cardData);
        }

        function onShowStockCard() {
            setPlayerTurnState(StockCard, m_this.cardData);
        }

        function onDoodadPayClicked() {
            attemptPayCash();
        }

        function onPickLoanCanceled() {
            this.marco("onCleanupLiabilityClickListeners");
            setPlayerTurnState(m_this.cardData.previousCard, m_this.cardData);
        }

        function onRepayClicked(id) {
            m_this.turnState.data = { previousCard: id };
            setPlayerTurnState(PickLoanCard, m_this.cardData);
        }

        function onPayOffLoanPayClicked(cost, repayAmount) {

            if (m_this.cardData.loanToRepay == "loan") {
                var ra = parseInt(repayAmount);
                if (cost == ra) {
                    //get rid of the entire loan
                    m_this.playerData.removeDebt(m_this.cardData.loanToRepay);
                }
                else {
                    var newExpense = 0;
                    var newLiability = 0;
                    var debts = m_this.playerData.debts;
                    for (var i = 0; i < debts.length; i++) {
                        if (debts[i].id == "loan") {
                            newExpense = debts[i].expense - (ra * 0.1);
                            newLiability = debts[i].liability - ra;
                            m_this.playerData.debts[i].expense = newExpense;
                            m_this.playerData.debts[i].liability = newLiability;
                        }
                    }
                }

                m_this.playerData.cash -= ra;
            }
            else {
                m_this.playerData.cash -= cost;
                m_this.playerData.removeDebt(m_this.cardData.loanToRepay);
            }
            m_this.playerData.refresh();
            var updater = {
                cash: m_this.playerData.cash,
                passiveIncome: m_this.playerData.passiveIncome,
                totalExpenses: m_this.playerData.totalExpenses,
                cashflowRatio: m_this.playerData.cashflowRatio
            };

            updater.debts = m_this.playerData.debts;
            m_this.localPlayerRef.update(updater).then(function () {
                if (m_this.cardData.previousCard == EndCard) {
                    onShowEndCard();
                }
                else {
                    if (!m_this.playerData.fastTrack && m_this.playerData.passiveIncome > m_this.playerData.totalExpenses) {
                        //fast track check for after they pay off a loan that does not take them back to the endcard
                        return setPlayerTurnState(EnterFastTrackCard);
                    }
                    else {
                        setPlayerTurnState(m_this.cardData.previousCard)
                    }
                }
            });
        }

        function onBankruptPayOffClicked(cost, repayAmount) {
            //TODO: this is the same as above onPayOffLoanPayClicked can it be consolidated?!
            if (m_this.cardData.loanToRepay == "loan") {
                var ra = parseInt(repayAmount);
                if (cost == ra) {
                    //get rid of the entire loan
                    m_this.playerData.removeDebt(m_this.cardData.loanToRepay);
                }
                else {
                    var newExpense = 0;
                    var newLiability = 0;
                    var debts = m_this.playerData.debts;
                    for (var i = 0; i < debts.length; i++) {
                        if (debts[i].id == "loan") {
                            newExpense = debts[i].expense - (ra * 0.1);
                            newLiability = debts[i].liability - ra;
                            m_this.playerData.debts[i].expense = newExpense;
                            m_this.playerData.debts[i].liability = newLiability;
                        }
                    }
                }

                m_this.playerData.cash -= ra;
            }
            else {
                m_this.playerData.cash -= cost;
                m_this.playerData.removeDebt(m_this.cardData.loanToRepay);
            }
            m_this.playerData.refresh();

            var updater = {
                cash: m_this.playerData.cash,
                passiveIncome: m_this.playerData.passiveIncome,
                totalExpenses: m_this.playerData.totalExpenses,
                cashflowRatio: m_this.playerData.cashflowRatio
            };

            updater.debts = m_this.playerData.debts;
            m_this.localPlayerRef.update(updater).then(function () {
                //TODO: check if they are still bankrupt then proceed
                //setPlayerTurnState(m_this.cardData.previousCard)
                stillBankruptCheck();
            });
        }

        function onBankruptPayOffCanceled() {
            setPlayerTurnState(BankruptCard);
        }

        function onBankruptCompleteClicked() {
            m_this.localPlayerRef.child("bankruptCount").set(3).then(function () {
                onShowEndCard();
            });
        }

        function onBankruptHalveClicked() {
            //do not do the bankrupt check here because we dont want to halve again we just want to check if they still are if so they lose
            if ((m_this.playerData.salary + m_this.playerData.passiveIncome - m_this.playerData.totalExpenses) > 0) {
                //this check determines if they are ready to get out of bankruptcy
                setPlayerTurnState(BankruptCompleteCard);
            }
            else {
                m_this.localPlayerRef.child("bankruptCount").set(-1).then(function () {
                    setPlayerTurnState(BankruptLoseCard);
                });
            }
        }

        function onBankruptLoseClicked() {
            //TODO: Check if everyone is bankrupt in the game if so show the everyone bankrupt card
            //TODO: if everyone is not bankrupt end the turn

            var everyoneBankrupt = true;
            m_this.getPlayerBlobs().forEach(function (player, i) {
                if (player.bankruptCount > -1) {
                    everyoneBankrupt = false;
                }
            });

            if (everyoneBankrupt) {
                return setPlayerTurnState(EveryoneBankruptCard);
            }


            return onEndTurn();
        }

        function onPayOffLoanCanceled() {
            setPlayerTurnState(PickLoanCard, m_this.cardData)
        }

        function onBankruptLiabilityClicked(id) {
            this.marco("onCleanupBankruptClickListeners");
            m_this.turnState.data = { loanToRepay: id };
            setPlayerTurnState(BankruptPayCard, m_this.cardData);
        }

        function onBankruptAssetClicked(index) {
            this.marco("onCleanupBankruptClickListeners");
            m_this.turnState.data = {
                propertyIndex: index,
                previousCard: m_this.turnState.id
            };
            setPlayerTurnState(BankruptSellCard, m_this.cardData);
        }

        function onBankruptSellBackClicked() {
            setPlayerTurnState(m_this.cardData.previousCard, m_this.cardData);
        }

        function onBankruptSellProperty() {
            var newCash = m_this.playerData.cash + (m_this.playerData.properties[m_this.cardData.propertyIndex].downpay * 0.5);
            m_this.playerData.removePropertyByIndex(m_this.cardData.propertyIndex);

            m_this.playerData.refresh();
            var updater = {
                cash: newCash,
                passiveIncome: m_this.playerData.passiveIncome,
                totalExpenses: m_this.playerData.totalExpenses,
                cashflowRatio: m_this.playerData.cashflowRatio
            };

            updater.properties = m_this.playerData.properties;
            m_this.localPlayerRef.update(updater).then(function () {
                //TODO: check to see if they are still bankrupt then proceed
                stillBankruptCheck();
            });
        }

        function onListItemSelected(id) {
            this.marco("onCleanupLiabilityClickListeners");
            m_this.turnState.data.loanToRepay = id;
            setPlayerTurnState(PayOffLoanCard, m_this.cardData);
        }

        function onListItemAssetSelected(index) {
            //TODO: CHECK OUT THE CAR WASH SALE it puts the player -50000 what if they dont have the cash?!?! this is insane
            this.marco("onCleanupAssetClickListeners");
            m_this.cardData.propertyIndex = index;
            m_this.cardData.previousCard = m_this.turnState.id;
            if (m_this.turnState.id == "MarketCard") {
                setPlayerTurnState(MarketSellCard, m_this.cardData);
            }
        }

        function onMarketSellBackClicked() {
            setPlayerTurnState(m_this.cardData.previousCard, m_this.cardData);
        }

        function onSellMarketCard() {
            var cardData = m_this.cardData;
            var property = m_this.playerData.properties[cardData.propertyIndex];
            var amount = 1;
            var newCash = 0;
            var nextCard = null;

            if (m_this.cardData.type == "market_sell") {
                if (cardData.key == translations[language]["plex"] || cardData.key == translations[language]["apthouse"] || cardData.key == translations[language]["coin"]) {
                    amount = property.units;
                }
                newCash += ((cardData.cost * amount) - property.mortgage) + m_this.playerData.cash;
                nextCard = MarketCard;
                m_this.playerData.removePropertyByIndex(cardData.propertyIndex);
            }
            else if (cardData.type == "market_selladd") {
                if (property.key == cardData.key && property.quantity > 0) {
                    newCash = ((property.cost + cardData.cost) - property.mortgage) + m_this.playerData.cash;
                    nextCard = MarketCard;
                    m_this.playerData.removePropertyByIndex(cardData.propertyIndex);
                }
            }

            if (cardData.type == "market_brother") {
                if (property.key == translations[language]["3-2house"] && property.quantity > 0) {
                    m_this.playerData.removePropertyByIndex(cardData.propertyIndex);
                    newCash = m_this.playerData.cash;
                    nextCard = EndCard;
                }
            }
            m_this.playerData.refresh();
            var updater = {
                cash: newCash,
                passiveIncome: m_this.playerData.passiveIncome,
                totalExpenses: m_this.playerData.totalExpenses,
                cashflowRatio: m_this.playerData.cashflowRatio
            };
            updater.properties = m_this.playerData.properties;
            m_this.localPlayerRef.update(updater).then(function () {
                if (nextCard == EndCard) {
                    setPlayerTurnState(nextCard);
                }
                else {
                    if (m_this.playerData.playerCanUseMarketOpportunity(cardData.key)) {
                        setPlayerTurnState(nextCard, m_this.cardData);
                    }
                    else {
                        onShowEndCard();
                    }
                }
            });
        }

        function onMarketMustClicked() {
            if (m_this.playerData.performMarketMustAction(m_this.cardData)) {
                //use updater to update the player cash and properties
                m_this.playerData.refresh();
                var updater = {
                    cash: m_this.playerData.cash,
                    passiveIncome: m_this.playerData.passiveIncome,
                    totalExpenses: m_this.playerData.totalExpenses,
                    cashflowRatio: m_this.playerData.cashflowRatio
                };
                updater.properties = m_this.playerData.properties;
                m_this.localPlayerRef.update(updater).then(function () {
                    onShowEndCard();
                });
            }
            else {
                //they dont have enough cash for the must so they need to get a loan first
                offerLoan(m_this.cardData.cost - m_this.playerData.cash);
            }
        }


        function borrowCash(amountBorrowed, nextCard) {
            var newCash = 0;
            var expense = amountBorrowed * 0.1;
            var liability = amountBorrowed;
            newCash = m_this.playerData.cash + amountBorrowed;
            var debts = m_this.playerData.debts;
            var debtIndex = -1;
            var newExpense = 0;
            var newLiability = 0;
            var updater = {
                cash: newCash
            };
            for (var i = 0; i < debts.length; i++) {
                if (debts[i].id == "loan") {
                    debtIndex = i;
                    newExpense = debts[i].expense + expense;
                    newLiability = debts[i].liability + liability;
                    m_this.playerData.debts[i].expense = newExpense;
                    m_this.playerData.debts[i].liability = newLiability;
                }
            }
            if (debtIndex == -1) {
                //no current loan debt need to push to the array
                newLiability = amountBorrowed;
                newExpense = amountBorrowed * 0.1;
                var debt = new CustomDebt("loan", newExpense, newLiability);
                m_this.playerData.debts.push(debt);
            }
            updater.debts = m_this.playerData.debts;

            m_this.playerData.refresh();
            updater.passiveIncome = m_this.playerData.passiveIncome;
            updater.totalExpenses = m_this.playerData.totalExpenses;
            updater.cashflowRatio = m_this.playerData.cashflowRatio;

            m_this.localPlayerRef.update(updater).then(function () {
                setPlayerTurnState(nextCard, m_this.cardData);
            });
        }

        function onBorrowCardStartTurnClicked(amountBorrowed) {
            borrowCash(amountBorrowed, StartTurnCard);
        }

        function onBorrowCardEndTurnClicked(amountBorrowed) {
            borrowCash(amountBorrowed, EndCard);
        }

        function onLoanBorrowClicked() {
            borrowCash(m_this.cardData.loan, m_this.cardData.previousCard)
        }

        function onDownsizeClicked() {
            var cash = 0;
            var downsizeCount = 0;
            var charityCount = 0;

            if (m_this.playerData.cash >= m_this.cardData.cost) {
                downsizeCount = 2;
                cash = m_this.playerData.cash - m_this.cardData.cost;
                charityCount = 0;

                var updater = {
                    cash: cash,
                    charityCount: charityCount,
                    downsizeCount: downsizeCount
                }
                m_this.localPlayerRef.update(updater).then(function () {
                    return onShowEndCard();
                });
            } else {
                offerLoan(m_this.cardData.cost - m_this.playerData.cash);
            }
        }

        function onDivorceClicked() {
            var cash = 0;//m_this.playerData.cash;
            m_this.localPlayerRef.child("cash").set(cash).then(function () {
                onShowEndCard();
            });
        }

        function onLawsuitClicked() {
            var cash = m_this.playerData.cash * 0.5;
            m_this.localPlayerRef.child("cash").set(cash).then(function () {
                onShowEndCard();
            });
        }

        function onTaxClicked() {
            var cash = m_this.playerData.cash * 0.5;
            m_this.localPlayerRef.child("cash").set(cash).then(function () {
                onShowEndCard();
            });
        }

        function onDonateClicked() {
            //TODO: fast track check
            var charityCount = 0;
            var cash = 0;
            if (m_this.playerData.fastTrack) {
                charityCount = 4;
                cash = m_this.playerData.cash - 100000;
            } else {
                var amountToDonate = (m_this.playerData.salary + m_this.playerData.passiveIncome) * .1
                if (amountToDonate < 1) {
                    amountToDonate = 1;
                }
                charityCount = 3;
                cash = m_this.playerData.cash - amountToDonate;
            }
            var updater = {
                cash: cash,
                charityCount: charityCount
            }
            m_this.localPlayerRef.update(updater).then(function () {
                onShowEndCard();
            });
        }

        function onAddChild() {
            var blob = m_this.playerData.getBlob();
            blob.numberOfChildren += 1;
            m_this.playerData.refresh(); // modifies the blob's values

            m_this.localPlayerRef.update({
                numberOfChildren: blob.numberOfChildren,
                passiveIncome: blob.passiveIncome,
                totalExpenses: blob.totalExpenses,
                cashflowRatio: blob.cashflowRatio
            }).then(function () {
                onShowEndCard();
            });
        }

        function onDoodadLoanNeeded() {
            var newCash = 0;
            var expense = 0;
            var liability = 0;
            var debts = m_this.playerData.debts;
            var debtIndex = -1;
            var newExpense = 0;
            var newLiability = 0;

            if (m_this.cardData.title == "NEW BOAT") {
                if (m_this.playerData.cash < 1000) {
                    offerLoan(1000 - m_this.playerData.cash);
                    return;
                }
                newCash = m_this.playerData.cash - 1000;
                liability = m_this.cardData.cost - 1000;
                expense = m_this.cardData.payment;
                for (var i = 0; i < debts.length; i++) {
                    if (debts[i].id == "boat") {
                        debtIndex = i;
                        newExpense = debts[i].expense + expense;
                        newLiability = debts[i].liability + liability;
                        m_this.playerData.debts[i].expense = newExpense;
                        m_this.playerData.debts[i].liability = newLiability;
                    }
                }
                if (debtIndex == -1) {
                    //no current boat debt need to push to the array
                    newLiability = liability;
                    newExpense = expense;
                    var debt = new CustomDebt("boat", newExpense, newLiability);
                    m_this.playerData.debts.push(debt);
                }
            } else { // big screen tv gets added to credit card debt
                newCash = m_this.playerData.cash;
                liability = m_this.cardData.cost;
                expense = m_this.cardData.payment;
                for (var d = 0; d < debts.length; d++) {
                    if (debts[d].id == "creditcard") {
                        debtIndex = d;
                        newExpense = debts[d].expense + expense;
                        newLiability = debts[d].liability + liability;
                        m_this.playerData.debts[d].expense = newExpense;
                        m_this.playerData.debts[d].liability = newLiability;
                    }
                }
                if (debtIndex == -1) {
                    //no current creditcard debt need to push to the array
                    newLiability = liability;
                    newExpense = expense;
                    var debt = new CustomDebt("creditcard", newExpense, newLiability);
                    m_this.playerData.debts.push(debt);
                }
            }

            var updater = {
                cash: newCash
            };
            updater.debts = m_this.playerData.debts;

            m_this.playerData.refresh();
            updater.passiveIncome = m_this.playerData.passiveIncome;
            updater.totalExpenses = m_this.playerData.totalExpenses;
            updater.cashflowRatio = m_this.playerData.cashflowRatio;

            m_this.localPlayerRef.update(updater).then(function () {
                onShowEndCard();
            });
        }

        function onEnterFastTrackClicked() {

            // necessary for the calculations in playerData to be accurate
            m_this.playerData.getBlob().fastTrack = true;
            m_this.playerData.getBlob().winPassiveIncome = m_this.playerData.passiveIncome + 50000;

            console.log("onEnterFastTrackClicked test", m_this.getCurrentPlayerBlob(), m_this.playerData.getBlob(), m_this.playerData.passiveIncome);
            var updater = {};
            updater.fastTrack = true;
            // updater.mostRecentPayday = 0;
            updater.cash = m_this.playerData.passiveIncome;
            updater.winPassiveIncome = m_this.playerData.winPassiveIncome;
            updater.charityCount = 0;
            updater.downsizeCount = 0;
            updater.position = 42;

            m_this.playerData.refresh();
            updater.passiveIncome = m_this.playerData.passiveIncome;
            updater.totalExpenses = m_this.playerData.totalExpenses;
            updater.cashflowRatio = m_this.playerData.cashflowRatio;

            m_this.localPlayerRef.update(updater).then(function () {
                // setPlayerTurnState(SpecialStockCard, m_this.cardData);
                return onEndTurn();
            });
        }

        function onSpecialStockCardClicked() {
            m_this.playerData.specialStockEvent(m_this.cardData.key, m_this.cardData.cost);
            var updater = {
                stocks: m_this.playerData.stocks,
                passiveIncome: m_this.playerData.passiveIncome,
                totalExpenses: m_this.playerData.totalExpenses,
                cashflowRatio: m_this.playerData.cashflowRatio
            }
            m_this.localPlayerRef.update(updater).then(function () {
                //setPlayerTurnState(onend, m_this.cardData);
                return onShowEndCard();
            });
        }

        function attemptPayCash() {
            var cash = m_this.playerData.cash;
            var cost = m_this.cardData.cost;
            if (cash >= cost) {
                //pay the cash here
                var newCash = cash - cost;
                m_this.localPlayerRef.child("cash").set(newCash).then(function () {
                    onShowEndCard();
                });
            } else {
                offerLoan(cost - cash);
            }
        }

        function onEndTurn() {
            m_isLocalPlayersTurn = false;

            var myIndex = m_this.playerData.index;
            var numPlayers = m_this.getNumberOfPlayers();
            var nextPlayerIndex = (m_this.roomBlob.gameState.turn + 1) % numPlayers;

            // check whether we should skip the next player(s)
            // stop skipping if it comes back to yourself
            return m_this.roomRef.child("players/").once("value", function (snap) {
                /** @type {PlayerBlob[]} */
                var players = snap.val();

                //TODO: test that player skipping works
                while (nextPlayerIndex != myIndex) {
                    if (shouldSkipNextPlayer(players[nextPlayerIndex])) {
                        nextPlayerIndex = (nextPlayerIndex + 1) % numPlayers;
                    } else {
                        break;
                    }
                }

                var turnState = new TurnState();
                turnState.id = GameStates.turnStart;
                m_this.roomBlob.gameState.turnState = turnState;
                m_this.roomBlob.gameState.turn = nextPlayerIndex;

                return m_gameStateRef.set(m_this.roomBlob.gameState);
            });

        }

        /**
         * checks playerblob active, bankrupt, also maybe timeouts?
         * @param {PlayerBlob} playerBlob
         * @returns {Boolean}
         */
        function shouldSkipNextPlayer(playerBlob) {
            return playerBlob.isActive == false || playerBlob.bankruptCount < 0;
        }



        var gameWin = false; // TODO: something about handling player disconnects in GameSession.as:~210 in onLeavePlayer
        function winGame() {
            gameWin = true;

            // shout("DeactivateTimer");
            //should prolly just set the active players dream icon somewhere because we reference it a good number of times;
            if (m_this.getCurrentPlayerBlob().dreamWin) {
                // shout("Winner", activePlayer.playerName);
                // Report.win(activePlayer.playerName, activePlayer.dreamWin, activePlayer.passiveIncome, activePlayer.winPassiveIncome);
                m_this.marco("LogAction", m_this.getCurrentPlayerBlob().name + Data.getVocab("wongame", "copy"));
                return setPlayerTurnState(WinDreamCard, m_this.getCurrentPlayerBlob().index);
            }
            else {
                // shout("RefreshHeader");
                // onRefreshStatement();
                // shout("Winner", activePlayer.playerName);
                // Report.win(activePlayer.playerName, activePlayer.dreamWin, activePlayer.passiveIncome, activePlayer.winPassiveIncome);
                m_this.marco("LogAction", m_this.getCurrentPlayerBlob().name + Data.getVocab("wongame", "copy"));
                return setPlayerTurnState(WinPassiveCard, m_this.getCurrentPlayerBlob().index);
            }
        }
    }







    return GameSession;
})();
// The status that display on top of the screen while playing the game
var HeaderElement = (function () {

    inherit(HeaderElement, ContainerElement)

    function HeaderElement() {
        ContainerElement.call(this)
        
        var playerStatusText;
        var sprite = null
        var m_this = this;

        /** @type {createjs Sprite}*/
        var playerSmallBg = null;

        /** @type {createjs Sprite}*/
        var playerStatusTag = null;

        /** @type {createjs Sprite}*/
        var playerActive = null;

        /** @type {createjs Rect}*/
        var ProgressBarBackground = null

        /** @type {createjs Rect}*/
        var ProgressBar = null


        /** @type {createjs.Text}*/
        var playerNameText = null

        /** @type {createjs Sprite}*/
        var playerStatusTag = null

        /** @type {createjs Text}*/
        var playerStatusTagText = null

        /** @type {float/Number}*/
        var ProgressBarWidth = null;

        this.gameOver = false;
        var firebasePlayerRef = null;

        var colorString = [
            "purple",
            "green",
            "orange",
            "blue",
            "red",
            "grey"
        ]
        var colorRGB = [
            "#775478",
            "#a8b240",
            "db753c",
            "769ba3",
            "ee4136",
            "81888f"
        ]

        var templateRef = TemplateParser.parseTemplate("playerHeader");

        this.onCreate = function () {
            // this.polo("onPlayerDataUpdated", this.onPlayerDataUpdated);
        }

        this.onRelease = function () {
            firebasePlayerRef.child("cashflowRatio").off("value", onCashflowRatioChange);
            firebasePlayerRef.child("bankruptCount").off("value", onBankruptCountChanged);
            firebasePlayerRef.child("name").on("value", onNameChanged);
        }

        this.setTakingTurn = function () {
            playerStatusTag.alpha = 1;
            playerStatusTagText.text = Data.getVocab("header", "takingturn");
        }

        this.setNotTakingTurn = function () {
            playerStatusTag.alpha = 0;
            playerStatusTagText.text = "";
        }

        this.setBankrupt = function () {
            playerStatusTag.alpha = 1;
            playerStatusTagText.text = Data.getVocab("header", "gameover")
        }

        // index of array 
        this.setup = function (playerName, xPos, yPos, color, ref) {
            //myPlayer = player
            firebasePlayerRef = ref;

            var m_color = colorString[color];

            playerStatusTag = this.fetchSprite("plr_current_bk", true, {
                width: templateRef.playerStatusTag.width,
                height: templateRef.playerStatusTag.height,
                x: templateRef.playerStatusTag.x + xPos,
                y: templateRef.playerStatusTag.y,


            })

            playerSmallBg = this.fetchSprite("plr_bk_" + m_color, true, {
                width: templateRef.smallBg.width,
                height: templateRef.smallBg.height,
                x: templateRef.smallBg.x + xPos,
                y: templateRef.smallBg.y - 170,

            })




            playerActive = this.fetchSprite("plyrActive_" + m_color, true, {
                width: templateRef.icon.width,
                height: templateRef.icon.height,
                x: templateRef.icon.x + xPos,
                y: templateRef.icon.y,


            })

            ProgressBarBackground = TemplateParser.makeRectFromTemplate("playerHeader", "progressBarBackground", "#ffffff")
            ProgressBarBackground.x = +20 + xPos
            ProgressBar = TemplateParser.makeRectFromTemplate("playerHeader", "progressBar", colorRGB[color])
            ProgressBar.x = +20 + xPos
            ProgressBarWidth = ProgressBar.width

            playerNameText = TemplateParser.formatTextFromTemplate("playerHeader", "playerNameText", templateRef.playerNameText.color, false)
            playerNameText.text = "Player 1"
            playerNameText.x = + 40 + xPos;
            playerStatusTagText = TemplateParser.formatTextFromTemplate("playerHeader", "playerStatusTagText", templateRef.playerStatusTagText.color, false)
            playerStatusTagText.text = "";
            playerStatusTagText.x += xPos



            this.setPlayerName(playerName);
            playerNameText.color = Colors.getPlayerColor(color);//colorRGB[color];
            playerStatusTagText.color = Colors.getPlayerColor(color);//colorRGB[color];//Colors.getCurrentPlayerColor();

            ProgressBarBackground.alpha = .35;


            this.transform.addChild(playerNameText)
            this.transform.addChild(playerStatusTagText)
            this.transform.addChild(ProgressBarBackground)
            this.transform.addChild(ProgressBar)


            firebasePlayerRef.child("cashflowRatio").on("value", onCashflowRatioChange);
            firebasePlayerRef.child("bankruptCount").on("value", onBankruptCountChanged);
            firebasePlayerRef.child("name").on("value", onNameChanged);
        }
        function onCashflowRatioChange(snap) {
            ProgressBar.scaleX = snap.val();
        }
        function onBankruptCountChanged(snap) {
            console.log(snap.val())
            if (snap.val() === -1) {
                m_this.gameOver = true;
                m_this.setBankrupt();
            }
        }
        function onNameChanged(snap) {
            m_this.setPlayerName(snap.val());
        }

        var MAX_NAME_LENGTH = 8;
        /**
         * @param {string} name - player's name
         */
        this.setPlayerName = function (name) {
            if(name.length > MAX_NAME_LENGTH) {
                name = name.substr(0, MAX_NAME_LENGTH) + "...";
            }
            playerNameText.text = name;
            // var lineHeight = playerNameText.getMeasuredLineHeight();
            // if(playerNameText.getMeasuredHeight() > lineHeight) {
            //     playerNameText.
            // }
        }
    }
    return HeaderElement;
})()
// The status that display on top of the screen while playing the game
var HeaderWidget = (function () {

    inherit(HeaderWidget, ContainerElement)

    /** @type {Sprite Button} */
    var exitButton = null

    /** @type {Sprite Button} */
    var muteButton = null

    /** @type {Sprite Button} */
    var exitBG = null

    /** @type {Container holding a sprite and text} */
    var exitButton1 = null
    /** @type {HeaderElement[]} */
    var headerUI = null

    /** @type {create js container hold all of the other container} */
    var exitContainer = null;

    var numberOfPlayers = 0;

    function HeaderWidget() {

        ContainerElement.call(this)
        var m_template = TemplateParser.parseTemplate("gameScreen")
        var m_this = this;
        
        var myColor = null;

        this.onRelease = function () {
            Main.gameSession.roomRef.child("gameState").off("value",onGameStateChanged);
        }

        this.onCreate = function () {

            numberOfPlayers = Main.gameSession.getNumberOfPlayers();
            //console.log("number of players", numberOfPlayers);

            var players = Main.gameSession.getPlayerBlobs();
            var firebasePlayerRefs = Main.gameSession.getPlayerRefs();
            headerUI = [];
            for (var i = 0; i < numberOfPlayers; i++) {
                headerUI.push(this.create(HeaderElement));// = this.create(HeaderElement);
                headerUI[i].attach(this);
                // headerUI.setup(players[i], m_template["p" + (i + 1) + "SmallHeaderTransform"]["x"], 'e', i, firebasePlayerRefs[i])
                headerUI[i].setup(players[i].name, m_template["p" + (i + 1) + "SmallHeaderTransform"]["x"], 'e', i, firebasePlayerRefs[i])

            }

            Main.gameSession.roomRef.child("gameState").on("value",onGameStateChanged);

            exitContainer = new createjs.Stage("exitStage")
            exitButton = (function () {
                var button = null;
                button = this.fetchSprite("menu_nrm", false, {
                    width: m_template.menu.width,
                    height: m_template.menu.height,
                    x: m_template.menu.x,
                    y: m_template.menu.y,

                })
                button.on("click", onExitClick)

                return button;
            }).call(this)


            muteButton = (function () {
                var button = null;
                button = this.fetchSprite("soundOn_nrm", false, {
                    width: m_template.mute.width,
                    height: m_template.mute.height,
                    x: m_template.mute.x,
                    y: m_template.mute.y,

                })
                return button;
            }).call(this)
            muteButton.on("click", onMuteClick)



            exitBG = m_this.fetchSprite("card_btn_back_full", false, {
                width: m_template.exitBackground.width,
                height: m_template.exitBackground.height,
                x: m_template.exitBackground.x + 3,
                y: m_template.exitBackground.y - 480,
            })


            var exitCard = m_this.fetchSprite("popup_bk", false, {
                width: m_template.exitCard.width,
                height: m_template.exitCard.height,
                x: m_template.exitCard.x + 3,
                y: m_template.exitCard.y - 680,
            })


            // var myColor = Colors.getPlayerColor(Main.gameSession.playerData.index);
            myColor = Colors.getLocalPlayerColor();
            m_this.tintSprite(exitBG, myColor);


            exitButton1 = makeButton(1, translations[language]["yes"]);
            // exitButton1.color =Colors.getPlayerColor(Main.gameSession.playerData.index)
            exitButton1.on("click", function () {

                Main.logic.exitGame();
            })
            var exitButton2 = makeButton(2, translations[language]["no"]);
            // exitButton2.color = Colors.getPlayerColor(Main.gameSession.playerData.index)
            exitButton2.on("click", function () {
                //TODO: Play tween
                createjs.Tween.get(exitContainer).to({ y: -100 }, 1000, createjs.Ease.quintInOut)

                createjs.Ticker.addEventListener("tick", tickHandler)
            })
            var quitText = TemplateParser.formatTextFromTemplate("gameScreen", "exitTitle", "xFFFFFF", false)

            quitText.text = Data.getVocab("quitCard", "title")
            quitText.color = myColor;
            quitText.y -= 75


            /// exitButton.off("click", onExitClick)
            // console.log(Data.getVocab("yes", "copy"))
            // CardElement.makeButton(this,"popup_btn_bk2",m_template,Data.getVocab("yes", "copy"),"0xFFFFFF","exitButton1")

            // var exitButton1 = this.create(ButtonElement)
            //exitButton1.setSubTemplate = "gameScreen";
            // exitButton1.setup("popup_btn_bk2", m_template.exitButton1, Data.getVocab("yes", "copy"), "xFFFFFF", "exitButton1", "gameScreen")
            //exitContainer.addChild(exitButton1)
            exitContainer.y -= 100;
            exitContainer.addChild(exitBG)
            exitContainer.addChild(exitCard)
            exitContainer.addChild(exitButton2)
            exitContainer.addChild(exitButton1)
            exitContainer.addChild(quitText)
            this.transform.addChild(exitButton)
            this.transform.addChild(muteButton)
            this.transform.addChild(exitContainer)

            //  exitContainer.update();
            // this.transform.addChild(exitContainer)

        }

        function tickHandler(e) {
            exitContainer.update()
        }

        /** i is either 1 or 2 because there are only 2 buttons (Yes or no)
         * text is either yes or no
         */

        function makeButton(i, textDisplay) {
            var container = new createjs.Container()

            var sprite = m_this.fetchSprite("popup_btn_bk2", false, {
                width: m_template["exitButton" + i + "Text"]["width"],
                height: m_template["exitButton" + i + "Text"]["height"],
                x: m_template["exitButton" + i + "Text"]["x"],
                y: m_template["exitButton" + i + "Text"]["y"]
            })
            var text = TemplateParser.formatTextFromTemplate("gameScreen", "exitButton" + i + "Text", myColor, false)
            text.text = textDisplay
            //text.x = m_template["exitButton" + i + "Text"]["x"]
            container.addChild(sprite);
            container.addChild(text)
            text.y += 10
            // m_this.transform.addChild(container);
            return container;
        }
        

        function onGameStateChanged(snap){
            for(var t = 0; t < numberOfPlayers; t++){
                if(t == Main.gameSession.whoseTurn){
                    headerUI[t].setTakingTurn();
                }
                else{
                    if(headerUI[t].gameOver === false){
                        headerUI[t].setNotTakingTurn();
                    }
                    else{
                      headerUI[t].setBankrupt();
                    }
                }
            }
        }

        function onExitClick() {

            //TODO:Tween
            createjs.Tween.get(exitContainer).to({ y: 5 }, 1000, createjs.Ease.quintInOut)

            createjs.Ticker.addEventListener("tick", tickHandler)
        }


        function onMuteClick() {
            if (Main.flipFlopMute()) { muteButton.gotoAndStop("soundOff_nrm") }
            else { muteButton.gotoAndStop("soundOn_nrm") }

        }



    }









    return HeaderWidget;

})()
var Lobby = (function () {
    inherit(Lobby, CoreElement);

    function Lobby() {
        CoreElement.call(this);
        var m_this = this;

        /** @type {LobbyListItem[]} */
        var buttons = null;

        var m_roomId = null;
        var m_roomListRef = null;
        var m_database = null;

        var m_btnNewRoom = null;
        var m_roomBlobs = null;
        var m_btnJoinRoom = null;
        var m_inputPW = null;
        var m_headerName = null;
        var m_pw = null;

        var m_roomsRef = null;

        /** @type {LobbyListItem} */
        var m_selectedButton = null;

        var m_this = this;

        /**
         * @param {LobbyListItem[]} rooms
         * @param {HTMLButtonElement} createNewRoom
         * @param {HTMLButtonElement} btnJoinRoom
         * @param {HTMLInputElement} inputPW
         */
        this.setup = function (rooms, createNewRoom, btnJoinRoom, inputPW, headerName) {
            m_database = Main.firebase.database();

            buttons = rooms;
            m_btnNewRoom = createNewRoom;
            m_btnJoinRoom = btnJoinRoom;
            m_inputPW = inputPW;
            m_headerName = headerName;

            m_roomListRef = m_database.ref("/rooms");

            m_btnJoinRoom.addEventListener("click", function () {

                // Main.logic.onJoinGameClicked(m_roomId);
                joinRoom();
            });

            m_btnNewRoom.addEventListener("click", function (e) {
                Main.playSound("openToHumanv1")
                Main.logic.onCreateNewRoomClicked();
            })

            // set up button listeners...
            for (var i = 0; i < buttons.length; i++) {
                (function (index) {
                    buttons[index].addEventListener("click", function (e) {
                        m_roomId = buttons[index].roomId;

                        if (m_selectedButton != null) {
                            m_selectedButton.unselect();
                        }
                        m_selectedButton = buttons[index];
                        m_selectedButton.select();

                        m_database.ref("/rooms/" + m_roomId).once("value", function (snap) {
                            /** @type {RoomBlob} */
                            var roomBlob = snap.val();
                            if (!roomBlob) {
                                //TODO: disable join button
                                return;
                            } else {
                                //TODO: enable join button
                            }
                            m_this.joinRoomTween()
                            m_headerName.innerText = translations[language]["room-is"] + buttons[index].roomName;
                            m_btnJoinRoom.disabled = false;
                            if (roomBlob.password) {
                                m_inputPW.alpha = 1
                                m_pw = roomBlob.password;
                            } else {
                                m_inputPW.alpha = 0
                                // AddExistingPlayer();
                                m_pw = null;
                            }
                        });
                    });
                }).call(this, i)
            }


            m_roomsRef = m_roomListRef.orderByChild("timeCreated").limitToLast(buttons.length);
            m_roomsRef.on("value", onRefreshRoomList);
        }

        this.onRelease = function () {
            m_selectedButton = null;
            if (m_roomsRef) {
                m_roomsRef.off("value", onRefreshRoomList);
            }
            m_roomsRef = null;
        }

        function joinRoom() {
            Main.playSound("openToHumanv1")
            if (m_roomId) { Main.logic.joinRoom(m_roomId, m_inputPW.htmlElement.value); }

        }

        function onRefreshRoomList(snap) {
            if (m_this.released) return;

            if (snap.val()) {
                m_roomBlobs = snap.val();
                var roomIds = Object.keys(m_roomBlobs).reverse();

                for (var i = 0; i < buttons.length; i++) {
                    buttons[i].setRoomData(roomIds[i], m_roomBlobs[roomIds[i]]);
                }
            } else {
                for (var i = 0; i < buttons.length; i++) {
                    buttons[i].setRoomData(null, null);
                    // console.log( buttons[i])
                    //  buttons[i].alpha = .5;
                }
            }
        }

        this.getRoom = function () {
            // console.log(room)
            return m_roomId;
        }




        this.joinRoomTween = function () {

            createjs.Tween.get(m_btnJoinRoom).to({ y: 0 }, 1000, createjs.Ease.quintInOut)
            createjs.Ticker.addEventListener("tick", function (e) {
                m_btnJoinRoom.update()
            })
        }
    }

    return Lobby;
})();
var PlayerData = (function () {

    inherit(PlayerData, CoreElement);

    function PlayerData() {
        CoreElement.call(this);

        /** @type {PlayerData} */
        var m_this = this;
        var m_dirty = false;

        /** @type {PlayerBlob} */
        var m_playerBlob = null;

        this.fromFirebaseBlob = function (blob) {
            m_playerBlob.fromFirebase(blob);
        }

        this.toFirebaseBlob = function () {
            return null;
        }

        this.onCreate = function () { }

        this.init = function (index, host, userId, userName, careerJson) {
            m_playerBlob = PlayerBlob.createFromCareerData(careerJson);
            m_playerBlob.index = index;
            m_playerBlob.indexLobby = index;
            m_playerBlob.isHost = host;
            m_playerBlob.isActive = true;
            m_playerBlob.userId = userId;
            m_playerBlob.name = userName;

            // m_playerBlob.stocks.push(new Stocks({
            //     "cost": 1,
            //     "copy1": "Trade war panic leads to record low share price for this home electronics seller.",
            //     "title": "STOCK - MYT4U ELECTRONICS CO.",
            //     "traderange": "Trading Range: $5 to $30",
            //     "key": "MYT4U",
            //     "type": "smalldeal_stock",
            //     "cashflow": 0,
            //     "rule": "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            //     "queue": "true"
            //   }, 694));

            calcCashflowRatio();

            return m_playerBlob;
        }

        this.join = function(playerBlob) {
            m_playerBlob = new PlayerBlob();
            m_playerBlob.fromFirebase(playerBlob);

            // calcCashflowRatio();

            return m_playerBlob;
        }



        this.setup = function (careerJson) {
            m_playerBlob = PlayerBlob.createFromCareerData(careerJson);
            m_playerBlob.cash = 100000;
            // m_playerBlob.charityCount = 1;
            this.refresh();
        }

        this.getBlob = function () {
            return m_playerBlob;
        }

        this.refresh = function () {
            calcCashflowRatio();
        }

        /* // this.refresh = function (o) {
        //     o = o || this;
        //     this.marco("onPlayerDataUpdated", o);
        // }

        this.onPlayerDataUpdated = function (data) {
            if (data instanceof PlayerData) {
                // update everything...
            } else {
                if (data.key != undefined) { // only check the things you care about

                }
            }
        } */


        Object.defineProperties(this, {

            isActive: { get: function () { return m_playerBlob.isActive; } },
            isHost: { get: function () { return m_playerBlob.isHost; } },

            index: { get: function () { return m_playerBlob.index; } },
            indexLobby: { get: function () { return m_playerBlob.indexLobby; } },

            userId: { get: function () { return m_playerBlob.userId; } },
            name: { get: function () { return m_playerBlob.name; } },

            dreamId: {
                get: function () { return m_playerBlob.dreamId; }
                // set: function (c) { m_playerBlob.dreamId = c; }
            },
            position: { get: function () { return m_playerBlob.position; } },

            payday: { get: function () { return this.totalIncome - this.totalExpenses; } },

            numberOfChildren: { get: function () { return m_playerBlob.numberOfChildren; } },
            childPerExpense: { get: function () { return m_playerBlob.childPerExpense; } },

            salary: { get: function () { return m_playerBlob.salary; } },
            savings: { get: function () { return m_playerBlob.savings; } },

            cash: {
                get: function () { return m_playerBlob.cash; },
                set: function (c) {
                    m_playerBlob.cash = c;
                    // this.refresh();
                }
            },
            fastTrack: { get: function () { return m_playerBlob.fastTrack; } },

            debts: { get: function () { return m_playerBlob.debts || []; } },
            properties: { get: function () { return m_playerBlob.properties || []; } },
            stocks: { get: function () { return m_playerBlob.stocks || []; } },
            investments: { get: function () { return m_playerBlob.investments || []; } },

            dreamWin: { get: function () { return m_playerBlob.dreamWin; } },
            inQueue: { get: function () { return m_playerBlob.inQueue; } },

            totalExpenses: { get: calcTotalExpenses },
            passiveIncome: { get: calcPassiveIncome },
            winPassiveIncome: { get: function () { return m_playerBlob.winPassiveIncome; } },

            charityCount: { get: function () { return m_playerBlob.charityCount; } },

            downsizeCount: { get: function () { return m_playerBlob.downsizeCount; } },
            bankruptCount: { get: function () { return m_playerBlob.bankruptCount; } },

            careerTitle: {
                get: function () { return m_playerBlob.careerTitle; }
            },

            careerGenitive: {
                get: function () { return m_playerBlob.careerGenitive}

            },

            cashflowRatio: { get: function () { return m_playerBlob.cashflowRatio; } },

            totalIncome: { get: function () { return m_playerBlob.salary + calcPassiveIncome(); } }

        });

        function calcPassiveIncome() {
            var income = 0;
            var ftMultiplier = (m_playerBlob.fastTrack ? 100 : 1);

            m_playerBlob.properties.forEach(function (property) {
                if (property.quantity === 0) { return; }
                income += property.cashflow * ftMultiplier;
            });
            m_playerBlob.stocks.forEach(function (stock) {
                if (stock.quantity === 0) { return; }
                income += stock.cashflow * ftMultiplier;
            });
            m_playerBlob.investments.forEach(function (investment) {
                // if (investment.quantity == 0) { return; }
                income += investment.cashflow;
            });

            if (m_playerBlob.passiveIncome != income) {
                m_playerBlob.passiveIncome = income;
                setDirty();
                // calcCashflowRatio();
            }
            return m_playerBlob.passiveIncome;
        }

        function calcTotalExpenses() {
            var expenses = 0;
            m_playerBlob.debts.forEach(function (debt) {
                expenses += debt.expense;
            })
            expenses += (m_playerBlob.numberOfChildren * m_playerBlob.childPerExpense);
            if (m_playerBlob.totalExpenses != expenses) {
                m_playerBlob.totalExpenses = expenses;
                setDirty();
                // calcCashflowRatio();
            }

            // if(m_playerBlob.isHost) {
            //     m_playerBlob.totalExpenses = 100000;
            // }

            return m_playerBlob.totalExpenses;
        }

        function calcCashflowRatio() {
            var cashflowRatio = 0;
            if (m_playerBlob.fastTrack) {
                cashflowRatio = (calcPassiveIncome() - (m_playerBlob.winPassiveIncome - 50000)) / 50000;
            } else {
                cashflowRatio = calcPassiveIncome() / calcTotalExpenses();
            }

            cashflowRatio = Math.max(0, cashflowRatio);
            cashflowRatio = Math.min(1, cashflowRatio);

            if (m_playerBlob.cashflowRatio != cashflowRatio) {
                m_playerBlob.cashflowRatio = cashflowRatio;
                setDirty();
            }

            return m_playerBlob.cashflowRatio;
        }

        function calcPassiveExpenses() { /* return this.totalIncome - m_income.salary; */ }




        /**
         * @param {string} key - the 'name' (aka key) of the stock from the json
         * @returns {Number} - the total number of stocks owned with that key name
         */
        this.getStockAmount = function (key) {
            var amount = 0;
            this.stocks.forEach(function (stock) {
                if (stock.key == key) {
                    amount += stock.quantity;
                }
            })
            return amount;
        }

        /**
         * @param {string} key - the 'name' (aka key) of the market opportunity
         * @returns {Boolean} - if they can use it or not
         */
        this.playerCanUseMarketOpportunity = function (key) {
            var canUse = false;
            this.properties.forEach(function (property) {
                if (key == "400" || key == "250") {
                    if ((property.key == translations[language]["widget"] || property.key == translations[language]["software"]) && property.quantity > 0) {
                        canUse = true;
                    }
                }
                else if (key == translations[language]["8plex"]) {
                    if (property.key == translations[language]["plex"] && property.units == 8 && property.quantity > 0) {
                        canUse = true;
                    }
                }
                else if (key == "rental") {
                    if ((property.key == translations[language]["3-2house"] || property.key == translations[language]["plex"] || property.key == translations[language]["apthouse"] || property.key == translations[language]["2-1condo"]) && property.quantity > 0) {
                        canUse = true;
                    }
                }
                else {
                    if (property.key == key && property.quantity > 0) {
                        canUse = true;
                    }
                }
            })
            return canUse;
        }

        /**
         * doubles or halves the number of stocks the player hass
         * @param {String} key - athe 'name' (aka key) of the stock from the json
         * @param {Number} c - -1 == double -2 == halve
         */
        this.specialStockEvent = function (key, c) {
            var stockKey = key;
            var stocks = this.stocks.filter(function (stock) {
                return stock.key == stockKey;
            })

            for (var i = 0; i < stocks.length; i++) {
                if (c == -1) { //stock double
                    stocks[i].quantity *= 2;
                } else { //stock halve
                    stocks[i].quantity = Math.floor(stocks[i].quantity / 2);
                }
            }
            m_playerBlob.stocks = this.stocks.filter(function (stock) {
                if (!stock) { console.log("clearing out1", stock); return false; } // if no stock: remove it
                if (stock.quantity == 0) { console.log("clearing out2", stock); return false; } // if no quantity: remove it
                return true;
            });

            m_this.refresh();
        }


        /**
         * removes the number of stocks from our inventory
         * @param {Stocks} stockInfo - an object reprenseting the stock we're trying to sell, including quantity
         */
        this.sellStocks = function (stockInfo) {
            var sellKey = stockInfo.key;
            var sellAmount = stockInfo.quantity; // forcing it to be a positive number

            // collect all stocks of this 'key' type'
            var stocks = this.stocks.filter(function (stock) {
                return stock.key == sellKey;
            })

            // sort so that lowest 'cost' stocks are first
            stocks.sort(function (a, b) {
                if (a.cost < b.cost) { return -1; }
                if (a.cost > b.cost) { return 1; }
                return 0;
            });

            // loop through and try to sell lowest through highest
            for (var i = 0; i < stocks.length; i++) {

                // if more in this stock than we're trying to sell
                if (stocks[i].quantity >= Math.abs(sellAmount)) {
                    stocks[i].quantity += sellAmount;
                    sellAmount = 0;
                } else if (stocks[i].quantity < Math.abs(sellAmount)) {
                    sellAmount += stocks[i].quantity;
                    stocks[i].quantity = 0;
                }

                stocks[i] = null;
                if (sellAmount == 0) {
                    break;
                }
            }
            // clear out the stocks array of all 'quantity == 0' entries
            m_playerBlob.stocks = this.stocks.filter(function (stock) {
                if (!stock) { console.log("clearing out1", stock); return false; } // if no stock: remove it
                if (stock.quantity == 0) { console.log("clearing out2", stock); return false; } // if no quantity: remove it
                return true;
            });
        }

        this.bankruptHalveDebts = function () {
            var debts = this.debts;
            for (var i = 0; i < debts.length; i++) {
                if (debts[i].id == "carloan" || debts[i].id == "creditcard" || debts[i].id == "retail") {
                    debts[i].expense = this.debts[i].expense * 0.5;
                    debts[i].liability = this.debts[i].liability * 0.5;
                }
            }
            m_playerBlob.debts = debts;
            m_this.refresh();
        }

        this.performMarketMustAction = function (cardData) {
            var newCash = this.cash;
            var properties = this.properties;
            for (var propertyIndex = 0; propertyIndex < properties.length; propertyIndex++) {
                var property = properties[propertyIndex];
                if (cardData.type == "market_startup") {
                    if (property.type == "smalldeal_startup" && property.quantity > 0) {
                        if (cardData.key == "250" || cardData.key == "400") {
                            //set the new cashflow of this property to be +250 or +400
                            //property.cashFlow += Number(cardData.key)
                            property.cashflow += Number(cardData.key);
                        }
                        else {
                            if (property.key == cardData.key && property.quantity > 0) {
                                //set the player cash to be += cardData.cost
                                //remove the property they are forced to sell
                                newCash += Number(cardData.cost);
                                property.quantity = 0;
                            }
                        }
                    }
                }
                else if (cardData.type == "market_lose") {
                    if (property.key == cardData.key && property.quantity > 0) {
                        //remove the property they are forced to give it up they get no cash
                        property.quantity = 0;
                    }
                }
                else if (cardData.type == "market_sellmultiply") {
                    if (property.key == cardData.key && property.quantity > 0) {
                        //set the player cash += (property.cost * cardData.cost)
                        //remove the property 
                        newCash += (Number(property.cost) * Number(cardData.cost));
                        property.quantity = 0;
                    }
                }
                else if (cardData.type == "market_fee") {
                    if (cardData.key == "rental") {
                        if (property.key == translations[language]["3-2house"] || property.key == translations[language]["plex"] || property.key == translations[language]["apthouse"] || property.key == translations[language]["2-1condo"]) {
                            if (this.cash >= cardData.cost) {
                                //is this correct ^
                                //set the player cash += -cardData.cost;
                                newCash += Number(-cardData.cost);
                                break;
                            }
                            else {
                                //offer a loan passing in (cardData.cost - this.cash)
                                //do not need to continue this is a one time thing no matter how many properties you have so just return
                                return false;
                            }
                        }
                    }
                }
                else if (cardData.key == translations[language]["8plex"]) {
                    if (property.key == translations[language]["plex"] && property.units == 8) {
                        if (this.cash >= cardData.cost) {
                            //does this work again ^
                            //set the player cash += -cardData.cost;
                            newCash += Number(-cardData.cost);
                            break;
                        }
                        else {
                            //offer a loan passing in (cardData.cost - this.cash)
                            //do not need to continue this is a one time thing no matter how many properties you have so just return
                            return false;
                        }
                    }
                }
            }
            //set the player's new cash;
            m_playerBlob.cash = newCash;
            // clear out the properties array of all 'quantity == 0' entries
            m_playerBlob.properties = properties.filter(function (property) {
                if (!property) { console.log("clearing out1", property); return false; } // if no property: remove it
                if (property.quantity == 0) { console.log("clearing out2", property); return false; } // if no quantity: remove it
                return true;
            });
            return true;
        }

        /**
         * removes the debt with the given Id
         * @param {String} debtId
         */
        this.removeDebt = function (debtId) {

            var debts = debts;
            m_playerBlob.debts = this.debts.filter(function (debt) {
                if (debt.id == debtId) { console.log("clearing out1", debt); return false }
                return true;
            });
            // m_this.refresh(); // gamesession does other random things outside of tihs function
        }

        /**
         * removes the property with the given index
         * @param {String} propIndex
         */
        this.removePropertyByIndex = function (propIndex) {
            m_playerBlob.properties = this.properties.filter(function (debt, index) {
                if (propIndex == index) {
                    return false;
                }
                return true;
            });
            // m_this.refresh(); // gamesession does other random things outside of tihs function
        }

        /**
         * returns true if the player has any assets used in bankrupcty checks
         */
        this.playerHasAssets = function () {
            for (var i = 0; i < this.properties.length; i++) {
                if (this.properties[i].quantity > 0) {
                    return true;
                }
            }
            return false;
        }

        /**
         * returns true if the player has any debts they can payoff used in bankruptcy checks
         */
        this.playerCanPayOffDebt = function () {
            for (var i = 0; i < this.debts.length; i++) {
                if (this.debts[i].key == "loan" && this.cash >= 1000) {
                    return true;
                }
                else {
                    if (this.debts[i].liability > 0 && this.cash >= this.debts[i].liability) {
                        return true;
                    }
                }
            }
            return false;
        }


        function setDirty() {
            m_dirty = true;
        }
    }

    function calc(obj, numKids) {
        var total = 0;
        if (obj) {
            Object.keys(obj).forEach(function (prop) {
                var amount = obj[prop]
                if (typeof amount === Types.NUMBER) {
                    if (prop === "childPerExpense") amount *= numKids;
                    total += amount;
                }
            });
        }
        return total;
    }

    return PlayerData;
})()
var TemplateParser = (function () {

    function TemplateParser() {

    }

    var m_template = null;

    function _castVal(val) {
        if (!isNaN(Number(val))) {
            return Number(val);
        }
        else if (typeof val === "string" && val.toLowerCase() === "true" || val.toLowerCase() === "false") {
            return Boolean(val);
        }
        return val;
    }

    function parse(id) {

        m_template = Main.loadQueue.getResult(id).template;

        Object.keys(m_template).forEach(function (key) {
            if (m_template[key] != null) {
                if (typeof m_template[key] == "object") {
                    Object.keys(m_template[key]).forEach(function (subkey) {
                        m_template[key][subkey] = _castVal(m_template[key][subkey]);
                    })
                } else {
                    m_template[key] = _castVal(m_template[key]);
                }
            }
        })

        return m_template;
    }
    //id = template camel case string
    //sub = path string
    function format(id, subID, color, allCaps) {
        var subtemplate = parse(id)[subID];

        // console.log("colortest", color, subtemplate.color);
        var text = new createjs.Text(
            allCaps ? subtemplate.text.toUpperCase() : subtemplate.text,
            font(subtemplate.bold ? "bold" : "", subtemplate.size, subtemplate.font),
            color || subtemplate.color
        );

        text.x = (function () {
            switch (subtemplate.align) {
                case "center":
                    return subtemplate.x + subtemplate.width / 2
                case "left":
                    return subtemplate.x;
                case "right":
                    return subtemplate.x + subtemplate.width;
            }
        })()
        text.y = subtemplate.y;
        if (!(text.text=="[b1]" || text.text=="[b2]" || text.text=="[b3]")){ // A bit dumb fix, but ensures that buttons text gets never ever wrapped (cause some languages have a bit long words)
            text.lineWidth = subtemplate.width;
        }
        text.maxWidth = subtemplate.width;
        text.multiline = subtemplate.multiline;
        text.wordWrap = subtemplate.wordWrap;
        text.textAlign = subtemplate.align;
        text.textBaseline = subtemplate.vAlign;
        return text;
    }

    function font(fontWeight, size, font) {
        var SPACE = " ";
        return (fontWeight + SPACE + size + "px" + SPACE + font)
    }

    function rect(id, subID, color) {
        var subtemplate = parse(id)[subID];
        var graphics = new createjs.Graphics();
        var width = subtemplate.width;
        var height = subtemplate.height
        graphics.beginFill(color).drawRect(0, 0, width, height);
        var rectangle = new createjs.Shape(graphics);
        rectangle.setBounds(0, 0, width, height);
        rectangle.x = subtemplate.x;
        rectangle.y = subtemplate.y;
        return rectangle;
    }

    //id =  string location template
    // sub id = string sub location template
    //frame = frame of the sprite
    //spriteID = string

    function sprite(id, subID, frame, spriteID) {
        var subtemplate = parse(id)[subID]
        if (spriteID) {
            var spritesheet = new createjs.Sprite(Main.loadQueue.getResult(spriteID))
        }
        else {
            var spritesheet = new createjs.Sprite(Main.loadQueue.getResult("ui"))
        }
        // var spritesheet = new createjs.Sprite(Main.loadQueue.getResult(spriteID)) || new createjs.Sprite(Main.loadQueue.getResult("ui"));
        spritesheet.gotoAndStop(frame);
        spritesheet.x = subtemplate.x;
        spritesheet.y = subtemplate.y;
        var bounds = spritesheet.getBounds();
        spritesheet.scaleX = subtemplate.width / bounds.width;
        spritesheet.scaleY = subtemplate.height / bounds.height;

        return spritesheet;
    }

    function list(creator, id, subID) {
        var subtemplate = parse(id)[subID];
        var list = creator.create(StatementList);
        var transform = list.transform;
        transform.x = subtemplate.x;
        transform.y = subtemplate.y;

        return list;
    }

    Object.defineProperties(TemplateParser, {
        parseTemplate: {
            value: parse,
            writable: false
        },
        template: { get: function () { return m_template; } },
        formatTextFromTemplate: {
            value: format,
            writable: false
        },
        makeRectFromTemplate: {
            value: rect,
            writable: false
        },
        makeSpriteFromTemplate: {
            value: sprite,
            writable: false
        },
        makeListFromTemplate: {
            value: list,
            writable: false
        }
    })

    return TemplateParser
})();
var GameScreen = (function () {
	inherit(GameScreen, ScreenElement);

	var m_template = null;

	// var m_rollButton = null;
	// var m_playersDatabase = null;
	// var m_position = 0;
	// var m_dreamSelect = null;
	// var m_turn = 0;
	// var m_currentTurn = 0;

	GameScreen.instance = null;

	// function GetCardClasses() {
	//     return {
	//         turnStart: GameStates.turnStart,
	//         dreamSelectCard: DreamSelectCard,
	//         specialStockCard: SpecialStockCard,
	//         dealCard: DealCard,
	//         loanCard: LoanCard,
	//         quitCard: QuitCard,
	//         endCard: EndCard,
	//         payoffLoanCard: PayOffCard,
	//         borrowCardStart: BorrowCardStartTurn,
	//         borrowCardEndTurn: BorrowCardEndTurn,
	//         dreamCard: DreamCard,
	//         winDreamCard: WinDreamCard,
	//         winPassiveCard: WinPassiveCard,
	//         startTurnCard: StartTurnCard,
	//         everyoneBankruptCard: EveryoneBankruptCard,
	//         skipTurnCard: SkipTurnCard,
	//         fastTrackCard: FastTrackCard,
	//         bankruptCard: BankruptCard,
	//         bankruptSellCard: BankruptSellCard,
	//         bankruptPayCard: BankruptPayCard,
	//         paydayCard: PayDayCard,
	//         taxCard: TaxCard,
	//         lawsuitCard: LawsuitCard,
	//         divorceCard: DivorceCard,
	//         cashflowDayCard: CashflowDayCard,
	//         charityCard: CharityCard,
	//         babyCard: BabyCard,
	//         marketCard: MarketCard,
	//         downsizeCard: DownsizeCard,
	//         payOffCard: PayOffCard,
	//         propertySmallDealCard: PropertySmallDealCard,
	//         bigDealCard: BigDealCard,
	//         doodadCard: DoodadCard,
	//         specialdoodadCard: SpecialDoodadCard,
	//         marketSellCard: MarketSellCard,
	//         stockBuyCard: StockBuyCard,
	//         bankruptComplete: BankruptCompleteCard,
	//         bankruptHalve: bankruptHalveCard,
	//         marketMust: MarketMustCard,
	//         bankruptLose: bankruptLoseCard
	//     };
	// }

	function GameScreen() {
		ScreenElement.call(this);
		var m_this = this;

		m_template = TemplateParser.parseTemplate("gameScreen");

		var m_playerPieces = [];
		var m_statement = null;
		var m_board = null;

		var m_currentView = null;
		var m_currentViewName = null;
		var m_currentData = null;

		var m_myPlayerPiece = null;
		var m_myPlayerIndex = -1;

		var m_dreamPieces = [];
		var m_myDreamPiece = null;

		//var CardClasses = GetCardClasses();

		this.onRelease = function () {
			if (GameScreen.instance == this) {
				GameScreen.instance = null;
			}
			m_template = null;
			m_board = null;
			m_statement = null;
			// m_playersDatabase = null;
			m_playerPieces = null;
		};

		this.onCreate = function () {
			Main.playSound("nextPlayer");
			GameScreen.instance = this;

			console.log("creating");

			// creating the gameboard background
			m_board = this.create(BoardElement);
			m_board.transform.scaleX = m_template.board.width / 1842;
			m_board.transform.scaleY = m_template.board.height / 1221;
			m_board.transform.x = m_template.board.x;
			m_board.transform.y = m_template.board.y;
			m_board.attach(this);
			this.create(HeaderWidget).attach(this);
			// create the player pieces on the game board
			m_playerPieces = function () {
				var playerPieces = [];
				var length = Main.gameSession.getNumberOfPlayers();
				for (var i = 0; i < length; i++) {
					var player = this.create(PlayerGamePieceElement);

					// if (Main.gameSession.playerData.index === i) {
					// 	m_myPlayerIndex = i;
					// 	m_myPlayerPiece = player;
					// }

					var template = m_template.boardPiece;
					player.setNumber(i);
					// player.transform.x = template.x;
					// player.transform.y = template.y;
					player.attach(this);
					playerPieces.push(player);
				}
				return playerPieces;
			}.call(this);

			m_dreamPieces = function () {
				var length = Main.gameSession.getNumberOfPlayers();

				var pieces = [];
				for (var i = 0; i < length; i++) {
					console.log(i);
					var piece = this.create(PlayerDreamPieceElement);

					// if (Main.gameSession.playerData.index === i) {
					// 	m_myDreamPiece = piece;
					// }
					var template = m_template.boardPiece;

					piece.setNumber(i);

					piece.transform.scaleX = piece.transform.getBounds().width / template.width;
					piece.transform.scaleY = piece.transform.getBounds().height / template.height;
					// piece.transform.x = template.x - piece.transform.getBounds().width / 2;
					// piece.transform.y = template.y - piece.transform.getBounds().height / 2;
					// console.log(piece.transform.x);
					piece.attach(this);
					pieces.push(piece);
				}
				return pieces;
			}.call(this);

			//console.log(m_dreamPieces);

			var chatlog = this.create(FooterWidget).attach(this)


			if (Main.gameSession.isParticipating()) {
				// create the statement sheet
				m_statement = function () {
					var statement = this.create(StatementElement);
					var container = statement.transform;
					container.y = 56;
					container.x = -652;
					container.on("click", function (event) {
						statement.tween();
					});
					statement.setPlayerData(
						Main.gameSession.playerData
					);
					statement.attach(this);
					return statement;
				}.call(this);
			}


			// this.polo("onRollDice", onRollDice);
			this.polo("onGameStateUpdated", onGameStateUpdated);

			// m_currentView = CardElement.showCard(this, DoodadCard,
			// {
			//     "type": "doodad",
			//     "title": "BIRTHDAY PARTY",
			//     "cost": 100,
			//     "child": "has"
			// });
			// m_currentView = CardElement.showCard(this, DealCard, null);
		};

		function onGameStateUpdated() {
			var turnState = Main.gameSession.turnState;
			if (turnState) {
				if (turnState.id == GameStates.rolling) {
					// TODO: separate displaying of dic rolls && moving player pieces
				} else {
					// Main.gameSession.updateCardData(turnState.data);
					m_this.showView(turnState.id, turnState.data);
				}
			} else {
				console.error("no turn state...");
			}
		}

		this.showView = function (viewName, data) {
			if (m_currentView) {
				m_currentView.release();
			}
			/* 
            var viewType = null;
            if (viewName == CardClasses.startTurnCard) {
                viewType = CardClasses.startTurnCard;
            } else if (viewName == CardClasses.endCard) {
                viewType = CardClasses.endCard;
            } else if (viewName == CardClasses.borrowCard) {
                viewType = CardClasses.borrowCard;
            } else if (viewName == Views.rr_deal) {
                viewType = CardClasses.dealCard;
            } else if (viewName == Views.rr_smalldeal) {
                if (data.type == DeckCardTypes.smalldeal_stock || data.type == DeckCardTypes.smalldeal_anystock) {
                    if (Number(data.cost) < 0) {
                        /// -1 == x2, -2 == x0.5 the amount of shares
                        /// example: 500 shares, -1 -> 1000 shares, -2 -> 250 shares
                        this.polo("SpecialStockEvent", data); // TODO: Handle
                        viewType = CardClasses.specialStockCard; // $activate("specialStockCard");
                    } else {
                        viewType = CardClasses.stockCard; // $activate("stockCard");
                    }
                } else if (data.downpay != undefined) {
                    viewType = CardClasses.propertySmallDealCard; // $activate("propertyCard");
                } else { // will never happen
                    console.warn("this smalldeal case shouldn't happen, data:", data);
                    // viewType = CardClasses.smallDealCard; // $activate("smallDealCard");
                }
            } else {
                console.warn("hmm, unknown case", viewName)
                viewType = viewName;
            }
            m_currentData = data;
            m_currentViewName = viewName; 
            */

			if (viewName == GameStates.turnStart) {
			} else {
				m_currentView = CardElement.showCard(this, viewName, data);
			}
		};
	}
	return GameScreen;
})();

// var LobbyScreen = (function () {

//     inherit(LobbyScreen, ScreenElement);

//     var templateID =  "lobbyScreen";

//     function LobbyScreen() {

//         var list = null;
//         var titleText = null;
//         var feedbackText = null;
//         var backplate = null;
//         var roomListReference = null;
//         var databaseManager = null;

//         var self = this;
//         var template = TemplateParser.parseTemplate(templateID);

//         ScreenElement.call(this);

//         this.onCreate = function() {
//             onCreateDatabaseRefences();
//             onCreateSprites();
//             onCreateText();
//             onCreateList();
//         }

//         this.onRelease = function() {
//             //TODO: null all the things
//         }

//         function onCreateDatabaseRefences() {
//             //TODO: Setup room references

//         }

//         function onCreateList() {
//             createList();
//             setupList();
//             attachList();
//         }

//         function onCreateSprites() {
//             createSprites();
//             attachSprites();
//         }

//         function onCreateText() {
//             createText();
//             attachText();
//         }

//         function createList() {
//             list = TemplateParser.makeListFromTemplate(self, templateID, "lobbyList");
//             list.html.className += " lobby";
//         }

//         function setupList() {
//            createItems();
//         //    setupItems();
//         //    attachItem();
//         }

//         function attachList() {
//             list.attach(self);
//         }

//         function createText() {
//             titleText = TemplateParser.formatTextFromTemplate(templateID, "lobbyTitle", Colors.PURPLE, false);
//             feedbackText = TemplateParser.formatTextFromTemplate(templateID, "feedbackText", Colors.PURPLE, false);
//         }

//         function attachText() {
//             self.transform.addChild(titleText);
//             self.transform.addChild(feedbackText);
//         }

//         function createSprites() {
//             var subtemplate = template.mainSheet;
//             backplate = self.fetchSprite("main_sheet", false, {
//                 width: subtemplate.width,
//                 height: subtemplate.height,
//                 x: subtemplate.x,
//                 y: subtemplate.y,
//                 sheet: "ui2"
//             });
//         }

//         function attachSprites() {
//             self.transform.addChild(backplate);
//         }

//         function createItems() {
//             var createRoomItem = self.create(ListItem);
//             list.addItem(createRoomItem);

//             for(var i = 0; i < 12; i++) {
//                 var item = list.addItem(ListItem.DEFAULT);
//                 item.html.className += i % 2 === 0 ? " even" : " odd";
//             }
//         }
//     }

//     return LobbyScreen;
// })();

var LobbyScreen = (function () {
    inherit(LobbyScreen, ScreenElement);

    function LobbyScreen() {
        ScreenElement.call(this);
        var m_this = this;

        var m_divLobby = null;
        var m_ulLobby = null;
        /** @type {LobbyListItem[]} */
        var m_rooms = [];
        var m_domElement = null

        /** @type {LobbyListItem[]} */
        var m_btnJoinRoom = null
        /** @type {Sprite js} */
        var m_joinRoomBG = null

        /** @type {Container Js} */
        var joinRoomContainer = null
        var m_btnNewRoom = null
        var m_inputPW = null;
        var m_headerName = null;
        var m_lobby = null;

        /** @type {Dom Js} */
        var domElementPW = null


        var lobbyTemplateString = "lobbyScreen"
        /** @type {create js Text} */
        var joinGameTitle = null

        /** @type {create js Text} */
        var lobbyTitle = null

        var lobbyTemplate = TemplateParser.parseTemplate(lobbyTemplateString)

        /** @type {create js sprite} */
        var mainSheet = null;

        this.onCreate = function () {
            Main.canvas.style.backgroundColor = '#c1d2a3ff';
            joinRoomContainer = new createjs.Stage("JoinRoom")


            var fieldset = document.createElement("fieldset")
            m_divLobby = document.createElement("div")
            m_divLobby.id = "Lobby"
            m_divLobby.hidden = true;
            initLobby();

            m_lobby = m_this.create(Lobby);
            m_lobby.setup(m_rooms, m_btnNewRoom, m_btnJoinRoom, domElementPW, m_headerName);

            m_divLobby.appendChild(m_ulLobby)
            m_domElement = new createjs.DOMElement(m_divLobby);
            m_domElement.x = lobbyTemplate.lobbyList.x;
            m_domElement.y = lobbyTemplate.lobbyList.y - 40;
            m_domElement.width = lobbyTemplate.lobbyList.width;
            m_domElement.height = lobbyTemplate.lobbyList.height;

            this.transform.addChild(joinRoomContainer)
            this.transform.addChild(mainSheet)


            this.transform.addChild(lobbyTitle)
            this.transform.addChild(m_domElement)
            this.transform.addChild(domElementPW)


            Main.ui.appendChild(m_divLobby)
            console.log(m_divLobby)
            setTimeout(function () {
                m_divLobby.hidden = false;
            }, 1)

            m_this.polo("onRoomJoinFailed", _handleRoomJoinFailed);
        }

        function _handleRoomJoinFailed(reason) {
            if (reason == "password") {
                alert(translations[language]["incorrect-password"]);
            } else if (reason == "alreadyStarted") {
                alert(translations[language]["already-started"]);
            } else if (reason == "full") {
                alert(translations[language]["game-full"]);
            }
        }

        this.onRelease = function () {
            Main.ui.removeChild(m_divLobby);
            Main.ui.removeChild(m_inputPW);

            m_inputPW.removeEventListener("submit", _handlePWSubmit);

            m_rooms = null;

            m_lobby = null;
        }

        function initLobby() {
            mainSheet = TemplateParser.makeSpriteFromTemplate("lobbyScreen", "mainSheet", 4, "ui2")



            lobbyTitle = TemplateParser.formatTextFromTemplate("lobbyScreen", "lobbyTitle", "#775478", false)
            lobbyTitle.text = lobbyTemplate.lobbyTitle.text

            makeEntryRoom();
            makeRoom();
            makeJoinButton()




        }
        function makeJoinButton() {
            joinGameTitle = TemplateParser.formatTextFromTemplate("lobbyScreen", "joinGameTitle", "#775478", false)
            joinGameTitle.text = Data.getVocab("join", "copy")

            m_joinRoomBG = TemplateParser.makeSpriteFromTemplate("lobbyScreen", "joinGameBtn", 53)

            var nextArrow = TemplateParser.makeSpriteFromTemplate("lobbyScreen", "nextArrow", 55)
            m_this.tintSprite(nextArrow, "#775478")

            m_btnJoinRoom = joinRoomContainer;
            // m_btnJoinRoom.innerText = "Join"
            // m_btnJoinRoom.disabled = true;
            // var attr = document.createAttribute("type");
            // attr.value = "button"
            // m_btnJoinRoom.attributes.setNamedItem(attr);

            joinRoomContainer.addChild(m_joinRoomBG)
            joinRoomContainer.addChild(joinGameTitle)
            joinRoomContainer.addChild(nextArrow)
            joinRoomContainer.y -= 50



            // m_divLobby.appendChild(m_btnJoinRoom)
        }

        function makeEntryRoom() {

            m_ulLobby = document.createElement("ul")

            // create the 'create new room' button
            m_btnNewRoom = document.createElement("li")
            var aLobby = document.createElement("a")
            m_btnNewRoom.appendChild(aLobby)
            aLobby.innerText = translations[language]["create-new-room"]
            m_btnNewRoom.classList.add("odd")
            m_ulLobby.appendChild(m_btnNewRoom)

            m_headerName = document.createElement("h2")

            m_headerName.align = "center";
            m_headerName.innerText = translations[language]["room"]
            m_divLobby.appendChild(m_headerName)


            m_inputPW = document.createElement("input")
            m_inputPW.hidden = true;
            // m_inputPW.maxLength = 10;
            m_inputPW.placeholder = translations[language]["password"]
            m_inputPW.id = "PasswordTextBox";
            m_inputPW.addEventListener("submit", _handlePWSubmit);

            domElementPW = new createjs.DOMElement(m_inputPW)
            domElementPW.x = 550;
            domElementPW.y = lobbyTemplate.refreshBtn.y
            //console.log("pw ", domElementPW.htmlElement.hidden)
            domElementPW.alpha = 0

            // console.log
            //domElementPW.htmlElement.visibility = "hidden";
            m_this.transform.addChild(domElementPW)
            Main.ui.appendChild(m_inputPW)
            // Main.ui.appendChild(m_inputPW)
            setTimeout(function () { m_inputPW.hidden = false; }, 1);

        }

        function _handlePWSubmit(e) {
            e.preventDefault();
        }

        function makeRoom() {
            m_ulLobby.id = "rooms"
            m_divLobby.appendChild(m_ulLobby)

            // make room list
            for (var i = 0; i < 24; i++) {
                /*  
                var liLobby = document.createElement("li")
                var aLobby = document.createElement("a")
                liLobby.appendChild(aLobby);
                if (i % 2 === 0) {
                    liLobby.classList.add("even")
                } else {
                    liLobby.classList.add("odd")
                }
                
                aLobby.innerText = "no";
                m_ulLobby.appendChild(liLobby);
                m_rooms.push(liLobby)
                */

                /** @type {LobbyListItem} */
                var button = m_this.create(LobbyListItem);
                button.setIndex(i);
                m_ulLobby.appendChild(button.transform);
                m_rooms.push(button);


                // Main.firebase.database().ref("rooms").on("value", function(snap){
                //     m_rooms.forEach(function(mbutton) {
                //        console.log(mbutton.innerText)
                //     });
                // })



            }
        }
    }


    return LobbyScreen;
})()

inherit(LobbyListItem, CoreElement);
function LobbyListItem() {
    CoreElement.call(this);
    /** @type {LobbyListItem} */
    var m_this = this;

    var m_roomId = null;
    var m_roomBlob = null;

    /** @type {HTMLLIElement} */
    var m_liLobby = null;
    /** @type {HTMLAnchorElement} */
    var m_aLobby = null;
    var m_index = -1;

    var m_validRoom = false;

    /** @type {HTMLElement} */
    this.transform = null;
    Object.defineProperty(this, "transform", { get: function () { return m_liLobby; } });

    this.roomId = null;
    Object.defineProperty(this, "roomId", { get: function () { return m_roomId; } });

    this.roomBlob = null;
    Object.defineProperty(this, "roomBlob", { get: function () { return m_roomBlob; } });

    this.roomName = null;
    Object.defineProperty(this, "roomName", { get: function () { return (m_roomBlob ? m_roomBlob.name : null); } });

    this.onCreate = function () {
        m_liLobby = document.createElement("li")
        m_aLobby = document.createElement("a")
        m_liLobby.appendChild(m_aLobby);
        m_aLobby.innerText = translations[language]["loading-no"];

        this.transform.addEventListener("click", onClicked);
    }

    this.onRelease = function () {
        m_liLobby.remove();


        m_roomId = null;
        m_roomBlob = null;


        // m_liLobby = null;
        // m_aLobby = null;
    }

    function onClicked() {
        if (m_validRoom) {
            m_this.dispatchEvent({ type: "click", target: this });
        }
    }

    this.setIndex = function (index) {
        if (index % 2 === 0) {
            m_liLobby.classList.add("even")
        } else {
            m_liLobby.classList.add("odd")
        }
    }

    /**
     * @param {string} roomId
     * @param {RoomBlob} roomBlob
     */
    this.setRoomData = function (roomId, roomBlob) {
        m_roomId = roomId;
        m_roomBlob = roomBlob;

        if (roomBlob && roomBlob.players && roomBlob.gameState) {
            m_validRoom = true;
            var numJoined = roomBlob.players.filter(function (player, i) { return player.isActive == true }).length
            this.setText("[" + numJoined + "/" + roomBlob.maxPlayers + "] " + roomBlob.name + (roomBlob.gameState.gameStarted ? "  [" + translations[language]["started"] + "]" : ""));
        } else {
            m_validRoom = false;
            this.setText(translations[language]["empty-room"]);
        }
    }

    this.select = function () {
        m_liLobby.classList.add("selected");
    }

    this.unselect = function () {
        m_liLobby.classList.remove("selected");
    }

    this.setText = function (text) {
        m_aLobby.innerText = text;
    }
}
var RoomScreen = (function () {

    inherit(RoomScreen, ScreenElement);

    var templateID = "partySetupScreen";
    var px = "px";

    function RoomScreen() {

        var self = this;

        var template = TemplateParser.parseTemplate(templateID);
        var vocab = Main.loadQueue.getResult("vocabEnUS").vocab.lobby;
        var titles = [];
        var frames = [];
        var icons = [];
        var instructions = "";
        var partySelectCard = null;
        var titleText = null;
        var numberOfPlayers = 1;
        var gameNameText = null;
        var passwordNameText = null;
        var passwordTextbox = null;
        var nameTextbox = null;
        var backButton = null;
        var nextButton = null;
        var nextText = null;
        var backText = null;
        var backArrow = null;
        var nextArrow = null;
        var DISABLED_ALPHA = .5;

        ScreenElement.call(this);

        this.onCreate = function () {
            onCreateSprites.call(this);
            onCreateText.call(this);
            onCreateDOMElements.call(this);
        }

        this.onRelease = function () {
            this.transform.children.forEach(function (child) {
                child.uncache();
                child.removeAllEventListeners();
            });
            self = null;
            template = null;
            vocab = null;
            titles = null;
            frames = null;
            icons = null;
            partySelectCard = null;
            titleText = null;
            gameNameText = null;
            passwordNameText = null;
            passwordTextbox = null;
            nameTextbox = null;
            backButton = null;
            nextButton = null;
            nextText = null;
            backText = null;
            backArrow = null;
            nextArrow = null;
            this.transform.removeAllEventListeners();
            this.transform.removeAllChildren();
        }

        function onCreateText() {
            createText.call(this);
            attachText.call(this);
        }

        function onCreateSprites() {
            createSprites.call(this);
            attachSprites.call(this);
        }

        function onCreateDOMElements() {
            createDOMElements.call(this);
            attachDOMElements.call(this);
        }

        function createDOMElements() {

            var subtemplate = null;

            subtemplate = template.gameOutline;
            nameTextbox = this.create(DOMElement);
            nameTextbox.set(document.createElement("input"), 
            /** @param {HTMLInputElement} element */
            function (element) {
                element.maxLength = 8
                element.autocomplete = "new-password";
                element.style.width = subtemplate.width.toString() + px;
                element.style.height = subtemplate.height.toString() + px;
                subtemplate = template.gameNameText_onlinePartySetup;
                element.style.fontFamily = subtemplate.font;
                element.style.fontSize = subtemplate.size.toString() + px;
                element.style.verticalAlign = "top";
                element.style.background = "none";
                element.addEventListener("input", function (event) {
                    nextButton.alpha = nextText.alpha = nextArrow.alpha = element.value != "" ? 1 : DISABLED_ALPHA;
                });
            });
            subtemplate = template.gameOutline;
            nameTextbox.transform.x = subtemplate.x;
            nameTextbox.transform.y = subtemplate.y;

            
            subtemplate = template.passwordOutline;
            passwordTextbox = this.create(DOMElement);
            passwordTextbox.set(document.createElement("input"), function (element) {
                element.maxLength = 4;
                element.style.width = subtemplate.width.toString() + px;
                element.style.height = subtemplate.height.toString() + px;
                element.autocomplete = "new-password";
                subtemplate = template.passwordInputText_onlinePartySetup;
                element.style.fontFamily = subtemplate.font;
                element.style.fontSize = subtemplate.size.toString() + px;
                element.style.verticalAlign = "top";
                element.style.background = "none";
                // element.type = "password";
            });
            subtemplate = template.passwordOutline;
            passwordTextbox.transform.x = subtemplate.x;
            passwordTextbox.transform.y = subtemplate.y;
        }

        function attachDOMElements() {
            passwordTextbox.attach(this);
            nameTextbox.attach(this);
        }

        function createSprites() {

            var subtemplate = template.backBtn;
            backButton = this.fetchSprite("create_tab", false, {
                width: subtemplate.width,
                height: subtemplate.height,
                x: subtemplate.x,
                y: subtemplate.y
            });
            backButton.on("click", function (event) {
                Main.changeScreen(LobbyScreen);
            })

            subtemplate = template.nextBtn;
            nextButton = this.fetchSprite("create_tab", false, {
                width: subtemplate.width,
                height: subtemplate.height,
                x: subtemplate.x,
                y: subtemplate.y,
                alpha: DISABLED_ALPHA
            });
            var clicked = false;
            nextButton.on("click", function (event) {
                if (!clicked) {
                    var roomName = nameTextbox.html.value;
                    if (roomName != "") {
                        Main.logic.createRoom(numberOfPlayers, roomName, passwordTextbox.html.value);
                        clicked = true;
                    }
                }
            })

            subtemplate = template.backArrow;
            backArrow = this.fetchSprite("play_white", false, {
                width: subtemplate.width,
                height: subtemplate.height,
                x: subtemplate.x,
                y: subtemplate.y
            });
            backArrow.scaleX *= -1;
            backArrow.x += backArrow.getBounds().width / 2;
            this.tintSprite(backArrow, Colors.PURPLE);

            subtemplate = template.nextArrow;
            nextArrow = this.fetchSprite("play_white", false, {
                width: subtemplate.width,
                height: subtemplate.height,
                x: subtemplate.x,
                y: subtemplate.y,
                alpha: DISABLED_ALPHA
            });
            this.tintSprite(nextArrow, Colors.PURPLE);

            subtemplate = template.partySelectCard;
            partySelectCard = this.fetchSprite("main_sheet", false, {
                sheet: "ui2",
                width: subtemplate.width,
                height: subtemplate.height,
                x: subtemplate.x,
                y: subtemplate.y
            });

            for (var i = 0; i < 6; i++) {
                var number = (i + 1).toString();
                subtemplate = template["p" + number + "Frame"];
                var frame = this.fetchSprite("box", false, {
                    width: subtemplate.width,
                    height: subtemplate.height,
                    x: subtemplate.x,
                    y: subtemplate.y
                })
                var icon = this.fetchSprite(i === 0 ? "player_male_white" : "X_closed", false, {
                    width: subtemplate.width,
                    height: subtemplate.height,
                    x: subtemplate.x,
                    y: subtemplate.y
                });

                var hit = new createjs.Shape();
                var frameBounds = frame.getBounds();
                hit.graphics.beginFill("#000").drawRect(0, 0, frameBounds.width, frameBounds.height);
                icon.hitArea = hit;

                icon.on("click", function (event) {
                    var playerNumber = icons.indexOf(this);
                    var length = icons.length;

                    for (var i = 1; i < length; i++) {
                        icons[i].uncache();
                        icons[i].gotoAndStop(i <= playerNumber ? "player_male_white" : "X_closed");
                        self.tintSprite(icons[i], Colors.ARRAY[i]);
                    }

                    numberOfPlayers = playerNumber + 1;
                });

                this.tintSprite(frame, Colors.DARK_TAN);
                this.tintSprite(icon, Colors.ARRAY[i]);
                frames.push(frame);
                icons.push(icon);

            }
        }

        function attachSprites() {
            this.transform.addChild(backButton);
            this.transform.addChild(nextButton);
            this.transform.addChild(backArrow);
            this.transform.addChild(nextArrow);
            this.transform.addChild(partySelectCard);
            frames.forEach(attach, this);
            icons.forEach(attach, this);
        }

        function createText() {
            instructions = TemplateParser.formatTextFromTemplate(templateID, "instructionsText", Colors.BLACK);
            instructions.text = "";
            for (var i = 1; i <= 6; i++) {

                var number = i.toString();

                if (i <= 4) {
                    instructions.text += (vocab["instructions" + number] + "\n");
                }

                var text = null;
                text = TemplateParser.formatTextFromTemplate(templateID, "p" + number + "Title", Colors.ARRAY[i - 1]);
                text.text = number;
                titles.push(text);
            }
            nextText = TemplateParser.formatTextFromTemplate(templateID, "nextText", Colors.PURPLE);
            nextText.text = vocab.create;
            nextText.alpha = DISABLED_ALPHA;

            backText = TemplateParser.formatTextFromTemplate(templateID, "backText", Colors.PURPLE);
            passwordNameText = TemplateParser.formatTextFromTemplate(templateID, "passwordNameText_onlinePartySetup", Colors.BLACK);
            gameNameText = TemplateParser.formatTextFromTemplate(templateID, "gameNameText_onlinePartySetup", Colors.BLACK);
            titleText = TemplateParser.formatTextFromTemplate(templateID, "titleText", Colors.PURPLE);
        }

        function attachText() {
            titles.forEach(attach, this);
            this.transform.addChild(nextText);
            this.transform.addChild(backText);
            this.transform.addChild(instructions);
            this.transform.addChild(titleText);
            this.transform.addChild(gameNameText);
            this.transform.addChild(passwordNameText);
        }

        function attach(container) {
            this.transform.addChild(container);
        }
    }

    return RoomScreen;
})();
var TitleScreen = (function () {
    inherit(TitleScreen, ScreenElement);

    function TitleScreen() {
        ScreenElement.call(this);

        // var splashTemplateName = "splashScreen"
        // var splashTemplate = TemplateParser.parseTemplate(splashTemplateName)
        var m_this = this;

        /**@type {create js container} */
        var titleContainer = null

        this.onCreate = function () {

            var titleContainer = new createjs.Container()
            var template = TemplateParser.parseTemplate("splashScreen");
            var titleImage = Main.loadQueue.getResult("titleImage");

            var bgTab = m_this.fetchSprite("loadBar", false, {
                x: template.loadBar.x,
                y: template.loadBar.y,
                width: template.loadBar.width,
                height: template.loadBar.height,
                sheet: "titleImage",


            })

            var txtContinue = TemplateParser.formatTextFromTemplate("splashScreen", "clickText", "black", false)
            txtContinue.font = "Bold 26px Helvetica"
            txtContinue.text = translations[language]["click-anywhere-to-continue"]

            titleContainer.addChild(bgTab)

            titleContainer.addChild(txtContinue)

            titleContainer.y = 100
            // console.log(template.clickText[13])
            var bgImg = new createjs.Sprite(titleImage);
            this.splashBackground = bgImg
            bgImg.gotoAndStop("loadingscreen");



            var bounds = bgImg.getBounds();
            bgImg.scaleX = (template.splashBackground.width / bounds.width);
            bgImg.scaleY = (template.splashBackground.height / bounds.height);

            //TemplateParser.applyTemplate(this, template);

            bgImg.addEventListener("click", function () {
                // Main.changeScreen(LobbyScreen);
                Main.playSound("buttonPush")
                Main.logic.onTitleClicked();
            })

            var versionNumber = (function () {
                var text = new createjs.Text(translations[language]["version"] + ": " + Main.versionNumber.toString(), "17px Helvetica", Colors.WHITE);
                // text.textAlign = "right";
                // text.x = this.stageWidth - 12;
                // text.y = this.stageHeight - 700 - text.getMeasuredLineHeight();
                text.x = 12;
                text.y = 12;
                this.transform.addChild(text);
                return text;
            }).call(this)

            //var cool = this.create(CardDreamSelector)
            //this.transform.addChild(cool);

            this.transform.addChild(titleContainer)
            this.transform.addChildAt(bgImg, 0);


            
            createjs.Tween.get(titleContainer).to({y:0 },500,createjs.Ease.quintInOut)
            createjs.Ticker.addEventListener("tick", TickHandler)
            //this.create(FooterWidget).attach(this)
        };


        function TickHandler(e) {
            if(titleContainer){ titleContainer.update();}
           
        }

        this.onRelease = function () {
            createjs.Ticker.removeEventListener("tick", TickHandler)
        }
    }

    return TitleScreen;
})();
var WaitingScreen = (function () {

    inherit(WaitingScreen, ScreenElement);

    var templateID = "partySetupScreen";
    var px = "px";

    function WaitingScreen() {

        var self = this;

        var template = TemplateParser.parseTemplate(templateID);
        var vocab = Main.loadQueue.getResult("vocabEnUS").vocab.lobby;
        var isLocalPlayerHost = Main.gameSession.getCurrentPlayerBlob().isHost;
        var lobbyStatus = isLocalPlayerHost ? "_localHost" : "_onlinePartySetup";
        var instructionStatus = isLocalPlayerHost ? "host" : "guest"
        var numberOfPlayers = Main.gameSession.roomBlob.maxPlayers;
        var titles = new Array(numberOfPlayers);
        var frames = [];
        var icons = [];
        var instructions = "";
        var partySelectCard = null;
        var nextText = null;
        var titleText = null;
        var gameNameText = null;
        var backButton = null;
        var nextButton = null;
        var backText = null;
        var backArrow = null;
        var nextArrow = null;
        var nameTextbox = null;
        var nameTextHtml = null;
        var types = [];
        var ref = null;
        var playersRef = null;
        var DISABLED_ALPHA = .5;

        ScreenElement.call(this);

        this.onCreate = function () {
            onCreateSprites.call(this);
            onCreateText.call(this);
            onCreateDOMElements.call(this);
            onCreateDatabaseRef.call(this);
        }

        function onCreateDatabaseRef() {
            playersRef = Main.gameSession.roomRef.child("players")
            playersRef.on("value", onPlayersUpdated);
            ref = Main.gameSession.localPlayerRef.child("isReady");
            Main.gameSession.roomBlob.players.forEach(function (player, i) {
                Main.gameSession.roomRef.child("players/" + i).on("value", onReady);
            });
            ref.set(Main.gameSession.playerData.isHost);
        }

        function onPlayersUpdated(snap) {
            console.log("onPlayersUpdated this", this);
            if (!self || self.released) { return; }

            if (Main.gameSession.roomBlob.players.every(function (playerBlob) {
                return playerBlob.isHost === false;
            })) {
                Main.logic.exitGame();
            } else {

                if (!snap.val()) { return; }

                Object.keys(snap.val()).forEach(function (p) {

                    /** @type {PlayerBlob} */
                    var playerBlob = snap.val()[p];

                    if (playerBlob && playerBlob.isActive === true) {
                        var index = playerBlob.index;
                        types[index].text = playerBlob.isReady ? translations[language]["ready"] : "";
                        

                        if (index === Main.gameSession.playerData.index) {
                            self.transform.removeChild(titles[index]);
                        }
                        else {
                            titles[index].text = playerBlob.name;
                        }

                        icons[index].uncache();
                        icons[index].gotoAndStop("player_male_white");
                        self.tintSprite(icons[index], Colors.ARRAY[index]);
                    } else if (playerBlob && playerBlob.isActive === false) {
                        var index = parseInt(p);
                        var number = (index + 1);
                        types[index].text = "";
                        icons[index].uncache();
                        icons[index].gotoAndStop("plus");
                        self.tintSprite(icons[index], Colors.ARRAY[index]);
                        if (self.transform.getChildIndex(titles[index]) === -1) {
                            titles[index] = TemplateParser.formatTextFromTemplate(templateID, "p" + number + "Title", Colors.ARRAY[index]);
                            titles[index].text = number;
                            self.transform.addChild(titles[index]);
                        } else {
                            titles[index].text = number;
                        }
                    }
                })

            }
        }

        this.onRelease = function () {

            nameTextHtml.removeEventListener("input", onInput);
            nameTextHtml.removeEventListener("submit", onSubmit);

            ref.off("value", onReady);
            ref = null;

            nameTextHtml = null;

            this.transform.children.forEach(function (child) {
                child.uncache();
                child.removeAllEventListeners();
            });

            self = null;
            template = null;
            vocab = null;
            titles = null;
            frames = null;
            icons = null;
            partySelectCard = null;
            titleText = null;
            gameNameText = null;
            backButton = null;
            nextButton = null;
            nextText = null;
            backText = null;
            backArrow = null;
            nextArrow = null;
            this.transform.removeAllEventListeners();
            this.transform.removeAllChildren();
            playersRef.off("value", onPlayersUpdated);
            playersRef = null;
            Main.gameSession.roomBlob.players.forEach(function (player, i) {
                if (Main.gameSession.roomRef) Main.gameSession.roomRef.child("players/" + i).off("value", onReady);
            });

        }

        function onCreateText() {
            createText.call(this);
            attachText.call(this);
        }

        function onCreateSprites() {
            createSprites.call(this);
            attachSprites.call(this);
        }

        function onCreateDOMElements() {
            createDOMElements.call(this);
            attachDOMElements.call(this);
        }

        function createDOMElements() {
            var subtemplate = template["textInput" + (Main.gameSession.playerData.index + 1).toString()];
            nameTextbox = ((function () {
                var input = this.create(DOMElement);
                input.set(document.createElement("input"), function (element) {
                    element.style.width = subtemplate.width + px;
                    element.style.height = subtemplate.height + px;
                    element.style.textAlign = "center";
                    element.maxLength = 8;
                    element.value = Main.gameSession.playerData.name;
                    element.addEventListener("input", onInput);
                    element.addEventListener("submit", onSubmit);
                    nameTextHtml = element;
                });
                return input;
            }).call(this));

            nameTextbox.transform.x = subtemplate.x;
            nameTextbox.transform.y = subtemplate.y;
        }

        function onInput(event) {
            Main.gameSession.localPlayerRef.child("name").set(nameTextbox.html.value);
        }

        function onSubmit(event) {
            event.preventDefault();
        }

        function attachDOMElements() {
            nameTextbox.attach(this);
        }

        function createSprites() {

            var subtemplate = template.backBtn;
            backButton = this.fetchSprite("create_tab", false, {
                width: subtemplate.width,
                height: subtemplate.height,
                x: subtemplate.x,
                y: subtemplate.y
            });
            backButton.on("click", function (event) {
                var session = Main.gameSession;
                if (session.playerData.isHost === true) {
                    session.localPlayerRef.child("isHost").set(false);
                } else {
                    session.localPlayerRef.set(session.createPlayerBlobStub(session.playerData.index));
                    Main.logic.exitGame();
                }
            })

            subtemplate = template.nextBtn;
            nextButton = this.fetchSprite("create_tab", false, {
                width: subtemplate.width,
                height: subtemplate.height,
                x: subtemplate.x,
                y: subtemplate.y,
                alpha: Main.gameSession.playerData.isHost ? DISABLED_ALPHA : 1
            });
            nextButton.on("click", function (event) {
                if (!Main.gameSession.playerData.isHost) {
                    nextText.text = (nextText.text === vocab.clickready) ? vocab.ready : vocab.clickready;
                    ref = Main.gameSession.localPlayerRef.child("isReady");
                    ref.set(nextText.text === vocab.ready);
                    ref.on("value", onReady); // TODO: mark for cleanup
                } else {
                    if (nextButton.alpha === 1) {
                        self.marco("onStartGameClicked");
                    }
                }
            })

            subtemplate = template.backArrow;
            backArrow = this.fetchSprite("play_white", false, {
                width: subtemplate.width,
                height: subtemplate.height,
                x: subtemplate.x,
                y: subtemplate.y
            });
            backArrow.scaleX *= -1;
            backArrow.x += backArrow.getBounds().width / 2;
            this.tintSprite(backArrow, Colors.PURPLE);

            subtemplate = template.nextArrow;
            nextArrow = this.fetchSprite("play_white", false, {
                width: subtemplate.width,
                height: subtemplate.height,
                x: subtemplate.x,
                y: subtemplate.y,
                alpha: Main.gameSession.playerData.isHost ? DISABLED_ALPHA : 1
            });
            this.tintSprite(nextArrow, Colors.PURPLE);

            subtemplate = template.partySelectCard;
            partySelectCard = this.fetchSprite("main_sheet", false, {
                sheet: "ui2",
                width: subtemplate.width,
                height: subtemplate.height,
                x: subtemplate.x,
                y: subtemplate.y
            });

            for (var i = 0; i < 6; i++) {
                var number = (i + 1).toString();
                subtemplate = template["p" + number + "Frame"];
                var frame = this.fetchSprite("box", false, {
                    width: subtemplate.width,
                    height: subtemplate.height,
                    x: subtemplate.x,
                    y: subtemplate.y
                })
                var icon = this.fetchSprite((function () {
                    if (i === 0) return "player_male_white";
                    else if ((i + 1) <= numberOfPlayers) return "plus";
                    else return "X_closed";
                })(), false, {
                        width: subtemplate.width,
                        height: subtemplate.height,
                        x: subtemplate.x,
                        y: subtemplate.y
                    });

                var hit = new createjs.Shape();
                var frameBounds = frame.getBounds();
                hit.graphics.beginFill("#000").drawRect(0, 0, frameBounds.width, frameBounds.height);
                icon.hitArea = hit;

                // if (icon.currentFrame === 48 || icon.currentFrame === 39) {
                //     icon.on("click", function (event) {
                //         var playerNumber = icons.indexOf(this);
                //         var length = icons.length;

                //         for (var i = 1; i < length; i++) {
                //             if (icons[i].currentFrame === 48 || icons[i].currentFrame === 39) {
                //                 icons[i].uncache();
                //                 icons[i].gotoAndStop(i <= playerNumber ? "player_male_white" : "plus");
                //                 self.tintSprite(icons[i], Colors.ARRAY[i]);
                //             }
                //         }
                //     });
                // }

                this.tintSprite(frame, Colors.DARK_TAN);
                this.tintSprite(icon, Colors.ARRAY[i]);
                frames.push(frame);
                icons.push(icon);

            }
        }

        function attachSprites() {
            this.transform.addChild(backButton);
            this.transform.addChild(nextButton);
            this.transform.addChild(backArrow);
            this.transform.addChild(nextArrow);
            this.transform.addChild(partySelectCard);
            frames.forEach(attach, this);
            icons.forEach(attach, this);
        }

        function createText() {
            instructions = TemplateParser.formatTextFromTemplate(templateID, "instructionsText", Colors.BLACK);
            instructions.text = "";
            for (var i = 1; i <= 6; i++) {
                var number = i.toString();
                if (i <= 4 && i != 2) {
                    instructions.text += (vocab["instructions" + instructionStatus + number] + "\n");
                }
                var text = null;
                var titleIndex = i - 1;
                text = TemplateParser.formatTextFromTemplate(templateID, "p" + number + "Title", Colors.ARRAY[titleIndex]);
                text.text = number.toString();
                titles[titleIndex] = text;
            }
            nextText = TemplateParser.formatTextFromTemplate(templateID, "nextText", Colors.PURPLE);
            nextText.text = Main.gameSession.playerData.isHost ? vocab.host : vocab.clickready;
            nextText.alpha = Main.gameSession.playerData.isHost ? DISABLED_ALPHA : 1;

            backText = TemplateParser.formatTextFromTemplate(templateID, "backText", Colors.PURPLE);
            titleText = TemplateParser.formatTextFromTemplate(templateID, "titleText", Colors.PURPLE);
            titleText.text = vocab.title;

            for (var i = 1; i <= numberOfPlayers; i++) {
                var text = TemplateParser.formatTextFromTemplate(templateID, "p" + i.toString() + "Type", Colors.GREY);
                text.y += 6;
                text.text = (icons[i - 1].currentFrame === 39) ? "Remote" : "Human";
                types.push(text);
            }
        }

        function attachText() {
            titles.forEach(attach, this);
            types.forEach(attach, this);
            this.transform.addChild(nextText);
            this.transform.addChild(backText);
            this.transform.addChild(instructions);
            this.transform.addChild(titleText);
            this.transform.addChild(gameNameText);
        }

        function attach(container) {
            this.transform.addChild(container);
        }

        function onReady(snap) {
            if (Main.gameSession.roomBlob.players.every(function (playerBlob) {
                return playerBlob.isActive === false || playerBlob.isReady === true;
            }) && Main.gameSession.playerData.isHost === true) {
                nextText.text = vocab.begin;
                nextButton.alpha = 1;
                nextText.alpha = 1;
                nextArrow.alpha = 1;
            } else if (Main.gameSession.playerData.isHost === true) {
                nextText.text = vocab.host;
                nextButton.alpha = DISABLED_ALPHA;
                nextText.alpha = DISABLED_ALPHA;
                nextArrow.alpha = DISABLED_ALPHA;
            }
        }
    }

    return WaitingScreen;
})();

// var WaitingScreen = (function () {
//     inherit(WaitingScreen, ScreenElement)
//     var nameInput = null;
//     var divWaiting = null
//     /** @type {HTMLButtonElement} */
//     var btnGotoGameScreen = null;
//     var group = []
//     var element = null
//     var groups = null; //ul html element

//     function WaitingScreen() {
//         ScreenElement.call(this);
//         var m_this = this;

//         initWaitingScreen();
//         element = new createjs.DOMElement(divWaiting)
//         element.x = 200;
//         element.y = 200;


//         this.transform.addChild(element);

//         var playersRef = Main.gameSession.roomRef.child("players");
//         playersRef.on("value", onPlayersFirstTime);



//         Main.ui.appendChild(divWaiting);

//         function initWaitingScreen() {
//             divWaiting = document.createElement("div")
//             nameInput = document.createElement("input")
//             nameInput.maxLength = 10;
//             nameInput.placeholder = "New Name"

//             var btnChangeName = document.createElement("button")
//             btnChangeName.innerText = "Name Change"
//             var attr = document.createAttribute("type");
//             attr.value = "button"
//             btnChangeName.attributes.setNamedItem(attr);


//             btnGotoGameScreen = document.createElement("button")
//             btnGotoGameScreen.innerText = "Play"
//             var attr = document.createAttribute("type");
//             attr.value = "button"
//             btnGotoGameScreen.attributes.setNamedItem(attr);

//             btnChangeName.addEventListener("click", function () {
//                 if (nameInput.value === "") {
//                     return;
//                 }
//                 Main.playSound("openToHumanv1");
//                 var nameRef = Main.gameSession.localPlayerRef.child("name");
//                 nameRef.set(nameInput.value);
//             });


//             btnGotoGameScreen.addEventListener("click", function () {
//                 // Host starts the game.
//                 Main.playSound("openToHumanv2")
//                 m_this.marco("onStartGameClicked");
//             });

//             divWaiting.appendChild(btnChangeName)
//             divWaiting.appendChild(nameInput)
//             divWaiting.appendChild(btnGotoGameScreen);
//             listingExistingPlayer();
//         }


//         function listingExistingPlayer() {
//             groups = document.createElement("ol")
//             groups.classList.add("groups")
//             var playersRef = Main.gameSession.roomRef.child("players");

//             playersRef.on("value", onPlayersUpdated);
//             divWaiting.appendChild(groups);
//         }


//         function onPlayersFirstTime(snap) {

//             var localIndex = Main.gameSession.playerData.index;
//             // TODO: 'create' button should not work for non-hosts
//             if (snap.val()[localIndex].isHost === true) {
//                 btnGotoGameScreen.disabled = false;
//             }
//             else {
//                 btnGotoGameScreen.disabled = true;
//             }
//         }

//         function onPlayersUpdated(snap) {

//             Object.keys(snap.val()).forEach(function (p) {

//                 /** @type {PlayerBlob} */
//                 var playerBlob = snap.val()[p];

//                 // if there isn't an entry in the list, add one.
//                 if (playerBlob.index >= groups.children.length) {
//                     var otherPlayerDisplay = document.createElement("li")
//                     otherPlayerDisplay.classList.add("nameDisplay")
//                     otherPlayerDisplay.innerText = snap.val()[p]["name"]
//                     groups.appendChild(otherPlayerDisplay)
//                 }

//                 if (playerBlob.isActive === false) {
//                     groups.children[p].innerText = "Empty"
//                 } else {
//                     groups.children[p].innerText = playerBlob.name;
//                 }
//             })
//         }





//         this.onRelease = function () {
//             Main.ui.removeChild(divWaiting);
//             this.transform.removeChild(element);
//             divWaiting = null;
//             element = null;

//             if (playersRef) {
//                 playersRef.off("value", onPlayersFirstTime);
//                 playersRef.off("value", onPlayersUpdated);
//             }
//             playersRef = null;
//         }

//     }

//     return WaitingScreen
// })()
var MathHelper = (function () { //jshint ignore:line
    "use strict";

    function MathHelper() { }

    MathHelper.randomInt = function (min, max) {
        if (min === undefined) {
            min = 0;
        }
        if (max === undefined) {
            max = 1;
        }
        min = Math.floor(min);
        max = Math.floor(max) + 1;
        return Math.floor(Math.random() * (max - min)) + min; //The maximum and minimum are inclusive.
    };


    MathHelper.randomRange = function (min, max) {
        if (min === undefined) {
            min = 0;
        }
        if (max === undefined) {
            max = 1;
        }
        return Math.random() * (max - min) + min; //The maximum and minimum are inclusive.
    };

    /**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
    MathHelper.shuffleArray2 = function (array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }


    /**
     * Randomize array element order in-place.
     * Using Fisher-Yates (aka Knuth) shuffle algorithm.
     */
    MathHelper.shuffleArray = function (array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        // return array;
    }

    MathHelper.formatNumber = function(num)
    {
        var snum = "";
        var digits = 0;
        var s = "";
        if(num < 0) {
            num *= -1;
            s += "-";
        }
        snum = Math.ceil(num).toString();
        digits = snum.length;
        
        for(var i = 0; i < snum.length; i++)
        {
            s += snum.charAt(i);
            if( (digits - i) % 3 == 1 && i != (digits - 1))
                s += translations[language]["numSeparator"];
        }
        return s;
    }

    return MathHelper;
}());
var Button = (function() {

    var m_element = null;
    var m_button = null;
    var ui = null;

    inherit(Button, CoreElement);

    function Button() {

        CoreElement.call(this);
        m_element = (function() {
            ui = document.getElementById("ui");
            m_button = document.createElement("button");
            m_button.className = "button";
            m_button.innerText = "I am a button";
            ui.appendChild(m_button);

            var element = new createjs.DOMElement(m_button);

           // element.htmlElement = m_button;

            element.x = Main.canvas.width - 50;
            element.y = Main.canvas.height - 50;

            return element;

        }).call(this)

        this._cleanup = function() {
            ui.removeChild(m_button);
            ui = null;
            m_element = null;
        }

        Object.defineProperties(this, {
            element: { get: function() { return m_element; } }
        });
    }

    return Button
})()