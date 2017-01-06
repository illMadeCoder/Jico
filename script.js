//function Entity(_ID,_positionVector2D,_components,_properties,_tag)
function titleText() {
  let name = "titleText";
  let position = new Vector2D(0,0);
  let text = new Text("Demo Platformer", {fill : Color.blue});
  let moveScript = new Script({
    init : function(entity) {
      text.setOffsetVector2D(new Vector2D(Game.renderer.width/2-text.getWidth()/2, 5));
    }
  });
  return new Entity(name,position,[text,moveScript]);
}

function player() {
  let name = "player";
  let position = new Vector2D(400,300);
  let graphic = new Animator("kindle",4);
  let collider = new RectCollider(64,64, new Vector2D(-32,-32))
  let kinematics = {v_x : 0, v_y : 0};
  let grounded = false;
  let playerController = new Script({
    update : function(entity) {
      graphic.animation.anchor.x = .5;
      graphic.animation.anchor.y = .5;
      graphic.setRotation(graphic.getRotation()+10);
      camera(position.x-400,position.y-400);
      if (btn('r') && kinematics.v_x < 150) kinematics.v_x += 150;
      if (btn('l') && kinematics.v_x > -150) kinematics.v_x += -150;
      if (!btn('l') && !btn('r')) kinematics.v_x = 0;
      if (btn('u') && grounded) {
        kinematics.v_y += -300;
      }
      if (!grounded) kinematics.v_y += 500*deltaTime();
      entity.position.vector2D.x += kinematics.v_x*deltaTime();
      entity.position.vector2D.y += kinematics.v_y*deltaTime();
      grounded = false;
    },
    onCollision : function(entity,coll) {
      if (!grounded) {
        kinematics.v_y = 0;
        grounded = true;
      }
    }
  });
  return new Entity(name,position,[collider,graphic,playerController]);
}
function ground() {
  let name = "ground";
  let position = new Vector2D(0,400);
  let collider = new RectCollider(800,10);
  let script = new Script({update : function() {line(0,400,800,0,Color.blue);}});
  return new Entity(name,position,[script,collider]);
}
function ground2() {
  let name = "ground";
  let position = new Vector2D(400,250);
  let collider = new RectCollider(100,1);
  let script = new Script({update : function() {line(400,250,100,0,Color.blue);}});
  return new Entity(name,position,[script,collider]);
}
EntityList = {};
function game_init() {
  EntityList["player"] = new player();
  EntityList["title"] = new titleText();
  EntityList["ground"] = new ground();
  EntityList["ground2"] = new ground2;
}

function game_update() {
}
function load_screen() {

}
