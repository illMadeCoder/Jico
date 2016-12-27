//function Entity(_ID,_positionVector2D,_components,_properties,_tag)
function testEntity() {
  let name = "test";
  let position = new Vector2D(100,100);
  let sprite = new SpriteRenderer("bunny.png",4);
  let moveScript = new Script(
    function(entity) {
    }
  )
  return new Entity(name,position,[sprite,moveScript]);
}
var entity = testEntity();
function game_init() {
}

function game_update() {
}
