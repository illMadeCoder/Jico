//jico.js A Web Based Game Engine
//jico depends on Pixi.js, and Howler.js to operate.
//By Jesse Bergerstock
//November 2016

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
    throw new Error("Bad Vector2D arg x, not number",_x);
  }
  if (typeof _y !== "number") {
    throw new Error("Bad Vector2D arg x, not number",_y);
  }
  //Implementation
  //Member Variables
  this.x = _x;
  this.y = _y;
  //Member Functions
  this.magnitude = function () {
    return Math.sqrt(Math.pow(this.x,2) + Math.pow(this.y,2));
  }
  this.set = function (_vector2D) {
    this.x = _vector2D.x;
    this.y = _vector2D.y;
  }
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
  this.backgroundColor = Color.black; //Default canvas color
  this.width = 800;
  this.height = 600;
  this.renderer = PIXI.autoDetectRenderer(this.width,this.height,{backgroundColor : this.backgroundColor}); //Canvas Renderer
  this.stage = new PIXI.Container(); //Stage for canvas
  document.body.appendChild(this.renderer.view);
  this.graphics = new PIXI.Graphics();
  this.stage.addChild(this.graphics);
  //Entity List
  this.entityLinkedList = new DoublyLinkedList(); //Container for game entities.
  //Time
  this.deltaTimeMS = 0;
  this.totalTimeS = 0;
  this.lastTimeMS = Date.now();
  this.frameCounter = 0;
  //Private Methods
  this.updateEntityPool = function() {
    let updateFunc = function(_entity) {
      //Asserts
      if (_entity.constructor !== Entity)
        throw new Error("Non Entity in Entity Pool", _entity);
      _entity.updateComponents()
    }
    this.entityLinkedList.map(updateFunc);
  }
  this.gameLoop = function() {
    requestAnimationFrame(this.gameLoop);
    this.deltaTimeMS = Date.now() - this.lastTimeMS;
    this.totalTimeS += this.deltaTimeMS/1000;
    //Update Functions
    game_update(); //Call Scripting Environment's planned game_update function.
    this.updateEntityPool();
    //Rendering Functions
    this.renderer.render(this.stage);
    //Evaluate Time After Frame
    this.frameCounter += 1;
    this.lastTimeMS = Date.now()
    this.graphics.clear()
  }.bind(this)
  return this;
})();
//END GAME ENGINE

