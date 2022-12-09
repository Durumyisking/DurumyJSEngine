import { Rectangle } from './node_modules/pixi.js/dist/pixi.mjs';
import * as PIXI from './node_modules/pixi.js/dist/pixi.mjs';



const app = new PIXI.Application({

    // 초기화 영역 : 변수 접근으로는 수정이 불가능함
    width: 1280,
    height: 720,
    transparent: false,
    antialias: true

});

// 윈도우렌더링을 변경하려면 renderer로 접근해야함
app.renderer.backgroundColor = 0xf3ff3f;
//app.renderer.resize(window.innerWidth, window.innerHeight);
app.renderer.view.style.position ='absolute';

document.body.appendChild(app.view);


// 윈도우 내부 컨테이너생성


const Graphics = PIXI.Graphics;

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
const renderContainer = new PIXI.Container(1000, {

});
// 컨테이너의 위치를 윈도우 중앙으로
renderContainer.x = -5;
renderContainer.y = -5;
app.stage.addChild(renderContainer);


// enum
const State = {
    IDLE: 0,
    MOVE: 1,
    JUMP : 2,
    ATTACK: 4,
}
const DIR = {
    NONE: 0,
    U: 1,
    D: 2,
    L: 4,
    R: 8,
}
//// functions ////

  const key_left = keyboardMgr("ArrowLeft"),
  key_up = keyboardMgr("ArrowUp"),
  key_right = keyboardMgr("ArrowRight"),
  key_down = keyboardMgr("ArrowDown"),
  key_space = keyboardMgr(" "),
  key_z = keyboardMgr("z"),
  key_x = keyboardMgr("x"),
  key_c = keyboardMgr("c");

/** _target의 x y에 Sprite 추가 */
function addSprite(_target , _texture, _x, _y)
{
    const Sprite = new PIXI.Sprite(_texture);    
    Sprite.x = _x;
    Sprite.y = _y;
    _target.addChild(Sprite);

}

/** Frame이용한 Sprite 추가 */
// rectangle로 Texture.Frame을 지정해서 텍스처의 원하는 부분만 잘라내기가 가능
function addSpriteFrame(_target , _texture, _xPos, _yPos, _rect)
{

    _texture.frame = _rect;
    const Sprite = new PIXI.Sprite(_texture);
    Sprite.x = _xPos;
    Sprite.y = _yPos;

    //Sprite.scale.set(2, 2);
    _target.addChild(Sprite);
}



var DT;
var MS;
var Col_id = 0;

// x y를 가지는 구조체


function Vec2(_x, _y)
{
    var temp = {x: _x, y: _y}

    return temp;
}

function GameObj () {

    this.name = "";
    this.vPos =  Vec2(0, 0);
    this.vScale = Vec2(0, 0);
    this.Animations = [];
    this.CurrentAnim = null;
    this.Collider = null;
    this.IsDead = false;


    this.SetPos = function(_x, _y) 
    {
        this.vPos = Vec2(_x, _y);
    }

    this.SetScake = function(_x, _y) 
    {
        this.vScale = Vec2(_x, _y);
    }
    this.update = function() 
    {
        if(null != this.CurrentAnim)
            this.CurrentAnim.Animsprite.position.set(this.vPos.x, this.vPos.y);

    }
    this.render = function(container) 
    {

    }

    this.CreateAnimation = function(name, path, maxframe, loop) 
    {
        const newAnim = new Animation(this, name, maxframe, loop);

        for(let i = 1; i<= maxframe; ++i)
        {
            const texture = PIXI.Texture.from(path + `${i}.png`);
            newAnim.Texture.push(texture);
        }
        newAnim.CreateAnim(this.vPos.x, this.vPos.y);

        this.Animations.push(newAnim);
    }

    this.playAnim = function(name)
    {
        for(var i =0; i< this.Animations.length; ++i)
        {
            if(this.Animations[i].name == name)
            {
                this.Animations[i].playAnim();
                this.CurrentAnim = this.Animations[i];
            }
        }
    }

    this.stopAnim = function()
    {
        this.CurrentAnim.stopAnim();
        this.CurrentAnim = null;
    }

    this.changeAnim = function(name)
    {
        this.stopAnim();
        for(var i =0; i< this.Animations.length; ++i)
        {
            if(this.Animations[i].name == name)
            {
                this.Animations[i].playAnim();
                this.CurrentAnim = this.Animations[i];
            }
        }
    }

    this.CreateCollider = function(_x, _y)
    {
        this.Collider = new Collider(this, Vec2(_x, _y));
        this.Collider.rect = new Graphics();
        this.Collider.rect.beginFill(0, 0.05)
        .drawRect(this.vPos.x - (_x / 2) , this.vPos.y - (_y / 2), _x, _y)
        .endFill();
    }


    this.OnCollisionEnter = function(_Other) 
    {

    }
    this.OnCollision = function(_Other) 
    {

    }
    this.OnCollisionExit = function(_Other) 
    {

    }
}



