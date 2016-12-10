function RigidBody()
{
  this.component = new Component();
  this.mass = 0;
  this.v = {x:0,y:0};
  this.a = {x:0,y:0};
  this.step = function()
  {
    this.component.entity.position.x += this.v.x * Time.deltaTime;
    this.component.entity.position.y += this.v.y * Time.deltaTime;
    this.v.x += this.a.x * Time.deltaTime;
    this.v.y += this.a.y * Time.deltaTime;
  }.bind(this);
}
