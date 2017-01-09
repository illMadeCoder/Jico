//jico.js A Web Based Game Engine
//jico depends on Pixi.js, and Howler.js to operate.
//By Jesse Bergerstock
//Started in November of 2016

/////////////////////////////////////////////////////////////
//Enumorate Color Codes
//Pico-8 Color Palette
Color = {};
Color[0] = Color.black = 0x000000;
Color[1] = Color.dark_blue = 0x1D2B53;
Color[2] = Color.dark_purple = 0x7E2553;
Color[3] = Color.dark_green = 0x008751;
Color[4] = Color.brown = 0xAB5236;
Color[5] = Color.dark_gray = 0x5F574F;
Color[6] = Color.light_gray = 0xC2C3C7;
Color[7] = Color.white = 0xFFF1E8;
Color[8] = Color.red = 0xFF004D;
Color[9] = Color.orange = 0xFFA300;
Color[10] = Color.yellow = 0xFFEC27;
Color[11] = Color.green = 0x00E436;
Color[12] = Color.blue = 0x29ADFF;
Color[13] = Color.indigo = 0x83769C;
Color[14] = Color.pink = 0xFF77A8;
Color[15] = Color.peach = 0xFFCCAA;

//Useful Functions
function min(_x,_y) {
  //Implementation
  if (_x < _y) {
    return _x;
  }
  else {
    return _y;
  }
}
function max(_x,_y) {
  //Implementation
  if (_x > _y) {
    return _x;
  }
  else {
    return _y;
  }
}
function inRange(_val,_min,_max) {
  //Implementation
  if (_val >= _min && _val <= _max) {
    return true;
  }
}
function clamp(_val,_min,_max) {
  //Implementation
  if (_val <= _min) {
    return _min
  } else if (_val >= _max) {
    return _max;
  } else {
    return _val;
  }
}
function degToRad(_val) {
  return (_val*(Math.PI/180));
}
function radToDeg(_val) {
  return (_val*(180/Math.PI));
}
function rectIntersect(_rectA,_rectB) {
  if (_rectA.x <= _rectB.x + _rectB.width &&
    _rectA.x + _rectA.width >= _rectB.x &&
    _rectA.y <= _rectB.y + _rectB.height &&
    _rectA.height + _rectA.y >= _rectB.y) {
      return true;
    } else {
      return false
    }
}
//Data Structures
function DoublyLinkedList() {
  /*
  A doubly linked list is necessary to achieve constant time
  inseration and removal of entities which exist on the
  game engine's entity list. This algorithmic effeciency
  will allow for a massive quantity of entities to be removed
  from the game without having to traverse the typical array
  with each iteration.

  This doubly linked list will hinder node control to who ever inserts
  the value on the list. This will allow for constant time removal by
  directly handing the node to be removed to the removal method instead of
  a value that will have to be located requiring n time traversal.
  */
  //Member Variables
  this.head = null;
  this.tail = null;
  this.count = 0;
  //Member Functions
  this.push = function(_data) {
    //Constant time insertion method, inserts at the end of the list.
    //Returns a node to be used for deletion.
    //Asserts
    if (_data === undefined) {
      throw new Error("Object Type DoublyLinkedList's function push given no arg _data", _data);
    }
    //Implementation
    var node = new Node(_data);
    if (this.count == 0) {
      //List is empty
      this.head = node;
      this.tail = node;
    }
    else {
      //List is populated, Insert at end
      this.tail.next = node;
      node.prev = this.tail;
      this.tail = node;
    }
    //Element count in list is increased by one
    this.count++;
    return node;
  }
  this.remove = function(node) {
    //Constant time removal method, requires the node in question to be removed instead of a value or index.
    //Asserts
    if (node.constructor !== Node)
      throw new Error("Bad node in DoublyLinkedList remove", node);
    //Implementation
    if (node == this.head && node == this.tail) {
      this.head = null;
      this.tail = null;
    }
    else if (node == this.head) {
      this.head = node.next;
    }
    else if (node == this.tail) {
      this.tail = node.prev;
    }
    else {
      node.prev.next = node.next;
      node.next.prev = node.prev;
    }
    //Give GC a break
    node.next = null;
    node.prev = null;
    node.data = null;
    this.count--;
  }
  this.contains = function(_node) {
    //Given a node, check to see if it exists in this linked list.
    //Return Bool
    //Asserts
    if (_node === undefined) {
      throw new Error("Object Type DoublyLinkedList's function contains given no arg _node", _node);
    }
    let node = this.head;
    while (node != null) {
      if (node == _node) return true;
      node = node.next;
    }
    return false;
  }
  this.map = function(funct) {
    //Given a function, apply that function to every value in list.
    //Asserts
    if (typeof funct != "function")
      throw new Error("Cannot map non function in DoublyLinkedList map");
    let node = this.head;
    while (node != null) {
      funct(node.data);
      node = node.next;
    }
  }
  function Node(_data) {
    //A node is the container that encapsulates values on the lsit.
    this.data = _data;
    this.prev = null;
    this.next = null;
  }
  return this;
}

function Vector2D(_x,_y) {
  /*
  A Vector2D is a datastructure which maintains exactly two elements, x and y.
  While a Vector2D can act as a container to any two elements, in the case of Jico.js
  the Vector2D will typically act as a representation of a position on the canvas as
  a cartesian plane.
  */
  //Asserts
  if (typeof _x !== "number") {
    throw new Error("Bad Vector2D arg _x, not number",_x);
  }
  if (typeof _y !== "number") {
    throw new Error("Bad Vector2D arg _y, not number",_y);
  }
  //Implementation
  //Member Variables
  this.x = _x;
  this.y = _y;
  //Member Functions
  this.magnitude = function() {
    return Math.sqrt(Math.pow(this.x,2) + Math.pow(this.y,2));
  }
  this.set = function(_x,_y) {
    if (typeof _x !== "number") {
      throw new Error("Bad Vector2D arg _x, not number",_x);
    }
    if (typeof _y !== "number") {
      throw new Error("Bad Vector2D arg _y, not number",_y);
    }
    this.x = _vector2D.x;
    this.y = _vector2D.y;
  }
  return this;
}

