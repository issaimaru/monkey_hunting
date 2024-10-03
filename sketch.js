// aliases
const Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Constraint = Matter.Constraint,
    Body = Matter.Body,
    Bodies = Matter.Bodies,
    Events = Matter.Events,
    Mouse = Matter.Mouse

const engine = Engine.create()
const render = Render.create({
    element: document.body,
    engine: engine,
})

engine.timing.timeScale = 0.1; // タイムスケールを設定


// 衝突回数をカウントする変数
let collisionCount = 0;

// 衝突回数を表示する要素を取得
const collisionCountElement = document.getElementById('collisionCount');

function reset(){
    World.remove(engine.world, square1);
    square1 = Bodies.rectangle(Math.random() * ( 800 - 400 ) + 400, 100, 20, 20, { 
        mass: 100, 
        friction: 0, 
        frictionAir: 0, 
        restitution: 1, 
        label: 'square1', 
        isStatic: true 
    });
    
    // 新しいsquare1をワールドに追加
    World.add(engine.world, square1);

    World.remove(engine.world, square2);
    square2 = Bodies.circle(200, ground.bounds.max.y - 50, 20, { 
        mass: 1, 
        friction: 0, 
        frictionAir: 0, 
        restitution: 1, 
        label: 'square2'
    });
    
    // 新しいsquare1をワールドに追加
    World.add(engine.world, square2);

    doubledrag = false;
    World.add(engine.world, mouseConstraint);
}

// 衝突イベントリスナーを追加
Matter.Events.on(engine, 'collisionStart', function(event) {
    const pairs = event.pairs;

    // 衝突が発生したペアごとにカウントを増加
    pairs.forEach(pair => {
        console.log(pair.bodyA.id, pair.bodyB.id);
        if (pair.bodyA.label !== 'ground' && pair.bodyB.label !== 'ground' &&pair.bodyB.label !== 'floor3' && pair.bodyA.label !== 'floor3') {
            collisionCount++;
            collisionCountElement.textContent = `スコア: ${collisionCount}`;
        }   
        if (pair.bodyA.id == 'square1' && pair.bodyB.label == 'ground' || pair.bodyA.label == 'ground' && pair.bodyB.label == 'square1') {
            collisionCount =0;
            collisionCountElement.textContent = `スコア: ${collisionCount}`;
            console.log('reset');
            reset();
        }   
        if (pair.bodyA.label == 'square1' && pair.bodyB.label == 'square2' || pair.bodyA.label == 'square2' && pair.bodyB.label == 'square1') {
            reset();
        }  
        if (pair.bodyA.label == 'square2' && pair.bodyB.label == 'floor3' || pair.bodyA.label == 'floor3' && pair.bodyB.label == 'square2') {
            null;
        }    
    });
});


engine.world.gravity.y = 9.81


// 静止オブジェクト(空中の床と地面)【①】
const floor3 = Bodies.rectangle(10, 420, 300, 30, { angle: -Math.PI / 2, isStatic: true, label: 'floor3' });
const ground = Bodies.rectangle(400, 585, 850, 30, { isStatic: true ,label: 'ground'});


// 可動オブジェクト（正方形と円）【②】
var square1 = Bodies.rectangle(Math.random() * ( 800 - 400 ) + 400, 100, 20, 20, { mass: 100, friction: 0, frictionAir:0, restitution: 1, label: 'square1',isStatic:true });
var square2 = Bodies.circle(200, ground.bounds.max.y - 50, 20, { mass: 1,friction: 0 ,frictionAir:0 ,restitution: 1, label: 'square2' });

// オブジェクトの追加【③】
World.add(engine.world, [floor3, ground, square1, square2]);

// 初速度を設定
Matter.Body.setVelocity(square1, { x: 0, y: 0 });
Matter.Body.setVelocity(square2, { x: 0, y: 0 });



// マウスドラッグでオブジェクトを動かす【④】

var MouseConstraint = Matter.MouseConstraint;
var mouseConstraint = MouseConstraint.create(engine);
World.add(engine.world, mouseConstraint);

var dragStart = null;
var dragEnd = null;
var touchedBody = null;

var doubledrag=false;

// マウスのドラッグ開始位置を記録
Matter.Events.on(mouseConstraint, 'mousedown', function(event) {
    if(doubledrag){
        return;
    }
    dragStart = { x: event.mouse.position.x, y: event.mouse.position.y };
    touchedBody = mouseConstraint.body;
    if(touchedBody == null){return;}
    if(touchedBody.label=='square2'){
        square1.isStatic = true;
        square2.isStatic = true;
    }
    console.log(touchedBody.label);
});

// マウスのドラッグ終了位置を記録し、ドラッグ方向にオブジェクトを動かす
Matter.Events.on(mouseConstraint, 'mouseup', function(event) {
    if(doubledrag){
        return;
    }
    dragEnd = { x: event.mouse.position.x, y: event.mouse.position.y };
    if(touchedBody == null){return;}
    if(touchedBody.label=='square2'){
        square1.isStatic = false;
        square2.isStatic = false;
    }else{return;}

    if (dragStart && dragEnd) {
        var velocity = {
            x: (dragEnd.x - dragStart.x) * 0.1, // スケーリングファクターを調整
            y: (dragEnd.y - dragStart.y) * 0.1  // スケーリングファクターを調整
        };

        var maxSpeed = 4; // 最大速度の値を設定
    var speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);

    if (speed > maxSpeed) {
        var scale = maxSpeed / speed;
        velocity.x *= scale;
        velocity.y *= scale;
    }
        
        Matter.Body.setVelocity(square2, velocity);
    }
    
    // リセット
    dragStart = null;
    dragEnd = null;
    touchedBody = null;

    doubledrag = true;

    World.remove(engine.world, mouseConstraint);
});

Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: 810, y: 600 }
});

Engine.run(engine)
Render.run(render)

