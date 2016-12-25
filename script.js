//function entity(_ID,_position,_sprite,_update,_onCollision,_hitbox,_tags,_enabled,_properties,_scale)
function bunny1()
{
  let _update = function()
  {
    if (this.getTimeAlive() == 0)
    {
      this.getComponent(AudioPlayer).play();
    }
    if (this.position.x > 600) this.properties.sign = -1;
    if (this.position.x < 100) this.properties.sign = 1;
    this.position.x += deltaTime()*240*this.properties.sign;
    if (btn('z'))
    {

      if (!this.getComponent(AudioPlayer).isPlaying())
        this.getComponent(AudioPlayer).play();
      else
        this.getComponent(AudioPlayer).stop();
    }
    if (btn("down")) this.getComponent(AudioPlayer).setVolume(this.getComponent(AudioPlayer).getVolume()-.1);
    if (btn("right")) this.getComponent(AudioPlayer).setLooping(false);
    if (btn("x")) {
      this.getComponent(SpriteRenderer);
    }
    if (btn('u')) this.position.y += 10;
  }
  return new Entity("bunny",new Position(100,300,0), [new GameText("Test", Color.white, 10, -25),new Script(function() {}, _update), new AudioPlayer("Donkey Kong Country 2 - Stickerbush Symphony.mp3"),new SpriteRenderer("bunny.png",4), new SpriteRenderer("bunny.png",4, 20,20) ],{sign : 1},[]);
}
var bunny1 = bunny1()
function game_init()
{
  canvasColorSet(Color.black);
}
var count = 0;
var backgroundTimer = 0;
function game_update()
{
  backgroundTimer += deltaTime();
  if (backgroundTimer > 1)
  {
    backgroundTimer = 0;
    count++;
    if (count > 15) count = 0;
    canvasColorSet(Color[count]);
  }
  for (j = 0; j<20; j++)
  {
    for (i = 0; i<100; i++)
    {
      pset(Math.cos(i*.1)*10+100+totalTime()*100,Math.sin(i*.1)*10+100+Math.sin(totalTime())*100+j*15,Color[count+1]);
    }
  }
}
