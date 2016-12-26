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
    if (node.constructor != Node)
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
      throw new Error("Object Type DoublyLinkedList's function push given no arg _node", _node);
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
  this.renderer = PIXI.autoDetectRenderer(800, 600,{backgroundColor : this.backgroundColor}); //Canvas Renderer
  this.stage = new PIXI.Container(); //Stage for canvas
  document.body.appendChild(this.renderer.view);
  this.graphics = new PIXI.Graphics();
  this.stage.addChild(this.graphics);
  //Entity List
  this.entityLinkedList = new DoublyLinkedList(); //Container for game entities.
  //Time
  this.Time = {};
  this.Time.deltaTime = 0;
  this.Time.totalTime = 0;
  this.Time.lastTime = Date.now();
  this.frameCounter = 0;
  //Private Methods
  this.updateEntityPool = function() {
    let updateFunc = function(_entity) {
      //Asserts
      if (_entity.constructor != Entity)
        throw new Error("Non Entity in Entity Pool", _entity);
      _entity.updateComponents()
    }
    this.entityLinkedList.map(updateFunc);
  }
  this.gameLoop = function() {
    this.Time.lastTime = Date.now();
    //Update Functions
    game_update(); //Call Scripting Environment's planned game_update function.
    this.updateEntityPool();
    //Rendering Functions
    this.renderer.render(this.stage);
    //Evaluate Time After Frame
    this.frameCounter += 1;
    this.Time.deltaTime = (Date.now() - this.Time.lastTime);
    this.Time.totalTime += this.Time.deltaTime;
    this.graphics.clear()
    requestAnimationFrame(this.gameLoop);
  }.bind(this)
  return this;
})();
//END GAME ENGINE

