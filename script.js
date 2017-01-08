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
  let collider = new RectCollider(16,16, new Vector2D(-8,-8))
  let kinematics = {v_x : 0, v_y : 0};
  let grounded = false;
  let coll = null;
  let playerController = new Script({
    update : function(entity) {
      graphic.animation.pivot.x = graphic.animation.width/2;
      graphic.animation.pivot.y = graphic.animation.height/2;
      collider.draw = true;
      graphic.setRotation(graphic.getRotation()+(10*deltaTime()));
      camera(position.x-400,position.y-400);
      if (!grounded) {
        kinematics.v_y += 500*deltaTime();
      } else {
        entity.position.vector2D.y = coll.top()-8;
        kinematics.v_y = 0;
      }
      kinematics.v_x += 150*deltaTime();

      if (btn('u') && grounded) {
        kinematics.v_y += -300;
      }
      entity.position.vector2D.x += kinematics.v_x*deltaTime();
      entity.position.vector2D.y += kinematics.v_y*deltaTime();
      grounded = false;
    },
    onCollision : function(_entity,_coll) {
      if (_entity.bot()/2 <= _coll.top()) {
        grounded = true;
        coll = _coll;
      }
    }
  });
  return new Entity(name,position,[collider,graphic,playerController]);
}
function ground(_x0,_x1) {
  let name = "ground";
  let position = new Vector2D(_x0,400);
  let collider = new RectCollider(_x1,10);
  let script = new Script({
    update : function() {
      line(_x0,400,_x1,0,Color.blue);
    }
  });
  return new Entity(name,position,[script,collider]);
}
function score() {
  let name = "score";
  let position = new Vector2D(400,10);
  let score = 0;
  let scoreText = new Text("Hahahahahaha", {fill : Color.blue});
  let scoreScript = new Script(
    {
      update : function(entity) {
      }
    }
  );
  new Entity(name,position,[scoreText]);
}
EntityList = {};
function game_init() {
  EntityList["player"] = new player();
  EntityList["title"] = new titleText();
  EntityList["score"] = new score();
  for (let i = 0; i < 25; i++) {
    new ground(400+(i*800) + (i*i*50),800);
  }
}

function game_update() {
}
function load_screen() {

}
