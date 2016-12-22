//function entity(_ID,_position,_sprite,_update,_onCollision,_hitbox,_tags,_enabled,_properties,_scale)
function bunny1()
{
  let _update = function()
  {
    if (this.position.x > 600) this.properties.sign = -1;
    if (this.position.x < 100) this.properties.sign = 1;
    this.position.x += deltaTime()*240*this.properties.sign;

     if (btn('u')) this.position.y += 1;
  }
  return new Entity("bunny",new Position(100,300,0), _update, [new SpriteRenderer("bunny.png",4), new SpriteRenderer("bunny.png",4, 20,20) ],{sign : 1},[]);
}
function bunny2()
{
  return new Entity("bunny",new Position(100,100,0), function(){
    if (this.position.x > 600) this.properties.sign = -1;
    if (this.position.x < 100) this.properties.sign = 1;
    this.position.x += 2*this.properties.sign;
    let test = this.getComponent(RigidBody);
    test.v.x += 1;
     if (btn('u')) this.position.y += 1;}, [new SpriteRenderer("bunny.png",4), new RigidBody()],{sign : 1},[]);
}
var bunny1 = bunny1()
var bunny2 = bunny2()
function game_init()
{
  canvasColorSet(Color.black);
}
var count = 0;
var backgroundTimer = 0;
function game_update()
{
  print("test",40+totalTime()*10,40,Color.blue);
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