const Obj_Type = {
    Floor: 0,
    Player: 1,
    Bullet: 2,
    END: 10,
}


function Scene () {

    this.arrGameObj = Array.from(new Array(Obj_Type.END), () => new Array(0));
    this.Wintexture = PIXI.Texture.from('/DurumyJSEngine/images/bg/thekingsleap/Background/Windows/windows.png');
    this.Farbgtexture = PIXI.Texture.from('/DurumyJSEngine/images/bg/thekingsleap/Background/Far/far_bg.png');
    this.Columntexture = PIXI.Texture.from('/DurumyJSEngine/images/bg/thekingsleap/Background/Columns/columns.png');
    this.Maintexture = PIXI.Texture.from('/DurumyJSEngine/images/bg/thekingsleap/Midground/Main.png');
    this.Winsprite = new PIXI.Sprite(this.Wintexture);
    this.Farbgsprite = new PIXI.Sprite(this.Farbgtexture);
    this.Columnsprite = new PIXI.Sprite(this.Columntexture);
    this.Mainsprite = new PIXI.Sprite(this.Maintexture);

    //[Obj_Type.END][255];

    this.update = function() 
    {
        for(var i =0; i< this.arrGameObj.length; ++i)
        {
            for(var j =0; j< this.arrGameObj[i].length; ++j)
            {
                if(this.arrGameObj[i][j] != null)
                    this.arrGameObj[i][j].update();

                if(null != this.arrGameObj[i][j].Collider)
                    this.arrGameObj[i][j].Collider.update();
            }
        }
    }
    this.render = function(container) 
    {
       container.addChild(this.Farbgsprite);
       container.addChild(this.Winsprite);
       container.addChild(this.Columnsprite);
       container.addChild(this.Mainsprite);

        for(var i =0; i< this.arrGameObj.length; ++i)
        {            
            for(var j =0; j< this.arrGameObj[i].length; ++j)
            {
                if(this.arrGameObj[i][j] != null)
                    this.arrGameObj[i][j].render(container);


                if(null != this.arrGameObj[i][j].Collider)
                    this.arrGameObj[i][j].Collider.render(container);
            }
        }
    }
}


