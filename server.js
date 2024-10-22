const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 5000;
const SECRET_KEY = 'your_jwt_secret_key_your-very-secure-secret-key';

app.use(cors());
app.use(express.json());

// 간단한 사용자 데이터베이스 (데모용)
const users = [
    {
        id: 1,
        username: 'qwer',
        password: bcrypt.hashSync('asdf', 8) // 'password123' 해시
    }
];

// 로그인 요청 처리
app.post('/login', (req, res) => {
    console.log(req.body);  // 요청이 제대로 도착했는지 로그로 확인
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    });
});

// 인증된 사용자 확인

app.get('/protected', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];  // Bearer 토큰 추출
    if (!token) {
        return res.status(401).json({ message: 'Access Denied' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid Token' });
        }
        res.json({ message: 'Access to protected resource granted', user });
    });
});



app.get('/', (req, res) => {
    res.send(`${PORT}번 포트에서 서버가 실행중입니다.`);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
