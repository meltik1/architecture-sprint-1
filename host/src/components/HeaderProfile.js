function HeaderProfile({handleSignOut, email}) {
    return (
        <div className="header__wrapper">
            <p className="header__user">{email}</p>
            <button className="header__logout" onClick={handleSignOut}>Выйти</button>
        </div>
    )
}

export default HeaderProfile;