function Tuple(_x,_y) {
  //Asserts
  if (_x === undefined) {
    throw new Error("Bad Tuple arg x, not defined",_x);
  }
  if (_y === undefined) {
    throw new Error("Bad Tuple arg x, not defined",_y);
  }
  //Implementation
  //Member Variables
  this.x = _x;
  this.y = _y;
  return this;
}
//END DATA STRUCTURES

//BEGIN GAME ENGINE
var Game = (function () {
  /*
  The singleton object referenced by identifier Game contains
  properties that compose the minimal variables and logic to
  run the jico.js game engine.

  Game is responsible for handling Time, the game loop,
  the rendering stage and canvas, primative graphics,
  and the game's entity list.
  */
  //Implementation
  //Properties
  //Rendering
  this.renderer = PIXI.autoDetectRenderer(800,600,{backgroundColor : 0x000000}); //Canvas Renderer
  document.body.appendChild(this.renderer.view);
  this.stage = new PIXI.Container(); //Stage for canvas
  this.graphics = new PIXI.Graphics();
  this.temp_text = []; //Only meant for short text occurances
  this.stage.addChild(this.graphics);
  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
  //Entity List
  this.entityLinkedList = new DoublyLinkedList(); //Container for game entities.
  //Time
  this.deltaTimeMS = 0;
  this.totalTimeS = 0;
  this.lastTimeMS = Date.now();
  this.frameCounter = 0;

  this.clearTempText = function() {
    for (let i = 0; i < temp_text.length; i++) {
      temp_text[i].destroy();
      temp_text.splice(i,1);
    }
  }
  //Collision Cache
  this.collisionPool = [];
  this.initialized = false;
  //Private Methods
  this.SpatialHash = (function(Game) {
    this.cellSize = 100;
    this.cols = (Game.renderer.height / this.cellSize) + 1;
    this.rows = (Game.renderer.width / this.cellSize) + 1;
    this.grid = [];

    this.clear = function() {
      for (let i = 0; i <= this.cols; i++) {
        this.grid[i] = [];
        for (let j = 0; j <= this.rows; j++) {
          this.grid[i][j] = [];
        }
      }
    }
    this.resize = function() {
      this.cols = (Game.renderer.height / this.cellSize) + 1;
      this.rows = (Game.renderer.width / this.cellSize) + 1;
      this.clear();
    }
    this.addCollider = function(_collider) {
      let x = Math.floor((_collider.x+Game.stage.x)/this.cellSize);
      let y = Math.floor((_collider.y+Game.stage.y)/this.cellSize);
      let xEnd = Math.floor((_collider.x+_collider.width+Game.stage.x)/this.cellSize);
      let yEnd = Math.floor((_collider.y+_collider.height+Game.stage.y)/this.cellSize);
      for (let px = x; px <= xEnd; px++) {
        for (let py = y; py <= yEnd; py++) {
          if (px <= this.cols &&
              px >= 0 &&
              py <= this.rows &&
              py >= 0) {
                this.grid[px][py].push(_collider);
            }
        }
      }
    }
    this.getNear = function(_collider) {
      let ret = [];
      let x = Math.floor((_collider.x+Game.stage.x)/this.cellSize);
      let y = Math.floor((_collider.y+Game.stage.y)/this.cellSize);
      let xEnd = Math.floor((_collider.x+_collider.width+Game.stage.x)/this.cellSize);
      let yEnd = Math.floor((_collider.y+_collider.height+Game.stage.y)/this.cellSize);
      for (let px = x; px <= xEnd; px++) {
        for (let py = y; py <= yEnd; py++) {
          if (px <= this.cols &&
              px >= 0 &&
              py <= this.rows &&
              py >= 0) {
                for (let i = 0; i < this.grid[px][py].length; i++) {
                  if (this.grid[px][py][i] !== _collider) {
                    ret.push(this.grid[px][py][i]);
                  }
                }
            }
        }
      }
      return ret;
    }
    this.draw = function() {
      for (let i = 0; i <= this.cols; i++) {
        for (let j = 0; j <= this.rows; j++) {
          rect((i*this.cellSize)-Game.stage.x,(j*this.cellSize)-Game.stage.y,this.cellSize,this.cellSize,Color.green);
        }
      }
    };
    return this;
  })(this);
  this.collisionDetection = function() {
    //Clear Grid
    Game.SpatialHash.clear();
    //Populate Grid
    for (let i = 0; i < Game.collisionPool.length; i++) {
      Game.SpatialHash.addCollider(Game.collisionPool[i]);
    }
    //For each collision
    for (let i = 0; i < Game.collisionPool.length; i++) {
      let collA = Game.collisionPool[i];
      let near = Game.SpatialHash.getNear(collA);
      for (let j = 0; j < near.length; j++) {
        let collB = near[j];
        if (rectIntersect(collA,collB)) {
            let scripts = collA.component.entity.getComponents(Script);
            for (let i = 0; i < scripts.length; i++) {
              scripts[i].collision(collA,collB);
          }
        }
      }
    }
  }
  this.updateEntityPool = function() {
    let updateFunc = function(_entity) {
      //Asserts
      if (_entity.constructor !== Entity)
        throw new Error("Non Entity in Entity Pool", _entity);
      _entity.updateComponents()
    }
    this.entityLinkedList.map(updateFunc);
  }
  this.startGame = function() {
    if (!this.initialized) {
      game_init();
      this.initialized = true;
    }
    this.gameLoop();
  }
  this.gameLoop = function() {
    requestAnimationFrame(this.gameLoop);
    this.deltaTimeMS = Date.now() - this.lastTimeMS;
    this.totalTimeS += this.deltaTimeMS/1000;
    //Update Functions
    game_update(); //Call Scripting Environment's planned game_update function.
    this.collisionDetection();
    this.updateEntityPool();
    //Rendering Functions
    this.renderer.render(this.stage);
    //Evaluate Time After Frame
    this.frameCounter += 1;
    this.lastTimeMS = Date.now()
    this.graphics.clear()
    this.clearTempText();
  }.bind(this)

  this.loadingScreen = function() {
    if (this.Loader.isLoaded == false) {
      requestAnimationFrame(this.loadingScreen);
      this.deltaTimeMS = Date.now() - this.lastTimeMS;
      this.totalTimeS += this.deltaTimeMS/1000;
      if (typeof game_loading === "function") {
        game_loading();
      }
      this.frameCounter += 1;
      this.lastTimeMS = Date.now()
      this.renderer.render(this.stage);
      this.graphics.clear()
      this.clearTempText();
    }
    else {
      Game.startGame();
    }
  }.bind(this);
  //Public
  this.setWidth = function(_width) {
    this.renderer.width = _width;
    this.SpatialHash.resize();
  }
  this.getWidth = function() {
    return this.renderer.width;
  }
  this.setHeight = function(_height) {
    this.renderer.height = _height;
    this.SpatialHash.resize();
  }
  this.getHeight = function() {
    return this.renderer.height;
  }
  this.setBackground = function(_color) {
    //Set color of html canvas which holds game
    if (typeof _color !== "number")
      throw new Error("Bad canvasColorSet arg _color: ", _color);
    this.renderer.backgroundColor = _color;
  }.bind(this);
  this.getBackground = function() {
    //Get color of html canvas which holds game in its Color enum
    return this.renderer.backgroundColor;
  }.bind(this);

  //!LOADER
  this.Loader = (function() {
    this.isLoaded = false;
    this.spritesLoaded = false;
    this.animationsLoaded = false;
    this.audioSourceLoaded = false;
    this.loadIn = function() {
      if (this.spritesLoaded == true && this.animationsLoaded == true && this.audioSourceLoaded == true) {
        this.isLoaded = true;
      }
    }
    //Load AssetMap
    this.assetMap = null;
    this.loadJSON = function(err, data) {
      this.assetMap = data;
      this.loadSprites(this.assetMap);
      this.loadAnimations(this.assetMap);
      this.loadAudio(this.assetMap);
    }
    let url = "/asset_map.json";
    let callback = this.loadJSON;
    var xhr = new XMLHttpRequest();
    xhr.open("get", url, true);
    xhr.responseType = "json";
    xhr.onload = function() {
      var status = xhr.status;
      if (status == 200) {
        callback(null, xhr.response);
      } else {
        callback(status);
      }
    };
    xhr.send();

    //Load Sprites
    this.loadSprites = function(json) {
      this.spriteLoader = new PIXI.loaders.Loader();
      this.spriteArray = json.assets.Sprite;
      for (let i = 0; i < this.spriteArray.length; i++) {
        this.spriteLoader.add(this.spriteArray[i].ID,"Images/" + this.spriteArray[i].FilePath);
      }
      this.spriteLoader.load(function () {this.spritesLoaded = true; this.loadIn();});
    }

    this.SpriteByID = function(_assetID) {
      if (typeof _assetID !== "string") {
        throw new Error("Bad arg _assetID in Loader's SpriteByID");
      }
      return this.spriteLoader.resources[_assetID].texture;
    }
    //Load Animations
    this.loadAnimations = function(json) {
      this.animationLoader = new PIXI.loaders.Loader();
      this.animationArray = json.assets.Animation;
      for (let i = 0; i < this.animationArray.length; i++) {
        this.animationLoader.add(this.animationArray[i].ID,"Animations/" + this.animationArray[i].FilePath);
      }
      this.animationLoader.load(function () {this.animationsLoaded = true; this.loadIn();})
    }
    this.AnimationByID = function(_assetID) {
      if (typeof _assetID !== "string") {
        throw new Error("Bad arg _assetID in Loader's AnimationByID");
      }
      let ret = [];
      for (variable in this.animationLoader.resources[_assetID].textures) {
        ret.push(this.animationLoader.resources[_assetID].textures[variable]);
      }
      return ret;
    }
    //Load AudioSource
    this.loadAudio = function(json) {
      this.audioLoader = (function() {
        for (let i = 0; i < json.assets.Audio.length; i++) {
          this[json.assets.Audio[i].ID] = json.assets.Audio[i].FilePath;
        }
        return this;
      })();
    }
    this.audioSourceLoaded = true;
    this.loadIn();
    this.AudioByID = function(_assetID) {
      return ("Audio/" + audioLoader[_assetID]);
    }
    return this;
  })();
  return this;
})();
//END GAME ENGINE

