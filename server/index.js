import express from 'express'
import cors from 'cors'
import pg from 'pg'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const { Pool } = pg
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = 3000

// 中间件
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// 数据库连接配置（请根据实际情况修改）
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'voice_badcase',
  password: 'your_password',
  port: 5432,
})

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /audio\/(mpeg|wav|mp3|ogg|m4a)/
    if (allowedTypes.test(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('只支持音频文件上传'))
    }
  }
})

// 初始化数据库表
const initDatabase = async () => {
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS badcases (
        id SERIAL PRIMARY KEY,
        problem_text TEXT NOT NULL,
        audio_url TEXT,
        problem_description TEXT NOT NULL,
        detail_description TEXT,
        priority VARCHAR(10) NOT NULL,
        feedback_source VARCHAR(100),
        feedback_date DATE,
        feedback_person VARCHAR(100),
        creator VARCHAR(100),
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // 创建更新时间触发器
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `)
    
    await client.query(`
      DROP TRIGGER IF EXISTS update_badcases_updated_at ON badcases;
      CREATE TRIGGER update_badcases_updated_at
      BEFORE UPDATE ON badcases
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `)
    
    console.log('数据库表初始化成功')
  } catch (error) {
    console.error('数据库初始化失败:', error)
  } finally {
    client.release()
  }
}

// API路由

// 获取badcase列表
app.get('/api/badcases', async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      searchText,
      status,
      priority,
      startDate,
      endDate
    } = req.query

    let whereConditions = []
    let params = []
    let paramIndex = 1

    if (searchText) {
      whereConditions.push(`problem_text ILIKE $${paramIndex}`)
      params.push(`%${searchText}%`)
      paramIndex++
    }

    if (status) {
      whereConditions.push(`status = $${paramIndex}`)
      params.push(status)
      paramIndex++
    }

    if (priority) {
      whereConditions.push(`priority = $${paramIndex}`)
      params.push(priority)
      paramIndex++
    }

    if (startDate && endDate) {
      whereConditions.push(`feedback_date BETWEEN $${paramIndex} AND $${paramIndex + 1}`)
      params.push(startDate, endDate)
      paramIndex += 2
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : ''

    const offset = (parseInt(page) - 1) * parseInt(pageSize)

    // 获取总数
    const countQuery = `SELECT COUNT(*) FROM badcases ${whereClause}`
    const countResult = await pool.query(countQuery, params)
    const total = parseInt(countResult.rows[0].count)

    // 获取数据
    const dataQuery = `
      SELECT 
        id,
        problem_text as "problemText",
        audio_url as "audioUrl",
        problem_description as "problemDescription",
        detail_description as "detailDescription",
        priority,
        feedback_source as "feedbackSource",
        feedback_date as "feedbackDate",
        feedback_person as "feedbackPerson",
        creator,
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM badcases 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    params.push(pageSize, offset)

    const result = await pool.query(dataQuery, params)

    res.json({
      data: result.rows,
      total
    })
  } catch (error) {
    console.error('获取数据失败:', error)
    res.status(500).json({ error: '获取数据失败' })
  }
})

