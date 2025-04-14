const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 导入单词数据
const cet4Words = require('../data/cet4');
const cet6Words = require('../data/cet6');

// 配置环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 存储已返回的单词，避免重复
const returnedWords = {
  cet4: new Set(),
  cet6: new Set()
};

// 获取随机单词的函数
function getRandomWords(wordList, count = 1, returnedSet) {
  const result = [];
  const availableWords = wordList.filter(word => !returnedSet.has(word.word));
  
  // 如果所有单词都已返回过，则重置
  if (availableWords.length === 0) {
    returnedSet.clear();
    return getRandomWords(wordList, count, returnedSet);
  }
  
  // 如果可用单词少于请求数量，返回所有可用单词
  if (availableWords.length <= count) {
    availableWords.forEach(word => returnedSet.add(word.word));
    return availableWords;
  }
  
  // 随机选择单词
  while (result.length < count && availableWords.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const selectedWord = availableWords.splice(randomIndex, 1)[0];
    returnedSet.add(selectedWord.word);
    result.push(selectedWord);
  }
  
  return result;
}

// 路由
app.get('/', (req, res) => {
  res.json({ message: '欢迎使用单词 API！' });
});

// 获取单词 API
app.get('/api/words', (req, res) => {
  const { level = 'cet4', count = 5 } = req.query;
  let wordList;
  let returnedSet;
  
  switch (level.toLowerCase()) {
    case 'cet6':
      wordList = cet6Words;
      returnedSet = returnedWords.cet6;
      break;
    case 'cet4':
    default:
      wordList = cet4Words;
      returnedSet = returnedWords.cet4;
      break;
  }
  
  const words = getRandomWords(wordList, parseInt(count), returnedSet);
  res.json({ words });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