//BEGIN ENTITY COMPONENT SYSTEM
function Entity(_ID,_position,_components,_properties,_tag) {
  //Closure
  var entity = this;
  //Asserts
  if (typeof _ID != "string")
    throw new Error("Bad Entity ID", _ID);
  if (!(_position instanceof Position))
    throw new Error("Bad Entity Position", _ID);
  //Handle common error case where _components are given as a component instead of a list of components
  if (!Array.isArray(_components)) {
    if (_components.component != undefined) {
      let temp = _components;
      _components = [temp];
    }
  }
  if (_components != null && !Array.isArray(_components))
    throw new Error("Bad Entity Components", _ID);
  //Defaults
  if (_components == null) _components = [];
  if (_tag == null) _tag = [];
  if (_properties == null) _properties = {};
  //Properties
  this.ID = _ID;
  this.components = []; //only set components via addComponent
  this.position = _position;
  this.tag = _tag;
  this.properties = _properties;
  this.birthTime = Game.Time.totalTime;

  //Component Methods
  //Method to Add components
  this.addComponent = function(component) {
    //Asserts
    if (component.component == undefined)
      throw new Error("Bad Add Component", component, "to entity,", entity);
    if (component.constructor == "Position")
      throw new Error("Bad Add Component, cannot add a position component", entity)
    component.component.entity = entity;
    component.component.position = entity.position;
    entity.components.push(component);
  }
  this.getComponent = function(constructorType) {
    ret = null;
    if (typeof constructorType != "function")
      throw new Error("Bad constructor type in getComponent")
    for (i = 0; i < entity.components.length; i++) {
      if (entity.components[i].constructor == constructorType)
        ret = entity.components[i];
    }
    return ret;
  }
  this.getComponents = function(constructorType) {

    if (typeof constructorType != "function")
      throw new Error("Bad constructor type in getComponents")
    var ret = []
    for (i = 0; i < entity.components.length; i++) {
      if (entity.components[i].constructor === constructorType)
          ret.push(entity.components[i]);
    }
    return ret;
  }
  this.updateComponents = function() {
    for (i=0; i < entity.components.length; i++)
      entity.components[i].component.apply();
  }
  this.getTimeAlive = function() {
    return (Game.totalTime - this.birthTime)/1000;
  }
  //Handle given components
  if (Array.isArray(_components))
    _components.map(this.addComponent);
  else if (_components != null)
    throw new Error("Components must be given in the form of an array", _ID);

  //Methods
  //unstage and stage remove and put the object in game space.
  this.stage = function() {
    if (this.isStaged(this.node) == true)
      console.error("Entity already staged", entity);
    else
      this.node = Game.entityLinkedList.push(this);
  }
  this.unStage = function() {
    if (this.isStaged(this.node) == false)
      console.error("Entity already unstaged", entity);

    Game.entityLinkedList.remove(this.node);
  }
  this.isStaged = function() {
    Game.entityLinkedList.contains(this.node);
  }
  this.compareTag = function(_tag) {
    //Asserts
    if (typeof _tag != "string")
      throw new Error("Bad Tag in Compare Tag", _tag, entity);
    for (i = 0; i < entity.tag.length; i++)
      if (entity.tag[i] == _tag) return true;
    return false;
  }
  this.destroy = function() {
    for (i = 0; i<entity.components.length; i++) {
      entity.components[i].component.delete();
    }
    this.unStage();
  }
  //Stage this entity into gamespace
  this.stage();
  return this;
}
//Abstract Type Component
function Component(_apply, _destroy) {
  //Defaults
  if (_apply === undefined) {
    _apply = function() {};
  }
  if (_destroy === undefined) {
    _destroy = function () {};
  }
  //Asserts
  if (typeof _apply !== "function") {
    throw new Error("Bad component apply function", _apply);
  }
  if (typeof _destroy !== "function") {
    throw new Error("Bad component destroy function", _destroy);
  }
  //Implementation
  this.entity = null;
  this.position = null;
  this.apply = _apply;
  this.destroy = _destroy;
}
function Script(_initFunc, _updateFunc) {
  //Defaults
  if (_updateFunc === undefined) {
    //If the updateFunc has not been defined then only one arg was used
    //updateFunc is required initfunc is not.
    _updateFunc = _initFunc;
    _initFunc = function() {};
  }
  //Asserts
  if (typeof _initFunc != "function") {
    throw new Error("_initFunc of Script Component is not function", _initFunc);
  }
  if (typeof _updateFunc === null || typeof _updateFunc !== "function") {
    throw new Error("Acceptable _updateFunc required for script component", _updateFunc);
  }
  //Implementation
  this.init = _initFunc;
  this.update = _updateFunc;
  this.component = new Component(
    function() {
      if (this.component.entity.getTimeAlive() == 0) {
        this.init = this.init.bind(this.component.entity);
        this.update = this.update.bind(this.component.entity);
        this.init();
      }
      this.update();
    }.bind(this),
    function () {
      this.init = null;
      this.update = null;
    }.bind(this)
  );
}
function GameText(_str, _color, _x_offset, _y_offset, _font) {
  //Defaults
  if (_str === undefined) {
    _str = "";
  }
  if (_color === undefined) {
    _color = 0x000000 //Black
  }
  if (_x_offset === undefined) {
    _x_offset = 0;
  }
  if (_y_offset === undefined) {
    _y_offset = 0;
  }
  if (_font === undefined) {
    _font = "Impact";
  }
  //Asserts
  if (typeof _str !== "string") {
    throw new Error("Bad string _str in Text Component", _str);
  }
  if (typeof _color !== "number") {
    throw new Error("Bad color _color in Text Component", _color);
  }
  if (typeof _x_offset !== "number") {
    throw new Error("Bad x offset _x_offset in Text Component", _x_offset);
  }
  if (typeof _y_offset !== "number") {
    throw new Error("Bad y offset _y_offset in Text Component", _y_offset);
  }
  if (typeof _font !== "string") {
    throw new Error("Bad font _font in Text Component", _x_offset);
  }
  //Implementation
  this.style = {align : "left", fontSize : 26, fontFamily : _font, fill : _color};
  this.text = new PIXI.Text(_str, this.style);
  this.x_offset = _x_offset;
  this.y_offset = _y_offset;
  Game.stage.addChild(this.text);
  this.setText = function(_str) {
    this.text.setText(_str);
  }
  this.clear = function() {
    this.text.setText("");
  }
  this.setFont = function(_font) {
    if (typeof _font !== "string") {
      throw new Error("Bad font _font in Text Component", _x_offset);
    }
    this.style.fontFamily = _font;
    this.text.setStyle(this.style);
  }
  this.setAlign = function(_align) {
    if (typeof _align !== "string") {
      throw new Error("Bad align _align in setAlign for Text Component", _align);
    }
    this.style.align = _align;
    this.text.style = this.style;
  }
  this.setColor = function(_color) {
    if (typeof _color != "number") {
      throw new Error("Bad color _color for Text Component setColor", _color);
    }
    this.style.fill = _color;
    this.text.setStyle(this.style);
  }
  this.setWidth = function(_w) {
    if (typeof _w != "number" || _w <= 0) {
      throw new Error("Bad width _w for Text Component setWidth", _w);
    }
    this.text.width = _w;
  }
  this.setRotation = function(_r) {
    if (typeof _r != "number") {
      throw new Error("Bad rotation _r for Text Component setRotation", _r);
    }
    this.text.rotation = _r;
  }
  this.setOffset = function(_x,_y) {
    this.x_offset = _x;
    this.y_offset = _y;
  }
  this.getXOffset = function() {
    return this.x_offset;
  }
  this.getYOffset = function() {
    return this.y_offset;
  }

  this.component = new Component(
    function() {
      this.text.x = this.component.position.x + this.x_offset;
      this.text.y = this.component.position.y + this.y_offset;
    }.bind(this)
  )
}
function SpriteRenderer(_spriteFileName,_scale,_x_offset,_y_offset) {
  /*
  The SpriteRenderer is defined as an entity component which encapsulates
  the PIXI.js library to provide behaviour associated with graphical sprites
  such as: sprite scale control, sprite display, and the sprite's local position.


  */
  //Asserts
  if (typeof _spriteFileName != "string")
    throw new Error("Bad spriteFileName in SpriteRenderer", _spriteFileName);

  if (typeof _scale != "number") _scale = 1;
  if (typeof _x_offset != "number") _x_offset = 0;
  if (typeof _y_offset != "number") _y_offset = 0;
  this.sprite = new PIXI.Sprite(PIXI.Texture.fromImage("Images/" + _spriteFileName));
  this.sprite.scale.x = _scale;
  this.sprite.scale.y = _scale;
  this.x_offset = _x_offset;
  this.y_offset = _y_offset;
  //Function which positions pixi sprite type equal to the objects position plus the relative offset
  this.updateSprite = function() {
    this.sprite.position.x = this.component.position.x + this.x_offset;
    this.sprite.position.y = this.component.position.y + this.y_offset;
  }
  this.setScaleX = function(_scale) {
    //Asserts
    if (typeof _scale != "number" || _scale <= 0)
      throw new Error("Bad Sprite Scale Set", this.component.entity);
    this.sprite.scale.x = _scale;
  }
  this.setScaleY = function(_scale) {
    //Asserts
    if (typeof _scale != "number" || _scale <= 0)
      throw new Error("Bad Sprite Scale Set", this.component.entity);
    this.sprite.scale.y = _scale;
  }
  this.getScaleX = function() {
    return this.sprite.scale.x;
  }
  this.getScaleY = function() {
    return this.sprite.scale.y;
  }
  Game.stage.addChild(this.sprite); //Setup entity to be rendered
  this.component = new Component(
    function() {
      this.updateSprite()
    }.bind(this),
    function() {
      this.sprite.destroy();
    }.bind(this)
    );
}

