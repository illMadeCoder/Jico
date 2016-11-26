//function entity(_ID,_position,_sprite,_update,_onCollision,_hitbox,_tags,_enabled,_properties,_scale)
function bunny1()
{
  let _update = function()
  {
    if (this.position.x > 600) this.properties.sign = -1;
    if (this.position.x < 100) this.properties.sign = 1;
    this.position.x += Game.deltaTime*240*this.properties.sign;

     if (btn('u')) this.position.y += 1;
  }
  return new Entity("bunny",new Position(100,300,0), _update, [new SpriteRenderer("bunny.png",4)],{sign : 1},[]);
}
function bunny2()
{
  return new Entity("bunny",new Position(100,100,0), function(){
    if (this.position.x > 600) this.properties.sign = -1;
    if (this.position.x < 100) this.properties.sign = 1;
    this.position.x += 2*this.properties.sign;

     if (btn('u')) this.position.y += 1;}, [new SpriteRenderer("bunny.png",4)],{sign : 1},[]);
}
var bunny1 = bunny1()
var bunny2 = bunny2()
function game_init()
{
  Game.setCanvasColor(0xFFFFFF);
}
function game_update()
{
}
