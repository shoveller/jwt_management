import bodyParser from "body-parser";
import express from 'express'
import jwt from 'jsonwebtoken'

const SECRET_KEY = 'secret key';

/**
 * express 서버 개시
 */
const app = express()

/**
 * 회원가입을 한 유저의 정보
 */
interface IUser {
	id: string,
	password: string,
	name: string
}

const registryUsers: Map<string, IUser> = new Map()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.set('JWT_SECRET', SECRET_KEY) // JWT의 인코딩/디코딩을 위한 키값

const loginCheck: express.RequestHandler = (req, res,next) => {
	next()
}

/**
 * 로그인
 */
const loginMessages = {
	failed: 'login failed',
	success: 'success'
}
app.get('/', (req, res) => {
	const { id = '', password = '' }: Partial<IUser> = req.query
	const user = registryUsers.get(id)

	if (!user) {
		return res.status(401).json({
			msg: loginMessages.failed
		})
	}

	if (user.password !== password) {
		return res.status(401).json({
			msg: loginMessages.failed
		})
	}

	const { JWT_SECRET } = app.settings
	const payload = {
		name: user.name
	}
	const options = { } // registered 정보

	/**
	 * JWT 토큰을 생성해서 반환한다
	 */
	jwt.sign(payload, JWT_SECRET, options, (err, token) => {
		return res.status(201).json({
			token,
			msg: loginMessages.success
		})
	})
})

/**
 * 회원가입
 */
const registerMessages = {
	registed: '이미 등록되어 있습니다.',
	success: 'success'
}
app.post('/', (req, res) => {
	const { id, password, name }: Partial<IUser> = req.body

	if (id === undefined || password === undefined || name === undefined) {
		return res.status(404)
	}

	if (registryUsers.get(id)) {
		return res.status(200).json({
			msg: registerMessages.registed
		})
	}

	/**
	 * 유저정보 저장
	 */
	registryUsers.set(id, {
		id, password, name
	})

	return res.status(201).json({
		msg: registerMessages.success,
	})
})

/**
 * 로그인이 필요한 정보요청
 */
app.get('/api', loginCheck, (req, res, next) => {

})

app.listen(3000, () => console.log('started at 3000'))