//BEGIN ENTITY COMPONENT SYSTEM
function Entity(_ID,_positionVector2D,_components,_tags,_rotation) {
  /*
  An Entity is a container type for any atoms of the game; from the Titlescreen UI,
  to the player, to an audio manager. An Entity is mostly composed of its components
  which are generic types of content which are necessary to create the total game.
  Content such as: sprites, positions, audio, and physics. An Entity must have an
  ID to identify an object by a name during runtime to either locate it in memory
  or to determine the consequence of entity interactions. All entities must have
  the Position component which describes the entities global position in game space,
  all other components will utilize the entity's position to figure its own position
  for each frame. This property allows for the capability of grouping objects by a
  relative distance otherwise known as a local position. Entities also may have a list
  of 'properties' which is a means to keep track of an entity's relevant and unique members.
  Finally the tag list allows for a grouping of types such as the 'bullet' type. The convenience
  of tags is found in allowing for the use of polymorphism during entity interactions.

  Entity will return itself for the use of a script which called it.
  */
  //Defaults
  if (_components === undefined) {
    _components = [];
  }
  if (_tags === undefined) {
    _tags = [];
  }
  if (_rotation === undefined) {
    _rotation = 0;
  }
  //Asserts
  if (typeof _ID !== "string") {
    throw new Error("Bad Entity ID", _ID);
  }
  if (_positionVector2D.constructor !== Vector2D) {
    throw new Error("Bad Entity Position",_positionVector2D,_ID);
  }
  if (!Array.isArray(_tags)) {
    throw new Error();
  }
  if (typeof _rotation !== "number") {
    throw new Error();
  }
  //Handle common error case where _components are given as a component instead of a list of components
  if (!Array.isArray(_components)) {
    if (_components.component != undefined) {
      let temp = _components;
      _components = [temp];
    }
  }
  if (!Array.isArray(_components)) {
    throw new Error("Bad Entity Components", _ID);
  }
  //Implementation
  //Properties
  //Member Variables
  this.ID = _ID;
  this.position = new Position(_positionVector2D);
  this.tags = _tags;
  this.birthTime = Game.totalTimeS;
  this.components = []; //only set components via addComponent
  //Member Functions
  this.addComponent = function(_component) {
    //Method to a component, a component needs a reference to the entity it's associated with.
    //Asserts
    if (_component.component == undefined) {
      throw new Error("Bad Add Component", _component, "to entity,", this);
    }
    if (_component.constructor == Position) {
      throw new Error("Bad Add Component, cannot add multiple position components", this);
    }
    //Implementation
    _component.component.entity = this;
    _component.component.position = this.position;
    this.components.push(_component);
  }.bind(this);
  this.getComponent = function(_constructorType) {
    //Given a constructor type which is the function that constructs a component,
    //Return the first found component of the given constructor type.
    //Asserts
    if (typeof _constructorType != "function") {
      throw new Error("Bad constructor type in getComponent", _constructorType, this);
    }
    //Implementation
    let ret = null;
    for (i = 0; i < this.components.length; i++) {
      if (_constructorType === this.components[i].constructor) {
        ret = this.components[i];
        break;
      }
    }
    return ret;
  }.bind(this);
  this.getComponents = function(_constructorType) {
    //Like getComponent, except returns all components of a constructor type in a list.
    //Asserts
    if (typeof _constructorType != "function")
      throw new Error("Bad constructor type in getComponents", _constructorType, this);
    //Implementation
    var ret = []
    for (i = 0; i < this.components.length; i++) {
      if (this.components[i].constructor === _constructorType)
          ret.push(this.components[i]);
    }
    return ret;
  }.bind(this);
  this.updateComponents = function() {
    //For each component associated with this entity, call on that components apply function.
    //Meant to be used each frame.
    for (i=0; i < this.components.length; i++) {
      if (this.components[i].component.initialized == false) {
        this.components[i].component.init();
        this.components[i].component.initialized = true;
      }
      this.components[i].component.update();
    }
  }.bind(this);
  this.getTimeAlive = function() {
    //Return the quantity of time in which this entity has been initialized in seconds.
    return (Game.totalTimeS - this.birthTime);
  }
  this.stage = function() {
    //Place this object in the entity list,
    //this will mean that all of the entity's component's apply functions will be called each frame.
    this.node = Game.entityLinkedList.push(this);
  }.bind(this);
  this.compareTag = function(_tag) {
    //Given a tag, see if this entity contains that tag.
    //Asserts
    if (typeof _tag != "string") {
      throw new Error("Bad Tag in Compare Tag", _tag, this);
    }
    for (i = 0; i < this.tag.length; i++) {
      if (entity.tags[i] == _tag) return true;
    }
    return false;
  }.bind(this);
  //Stage this entity into gamespace
  this.node = Game.entityLinkedList.push(this);
  //Handle given components now that the appropriate methods are defined.
  _components.map(this.addComponent);
  return this;
}
//Abstract Type Component
function Component(_init,_update,_destroy) {
  /*
  The Component type is a set of functions which allows for
  a generic interface with each component. In particular,
  a component must update each frame, and a component must
  be able to destroy itself.

  Furthermore the component acts as a cashe of relevent
  references for any components to use such as a reference
  to its associated entity and position.
  */
  //Defaults
  if (_init === undefined) {
    _init = function() {};
  }
  if (_update === undefined) {
    _update = function() {};
  }
  if (_destroy === undefined) {
    _destroy = function () {};
  }
  //Asserts
  if (typeof _init !== "function") {
    throw new Error("Bad component init function", _init);
  }
  if (typeof _update !== "function") {
    throw new Error("Bad component update function", _update);
  }
  if (typeof _destroy !== "function") {
    throw new Error("Bad component destroy function", _destroy);
  }
  //Implementation
  this.entity = null; //Will be assigned during entity construction.
  this.position = null; //Will be assigned during entity construction.
  this.initialized = false;
  //Interface
  this.init = _init;
  this.update = _update;
  this.destroy = _destroy;
  return this;
}
//Implements Component Object
function Position(_vector2D,_r) {
  /*
  The Position type is defined as an entity component
  which provides a container for the global position of
  an entity on canvas space. All other position based components
  will utilize an entity's Position component to have a frame of reference

  The Position component is special in that there can only exist a single Position
  object per entity, and an entity must maintain one Position object.
  */
  //Defaults
  if (_vector2D === undefined) {
    _vector2D = new Vector2D(0,0);
  }
  if (_r === undefined) {
    _r = 0;
  }
  //Asserts
  if (_vector2D.constructor !== Vector2D) {
    throw new Error("Bad arguement _vector2D in Position", _vector2D);
  }
  if (typeof _r !== "number") {
    throw new Error("Bad arguement _r in Position", _r);
  }
  //Implementation
  //Member Variables
  this.vector2D = _vector2D;
  this.rotation = _r;
  //Member Functions
  this.setX = function(_x) {
    this.vector2D.x = _x;
  }
  this.getX = function() {
    return this.vector2D.x;
  }
  this.setY = function(_y) {
    this.vector2D.y = _y;
  }
  this.getY = function() {
    return this.vector2D.y;
  }
  this.setRotation = function(_r) {
    this.rotation = _r;
  }
  this.getRotation = function() {
    return this.rotation;
  }
  this.component = new Component();
}
//Implements Component Object
function Script(_functionsObject) {
  /*
  The Script Component describes an entity's behaviour within a game. Where
  other components act as data containers with a set of methods to interface,
  the Script Component is a way to interact with an entity's components by providing
  a function that will be called with each frame. Multiple scripts may exist on
  an entity, but there is no current guarantee of their execution order.

  A Script is composed of two functions that should be called at appropriate times,
  the init function that is meant to be called when an object is initialized, and
  an update function which is meant to be called every frame after the intialization.
  */
  //Parse Functions Object
  let _updateFunc = _functionsObject.update;
  let _initFunc = _functionsObject.init;
  let _destroyFunc = _functionsObject.destroy;
  let _onCollisionFunc = _functionsObject.onCollision;

  //Defaults
  if (_initFunc === undefined) {
    _initFunc = function() {};
  }
  if (_updateFunc === undefined) {
    _updateFunc = function() {};
  }
  if (_destroyFunc == undefined) {
    _destroyFunc = function(){};
  }
  if (_onCollisionFunc == undefined) {
    _onCollisionFunc = function(){};
  }
  //Asserts
  if (typeof _initFunc != "function") {
    throw new Error("_initFunc of Script Component is not function", _initFunc);
  }
  if (typeof _updateFunc !== "function") {
    throw new Error("Acceptable _updateFunc required for script component", _updateFunc);
  }
  if (typeof _destroyFunc !== "function") {
    throw new Error("_destroyFunc of Script Component is not function", _destroyFunc);
  }
  if (typeof _onCollisionFunc !== "function") {
    throw new Error("_onCollisionFunc of Script Component is not function", _onCollisionFunc);
  }
  //Implementation
  this.init = _initFunc;
  this.update = _updateFunc;
  this.destroy = _destroyFunc;
  this.collision = _onCollisionFunc;
  this.initialized = false;

  this.component = new Component(
    function() {},
    function() {
      if (!this.initialized) {
        this.init(this.component.entity);
        this.initialized = true;
      }
      this.update(this.component.entity);
    }.bind(this),
    function () {
      this.destroy(this.component.entity);
      this.init = null;
      this.update = null;
      this.destroy = null;
    }.bind(this)
  );
  return this;
}
//Implements Component Object
function Text(_str,_style,_offsetVector2D,_offsetRotation) {
  /*
  The Text Component utilizes PIXI's Text type to create
  persistent text object to display a string as a graphic on the canvas.

  The Text Component requires a string to display, a color, a vector to offset its position,
  and a font.

  Variable Setter Getters
  alpha : number : opacity of the text
  anchor : number : axis of rotation by percentage
  height : number : height of the text
  pivot : number : axis of rotation by pixel
  rotation : number : sets rotation of text
  width : number : sets the width of the text
  style : object : style of object defined by pixi

  Style includes
  Style parameters use pixi.js
  http://pixijs.download/release/docs/PIXI.TextStyle.html
  */
  //Defaults
  if (_str === undefined) {
    _str = "";
  }
  if (_style === undefined) {
    _style = {};
  }
  if (_offsetVector2D === undefined) {
    _offsetVector2D = new Vector2D(0,0);
  }
  if (_offsetRotation === undefined) {
    _offsetRotation = 0;
  }
  //Asserts
  if (typeof _str !== "string") {
    throw new Error("Bad arg string _str in Text Component", _str);
  }
  if (typeof _style !== "object") {
    throw new Error("Bad arg _style in Text Component", _style);
  }
  if (_offsetVector2D.constructor !== Vector2D) {
    throw new Error("Bad arg _offsetVector2D in Text Component", _offsetVector2D);
  }
  if (typeof _offsetRotation !== "number") {
    throw new Error("Bad arg _offsetRotation in Text Component", _offsetRotation);
  }
  //Implementation
  //Member Variables
  this.style = _style;
  this.text = new PIXI.Text(this.str, this.style);
  this.offsetVector2D = _offsetVector2D;
  this.offsetRotation = _offsetRotation;
  this.canRotate = true;
  //Member Functions
  this.setText = function(_str) {
    if (typeof _str !== "string") {
      throw new Error("Bad string _font in Text Component", _str, this.component.entity);
    }
    this.text = _str;
  }
  this.getText = function() {
    return this.str;
  }
  this.clear = function() {
    this.text = "";
  }
  this.setAnchor = function(_aX, _aY) {
    this.text.anchor.x = _aX;
    this.text.anchor.y = _aY;
  }
  this.getAnchor = function() {
    return this.text.anchor;
  }
  this.setAlpha = function(_a) {
    this.text.alpha = _a;
  }
  this.getAlpha = function() {
    return this.text.alpha;
  }
  this.setPivot = function(_pX, _pY) {
    this.text.pivot.x = _pX;
    this.text.pivot.y = _pY;
  }
  this.getPivot = function() {
    return this.text.pivot;
  }
  this.setWidth = function(_w) {
    if (typeof _w != "number" || _w <= 0) {
      throw new Error("Bad width _w for Text Component setWidth", _w, this.component.entity);
    }
    this.text.width = _w;
  }
  this.getWidth = function() {
    return this.text.width;
  }
  this.setHeight = function(_h) {
    if (typeof _h != "number" || _h <= 0) {
      throw new Error("Bad width _h for Text Component setWidth", _h, this.component.entity);
    }
    this.text.height = _h;
  }
  this.getHeight = function() {
    return this.text.height;
  }
  this.setStyle = function(_style) {
    if (typeof _style !== "object") {
      throw new Error("Bad arg _style in Text setStyle", _style);
    }
    this.text.setStyle(_style);
  }
  this.getStyle = function() {
    return this.text.style;
  }
  this.setOffsetRotation = function(_r) {
    if (typeof _r != "number") {
      throw new Error("Bad arg _r for Text Component setOffsetRotation", _r, this.component.entity);
    }
    this.text.rotation = _r;
  }
  this.getOffsetRotation = function() {
    return this.text.rotation;
  }
  this.setOffsetVector2D = function(_offsetVector2D) {
    if (_offsetVector2D.constructor !== Vector2D) {
      throw new Error("Bad arg _offsetVector2D in Text setOffsetVector2D", _offsetVector2D, this.component.entity);
    }
    this.offsetVector2D = _offsetVector2D;
  }
  this.getOffsetVector2D = function() {
    return this.offsetVector2D;
  }

  this.component = new Component(
    function () {
      Game.stage.addChild(this.text)
    }.bind(this),
    function() {
      this.text.x = this.component.position.vector2D.x + this.offsetVector2D.x;
      this.text.y = this.component.position.vector2D.y + this.offsetVector2D.y;
      if (this.canRotate) {
        this.text.rotation = this.component.position.rotation + this.offsetRotation;
      }
    }.bind(this),
    function() {
      this.text.destroy();
    }.bind(this)
  )
  return this;
}
//Implements Component Object
function SpriteRenderer(_asset,_scale,_offsetVector2D,_offsetRotation) {
  /*
  The SpriteRenderer is defined as an entity component which encapsulates
  the PIXI.js library to provide behaviour associated with graphical sprites
  such as: sprite scale control, sprite display, and the sprite's local position.
  */
  //Defaults
  if (_scale === undefined) {
    _scale = 1;
  }
  if (_offsetVector2D === undefined) {
    _offsetVector2D = new Vector2D(0,0);
  }
  if (_offsetRotation === undefined) {
    _offsetRotation = 0;
  }
  //Asserts
  if (typeof _asset !== "string") {
    throw new Error("Bad _asset in SpriteRenderer", _asset);
  }
  if (typeof _scale !== "number") {
    throw new Error("Bad _scale in SpriteRenderer", _scale);
  }
  if (_offsetVector2D.constructor !== Vector2D) {
    throw new Error("Bad _offsetVector2D in SpriteRenderer", _offsetVector2D);
  }
  if (typeof _offsetRotation !== "number") {
    throw new Error("Bad _offsetRotation in SpriteRenderer", _offsetRotation);
  }
  //Implementation
  this.sprite = new PIXI.Sprite.from(Game.Loader.SpriteByID(_asset));
  this.sprite.scale.x = _scale;
  this.sprite.scale.y = _scale;
  this.offsetVector2D = _offsetVector2D;
  this.offsetRotation = _offsetRotation;
  this.sprite.baseTexture = new PIXI.BaseTexture(this.sprite, PIXI.SCALE_MODES.NEAREST, 1);
  //Member Functions
  //Function which positions pixi sprite type equal to the objects position plus the relative offset
  this.setAnchor = function(_a) {
    this.sprite.anchor = _a;
  }
  this.getAnchor = function() {
    return this.sprite.anchor;
  }
  this.setScale = function(_sX, _sY) {
    this.sprite.scale.x = _sX;
    this.sprite.scale.y = _sY;
  }
  this.getScale = function() {
    return this.sprite.scale;
  }
  this.setPivot = function(_sX, _sY) {
    this.sprite.pivot.x = _sX;
    this.sprite.pivot.y = _sY;
  }
  this.getPivot = function() {
    return this.sprite.pivot;
  }
  this.setAxis = function(_axis) {
    if (typeof _axis !== "string") {
      throw new Error("Bad arg _axis in SpriteRenderer function setPivot, must be string", _axis, this.component.entity);
    }
    if (_axis === "center") {
      this.sprite.anchor.x = .5;
      this.sprite.anchor.y = .5;
    } else if (_axis == "top left") {
      this.sprite.anchor.x = 0;
      this.sprite.anchor.y = 0;
    } else if (_axis == "top") {
      this.sprite.anchor.x = .5;
      this.sprite.anchor.y = 0;
    } else if (_axis == "top right") {
      this.sprite.anchor.x = 1;
      this.sprite.anchor.y = 0;
    } else if (_axis == "right") {
      this.sprite.anchor.x = 1;
      this.sprite.anchor.y = .5;
    } else if (_axis == "bottom right") {
      this.sprite.anchor.x = 1;
      this.sprite.anchor.y = 1;
    } else if (_axis == "bottom") {
      this.sprite.anchor.x = .5;
      this.sprite.anchor.y = 1;
    } else if (_axis == "bottom left") {
      this.sprite.anchor.x = 0;
      this.sprite.anchor.y = 1;
    } else if (_axis == "left") {
      this.sprite.anchor.x = 0;
      this.sprite.anchor.y = .5;
    } else {
      throw new Error("Bad axis _axis in SpriteRenderer setAxis, needs string", _axis, this.component.entity)
    }
  }
  this.getWidth = function() {
    return this.sprite.width;
  }
  this.getHeight = function() {
    return this.sprite.height;
  }
  this.setVisible = function(_bool) {
    if (typeof _bool !== "boolean") {
      throw new Error("Bad boolean arg _bool in SpriteRenderer setVisible", _bool, this.component.entity);
    }
    this.sprite.visible = _bool;
  }
  this.getVisible = function() {
    return this.sprite.visible;
  }
  this.setSprite = function(_asset) {
    this.sprite.texture = Game.Loader.SpriteByID(_asset);
  }
  this.getSprite = function() {
    return this.sprite.texture;
  }

  this.component = new Component(
    function() {
      Game.stage.addChild(this.sprite);
    }.bind(this),
    function() {
      this.sprite.position.x = this.component.position.vector2D.x + this.offsetVector2D.x;
      this.sprite.position.y = this.component.position.vector2D.y + this.offsetVector2D.y;
      this.sprite.rotation = this.component.position.rotation;
    }.bind(this),
    function() {
      this.sprite.destroy();
    }.bind(this)
    );
  return this;
}