function AudioPlayer(_audioFileName) {
  /*
  The AudioPlayer type is defined as an entity component which
  encapsulates the howler.js library to provides common behaviour
  associated with audio such as: play, pause, stop, volume control,
  loop control, and mute control.

  The AudioPlayer requires a valid filename for an audio file located in the Audio folder.
  */
  //Asserts
  if (typeof _audioFileName !== "number") {
    throw new Error("Bad arg _audioFileName in construction of AudioPlayer component", _audioFileName);
  }
  //Implementation
  this.sound = new Howl({ src : ["Music/" + _audioFileName]});
  this.playing = false;
  this.loop = false;
  this.mute = false;
  this.volume = 1.0;

  this.play = function() {
    this.playing = true;
    this.sound.play();
  }
  this.stop = function() {
    this.playing = false;
    this.sound.stop();
  }
  this.pause = function() {
    this.playing = false;
    this.sound.pause();
  }
  this.getLooping = function() {
    return this.loop;
  }
  this.setLooping = function(_bool) {
    this.loop = _bool;
    this.sound.loop = _bool;
  }
  this.getMute = function(_bool) {
    return this.mute;
  }
  this.setMute = function(_bool) {
    this.mute = _bool;
    if (_bool === true)
      this.sound.volume(0);
    else
      this.sound.volume = this.volume;
  }
  this.getVolume = function() {
    return this.volume;
  }
  this.setVolume = function(_newVolume) {
    //Needs fix
    this.volume = _newVolume;
    if (!this.mute)
      this.sound.volume(_newVolume);
  }
  this.isPlaying = function() {
    return this.playing;
  }
  this.component = new Component(function() {},
  function() {
    this.stop();
  });
}

