//function Entity(_ID,_positionVector2D,_components,_properties,_tag)
function titleText() {
  let name = "titleText";
  let position = new Vector2D(0,0);
  let text = new Text("Getting Somewhere",Color.blue,new Vector2D(0,0),"ubuntu");
  let moveScript = new Script(
    function(entity) {
      text.setOffset(new Vector2D(Game.renderer.width/2-text.getWidth()/2, 5));
    },
    function(entity) {
    }
  )
  return new Entity(name,position,[text,moveScript]);
}
function arena() {
  let name = "arena";
  let position = new Vector2D(0,0);
  let linePosition = 0;
  let lineFlip = false;
  let renderArena = new Script(
    function(entity) {
      if (!lineFlip)
        line(0,linePosition,Game.renderer.width/2+25,1,Color.red);
      else
        line(Game.renderer.width/2-25,linePosition,Game.renderer.width,1,Color.red);

      linePosition += 500*deltaTime();
      if (linePosition >= Game.height) {
        linePosition = 0;
        lineFlip = !lineFlip;
      }
      rect(Game.renderer.width/2-100,Game.renderer.height/2-100,200,200,Color.white);
      }
    )
  return new Entity(name,position,[renderArena]);
}

function player() {
  let name = "player";
  let position = new Vector2D(Game.renderer.width/2-16,Game.renderer.height/2-16);
  let spriteR = new SpriteRenderer("player",2);
  let playerController = new Script(
      function(entity) {
      },
      function(entity) {
        if (btn('u')) entity.position.vector2D.y -= 100*deltaTime();
        if (btn('d')) entity.position.vector2D.y += 100*deltaTime();
        if (btn('l')) entity.position.vector2D.x -= 100*deltaTime();
        if (btn('r')) entity.position.vector2D.x += 100*deltaTime();
        entity.position.rotation += .05;
        spriteR.setPivot("center");
        spriteR.offsetVector2D.y = 100;
      }
    )
  return new Entity(name,position,[playerController,spriteR])
}

function musicPlayer() {
  let name = "musicPlayer";
  let position = new Vector2D(0,0);
  let audio = new AudioPlayer("Sun Rising Arp 120bpm.wav");
  let musicManager = new Script(
    function(entity) {
      if (!audio.isPlaying()) {
        audio.setLooping(true);
        audio.setVolume(0);
        audio.play();
      }
    }
  )
  return new Entity(name,position,[audio,musicManager]);
}

function animationTest() {
  let name = "animationTest";
  let position = new Vector2D(0,0);
  //let anim = new Animator(new Animation("kindle",["kindle"]));
  return new Entity(name,position);
}

EntityList = {};
function game_init() {
  EntityList = {
    titleText : new titleText(),
    arena : new arena(),
    player : new player(),
    musicPlayer : new musicPlayer(),
    animation : new animationTest()
  }
}

function game_update() {

}