function Animator(_assetID,_scale,_offsetVector2D,_offsetRotation) {
  /*
  The Animator is defined as an entity component which encapsulates the
  PIXI.js library to provide behaviour associated with graphical sprite animations.
  An animations is defined as a data structure in jico which maintains two
  properties, a name and an array of image files which will be played in sequence.
  The animator then hold an array of animations and can switch between them by
  using their name as a locator.
  */
  //Fix single animation to array of single animation
  //Defaults
  if (_scale === undefined) {
    _scale = 1;
  }
  if (_offsetVector2D === undefined) {
    _offsetVector2D = new Vector2D(0,0);
  }
  if (_offsetRotation === undefined) {
    _offsetRotation = 0;
  }
  //Asserts
  if (typeof _scale !== "number") {
    throw new Error("Bad _scale in Animator", _scale);
  }
  if (_offsetVector2D.constructor !== Vector2D) {
    throw new Error("Bad _offsetVector2D in Animator", _offsetVector2D);
  }
  if (typeof _offsetRotation !== "number") {
    throw new Error();
  }
  //Member Variables
  this.animation = new PIXI.extras.AnimatedSprite(Game.Loader.AnimationByID(_assetID));
  this.offsetVector2D = _offsetVector2D;
  this.offsetRotation = _offsetRotation;
  //Member Functions
  this.setAnimationSpeed = function(_speed) {
    this.animation.animtionSpeed = _speed;
  }
  this.getAnimationSpeed = function() {
    return this.animation.animationSpeed;
  }
  this.setAnimation = function(_assetID) {
    this.animation.destroy();
    this.animation = new PIXI.extras.AnimatedSprite(Game.Loader.AnimationByID(_assetID));
  }
  this.getAnimation = function() {
    return this.animation;
  }
  this.setRotation = function(_r) {
    this.offsetRotation = _r;
  }
  this.getRotation = function() {
    return this.offsetRotation;
  }

  this.component = new Component(
    function() {
      Game.stage.addChild(this.animation);
      this.animation.play();
    }.bind(this),
    function() {
      this.animation.x = this.component.position.vector2D.x + this.offsetVector2D.x;
      this.animation.y = this.component.position.vector2D.y + this.offsetVector2D.y;
      this.animation.rotation = this.component.position.rotation + this.offsetRotation;
    }.bind(this),
    function() {}
  );
  return this;
}
//Implements Component Object
function AudioPlayer(_audioFileName,_options) {
  /*
  The AudioPlayer type is defined as an entity component which
  encapsulates the howler.js library to provides common behaviour
  associated with audio such as: play, pause, stop, volume control,
  loop control, and mute control.

  The AudioPlayer requires a valid filename for an audio file located in the Audio folder.
  --Options
  https://github.com/goldfire/howler.js#documentation
  */
  //Defaults
  if (_options === undefined) {
    _options = {};
  }
  //Asserts
  if (typeof _audioFileName !== "string") {
    throw new Error("Bad arg _audioFileName in construction of AudioPlayer component", _audioFileName);
  }
  if (typeof _options !== "object") {
    throw new Error();
  }
  //Implementation
  //Member Variables
  _options.src = Game.Loader.AudioByID(_audioFileName);
  this.sound = new Howl(_options);
  //Member Functions
  this.play = function() {
    this.sound.play();
  }
  this.stop = function() {
    this.sound.stop();
  }
  this.pause = function() {
    this.sound.pause();
  }
  this.setLooping = function(_bool) {
    if (typeof _bool !== "boolean") {
      throw new Error("Bad boolean arg _bool in AudioPlayer setLooping", _bool, this.component.entity);
    }
    this.sound.loop(_bool);
  }
  this.getLooping = function() {
    return this.sound.loop();
  }
  this.setMute = function(_bool) {
    if (typeof _bool !== "boolean") {
      throw new Error("Bad boolean arg _bool in AudioPlayer setMute", _bool, this.component.entity);
    }
    this.sound.mute(_bool);
  }
  this.getMute = function() {
    return this.sound.mute();
  }
  this.setVolume = function(_newVolume) {
    if (typeof _newVolume !== "number") {
      throw new Error("Bad number new volume arg _newVolume in AudioPlayer setVolume", _newVolume, this.component.entity);
    }
    this.sound.volume(_newVolume);
  }
  this.getVolume = function() {
    return this.sound.volume();
  }
  this.isPlaying = function() {
    return this.sound.playing();
  }
  this.getDuration = function() {
    return this.sound.duration();
  }
  this.setRate = function(_r) {
    this.sound.rate(_r);
  }
  this.getRate = function() {
    return this.sound.rate();
  }
  this.duration = function() {
    return this.duration();
  }
  this.component = new Component(
  function() {},
  function() {},
  function() {
    this.sound.stop();
    this.sound.unload();
  }.bind(this)
  );
}
//Implements Component Object
function RectCollider(_width,_height,_offsetVector2D) {
  //Defaults
  if (_offsetVector2D === undefined) {
    _offsetVector2D = new Vector2D(0,0);
  }
  //Asserts
  if (_offsetVector2D.constructor !== Vector2D) {
    throw new Error();
  }
  //Implementation
  this.x = 0;
  this.y = 0;
  this.width = _width;
  this.height = _height;
  this.offsetVector2D = _offsetVector2D;
  this.top = function() {return this.y;};
  this.bot = function() {return this.y+this.height;},
  this.left = function() {return this.x;},
  this.right = function() {return this.x+this.width;}
  this.draw = false;
  this.component = new Component(
    function() {
      Game.collisionPool.push(this)
    }.bind(this),
    function() {
      this.x = this.component.entity.position.vector2D.x + this.offsetVector2D.x;
      this.y = this.component.entity.position.vector2D.y + this.offsetVector2D.y;
      if (this.draw) {
        rect(this.x,this.y,this.width,this.height,Color.green);
      }
    }.bind(this),
    function() {}
  );
  return this;
}
//END ENTITY COMPONENT SYSTEM

