import mitt from 'mitt'

enum EmitterEvents {
  // 数据加载完成
  DATA_LOADED = 'data-loaded',
}

const emitter = mitt<Record<EmitterEvents, any>>()

export { EmitterEvents, emitter }