function Cuphead()
{ 
    this.name = "Player";
    this.State = State.IDLE;
    this.Onfloor = false;
    this.vScale = Vec2(100, 100);
    this.vDir = DIR.NONE;
    this.fJumpTime = 0.0;
    this.fAttackDelay = 0.0;

    this.update = function() 
    {
        if((this.State & State.JUMP) == State.JUMP)
        {
            if(this.fJumpTime > 300.0)
            {
                this.vPos.y += (9.8 * DT)
            }
            else
            {
                this.vPos.y -= 10 * DT
            }
        }
        if(!this.Onfloor) // 바닥에 없을때
        {
            if((this.State & State.JUMP) == State.JUMP) // 점프상태일때
               this.fJumpTime += MS;    
            else
            {
                this.vPos.y += (9.8 * DT);
            }
        }

        switch(this.State)
        {
            case State.IDLE:
                cuphead.changeAnim("cuphead_idle");
                break;
            case State.JUMP:
                cuphead.changeAnim("cuphead_jump");
                break;    
            case State.MOVE:
                cuphead.changeAnim("cuphead_run");
                break;
            case State.ATTACK:
                cuphead.changeAnim("cuphead_aim_str");
                break;
            case State.ATTACK | State.MOVE:
                cuphead.changeAnim("cuphead_run_shoot_str");
                break;
        }
        if((this.State & State.JUMP) == State.JUMP)
        {
            cuphead.changeAnim("cuphead_jump");
        }

        this.Move();
        this.Attack();
        
    }
    this.render = function(container) 
    {
       // this.Anim.render(container);
    }

    this.Move = function ()
    {

        key_left.press = () => {
            this.vPos.x -= 5;
        };
        key_right.press = () => {
            this.vPos.x += 5;
        };
        key_c.press = () => { 
            this.State |= State.JUMP;          
        };
        
        if(((this.State & State.ATTACK) == State.ATTACK) && !((this.State & State.JUMP) == State.JUMP) && !((this.State & State.MOVE) == State.MOVE))
        {            
            if(key_up.isDown)
            {
                cuphead.changeAnim("cuphead_aim_up");
            }
            if(key_down.isDown)
            {
                cuphead.changeAnim("cuphead_aim_down");
            }

            if(key_up.isUp && key_down.isUp)
            {
                cuphead.changeAnim("cuphead_aim_str");
            }
        }

        // dir oper
        //////////////////////////////////////////////////
        if(key_left.isDown)
        {
            this.vPos.x -= 5 * DT;
            this.vDir |= DIR.L;
            this.vDir &= ~DIR.R;
            this.CurrentAnim.Animsprite.scale.x = -1;
        }
        if(key_right.isDown)
        {
            this.vPos.x += 5 * DT;
            this.vDir |= DIR.R;
            this.vDir &= ~DIR.L;
            this.CurrentAnim.Animsprite.scale.x = 1;
        }
        if(key_up.isDown)
        {
            this.vDir |= DIR.U;
        }
        if(key_down.isDown)
        {
            this.vDir |= DIR.D;
        }

        // if(key_left.isUp)
        // {
        //     this.vDir &= ~DIR.L;
        // }
        // if(key_right.isUp)
        // {
        //     this.vDir &= ~DIR.R;
        // }
        if(key_up.isUp)
        {
            this.vDir &= ~DIR.U;
        }
        if(key_down.isUp)
        {
            this.vDir &= ~DIR.D;
        }
        /////////////////////////////////////////////////////

        if(key_left.isDown || key_right.isDown)
        {
            this.State |= State.MOVE;          
        }


        if(key_left.isUp && key_right.isUp)
        {
            this.State &= ~State.MOVE;          
        }   


        this.CurrentAnim.Animsprite.position.set(this.vPos.x, this.vPos.y + (this.vScale.y / 2));

    }
    
    this.Attack = function ()
    {
        this.fAttackDelay += MS;

        if(key_x.isDown)
        {
            if(this.fAttackDelay > 100)
            {
                this.CreateBullet(Vec2(this.vPos.x, this.vPos.y));
                this.fAttackDelay = 0;
            }
        }


        key_x.press = () => {
            this.State |= State.ATTACK; 
            if(this.fAttackDelay > 100)
            {
                var bulletDir = Vec2(0, 0);

                switch(this.vDir)
                {
                    case DIR.U:
                        bulletDir = Vec2(0, -1);
                        break;
                    case DIR.D:
                        bulletDir = Vec2(0, 1);
                        break;                       
                    case DIR.L:
                        bulletDir = Vec2(-1, 0);
                        break;
                    case DIR.R:
                        bulletDir = Vec2(1, 0);
                        break;  
                    case DIR.U | DIR.L:
                        bulletDir = Vec2(-1, -1);
                        break;
                    case DIR.U | DIR.R:
                        bulletDir = Vec2(1, -1);
                        break;  
                    case DIR.D | DIR.L:
                        bulletDir = Vec2(-1, 1);
                        break;
                    case DIR.D | DIR.R:
                        bulletDir = Vec2(1, 1);
                        break;  
                }

                this.CreateBullet(Vec2(this.vPos.x, this.vPos.y), bulletDir);
                this.fAttackDelay = 0;
            }
        };

        if(key_x.isUp)
        {
            this.State &= ~State.ATTACK;          
        }
    }

    this.OnCollisionEnter = function(_Other) 
    {
        if(_Other.Owner.name == "Floor")
        {
            this.State &= ~State.JUMP;
            this.Onfloor = true;
            this.fJumpTime = 0;

        }
    }
    this.OnCollision = function(_Other) 
    {
    }
    this.OnCollisionExit = function(_Other) 
    {
        if(_Other.Owner.name == "Floor")
        {
            this.Onfloor = false;
        }
    }

    this.CreateBullet = function(_vPos, _vDir)
    {
        var bullet = new Bullet(_vPos, _vDir);
        GameScene.arrGameObj[Obj_Type.Bullet].push(bullet);
    }
}



