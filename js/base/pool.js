const __ = {
  poolDic: Symbol('poolDic')
}

/**
 * 简易的对象池实现
 * 用于对象的存贮和重复使用
 * 可以有效减少对象创建开销和避免频繁的垃圾回收
 * 提高游戏性能
 */
export default class Pool {
  constructor() {
    this[__.poolDic] = {}
  }

  /**
   * 根据对象标识符
   * 获取对应的对象池
   */
  getPoolBySign(name) {
    return this[__.poolDic][name] || ( this[__.poolDic][name] = [] )
  }

  /**
   * 根据传入的对象标识符，查询对象池
   * 对象池为空创建新的类，否则从对象池中取
   */
  getItemByClass(name, className, properties) {
    let pool = this.getPoolBySign(name)

    /*
    let result = (  pool.length
                  ? pool.shift()
                  : new className()  )

    return result
    */

    /*对象获取我们加入对象属性的判断，当有传入对象属性时，我们获取所有属性值一致的已回收对象，
     *若没有找到或者对象池为空时，则用属性创建新对象*/

    if (pool.length === 0) return new className(properties);

    if (!properties) return pool.shift();

    const index = pool.findIndex(item => {
      return Object.keys(properties).every(property => {
        return item[property] === properties[property];
      });
    });
    return index !== -1 ? pool.splice(index, 1)[0] : new className(properties)
  }

  /**
   * 将对象回收到对象池
   * 方便后续继续使用
   */
  recover(name, instance) {
    this.getPoolBySign(name).push(instance)
  }
}
