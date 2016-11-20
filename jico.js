//BEGIN UPDATE STEP
var globalFrameCounter = 0;

//Begin Call Entity Scripts
var entityPool = [];
function updateEntityPool()
{
  for (i = 0; i < entityPool.length; i++)
    if (entityPool[i].enabled) entityPool[i].script();
}
//End Call Entity Scripts

//BEGIN RENDER
var renderer = PIXI.autoDetectRenderer(800, 600,{backgroundColor : 0x1099bb});
document.body.appendChild(renderer.view);
var stage = new PIXI.Container();
function animate()
{
    renderer.render(stage);
}
//END RENDER
//Game Loop
function gameLoop()
{
  requestAnimationFrame(gameLoop);
  game_update();
  updateEntityPool();
  animate();
  globalFrameCounter += 1;
}
//End Game Loop
//END UPDATE STEP

//BEGIN ENTITY COMPONENT SYSTEM
function entity(_ID,_position,_sprite,_update,_onCollision,_hitbox,_tags,_enabled,_properties,_scale)
{
  //Asserts
  if (!_ID) console.log("No _ID Exception");
  else if (!_position) console.log("No _position Exception");
  else if (!_sprite) console.log("No _sprite Exception");
  else
  {
    //Defaults
    if (!_update) _update = function(){};
    if (!_onCollision) _onCollision = function(){};
    if (!_hitbox) _hitbox = new hitbox();
    if (!_tags) _tags = [];
    if (!_enabled) _enabled = true;
    if (!_properties) _properties = [];
    if (!_scale) _scale = 1;
    //Logs
    console.log("Creating Entity: " + _ID);
    console.log("Position: " + _position.x + "," + _position.y + "," + _position.r);
    console.log("Sprite: " + _sprite);
    console.log("Tags: " + _tags);
    console.log("Enabled: " + _enabled);
    console.log("Properties: " + _properties);
    console.log("Scale: " + _scale);
    //Construction
    this.ID = _ID;
    this.tags = _tags;
    this.sprite = new PIXI.Sprite(PIXI.Texture.fromImage('Images/' + _sprite));
    this.sprite.x = _position.x;
    this.sprite.y = _position.y;
    this.sprite.rotation = _position.r;
    this.sprite.anchor.x = .5;
    this.sprite.anchor.y = .5;
    this.sprite.scale.x = _scale;
    this.sprite.scale.y = _scale;
    this.enabled = _enabled;
    this.properties = _properties;
    this.script = _script.bind(this);
    this.hitbox = _hitbox;
    this.collision = _collision.bind(this);
    this.index = entityPool.length;
    //Entity Methods
    this.delete = function()
    {
      entityPool.splice(this.index,1);
      this.sprite.destroy()
    }

    entityPool.push(this);
    stage.addChild(this.sprite);
  }
}
function position(_x,_y,_r)
{
  if (!_x) _x = 0;
  if (!_y) _y = 0;
  if (!_r) _r = 0;
  this.x = _x;
  this.y = _y;
  this.r = _r;
}
function hitbox()
{
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
