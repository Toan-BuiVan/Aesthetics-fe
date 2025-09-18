import axios from 'axios';
import classNames from 'classnames/bind';
import { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faCode, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import styles from './Login.module.scss';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

const cx = classNames.bind(styles);

function Login({ onClose, setSuccessMessage }) {
    const [isLoginForm, setIsLoginForm] = useState(true);
    const [error, setError] = useState(null);
    const wrapperRef = useRef(null);
    const loginTitleRef = useRef(null);
    const registerTitleRef = useRef(null);

    const loginFunction = () => {
        setIsLoginForm(true);
        if (wrapperRef.current) {
            wrapperRef.current.style.height = '500px';
        }
        if (loginTitleRef.current) {
            loginTitleRef.current.style.top = '50%';
            loginTitleRef.current.style.opacity = '1';
        }
        if (registerTitleRef.current) {
            registerTitleRef.current.style.top = '50px';
            registerTitleRef.current.style.opacity = '0';
        }
    };

    const registerFunction = () => {
        setIsLoginForm(false);
        if (wrapperRef.current) {
            wrapperRef.current.style.height = '580px';
        }
        if (loginTitleRef.current) {
            loginTitleRef.current.style.top = '-60px';
            loginTitleRef.current.style.opacity = '0';
        }
        if (registerTitleRef.current) {
            registerTitleRef.current.style.top = '50%';
            registerTitleRef.current.style.opacity = '1';
        }
    };

    useEffect(() => {
        loginFunction();
    }, []);

    const handleLogin = async (event) => {
        event.preventDefault();

        const userName = document.getElementById('log-email').value;
        const password = document.getElementById('log-pass').value;

        try {
            const response = await axios.post('http://localhost:5262/api/Authentication/Login_Account', {
                userName,
                password,
            });
            const data = response.data;

            if (data.responseCode === 1) {
                const message = data.responseMessage || 'Đăng nhập thành công!';
                setSuccessMessage(message);

                localStorage.setItem('token', data.token);
                localStorage.setItem('refreshToken', data.refreshToken);
                localStorage.setItem('userID', data.userID);
                localStorage.setItem('typePerson', data.typePerson);
                localStorage.setItem('deviceName', data.deviceName);
                localStorage.setItem('userName', data.userName);

                setTimeout(() => {
                    setSuccessMessage(null);
                    onClose();
                }, 2500);
            } else {
                const message = data.responseMessage || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
                setSuccessMessage(message);
                setTimeout(() => {
                    setSuccessMessage(null);
                    onClose();
                }, 2000);
            }
        } catch (err) {
            console.error('Lỗi đăng nhập:', err);
        }
    };

    const handleRegister = async (event) => {
        event.preventDefault();

        const userName = document.getElementById('reg-name').value;
        const passWord = document.getElementById('reg-pass').value;
        const referralCode = document.getElementById('reg-code').value || null;
        const agree = document.getElementById('agree').checked;

        if (!userName || !passWord) {
            setSuccessMessage('Vui lòng nhập đầy đủ tên người dùng và mật khẩu.');
            return;
        }

        if (!agree) {
            setSuccessMessage('Vui lòng đồng ý với các điều khoản và điều kiện.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5262/api/Users/Create_Account', {
                userName,
                passWord,
                referralCode,
                typePersson: 'Customer',
            });
            const data = response.data;
            console.log('Phản hồi từ API:', data);
            if (data.responseCode === 1) {
                const message = data.resposeMessage;
                setSuccessMessage(message);
                setTimeout(() => {
                    setSuccessMessage(null);
                    loginFunction();
                }, 3500);
            } else {
                const message = data.resposeMessage;
                setSuccessMessage(message);
            }
        } catch (err) {
            setSuccessMessage('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
        }
    };

    const handleGoogleLogin = () => {
        const popup = window.open(
            'http://localhost:5262/api/Authentication/login-google',
            'googleLogin',
            'width=600,height=600',
        );
        if (!popup) {
            console.error('Popup bị chặn hoặc không mở được');
            setSuccessMessage('Vui lòng cho phép popup để đăng nhập Google');
            return;
        }

        const handleMessage = (event) => {
            console.log('Received message from:', event.origin);
            console.log('Data:', event.data);
            if (event.origin === 'http://localhost:5262') {
                const data = event.data;
                localStorage.setItem('token', data.Token);
                localStorage.setItem('refreshToken', data.RefreshToken);
                localStorage.setItem('userID', data.UserID);
                localStorage.setItem('typePerson', data.TypePerson);
                localStorage.setItem('deviceName', data.DeviceName);
                localStorage.setItem('userName', data.UserName);
                console.log('Data saved to localStorage:', localStorage.getItem('token'));
                popup.close();
                window.removeEventListener('message', handleMessage);
                setSuccessMessage('Đăng nhập Google thành công!');
                setTimeout(() => {
                    setSuccessMessage(null);
                    onClose();
                }, 2500);
            }
        };
        window.addEventListener('message', handleMessage);
    };
    return (
        <div className={cx('wrapper')} ref={wrapperRef}>
            <div className={cx('form-header')}>
                <div className={cx('titles')}>
                    <div className={cx('title-login')} ref={loginTitleRef}>
                        Login
                    </div>
                    <div className={cx('title-register')} ref={registerTitleRef}>
                        Register
                    </div>
                </div>
            </div>
            <form onSubmit={handleLogin} className={cx('login-form', { active: isLoginForm })} autoComplete="off">
                <div className={cx('input-box')}>
                    <input type="text" className={cx('input-field')} id="log-email" required />
                    <label htmlFor="log-email" className={cx('label')}>
                        Tài Khoản
                    </label>
                    <FontAwesomeIcon className={cx('bx', 'bx-envelope', 'icon')} icon={faEnvelope}></FontAwesomeIcon>
                </div>
                <div className={cx('input-box')}>
                    <input type="password" className={cx('input-field')} id="log-pass" required />
                    <label htmlFor="log-pass" className={cx('label')}>
                        Mật Khẩu
                    </label>
                    <FontAwesomeIcon className={cx('bx', 'bx-lock-alt', 'icon')} icon={faLock}></FontAwesomeIcon>
                </div>
                <div className={cx('form-cols')}>
                    <div className={cx('col-1')}></div>
                    <div className={cx('col-2')}>
                        <a href="#">Quên mật khẩu?</a>
                    </div>
                </div>
                <div className={cx('input-box')}>
                    <button type="submit" className={cx('btn-submit')} id="SignInBtn">
                        Đăng Nhập
                        <FontAwesomeIcon className={cx('bx', 'bx-log-in')} icon={faUserPlus}></FontAwesomeIcon>
                    </button>
                </div>
                {/* Thêm button Google login ở đây */}
                <div className={cx('input-box')}>
                    <button type="button" className={cx('btn-submit', 'btn-google')} onClick={handleGoogleLogin}>
                        Đăng nhập bằng Google
                        <FontAwesomeIcon icon={faGoogle} className={cx('google-icon')} />
                    </button>
                </div>
                <div className={cx('switch-form')}>
                    <span>
                        Chưa có tài khoản?{' '}
                        <a href="#" onClick={registerFunction}>
                            Đăng Kí
                        </a>
                    </span>
                </div>
            </form>
            <form
                onSubmit={handleRegister}
                className={cx('register-form', { active: !isLoginForm })}
                autoComplete="off"
            >
                <div className={cx('input-box')}>
                    <input type="text" className={cx('input-field')} id="reg-name" required />
                    <label htmlFor="reg-name" className={cx('label')}>
                        Tài Khoản
                    </label>
                    <FontAwesomeIcon className={cx('bx', 'bx-user', 'icon')} icon={faUser}></FontAwesomeIcon>
                </div>
                <div className={cx('input-box')}>
                    <input type="password" className={cx('input-field')} id="reg-pass" required />
                    <label htmlFor="reg-pass" className={cx('label')}>
                        Mật Khẩu
                    </label>
                    <FontAwesomeIcon className={cx('bx', 'bx-lock-alt', 'icon')} icon={faLock}></FontAwesomeIcon>
                </div>
                <div className={cx('input-box')}>
                    <input type="text" className={cx('input-field')} id="reg-code" />
                    <label htmlFor="reg-pass" className={cx('label')}>
                        Mã Giới Thiệu
                    </label>
                    <FontAwesomeIcon className={cx('fa-solid', 'fa-code')} icon={faCode}></FontAwesomeIcon>
                </div>
                <div className={cx('form-cols')}>
                    <div className={cx('col-1')}>
                        <input type="checkbox" id="agree" />
                        <label htmlFor="agree">Đồng ý với các điều khoản và điều kiện</label>
                    </div>
                    <div className={cx('col-2')}></div>
                </div>
                <div className={cx('input-box')}>
                    <button className={cx('btn-submit')} id="SignUpBtn">
                        Đăng Kí
                        <FontAwesomeIcon className={cx('bx', 'bx-user-plus')} icon={faUserPlus}></FontAwesomeIcon>
                    </button>
                </div>
                <div className={cx('switch-form')}>
                    <span>
                        Bạn đã có tài khoản?{' '}
                        <a href="#" onClick={loginFunction}>
                            Đăng Nhập
                        </a>
                        {/* Xóa icon Google ở đây */}
                    </span>
                </div>
            </form>
        </div>
    );
}

export default Login;