function Bullet(_vPos, _vDir)
{
    this.name = "Bullet";
    this.vScale = Vec2(64, 32);
    this.SetPos(_vPos.x, _vPos.y);
    this.vDir = _vDir;
    this.CreateAnimation("bullet_create", "/DurumyJSEngine/images/bullet/create/bullet_create_", 4, false);
    this.CreateAnimation("bullet", "/DurumyJSEngine/images/bullet/bullet/bullet_", 8, true);
    this.CreateAnimation("bullet_dead", "/DurumyJSEngine/images/bullet/bullet/bullet_", 6, false);
    this.CreateCollider(this, this.vSclae);
    this.playAnim("bullet_create");


    this.update = function()
    {
        this.vPos.x = this.vPos.x * (5 * this.vDir.x * DT);
        this.vPos.y = this.vPos.y * (5 * this.vDir.y * DT);

        if(this.CurrentAnim.name == "bullet_create")
        {
            this.CurrentAnim.Animsprite.onComplete = () => {
                this.changeAnim("bullet");
            };    
        }

        if(this.CurrentAnim.name == "bullet")
        {
            this.CurrentAnim.onComplete = () => {
                this.changeAnim("bullet_dead");
            };    
        }

        if(this.CurrentAnim.name == "bullet_dead")
        {
            this.CurrentAnim.onComplete = () => {
                this.stopAnim();
                //delete this;
            };    
        }
        this.CurrentAnim.Animsprite.position.set(this.vPos.x, this.vPos.y + (this.vScale.y / 2));
    }
    this.render = function(container) 
    {
    }

    this.OnCollisionEnter = function(_Other) 
    {
        if(_Other.Owner.name == "Floor")
        {
            this.changeAnim("bullet_dead");
        }
    }
    this.OnCollision = function(_Other) 
    {
    }
    this.OnCollisionExit = function(_Other) 
    {

    }
}


function Floor()
{
    this.name = "Floor";
    // this.texture = PIXI.Texture.from('/DurumyJSEngine/images/bg/floor.png');
    // this.sprite = new PIXI.Sprite(this.texture);
    this.vScale = Vec2(2048, 64);
    // this.sprite.anchor.set(0.5, 1);

    this.update = function() 
    {
        // this.sprite.position.set(this.vPos.x, this.vPos.y + (this.vScale.y / 2));
    }
    this.render = function(container) 
    {
        // container.addChild(this.sprite);
    }

}


function Animation(_Owner, _Name, _MaxFrame, _loop)
{
    this.Owner = _Owner
    this.name = _Name;
    this.Texture = [];
    this.MaxFrame = _MaxFrame;
    this.Animsprite = null;
    this.loop = _loop;

    this.playAnim = function() 
    {
        app.stage.addChild(this.Animsprite);
        this.Animsprite.play();
        this.Animsprite.animationSpeed = 0.25;
    }

    this.stopAnim = function() 
    {
        app.stage.removeChild(this.Animsprite);
        this.Animsprite.stop();
    }

    this.CreateAnim = function(_x, _y)
    {
        this.Animsprite = new PIXI.AnimatedSprite(this.Texture);
        this.Animsprite.position.set(_x, _y + (this.Owner.vScale.y / 2));
        this.Animsprite.anchor.set(0.5, 1);
        this.Animsprite.loop = this.loop;

    }
}

