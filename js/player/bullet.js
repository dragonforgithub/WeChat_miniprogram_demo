import Sprite   from '../base/sprite'
import DataBus  from '../databus'

const BULLET_IMG_SRC = 'images/bullet.png'
const BULLET_DOWN_IMG_SRC = 'images/bullet_down.png' //add1
const BULLET_WIDTH   = 16
const BULLET_HEIGHT  = 30

const __ = {
  speed: Symbol('speed')
}

let databus = new DataBus()

export default class Bullet extends Sprite {

  /*
  constructor() {
    super(BULLET_IMG_SRC, BULLET_WIDTH, BULLET_HEIGHT)
  }*/

  /*给每个子弹设置归属*/
  constructor({ direction, owner } = { direction: 'up' }) {
    super(direction === 'up' ? BULLET_IMG_SRC : BULLET_DOWN_IMG_SRC, BULLET_WIDTH, BULLET_HEIGHT)

    this.direction = direction;

    this.owner = owner;
  }

  init(x, y, speed) {
    this.x = x
    this.y = y

    this[__.speed] = speed

    this.visible = true
  }

  // 每一帧更新子弹位置
  update() {
    /*
    this.y -= this[__.speed]

    // 超出屏幕外回收自身
    if ( this.y < -this.height )
      databus.removeBullets(this)
      */

    // aad1
    if (this.direction === 'up') {
      this.y -= this[__.speed]

      // 超出屏幕顶部回收自身
      if (this.y < -this.height)
        databus.removeBullets(this)
    } else {
      this.y += this[__.speed]

      // 超出屏幕底部回收自身
      if (this.y > window.innerHeight + this.height)
        databus.removeBullets(this)
    }
  }
}