//BEGIN ENTITY COMPONENT SYSTEM
function Entity(_ID,_positionVector2D,_components,_properties,_tag) {
  /*
  An Entity is a container type for any atoms of the game; from the Titlescreen UI,
  to the player, to a music manager. An Entity is mostly composed of its components
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
  //Closure
  var entity = this;
  //Defaults
  if (_components === undefined)
    _components = [];
  if (_tag === undefined)
    _tag = [];
  if (_properties === undefined)
    _properties = {};
  //Asserts
  if (typeof _ID !== "string")
    throw new Error("Bad Entity ID", _ID);
  if (_positionVector2D.constructor !== Vector2D)
    throw new Error("Bad Entity Position",_positionVector2D,_ID);
  //Handle common error case where _components are given as a component instead of a list of components
  if (!Array.isArray(_components)) {
    if (_components.component != undefined) {
      let temp = _components;
      _components = [temp];
    }
  }
  if (!Array.isArray(_components))
    throw new Error("Bad Entity Components", _ID);
  //Implementation
  //Properties
  //Member Variables
  this.ID = _ID;
  this.position = new Position(_positionVector2D);
  this.tag = _tag;
  this.properties = _properties;
  this.birthTime = Game.totalTimeS;
  this.components = []; //only set components via addComponent
  //Member Functions
  this.addComponent = function(_component) {
    //Method to a component, a component needs a reference to the entity it's associated with.
    //Asserts
    if (_component.component == undefined)
      throw new Error("Bad Add Component", _component, "to entity,", entity);
    if (_component.constructor == Position)
      throw new Error("Bad Add Component, cannot add multiple position components", entity);
    //Implementation
    _component.component.entity = entity;
    _component.component.position = entity.position;
    entity.components.push(_component);
  }
  this.getComponent = function(_constructorType) {
    //Given a constructor type which is the function that constructs a component,
    //Return the first found component of the given constructor type.
    //Asserts
    if (_constructorType === undefined || typeof _constructorType != "function")
      throw new Error("Bad constructor type in getComponent", _constructorType, entity);
    //Implementation
    ret = null;
    for (i = 0; i < entity.components.length; i++) {
      if (_constructorType === entity.components[i].constructor) {
        ret = entity.components[i];
        break;
      }
    }
    return ret;
  }
  this.getComponents = function(_constructorType) {
    //Like getComponent, except returns all components of a constructor type in a list.
    //Asserts
    if (_constructorType === undefined || typeof _constructorType != "function")
      throw new Error("Bad constructor type in getComponents", _constructorType, entity);
    //Implementation
    var ret = []
    for (i = 0; i < entity.components.length; i++) {
      if (entity.components[i].constructor === _constructorType)
          ret.push(entity.components[i]);
    }
    return ret;
  }
  this.updateComponents = function() {
    //For each component associated with this entity, call on that components apply function.
    //Meant to be used each frame.
    for (i=0; i < entity.components.length; i++) {
      entity.components[i].component.update();
    }
  }
  this.getTimeAlive = function() {
    //Return the quantity of time in which this entity has been initialized in seconds.
    return (Game.totalTimeS - this.birthTime);
  }
  this.stage = function() {
    //Place this object in the entity list,
    //this will mean that all of the entity's component's apply functions will be called each frame.
    if (this.isStaged(this.node) == true)
      console.error("Entity already staged", entity);
    else
      this.node = Game.entityLinkedList.push(entity);
  }
  this.unStage = function() {
    //Remove this object from the entity list,
    //This function will leave the entity in tact so it can be used for future purposes.
    if (this.isStaged(this.node) == false)
      console.error("Entity already unstaged", entity);
    Game.entityLinkedList.remove(this.node);
    this.node = null;
  }
  this.isStaged = function() {
    //Check to see if a entity has been staged.
    Game.entityLinkedList.contains(this.node);
  }
  this.compareTag = function(_tag) {
    //Given a tag, see if this entity contains that tag.
    //Asserts
    if (typeof _tag != "string")
      throw new Error("Bad Tag in Compare Tag", _tag, entity);
    for (i = 0; i < entity.tag.length; i++)
      if (entity.tag[i] == _tag) return true;
    return false;
  }
  this.destroy = function() {
    //Remove this object and each of its components from memory.
    for (i = 0; i<entity.components.length; i++) {
      entity.components[i].component.delete();
    }
    this.unStage();
  }
  //Stage this entity into gamespace
  this.node = Game.entityLinkedList.push(entity);
  //Handle given components now that the appropriate methods are defined.
  _components.map(this.addComponent);
  return this;
}
//Abstract Type Component
function Component(_update,_unStage,_destroy) {
  /*
  The Component type is a set of functions which allows for
  a generic interface with each component. In particular,
  a component must update each frame, a component must be able
  to unstage, and a component must be able to destroy itself.

  Furthermore the component acts as a cashe of relevent
  references for any components to use such as a reference
  to its associated entity and position.
  */
  //Defaults
  if (_update === undefined) {
    _update = function() {};
  }
  if (_unStage === undefined) {
    _unStage = function () {};
  }
  if (_destroy === undefined) {
    _destroy = function () {};
  }
  //Asserts
  if (typeof _update !== "function") {
    throw new Error("Bad component update function", _update);
  }
  if (typeof _unStage !== "function") {
    throw new Error("Bad component unstage function", _unStage);
  }
  if (typeof _destroy !== "function") {
    throw new Error("Bad component destroy function", _destroy);
  }
  //Implementation
  this.entity = null; //Will be assigned during entity construction.
  this.position = null; //Will be assigned during entity construction.
  //Interface
  this.update = _update;
  this.destroy = _destroy;
  this.unStage = _unStage;
  return this;
}
//Implements Component Object
function Script(_initFunc, _updateFunc, _destroyFunc) {
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
  //Defaults
  if (_updateFunc === undefined) {
    //If the updateFunc has not been defined then only one arg was used
    //updateFunc is required initfunc is not.
    _updateFunc = _initFunc;
    _initFunc = function() {};
  }
  if (_destroyFunc == undefined) {
    _destroyFunc = function(){};
  }
  //Asserts
  if (typeof _initFunc != "function") {
    throw new Error("_initFunc of Script Component is not function", _initFunc);
  }
  if (typeof _updateFunc === null || typeof _updateFunc !== "function") {
    throw new Error("Acceptable _updateFunc required for script component", _updateFunc);
  }
  if (typeof _destroyFunc == null || typeof _destroyFunc !== "function") {
    throw new Error("_destroyFunc of Script Component is not function", _destroyFunc);
  }
  //Implementation
  this.init = _initFunc;
  this.update = _updateFunc;
  this.destroy = _destroyFunc;
  this.initialized = false;
  this.component = new Component(
    function() {
      if (!this.initialized) {
        this.init(this.component.entity);
        this.initialized = true;
      }
      this.update(this.component.entity);
    }.bind(this),
    function() {},
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
function Text(_str,_color,_offsetVector2D,_font) {
  /*
  The Text Component utilizes PIXI's Text type to create
  persistent text object to display a string as a graphic on the canvas.

  The Text Component requires a string to display, a color, a vector to offset its position,
  and a font.
  */
  //Defaults
  if (_str === undefined) {
    _str = "";
  }
  if (_color === undefined) {
    _color = 0x000000 //Black
  }
  if (_offsetVector2D === undefined) {
    _offsetVector2D = new Vector2D(0,0);
  }
  if (_font === undefined) {
    _font = "Impact";
  }
  //Asserts
  if (typeof _str !== "string") {
    throw new Error("Bad arg string _str in Text Component", _str);
  }
  if (typeof _color !== "number") {
    throw new Error("Bad arg color _color in Text Component", _color);
  }
  if (_offsetVector2D.constructor !== Vector2D) {
    throw new Error("Bad arg offset Vector2D _offsetVector2D in Text Component", _offsetVector2D);
  }
  if (typeof _font !== "string") {
    throw new Error("Bad arg font _font in Text Component", _font);
  }
  //Implementation
  //Member Variables
  this.style = {align : "left", fontSize : 26, fontFamily : _font, fill : _color, align : "right"};
  this.text = new PIXI.Text(_str, this.style);
  this.offsetVector2D =_offsetVector2D;
  //Member Functions
  this.setText = function(_str) {
    if (typeof _str !== "string") {
      throw new Error("Bad string _font in Text Component", _str, this.component.entity);
    }
    this.text.setText(_str);
  }
  this.getText = function() {
    return this.text;
  }
  this.clear = function() {
    this.text.setText("");
  }
  this.setFontSize = function(_fontSize) {
    if (typeof _fontSize !== "number" || _fontSize < 0) {
      throw new Error("Bad font size _fontSize in Text setFontSize", _fontSize, this.component.entity);
    }
    this.style.fontSize = _fontSize;
    this.text.setStyle(this.style);
  }
  this.getFontSize = function() {
    return this.style.fontSize;
  }
  this.setFont = function(_font) {
    if (typeof _font !== "string") {
      throw new Error("Bad font _font in Text Component", _font, this.component.entity);
    }
    this.style.fontFamily = _font;
    this.text.setStyle(this.style);
  }
  this.getFont = function() {
    return this.tyle.fontFamily;
  }
  this.setAlign = function(_align) {
    if (typeof _align !== "string") {
      throw new Error("Bad align _align in setAlign for Text Component", _align, this.component.entity);
    }
    this.style.align = _align;
    this.text.style = this.style;
  }
  this.getAlign = function() {
    return this.style.align;
  }
  this.setColor = function(_color) {
    if (typeof _color != "number") {
      throw new Error("Bad color _color for Text Component setColor", _color, this.component.entity);
    }
    this.style.fill = _color;
    this.text.setStyle(this.style);
  }
  this.getColor = function() {
    return this.style.fill;
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
  this.setRotation = function(_r) {
    if (typeof _r != "number") {
      throw new Error("Bad rotation _r for Text Component setRotation", _r, this.component.entity);
    }
    this.text.rotation = _r;
  }
  this.getRotation = function() {
    return this.text.rotation;
  }
  this.setOffset = function(_offsetVector2D) {
    if (_offsetVector2D.constructor !== Vector2D) {
      throw new Error("Bad arg _offsetVector2D in Text setOffset", _offsetVector2D, this.component.entity);
    }
    this.offsetVector2D = _offsetVector2D;
  }
  this.getOffset = function() {
    return this.offsetVector2D;
  }
  this.component = new Component(
    function() {
      this.text.x = this.component.position.vector2D.x + this.offsetVector2D.x;
      this.text.y = this.component.position.vector2D.y + this.offsetVector2D.y;
      this.text.rotation = this.component.position.rotation;
    }.bind(this),
    function() {
      //!!!Remove Text From Screen But Not Destroy It.
    }.bind(this),
    function() {
      this.text.destroy();
    }.bind(this)
  )
  Game.stage.addChild(this.text);
  return this;
}
//Implements Component Object
function SpriteRenderer(_spriteFileName,_scale,_offsetVector2D) {
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
  //Asserts
  if (_spriteFileName == null || typeof _spriteFileName != "string") {
    throw new Error("Bad _spriteFileName in SpriteRenderer", _spriteFileName);
  }
  if (typeof _scale !== "number") {
    throw new Error("Bad _scale in SpriteRenderer", _scale);
  }
  if (_offsetVector2D.constructor !== Vector2D) {
    throw new Error("Bad _offsetVector2D in SpriteRenderer", _offsetVector2D);
  }
  //Implementation
  //Member Variables
  this.sprite = new PIXI.Sprite(PIXI.Texture.fromImage("Images/" + _spriteFileName));
  this.sprite.scale.x = _scale;
  this.sprite.scale.y = _scale;
  this.offsetVector2D = _offsetVector2D;
  this.scaleMode = new PIXI.BaseTexture(this.sprite, PIXI.SCALE_MODES.NEAREST, 1);
  this.sprite.baseTexture = this.scaleMode;
  //Member Functions
  //Function which positions pixi sprite type equal to the objects position plus the relative offset
  this.setScaleX = function(_scale) {
    //Asserts
    if (typeof _scale != "number" || _scale <= 0)
      throw new Error("Bad Sprite Scale Set", _scale, this.component.entity);
    this.sprite.scale.x = _scale;
  }
  this.getScaleX = function() {
    return this.sprite.scale.x;
  }
  this.setScaleY = function(_scale) {
    //Asserts
    if (typeof _scale != "number" || _scale <= 0)
      throw new Error("Bad Sprite Scale Set", _scale, this.component.entity);
    this.sprite.scale.y = _scale;
  }
  this.getScaleY = function() {
    return this.sprite.scale.y;
  }
  this.setPivotX = function(_pivotPoint) {
    if (typeof _pivotPoint != "number")
      throw new Error("Bad Sprite Scale Set", _pivotPoint, this.component.entity);
    this.sprite.pivot.x = _pivotPoint;
  }
  this.getPivotX = function() {
    return this.sprite.pivot.x;
  }
  this.setPivotY = function(_pivotPoint) {
    if (typeof _pivotPoint != "number")
      throw new Error("Bad Sprite Scale Set", _pivotPoint, this.component.entity);
    this.sprite.pivot.y = _pivotPoint;
  }
  this.getPivotY = function() {
    return this.sprite.pivot.y;
  }
  this.setPivot = function(_pivotPoint) {
    if (typeof _pivotPoint !== "string") {
      throw new Error("Bad arg _pivotPoint in SpriteRenderer function setPivot, must be string", _pivotPoint, this.component.entity);
    }
    if (_pivotPoint === "center") {
      this.sprite.pivot.x = this.sprite.width*.5;
      this.sprite.pivot.y = this.sprite.height*.5;
    } else if (_pivotPoint == "top left") {
      this.sprite.pivot.x = 0;
      this.sprite.pivot.y = 0;
    } else if (_pivotPoint == "top") {
      this.sprite.pivot.x = this.sprite.width*.5;
      this.sprite.pivot.y = 0;
    } else if (_pivotPoint == "top right") {
      this.sprite.pivot.x = this.sprite.width;
      this.sprite.pivot.y = 0;
    } else if (_pivotPoint == "right") {
      this.sprite.pivot.x = this.sprite.width;
      this.sprite.pivot.y = this.sprite.height*.5;
    } else if (_pivotPoint == "bottom right") {
      this.sprite.pivot.x = this.sprite.width;
      this.sprite.pivot.y = this.sprite.height;
    } else if (_pivotPoint == "bottom") {
      this.sprite.pivot.x = this.sprite.width*.5;
      this.sprite.pivot.y = this.sprite.height;
    } else if (_pivotPoint == "bottom left") {
      this.sprite.pivot.x = 0;
      this.sprite.pivot.y = this.sprite.height;
    } else if (_pivotPoint == "left") {
      this.sprite.pivot.x = 0;
      this.sprite.pivot.y = this.sprite.height*.5;
    } else {
      throw new Error("Bad pivot point _pivotPoint in SpriteRenderer setPivot, needs string", _pivotPoint, this.component.entity)
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

  this.component = new Component(
    function() {
      this.sprite.position.x = this.component.position.vector2D.x + this.offsetVector2D.x;
      this.sprite.position.y = this.component.position.vector2D.y + this.offsetVector2D.y;
      this.sprite.rotation = this.component.position.rotation;
    }.bind(this),
    function() {
      //!!!Remove Text From Screen But Not Destroy It.
    }.bind(this),
    function() {
      this.sprite.destroy();
    }.bind(this)
    );
  Game.stage.addChild(this.sprite); //Setup entity to be rendered
  return this;
}
//Implements Component Object
function AudioPlayer(_audioFileName,_volume,_loop,_play) {
  /*
  The AudioPlayer type is defined as an entity component which
  encapsulates the howler.js library to provides common behaviour
  associated with audio such as: play, pause, stop, volume control,
  loop control, and mute control.

  The AudioPlayer requires a valid filename for an audio file located in the Audio folder.
  */
  //Defaults
  if (_volume === undefined) {
    _volume = 1;
  }
  if (_play === undefined) {
    _play = false;
  }
  if (_loop === undefined) {
    _loop = false;
  }
  //Asserts
  if (typeof _audioFileName !== "string") {
    throw new Error("Bad arg _audioFileName in construction of AudioPlayer component", _audioFileName);
  }
  //Implementation
  //Member Variables
  this.sound = new Howl({
    src : ["Music/" + _audioFileName],
    volume : _volume,
    loop : _loop,
    autoplay : _play
  });
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
  if (_r === undefined) _r = 0;
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

  this.component = new Component(
    function() {},
    function() {},
    function() {}
  );
}
//Implements Component Object
function BoxCollider() {
  this.component = new Component();
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
function canvasColorSet(_color) {
  //Set color of html canvas which holds game
  if (typeof _color === "number") {
    backgroundColor = _color;
    Game.renderer.backgroundColor = _color;
  }
  else
    throw new Error("Bad canvasColorSet arg _color: ", _color);
}
function canvasColorGet() {
  //Get color of html canvas which holds game in its Color enum
  for (i = 0; i < 15; i++) {
    if (Color[i] == Game.backgroundColor) return i;
  }
}
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
  Game.graphics.lineTo(x0+x1,y0+y1);
}
function camera(x,y) {
  Game.stage.position.x = x;
  Game.stage.position.y = y;
}
function pset(x,y,color) {
  Game.graphics.lineStyle(2,color);
  Game.graphics.moveTo(x-1,y-1);
  Game.graphics.lineTo(x+1,y+1);
}
