import express from 'express'
import bodyParser from "body-parser";
import jwt from 'jsonwebtoken'

const SECRET_KEY = 'secret key';

/**
 * express 서버 개시
 */
const app = express()

/**
 * 회원가입 한 유저의 정보
 */
let registryUsers ={

}

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.set('JWT_SECRET', SECRET_KEY) // JWT의 인코딩/디코딩을 위한 키값

const loginCheck: express.RequestHandler = (req, res,next) => {
	next()
}

/**
 * 로그인
 */
app.get('/', (req, res, next) => {

})

/**
 * 회원가입
 */
app.post('/', (req, res, next) => {

})

/**
 * 로그인이 필요한 정보요청
 */
app.get('/api', loginCheck, (req, res, next) => {

})

app.listen(3000, () => console.log('started at 3000'))