function Position(_x,_y,_r) {
  /*
  The Position type is defined as an entity component
  which provides a container for the global position of
  an entity on canvas space. All other position based components
  will utilize an entity's Position component to have a frame of reference

  The Position component is special in that there can only exist a single Position
  object per entity, and an entity must maintain one Position object.
  */
  //Defaults
  if (_x === undefined) _x = 0;
  if (_y === undefined) _y = 0;
  if (_r === undefined) _r = 0;
  //Asserts
  if (typeof _x !== "number") {
    throw new Error("Bad arguement _x in Position", _x);
  }
  if (typeof _y !== "number") {
    throw new Error("Bad arguement _y in Position", _y);
  }
  if (typeof _r !== "number") {
    throw new Error("Bad arguement _r in Position", _r);
  }
  //Implementation
  this.x = _x;
  this.y = _y;
  this.rotation = _r;
  this.component = new Component();
}

function BoxCollider() {
  this.component = new Component();
}

//END ENTITY COMPONENT SYSTEM

//BEGIN INPUT
var btn_array = Array(6).fill(false);
function btn(i) {
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
  if (i == "z") i = 0;
  if (i == "x") i = 1;
  if (i == "left" || i == "l") i = 2;
  if (i == "right" || i == "r") i = 3;
  if (i == "up" || i == "u") i = 4;
  if (i == "down" || i == "d") i = 5;
  if (i >= 0 && i < 6) return btn_array[i];
  else throw new Error("Bad btn input", i);
}
document.addEventListener("keydown",function(key) {
    if (key.keyCode == 90) btn_array[0] = true;
    if (key.keyCode == 88) btn_array[1] = true;
    if (key.keyCode == 37) btn_array[2] = true;
    if (key.keyCode == 39) btn_array[3] = true;
    if (key.keyCode == 38) btn_array[4] = true;
    if (key.keyCode == 40) btn_array[5] = true;
  }
);
document.addEventListener("keyup",function(key) {
    if (key.keyCode == 90) btn_array[0] = false;
    if (key.keyCode == 88) btn_array[1] = false;
    if (key.keyCode == 37) btn_array[2] = false;
    if (key.keyCode == 39) btn_array[3] = false;
    if (key.keyCode == 38) btn_array[4] = false;
    if (key.keyCode == 40) btn_array[5] = false;
  }
);

//END INPUT
//BEGIN TIME
function deltaTime() {
  //Get Time Between The Previous Frame and Current Frame in Seconds
  return Game.Time.deltaTime/1000;
}
function totalTime() {
  //Get Total Time Over Game Engine's LifeTime
  return Game.totalTime/1000;
}
//END TIME
//BEGIN GRAPHICS
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
  Game.graphics.moveTo(x,y);
  Game.graphics.lineTo(x+1,y+1);
}
//END GRAPHICS
