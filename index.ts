import bodyParser from "body-parser";
import express, { RequestParamHandler } from 'express'
import { IncomingHttpHeaders } from "http";
import jwt from 'jsonwebtoken'

/**
 * 회원가입을 한 유저의 정보
 */
interface IUser {
	id: string,
	password: string,
	name: string
}

/**
 * Response Body 인터페이스
 */
interface IResponseBody {
	msg: string
	token?: string
}

interface ISettings {
	JWT_SECRET: string
}

interface IApiResponseBody {
	data: number[],
	post: number[],
	name: Pick<IUser, 'name'>
}

const SECRET_KEY = 'secret key';

/**
 * express 서버 개시
 */
const app = express()

const registryUsers: Map<string, IUser> = new Map()

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.set('JWT_SECRET', SECRET_KEY) // JWT의 인코딩/디코딩을 위한 키값. express 인스턴스의 settings 프로퍼티에 설정함

const apiMessages = {
	failed: '인증실패'
}

/**
 * 로그인
 */
const loginMessages = {
	failed: 'login failed',
	success: 'success'
}
app.get<IUser, IResponseBody, null, IUser>('/', (req, res) => {
	const {id, password} = req.query
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

	const {JWT_SECRET} = app.settings
	const payload = {
		name: user.name
	}
	const options = {} // registered 정보

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
app.post<IUser, IResponseBody, IUser>('/', (req, res) => {
	const {id, password, name} = req.body

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
 * 로그인 체크 미들웨어
 */
const loginCheck: RequestParamHandler = (req, res, next) => {
	const {token} = req.headers as IncomingHttpHeaders & { token: string }
	const {JWT_SECRET} = app.settings as ISettings

	if (!token) {
		return res.status(401).json({
			msg: apiMessages.failed
		})
	}

	jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
		console.log('디코딩된 값', decoded);
		if (!decoded) {
			return res.status(401).json({
				msg: apiMessages.failed
			})
		}

		// https://reactgo.com/express-pass-variables-middleware/
		res.locals.user = {
			name: decoded.name
		}
	})
	next()
}
app.get<RequestParamHandler, IApiResponseBody>('/api', loginCheck as any, (req, res) => {
	return res.status(200).json({
		data: [1,2,3,4],
		post: [1,2,3,4],
		name: res.locals.user.name
	})
})

app.listen(3000, () => console.log('started at 3000'))
