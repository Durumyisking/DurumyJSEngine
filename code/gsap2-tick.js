

const app = new PIXI.Application({ background: '#1099bb' });

document.body.appendChild(app.view);

// Tweenmax ticker사용을 위한 ticker 자동실행 멈춤
app.ticker.stop();
TweenMax.ticker.addEventListener('tick', () => {
    app.ticker.update();
});

const container = new PIXI.Container();

app.stage.addChild(container);

// 텍스처 로드
const texture = PIXI.Texture.from('../sprite.png');

for (let i = 0; i < 25; i++) {
    const bunny = new PIXI.Sprite(texture);
    bunny.anchor.set(0.5); // 중심축을 중앙으로  <0 LT 1RB 0.5 Center>
    bunny.x = (i % 5) * 40;
    bunny.y = Math.floor(i / 5) * 40;
    container.addChild(bunny);
}

// 컨테이너를 윈도우 중앙으로
container.x = app.screen.width / 2;
container.y = app.screen.height / 2;

// 컨테이너 중앙에 토끼 생성
container.pivot.x = container.width / 2;
container.pivot.y = container.height / 2;


// Listen for animate update
app.ticker.add((delta) => {
    container.rotation -= 0.01 * delta;
});
