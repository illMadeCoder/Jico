
//BEGIN DATA STRUCTURES
function DoublyLinkedList()
{
  this.head = null;
  this.tail = null;
  this.push = function(_data)
  {
    var node = new Node(_data);
    if (this.head == null)
    {
      this.head = node;
      this.tail = node;
    }
    else
    {
      this.tail.next = node;
      node.prev = this.tail;
      this.tail = node;
    }
    return node;
  }
  this.remove = function(node)
  {
    //Asserts
    if (node.constructor != Node)
      throw new Error("Bad node in DoublyLinkedList remove", node);
    if (node == this.head && node == this.tail)
    {
      this.head = null;
      this.tail = null;
    }
    else if (node == this.head)
    {
      this.head = node.next;
    }
    else if (node == this.tail)
    {
      this.tail = node.prev;
    }
    else
    {
      node.prev.next = node.next;
      node.next.prev = node.prev;
    }
    node.next = null;
    node.prev = null;
    node.data = null;
  }
  this.contains = function(_node)
  {
    let node = this.head;
    while (node != null)
    {
      if (node == _node) return true;
      node = node.next;
    }
    return false;
  }
  this.map = function(funct)
  {
    //Asserts
    if (typeof funct != "function")
      throw new Error("Cannot map non function in DoublyLinkedList map");
    let node = this.head;
    while (node != null)
    {
      funct(node.data);
      node = node.next;
    }
  }
  function Node(_data)
  {
    this.data = _data;
    this.prev = null;
    this.next = null;
  }
}
//END DATA STRUCTURES

//BEGIN GAME ENGINE
function GameEngine()
{
  //Properties
  this.renderer = PIXI.autoDetectRenderer(800, 600,{backgroundColor : 0x1099bb}); //Canvas Renderer
  this.stage = new PIXI.Container(); //Stage for canvas
  this.entityLinkedList = new DoublyLinkedList(); //Container for game entities.
  this.deltaTime = 0;
  this.totalTime = 0;
  this.lastTime = Date.now();
  this.frameCounter = 0; //total frames into game
  document.body.appendChild(this.renderer.view);

  //Methods
  //private
  this.updateEntityPool = function()
  {
    updateFunc = function(_entity)
    {
      //Asserts
      if (_entity.constructor != Entity)
        throw new Error("Non Entity in Entity Pool", _entity);
      _entity.update();
      let sprites = _entity.getComponents(SpriteRenderer);
      for (i = 0; i < sprites.length; i++)
        sprites[i].updateSprite()
    }
    this.entityLinkedList.map(updateFunc);
  }
  this.animate = function()
  {
    this.renderer.render(this.stage);
  }
  this.gameLoop = function()
  {
    requestAnimationFrame(this.gameLoop);
    this.deltaTime = (Date.now() - this.lastTime)/1000;
    this.totalTime += this.deltaTime;
    //console.log((this.frameCounter/(this.totalTime%60)));
    game_update();
    this.updateEntityPool();
    this.animate();
    this.frameCounter += 1;
    this.lastTime = Date.now();
  }.bind(this)
  //public
  this.setCanvasColor = function(_color)
  {
    this.renderer.backgroundColor = _color;
  }.bind(this)
}
var Game = new GameEngine();
//END GAME ENGINE
//Time Singleton

//

