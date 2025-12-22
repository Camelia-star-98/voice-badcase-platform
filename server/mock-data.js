import pg from 'pg'

const { Pool } = pg

// 数据库连接配置（与server/index.js保持一致）
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'voice_badcase',
  password: 'your_password',
  port: 5432,
})

const mockData = [
  {
    problemText: 'farmer 后边的/mer/没有发出/m/r的音',
    problemDescription: '谜错',
    priority: 'P00',
    status: '修复中',
    feedbackDate: '2025-08-22',
    feedbackPerson: '张未',
    creator: '张未'
  },
  {
    problemText: 'Look! This is a farmer. /ɑr/, /ɜr/, farmer.',
    problemDescription: '谜错',
    priority: 'P00',
    status: '修复中',
    feedbackDate: '2025-08-22',
    feedbackPerson: '张未',
    creator: '张未'
  },
  {
    problemText: 'excuse',
    problemDescription: '发音不标准，应该读/ɪkˈskju:z/',
    priority: 'P00',
    status: '修复中',
    feedbackDate: '2025-06-30',
    feedbackPerson: '张未',
    creator: '张未'
  },
  {
    problemText: 'muse',
    problemDescription: '发音不标准，应该读/mjuːz/',
    priority: 'P00',
    status: '修复中',
    feedbackDate: '2025-06-30',
    feedbackPerson: '张未',
    creator: '张未'
  },
  {
    problemText: 'led',
    problemDescription: '应该读/led/，现在读音有误',
    priority: 'P00',
    status: '修复中',
    feedbackDate: '2025-06-30',
    feedbackPerson: '张未',
    creator: '张未'
  },
  {
    problemText: "Let's focus on our word, /k/, /e/, /g/, keg.",
    problemDescription: '单词keg，在不同文本中读音不一致',
    priority: 'P00',
    status: '修复中',
    feedbackDate: '2025-06-30',
    feedbackPerson: '张未',
    creator: '张未'
  },
  {
    problemText: 'Please remember, /k/, /e/, /g/, keg.',
    problemDescription: '单词keg，在不同文本中读音不一致',
    priority: 'P00',
    status: '修复中',
    feedbackDate: '2025-06-30',
    feedbackPerson: '张未',
    creator: '张未'
  },
  {
    problemText: 'You said /ʃ/ very clearly.',
    problemDescription: '里面的/ʃ/读错佛像/tʃ/',
    priority: 'P00',
    status: '修复中',
    feedbackDate: '2025-06-30',
    feedbackPerson: '张未',
    creator: '张未'
  },
  {
    problemText: "Say with me, O, X, /ɒks/, box.",
    problemDescription: "box的'b'不发音",
    priority: 'P00',
    status: '已上线并验证',
    feedbackDate: '2025-06-27',
    feedbackPerson: '张未',
    creator: '张未'
  },
  {
    problemText: 'Say with me, /bɒks/.',
    problemDescription: "'b'不发音，音标的/b/也不发出",
    priority: 'P00',
    status: '已上线并验证',
    feedbackDate: '2025-06-27',
    feedbackPerson: '张未',
    creator: '张未'
  },
  {
    problemText: '1. He has a bill. 2. She has a bill. 3. There is a bill.',
    problemDescription: 'bill在某些句子中存在错误',
    priority: 'P1',
    status: '修复中',
    feedbackDate: '2025-05-23',
    feedbackPerson: '申春晓',
    creator: '陈宇 cy'
  },
  {
    problemText: 'Ese draws chess pieces.',
    problemDescription: 'chess的发音像jess',
    priority: 'P1',
    status: '修复中',
    feedbackDate: '2025-05-23',
    feedbackPerson: '申春晓',
    creator: '陈宇 cy'
  },
  {
    problemText: "Good guess. Now let's read and find out.",
    problemDescription: '"read"识别为过去分词，念成/red/',
    priority: 'P0',
    status: '已上线并验证',
    feedbackDate: '2025-03-06',
    feedbackPerson: '陈宇 cy',
    creator: '陈宇 cy'
  },
  {
    problemText: 'led',
    problemDescription: '"led"识别为"l e d"三个字母，读/el i: di:/',
    priority: 'P2',
    status: '停顿',
    feedbackDate: '2025-03-06',
    feedbackPerson: '陈宇 cy',
    creator: '陈宇 cy'
  },
  {
    problemText: "Hey, dear, OK? let's focus on this one, OK?",
    problemDescription: '"OK"识别为"O K"两个字母，读/əʊ keɪ/',
    priority: 'P2',
    status: '停顿',
    feedbackDate: '2025-03-06',
    feedbackPerson: '陈宇 cy',
    creator: '陈宇 cy'
  },
  {
    problemText: "Let's read and find the answer.",
    problemDescription: '"read"识别为过去分词读法/red/',
    priority: 'P0',
    status: '已上线并验证',
    feedbackDate: '2025-05-16',
    feedbackPerson: '陈宇 cy',
    creator: '陈宇 cy'
  }
]

const insertMockData = async () => {
  const client = await pool.connect()
  try {
    console.log('开始插入模拟数据...')
    
    for (const item of mockData) {
      await client.query(
        `INSERT INTO badcases (
          problem_text, problem_description, priority, status,
          feedback_date, feedback_person, creator
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          item.problemText,
          item.problemDescription,
          item.priority,
          item.status,
          item.feedbackDate,
          item.feedbackPerson,
          item.creator
        ]
      )
    }
    
    console.log(`成功插入 ${mockData.length} 条数据`)
  } catch (error) {
    console.error('插入数据失败:', error)
  } finally {
    client.release()
    pool.end()
  }
}

insertMockData()