function Collider(_Owner, _Scale)
{
    this.Owner = _Owner;
    this.id = ++Col_id;
    // 콜라이더의 위치는 owner의 위치에서 y를 Scale의 0.5만큼 빼야한다. (앵커때문)
    this.vPos = this.Owner.vPos;
    this.vScale = _Scale;
    this.rect = null;

    this.update = function() 
    {
        this.vPos = Vec2(this.Owner.vPos.x, this.Owner.vPos.y);
//        this.rect.position.set(this.vPos.x, this.vPos.y)
    }
    this.render = function(container) 
    {
        container.addChild(this.rect);
    }

    this.OnCollisionEnter = function(_Other) 
    {
        this.Owner.OnCollisionEnter(_Other);
    }
    this.OnCollision = function(_Other) 
    {
        this.Owner.OnCollision(_Other);
    }

    this.OnCollisionExit = function(_Other) 
    {
        this.Owner.OnCollisionExit(_Other);
    }

}

function CollisionMgr(_GameScene)
{    
    this.GameScene = _GameScene
    this.id;
    this.mapColInfo = new Map();
    this.arrCheck = [Obj_Type.END];

    this.update = function() 
    {


        for(var i=0; i< Obj_Type.END; ++i)
        {
            for(var j =i; j< Obj_Type.END; ++j)
            {
                //if(this.arrCheck[i] & ( 1 << j))
                    this.CollisionCheck(i, j);
            }
        }

    }

    this.CollisionCheck = function (_GroupTypeA, _GroupTypeB)
    {
        const GroupA = GameScene.arrGameObj[_GroupTypeA];
        const GroupB = GameScene.arrGameObj[_GroupTypeB];


        for(var i =0; i< GroupA.length; ++i)
        {
            for(var j =0; j< GroupB.length; ++j)
            {
                if(null == GroupB[j].Collider || (GroupA[i] == GroupB[j]))
                {
                    continue;
                }

                var colA = GroupA[i].Collider;
                var colB = GroupB[j].Collider;

                var colAid = colA.id.toString();
                var colBid = colB.id.toString();

                this.id = (colAid) + (colBid);                
                
                // set = map에 데이터 저장
                // get = key에따른 value 획득


                var iter =  this.mapColInfo[Symbol.iterator](); // 충돌정보가 없으면 undefined를 가져가겠져 // 해당 위치의 iterator를 반환하도록 받아야함
                
                // map 순회하면서 이 아이디랑 같은지 확인
                for (const item of iter)
                {
                    iter = item;
                    if(item[0] == this.id)
                    {                        
                        break;
                    }
                    else
                    {
                        iter = undefined;
                    }
                }
                
                if(undefined == iter)
                {
                    this.mapColInfo.set(this.id, false);
                    iter = this.mapColInfo.get(this.id);
                }
            
                if(this.IsCollision(colA, colB))
                {
                    if(iter[1]) // 이전틱에도 충돌 중이었다.
                    {                                            
                        if(GroupA[i].IsDead || GroupB[j].IsDead) // 둘 중 하나가 이번틱에 삭제 예정이다.
                        {
                            GroupA[i].Collider.OnCollisionExit(colB);
                            GroupB[j].Collider.OnCollisionExit(colA);
                            this.mapColInfo.set(this.id, false);
                        }
                        else
                        {
                            GroupA[i].Collider.OnCollision(colB); // 여전히 충돌중이다
                            GroupB[j].Collider.OnCollision(colA);
                        }
                    }
                
                    else // 이전틱에 충돌중이지 않았다.
                    {
                        if(!GroupA[i].IsDead && !GroupB[j].IsDead) // 둘 다 살아있다.
                        {                        
                            GroupA[i].Collider.OnCollisionEnter(colB);
                            GroupB[j].Collider.OnCollisionEnter(colA);
                            this.mapColInfo.set(this.id, true);

                        }
                    }
                }
                else // 현재 충돌중이지 않다.
                {
                    if(iter[1]) // 이전에 충돌하고 있었다.
                    {
                        
                        GroupA[i].Collider.OnCollisionExit(colB);
                        GroupB[j].Collider.OnCollisionExit(colA);
                        this.mapColInfo.set(this.id, false);
                    }
                }
            }
        }
    }


    this.IsCollision = function (_colA, _colB)
    {
        var vAPos = Vec2(_colA.vPos.x, _colA.vPos.y);
        var vAScale = Vec2(_colA.rect.width, _colA.rect.height);
        
        var vBPos = Vec2(_colB.vPos.x, _colB.vPos.y);
        var vBScale = Vec2(_colB.rect.width, _colB.rect.height);


        if(Math.abs(vBPos.x - vAPos.x) < (vAScale.x + vBScale.x) / 2.0
        && Math.abs(vBPos.y - vAPos.y) < (vAScale.y + vBScale.y) / 2.0)
        {
            return true;
        }

        return false;
    }

    this.CheckGroup = function (Obj_TypeA, Obj_TypeB)
    {
        var row = Obj_TypeA;
        var col = Obj_TypeB;

        if(col < row)
        {
            row = Obj_TypeB;
            col = Obj_TypeA;
        }

        if(this.arrCheck[row]&(1 << col))
            this.arrCheck[row] &= ~(1<<col);
        else
            this.arrCheck[row] |= (1<<col);
    }
}