// 获取单个badcase
app.get('/api/badcases/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      `SELECT 
        id,
        problem_text as "problemText",
        audio_url as "audioUrl",
        problem_description as "problemDescription",
        detail_description as "detailDescription",
        priority,
        feedback_source as "feedbackSource",
        feedback_date as "feedbackDate",
        feedback_person as "feedbackPerson",
        creator,
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM badcases 
      WHERE id = $1`,
      [id]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '记录不存在' })
    }
    
    res.json(result.rows[0])
  } catch (error) {
    console.error('获取数据失败:', error)
    res.status(500).json({ error: '获取数据失败' })
  }
})

// 创建badcase
app.post('/api/badcases', async (req, res) => {
  try {
    const {
      problemText,
      audioUrl,
      problemDescription,
      detailDescription,
      priority,
      feedbackSource,
      feedbackDate,
      feedbackPerson,
      creator,
      status
    } = req.body

    const result = await pool.query(
      `INSERT INTO badcases (
        problem_text, audio_url, problem_description, detail_description,
        priority, feedback_source, feedback_date, feedback_person,
        creator, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING 
        id,
        problem_text as "problemText",
        audio_url as "audioUrl",
        problem_description as "problemDescription",
        detail_description as "detailDescription",
        priority,
        feedback_source as "feedbackSource",
        feedback_date as "feedbackDate",
        feedback_person as "feedbackPerson",
        creator,
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
      `,
      [
        problemText, audioUrl, problemDescription, detailDescription,
        priority, feedbackSource, feedbackDate, feedbackPerson,
        creator, status
      ]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('创建数据失败:', error)
    res.status(500).json({ error: '创建数据失败' })
  }
})

// 更新badcase
app.put('/api/badcases/:id', async (req, res) => {
  try {
    const { id } = req.params
    const {
      problemText,
      audioUrl,
      problemDescription,
      detailDescription,
      priority,
      feedbackSource,
      feedbackDate,
      feedbackPerson,
      creator,
      status
    } = req.body

    const result = await pool.query(
      `UPDATE badcases SET
        problem_text = $1,
        audio_url = $2,
        problem_description = $3,
        detail_description = $4,
        priority = $5,
        feedback_source = $6,
        feedback_date = $7,
        feedback_person = $8,
        creator = $9,
        status = $10
      WHERE id = $11
      RETURNING 
        id,
        problem_text as "problemText",
        audio_url as "audioUrl",
        problem_description as "problemDescription",
        detail_description as "detailDescription",
        priority,
        feedback_source as "feedbackSource",
        feedback_date as "feedbackDate",
        feedback_person as "feedbackPerson",
        creator,
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
      `,
      [
        problemText, audioUrl, problemDescription, detailDescription,
        priority, feedbackSource, feedbackDate, feedbackPerson,
        creator, status, id
      ]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '记录不存在' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('更新数据失败:', error)
    res.status(500).json({ error: '更新数据失败' })
  }
})

// 删除badcase
app.delete('/api/badcases/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('DELETE FROM badcases WHERE id = $1 RETURNING id', [id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '记录不存在' })
    }
    
    res.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除数据失败:', error)
    res.status(500).json({ error: '删除数据失败' })
  }
})

// 上传音频文件
app.post('/api/upload-audio', upload.single('audio'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '未上传文件' })
    }
    
    const fileUrl = `/uploads/${req.file.filename}`
    res.json({ url: fileUrl })
  } catch (error) {
    console.error('上传文件失败:', error)
    res.status(500).json({ error: '上传文件失败' })
  }
})

// 获取统计数据
app.get('/api/statistics', async (req, res) => {
  try {
    // 总数统计
    const totalResult = await pool.query('SELECT COUNT(*) as count FROM badcases')
    const totalCount = parseInt(totalResult.rows[0].count)

    // 已解决数量（已上线并验证 + 已关闭）
    const resolvedResult = await pool.query(
      "SELECT COUNT(*) as count FROM badcases WHERE status IN ('已上线并验证', '已关闭')"
    )
    const resolvedCount = parseInt(resolvedResult.rows[0].count)

    // 进行中数量（修复中 + 待确认）
    const inProgressResult = await pool.query(
      "SELECT COUNT(*) as count FROM badcases WHERE status IN ('修复中', '待确认')"
    )
    const inProgressCount = parseInt(inProgressResult.rows[0].count)

    // 高优先级数量（P00 + P0）
    const highPriorityResult = await pool.query(
      "SELECT COUNT(*) as count FROM badcases WHERE priority IN ('P00', 'P0')"
    )
    const highPriorityCount = parseInt(highPriorityResult.rows[0].count)

    // 状态分布
    const statusDistResult = await pool.query(
      'SELECT status, COUNT(*) as count FROM badcases GROUP BY status ORDER BY count DESC'
    )
    const statusDistribution = statusDistResult.rows

    // 优先级分布
    const priorityDistResult = await pool.query(
      'SELECT priority, COUNT(*) as count FROM badcases GROUP BY priority ORDER BY count DESC'
    )
    const priorityDistribution = priorityDistResult.rows

    // 近30天反馈趋势
    const trendResult = await pool.query(`
      SELECT 
        DATE(feedback_date) as date,
        COUNT(*) as count
      FROM badcases
      WHERE feedback_date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(feedback_date)
      ORDER BY date ASC
    `)
    const dailyTrend = trendResult.rows

    // 反馈来源分布
    const sourceDistResult = await pool.query(
      'SELECT feedback_source as source, COUNT(*) as count FROM badcases GROUP BY feedback_source ORDER BY count DESC LIMIT 10'
    )
    const sourceDistribution = sourceDistResult.rows

    res.json({
      totalCount,
      resolvedCount,
      inProgressCount,
      highPriorityCount,
      statusDistribution,
      priorityDistribution,
      dailyTrend,
      sourceDistribution,
    })
  } catch (error) {
    console.error('获取统计数据失败:', error)
    res.status(500).json({ error: '获取统计数据失败' })
  }
})

// 启动服务器
const startServer = async () => {
  await initDatabase()
  app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`)
  })
}

startServer()

