function bunny()
{
  var update = function()
  {
    this.sprite.x += Math.cos(this.sprite.rotation+-(Math.PI/2)) * this.properties.speed;
    this.sprite.y += Math.sin(this.sprite.rotation+-(Math.PI/2)) * this.properties.speed;
    if (Math.floor(Math.random()*10) <= 1) this.sprite.rotation += .1;
    if (Math.floor(Math.random()*10) >= 8) this.sprite.rotation -= .1;
  }
  return new entity("bunny",[],"bunny.png",new position(Math.floor(Math.random()*800),Math.floor(Math.random()*800),Math.random()*100),Math.floor(Math.random()*5)+1,true,{speed:Math.floor(Math.random()*5)+1},update,new hitbox(), function(){})
}

function player()
{
  var update = function()
  {
    if (btn('z')) this.properties.speed = 4;
    else this.properties.speed = 1;
    this.sprite.x += Math.cos(this.sprite.rotation+-(Math.PI/2)) * this.properties.speed;
    this.sprite.y += Math.sin(this.sprite.rotation+-(Math.PI/2)) * this.properties.speed;
    if (btn('r')) this.sprite.rotation += .1;
    if (btn('l')) this.sprite.rotation -= .1;
    if (globalFrameCounter > 100)
    {
      this.delete();
    }
  }
  return new entity("player",[],"player.png",new position(400,300,0),4,true,{speed:1},update,new hitbox(), function(){})
}

function game_init()
{
  player();
  /*for (i = 0; i < 100; i++)
    bunny();
  */
}
function game_update()
{

}