//BEGIN ENTITY COMPONENT SYSTEM
function Entity(_ID,_position,_update,_components,_properties,_tag)
{
  //Closure
  var entity = this;
  //Asserts
  if (typeof _ID != "string")
    throw new Error("Bad Entity ID", _ID);
  if (!(_position instanceof Position))
    throw new Error("Bad Entity Position", _ID);
  if (typeof _update != "function")
    throw new Error("Bad Entity Update Function", _ID)
  //Handle common error case where _components are given as a component instead of a list of components
  if (!Array.isArray(_components))
  {
    if (_components.component != undefined)
    {
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
  this.update = _update.bind(this);
  this.components = []; //only set components via addComponent
  this.position = _position;
  this.tag = _tag;
  this.properties = _properties;

  //Component Methods
  //Method to Add components
  this.addComponent = function(component)
  {
    //Asserts
    if (component.component == undefined)
      throw new Error("Bad Add Component", component, "to entity,", entity);
    if (component.constructor == "Position")
      throw new Error("Bad Add Component, cannot add a position component", entity)
    component.component.entity = entity;
    entity.components.push(component);
  }
  this.getComponent = function(constructorType)
  {
    if (typeof constructorType != "function")
      throw new Error("Bad constructor type in getComponent")
    for (i = 0; i < entity.components.length; i++)
    {
      if (entity.components[i].constructor == constructorType);
        return entity.components[i];
    }
  }
  this.getComponents = function(constructorType)
  {
    if (typeof constructorType != "function")
      throw new Error("Bad constructor type in getComponents")
    var ret = []
    for (i = 0; i < entity.components.length; i++)
    {
      if (entity.components[i].constructor == constructorType);
        ret.push(entity.components[i]);
    }
    return ret;
  }
  //Handle given components
  if (Array.isArray(_components))
    _components.map(this.addComponent);
  else if (_components != null)
    throw new Error("Components must be given in the form of an array", _ID);

  //Methods
  //unstage and stage remove and put the object in game space.
  this.stage = function()
  {
    if (this.isStaged(this.node) == true)
      console.error("Entity already staged", entity);
    else
      this.node = Game.entityLinkedList.push(this);
  }
  this.unStage = function()
  {
    if (this.isStaged(this.node) == false)
      console.error("Entity already unstaged", entity);
    else
    {
      Game.entityLinkedList.remove(this.node);
      let sprites = entity.getComponents(SpriteRenderer);
      for (i = 0; i < sprites.length; i++)
        sprites[i].destroy()
    }
  }
  this.isStaged = function()
  {
    Game.entityLinkedList.contains(this.node);
  }
  this.compareTag = function(_tag)
  {
    //Asserts
    if (typeof _tag != "string")
      throw new Error("Bad Tag in Compare Tag", _tag, entity);
    for (i = 0; i < entity.tag.length; i++)
      if (entity.tag[i] == _tag) return true;
    return false;
  }
  //Stage this entity into gamespace
  this.stage();
}
//Abstract Type Component
function Component()
{
  this.entity = null;
}
function SpriteRenderer(_spriteFileName,_scale) //Implements Component
{
  //Asserts
  if (typeof _spriteFileName != "string")
    throw new Error("Bad spriteFileName in SpriteRenderer", _spriteFileName);

  if (typeof _scale != "number") _scale = 1;
  this.component = new Component();
  this.sprite = new PIXI.Sprite(PIXI.Texture.fromImage("Images/" + _spriteFileName));
  this.sprite.scale.x = _scale;
  this.sprite.scale.y = _scale;

  this.updateSprite = function()
  {
    this.sprite.position.x = this.component.entity.position.x;
    this.sprite.position.y = this.component.entity.position.y;
  }
  this.setScaleX = function(_scale)
  {
    //Asserts
    if (typeof _scale != "number" || _scale <= 0)
      throw new Error("Bad Sprite Scale Set", this.component.entity);
    this.sprite.scale.x = _scale;
  }
  this.setScaleY = function(_scale)
  {
    //Asserts
    if (typeof _scale != "number" || _scale <= 0)
      throw new Error("Bad Sprite Scale Set", this.component.entity);
    this.sprite.scale.y = _scale;
  }
  this.getScaleX = function()
  {
    return this.sprite.scale.x;
  }
  this.getScaleY = function()
  {
    return this.sprite.scale.y;
  }
  this.destroy = function()
  {
    this.sprite.destroy();
  }
  Game.stage.addChild(this.sprite); //Setup entity to be rendered
}

function Position(_x,_y,_r) //Implements Component
{
  this.component = new Component();

  if (typeof _x != "number") _x = 0;
  if (typeof _y != "number") _y = 0;
  if (typeof _r != "number") _r = 0;
  this.x = _x;
  this.y = _y;
  this.rotation = _r;
}

function BoxCollider() //Implements Component
{
  this.component = new Component();

}

//END ENTITY COMPONENT SYSTEM

//BEGIN INPUT
var btn_array = Array(6).fill(false);
function btn(i)
{
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
  else console.log("BAD btn() CALL");
}
document.addEventListener("keydown",function(key)
  {
    if (key.keyCode == 90) btn_array[0] = true;
    if (key.keyCode == 88) btn_array[1] = true;
    if (key.keyCode == 37) btn_array[2] = true;
    if (key.keyCode == 39) btn_array[3] = true;
    if (key.keyCode == 38) btn_array[4] = true;
    if (key.keyCode == 40) btn_array[5] = true;
  }
);
document.addEventListener("keyup",function(key)
  {
    if (key.keyCode == 90) btn_array[0] = false;
    if (key.keyCode == 88) btn_array[1] = false;
    if (key.keyCode == 37) btn_array[2] = false;
    if (key.keyCode == 39) btn_array[3] = false;
    if (key.keyCode == 38) btn_array[4] = false;
    if (key.keyCode == 40) btn_array[5] = false;
  }
);

//END INPUT