Cuphead.prototype = new GameObj();
Floor.prototype = new GameObj();
Bullet.prototype = new GameObj();


var GameScene = new Scene();
var collisionMgr = new CollisionMgr(GameScene);


// ObjInit
var cuphead = new Cuphead();
cuphead.SetPos(100, 100);
cuphead.CreateCollider(100, 100);
var floor = new Floor();
floor.SetPos(512, 700);
floor.CreateCollider(2048, 64);


// 애니메이션 추가
cuphead.CreateAnimation("cuphead_idle", "/DurumyJSEngine/images/cuphead_idle/cuphead_idle_", 9 , true);
cuphead.CreateAnimation("cuphead_run", "/DurumyJSEngine/images/cuphead_run/cuphead_run_", 16, true);
cuphead.CreateAnimation("cuphead_run_shoot_str", "/DurumyJSEngine/images/cuphead_run/shooting/cuphead_run_shoot_", 16, true);
cuphead.CreateAnimation("cuphead_jump", "/DurumyJSEngine/images/cuphead_jump/cuphead_jump_", 8, true);
cuphead.CreateAnimation("cuphead_aim_str", "/DurumyJSEngine/images/cuphead_aim/Straight/cuphead_aim_straight_", 5, true);
cuphead.CreateAnimation("cuphead_aim_up", "/DurumyJSEngine/images/cuphead_aim/Up/cuphead_aim_up_", 5, true);
cuphead.CreateAnimation("cuphead_aim_down", "/DurumyJSEngine/images/cuphead_aim/Down/cuphead_aim_down_", 5, true);

cuphead.playAnim("cuphead_idle");

// OBj추가
GameScene.arrGameObj[Obj_Type.Floor].push(floor);
GameScene.arrGameObj[Obj_Type.Player].push(cuphead);





// GameLoop

// Ticker
// document : https://pixijs.download/dev/docs/PIXI.Ticker.html

// loop 함수의 인자로 deltatime 을 전달해준다
// loop 내의 로직을 stop까지 반복

app.ticker.add(delta => loop(delta));

function loop(delta)
{
    DT = delta;
    MS = app.ticker.elapsedMS;
    
    renderContainer.removeChildren(); // 화면 클리어


    GameScene.update();
    collisionMgr.update();

    GameScene.render(renderContainer);


}




