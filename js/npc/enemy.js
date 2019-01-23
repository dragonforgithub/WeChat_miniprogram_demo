import Animation from '../base/animation'
import DataBus   from '../databus'
import Bullet from '../player/bullet' //aad1

const ENEMY_IMG_SRC = 'images/enemy.png'
const SG_IMG_SRC = 'images/sg.png'
const ENEMY_WIDTH   = 60
const ENEMY_HEIGHT  = 60

const __ = {
  speed: Symbol('speed')
}

let databus = new DataBus()

function rnd(start, end){
  return Math.floor(Math.random() * (end - start) + start)
}

export default class Enemy extends Animation {
  constructor() {
    super(ENEMY_IMG_SRC, ENEMY_WIDTH, ENEMY_HEIGHT)

    this.initExplosionAnimation()
  }

  init(speed) {
    this.x = rnd(0, window.innerWidth - ENEMY_WIDTH)
    this.y = -this.height

    this[__.speed] = speed

    this.visible = true
  }

  // 预定义爆炸的帧动画
  initExplosionAnimation() {
    let frames = []

    const EXPLO_IMG_PREFIX  = 'images/explosion'
    const EXPLO_FRAME_COUNT = 19

    for ( let i = 0;i < EXPLO_FRAME_COUNT;i++ ) {
      frames.push(EXPLO_IMG_PREFIX + (i + 1) + '.png')
    }

    this.initFrames(frames)
  }

  // 每一帧更新子弹位置
  update() {
    this.y += this[__.speed]

    // 对象回收
    if ( this.y > window.innerHeight + this.height )
      databus.removeEnemey(this)
  }

  /**
   * 敌机射击操作
   * 射击时机由外部决定
   */
  shoot() {
    //const bullet = databus.pool.getItemByClass('bullet', Bullet);
    const bullet = databus.pool.getItemByClass('bullet', Bullet, { direction: 'down', owner: this });
    bullet.init(
      this.x + this.width / 2 - bullet.width / 2,
      this.y + 10,
      this[__.speed] + 5 //子弹比自身速度快5
    );

    databus.bullets.push(bullet);
  }
}
