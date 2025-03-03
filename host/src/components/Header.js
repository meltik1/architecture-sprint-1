import React from 'react';
import {Route, Link, Routes} from 'react-router-dom';
import logoPath from '../images/logo.svg';

// В корневом компоненте App описаны обработчики: onRegister, onLogin и onSignOut. Эти обработчики переданы в соответствующие компоненты: Register.js, Login.js, Header.js
function Header({onSignOut, email}) {
    function handleSignOut() {
        onSignOut();
    }

    return (
        <header className="header page__section">
            <img src={logoPath} alt="Логотип проекта Mesto" className="logo header__logo"/>
            <Routes>
                <Route
                    path="/"
                    element={
                        <div className="header__wrapper">
                            <p className="header__user">{email}</p>
                            <button className="header__logout" onClick={handleSignOut}>Выйти</button>
                        </div>
                    }
                />
                <Route path="/signup" element={<Link className="header__auth-link" to="signin">Войти</Link>} />
                <Route path="/signin" element={<Link className="header__auth-link" to="signup">Регистрация</Link>}/>
            </Routes>
        </header>
    )
}

export default Header;