//BEGIN INPUT
var btn_array = Array(6).fill(0);
function btn(_i,_frame) {
/*
Get whether a given key.keyCode is down, where
	0 < i < 6, where
  0 = ‘z’
  1 = ‘x’
  2 = left arrow key
  3 = right arrow key
  4 = up arrow key
  5 = down arrow key
*/
  //Defaults
  if (_frame === undefined) {
    _frame = 1;
  }
  //Implementation
  if (_i == "z") _i = 0;
  if (_i == "x") _i = 1;
  if (_i == "left" || _i == "l") _i = 2;
  if (_i == "right" || _i == "r") _i = 3;
  if (_i == "up" || _i == "u") _i = 4;
  if (_i == "down" || _i == "d") _i = 5;
  if (_i >= 0 && _i < 6) {
    if (btn_array[_i] >= _frame) return true;
    return false;
  }
  else throw new Error("Bad btn input", _i);
}
document.addEventListener("keydown",function(key) {
  //Catches Keydown Input from user.
    if (key.keyCode == 90) btn_array[0] += 1;
    if (key.keyCode == 88) btn_array[1] += 1;
    if (key.keyCode == 37) btn_array[2] += 1;
    if (key.keyCode == 39) btn_array[3] += 1;
    if (key.keyCode == 38) btn_array[4] += 1;
    if (key.keyCode == 40) btn_array[5] += 1;
  }
);
document.addEventListener("keyup",function(key) {
  //Catches Keyup Input from user.
    if (key.keyCode == 90) btn_array[0] = 0;
    if (key.keyCode == 88) btn_array[1] = 0;
    if (key.keyCode == 37) btn_array[2] = 0;
    if (key.keyCode == 39) btn_array[3] = 0;
    if (key.keyCode == 38) btn_array[4] = 0;
    if (key.keyCode == 40) btn_array[5] = 0;
  }
);
//BEGIN TIME API
function deltaTime() {
  //Get Time Between The Previous Frame and Current Frame in Seconds
  return Game.deltaTimeMS/1000;
}
function totalTime() {
  //Get Total Time Over Game Engine's LifeTime
  return Game.totalTimeS;
}
//BEGIN GRAPHICS API
function rect(x,y,width,height,color) {
  Game.graphics.lineStyle(2,color);
  Game.graphics.drawRect(x,y,width,height);
}
function rectFill(x,y,width,height,color) {
  Game.graphics.lineStyle(0);
  Game.graphics.beginFill(color);
  Game.graphics.drawRect(x,y,width,height);
  Game.graphics.endFill();
}
function circ(x,y,r,color) {
  Game.graphics.lineStyle(2, color);
  Game.graphics.drawCircle(x,y,r);
}
function circFill(x,y,r,color) {
  Game.graphics.lineStyle(0);
  Game.graphics.beginFill(color);
  Game.graphics.drawCircle(x,y,r);
  Game.graphics.endFill();
}
function line(x0,y0,x1,y1,color) {
  Game.graphics.lineStyle(2,color);
  Game.graphics.moveTo(x0,y0);
  Game.graphics.lineTo(x1,y1);
}
function camera(x,y) {
  Game.stage.position.x = -x;
  Game.stage.position.y = -y;
}
function pset(x,y,color) {
  Game.graphics.lineStyle(2,color);
  Game.graphics.moveTo(x-1,y-1);
  Game.graphics.lineTo(x+1,y+1);
}
function txt(_str,_style,_x,_y) {
  let tmp_text = new PIXI.Text(_str,_style)
  tmp_text.x = _x;
  tmp_text.y = _y;
  Game.temp_text.push(tmp_text);
  Game.stage.addChild(tmp_text);
  return tmp_text;
}
