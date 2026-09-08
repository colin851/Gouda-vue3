// 统一拼接静态资源路径，避免每个作品重复书写 /img 前缀。
const sequence = (folder, names) => names.map((name) => `/img/${folder}/${name}`)

// 作品数据是画廊卡片、首页入口和详情弹层的唯一数据源。
// 字段约定：id 用于稳定渲染 key；name 是完整标题；shortName 用于详情页大标题；
// cover 是画廊封面，images 按展示顺序保存详情图片。
export const products = [
  { id: 'banshee', name: '1/60 PG BANSHEE NORN GUNDAM', shortName: 'BANSHEE NORN', cover: '/img/pro1.png', images: sequence('banshee', ['pro-detail-15.jpg', 'pro-detail-16.jpg', 'pro-detail-17.jpg', 'pro-detail-18.jpg', 'pro-detail-19.jpg', 'pro-detail-20.jpg', 'pro-detail-21.jpg', 'pro-detail-22.jpg', 'pro-detail-23.jpg']) },
  { id: 'sms', name: '1/100 MG RX-93 νGUNDAM VER. KA', shortName: 'RX-93 νGUNDAM', cover: '/img/pro2.png', images: sequence('mymoneySms', ['1.jpg', '2.jpg', '3.jpg', '4.jpg']) },
  { id: 'gold', name: '1/72 GS ZEON MS-18E KAMPFER', shortName: 'MS-18E KAMPFER', cover: '/img/pro3.png', images: sequence('goldbaby', ['pro-detail-24.jpg', 'pro-detail-25.jpg', 'pro-detail-26.jpg', 'pro-detail-27.jpg', 'pro-detail-28.jpg', 'pro-detail-29.jpg', 'pro-detail-30.jpg', 'pro-detail-31.jpg', 'pro-detail-32.jpg']) },
  { id: 'unicorn', name: '1/60 PG RX-0 UNICORN GUNDAM', shortName: 'UNICORN GUNDAM', cover: '/img/pro4.png', images: sequence('unicorn', Array.from({ length: 17 }, (_, index) => `${index + 1}.jpg`)) },
  { id: 'phenix', name: '1/100 MG UNICORN GUNDAM PHOENIX', shortName: 'UNICORN PHOENIX', cover: '/img/pro5.png', images: sequence('phenix', ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg']) },
  { id: 'kabini', name: '1/90 AMX-004 QUBELEY', shortName: 'AMX-004 QUBELEY', cover: '/img/pro6.png', images: sequence('kabini', Array.from({ length: 14 }, (_, index) => `${index + 1}.jpg`)) },
]

// 进度页只需要图片和显示标签；id 保证 v-for 渲染稳定，图片路径与首页资源保持一致。
export const scheduleItems = [1, 2, 3, 4, 5].map((index) => ({ id: index, image: `/img/${index}.jpg`, label: `WORK ${String(index).padStart(2, '0')}` }))
