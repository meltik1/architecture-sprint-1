import React, {lazy, Suspense} from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import {Route, BrowserRouter,  useNavigate, Routes} from "react-router-dom";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";
import {CurrentUserContext} from "./contexts/CurrentUserContext";
import Main from "./components/Main";
import api from "./utils/api";
import * as auth from "./utils/auth.js";

const Register = lazy(() => import('auth/Register'));

const Login = lazy(() => import('auth/Login'))

const EditProfilePopup = lazy(() => import('auth/EditProfilePopup'));

const AddPlacePopup = lazy(() => import('cards/AddPlacePopup'));

const PopupWithForm = lazy(() => import('cards/PopupWithForm'))

const EditAvatarPopup = lazy(() => import('cards/PopupWithForm'))

const ImagePopup = lazy(() => import('cards/ImagePopup'))

const InfoTooltip = lazy(() => import('auth/InfoTooltip'))

const App = () => {
    const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] =
        React.useState(false);
    const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
    const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] =
        React.useState(false);
    const [selectedCard, setSelectedCard] = React.useState(null);
    const [cards, setCards] = React.useState([]);

// В корневом компоненте App создана стейт-переменная currentUser. Она используется в качестве значения для провайдера контекста.
    const [currentUser, setCurrentUser] = React.useState({});

    const [isInfoToolTipOpen, setIsInfoToolTipOpen] = React.useState(false);
    const [tooltipStatus, setTooltipStatus] = React.useState("");

    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
//В компоненты добавлены новые стейт-переменные: email — в компонент App
    const [email, setEmail] = React.useState("");

    const navigate = useNavigate();

// Запрос к API за информацией о пользователе и массиве карточек выполняется единожды, при монтировании.
    React.useEffect(() => {
        api
            .getAppInfo()
            .then(([cardData, userData]) => {
                setCurrentUser(userData);
                setCards(cardData);
            })
            .catch((err) => console.log(err));
    }, []);

// при монтировании App описан эффект, проверяющий наличие токена и его валидности
    React.useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (token) {
            auth
                .checkToken(token)
                .then((res) => {
                    setEmail(res.data.email);
                    setIsLoggedIn(true);
                    navigate("/");
                })
                .catch((err) => {
                    console.log(err);
                    localStorage.removeItem("jwt");
                });
        }
    }, [history]);


    function handleEditProfileClick() {
        setIsEditProfilePopupOpen(true);
    }

    function handleAddPlaceClick() {
        setIsAddPlacePopupOpen(true);
    }

    function handleEditAvatarClick() {
        setIsEditAvatarPopupOpen(true);
    }

    function closeAllPopups() {
        setIsEditProfilePopupOpen(false);
        setIsAddPlacePopupOpen(false);
        setIsEditAvatarPopupOpen(false);
        setIsInfoToolTipOpen(false);
        setSelectedCard(null);
    }

    function handleCardClick(card) {
        setSelectedCard(card);
    }

    function handleUpdateUser(userUpdate) {
        api
            .setUserInfo(userUpdate)
            .then((newUserData) => {
                setCurrentUser(newUserData);
                closeAllPopups();
            })
            .catch((err) => console.log(err));
    }

    function handleUpdateAvatar(avatarUpdate) {
        api
            .setUserAvatar(avatarUpdate)
            .then((newUserData) => {
                setCurrentUser(newUserData);
                closeAllPopups();
            })
            .catch((err) => console.log(err));
    }

    function handleCardLike(card) {
        const isLiked = card.likes.some((i) => i._id === currentUser._id);
        api
            .changeLikeCardStatus(card._id, !isLiked)
            .then((newCard) => {
                setCards((cards) =>
                    cards.map((c) => (c._id === card._id ? newCard : c))
                );
            })
            .catch((err) => console.log(err));
    }

    function handleCardDelete(card) {
        api
            .removeCard(card._id)
            .then(() => {
                setCards((cards) => cards.filter((c) => c._id !== card._id));
            })
            .catch((err) => console.log(err));
    }

    function handleAddPlaceSubmit(newCard) {
        api
            .addCard(newCard)
            .then((newCardFull) => {
                setCards([newCardFull, ...cards]);
                closeAllPopups();
            })
            .catch((err) => console.log(err));
    }

    function onRegister({email, password}) {
        auth
            .register(email, password)
            .then((res) => {
                setTooltipStatus("success");
                setIsInfoToolTipOpen(true);
                navigate("/signin");
            })
            .catch((err) => {
                console.log(err)
                setTooltipStatus("fail");
                setIsInfoToolTipOpen(true);
            });
    }

    function onLogin({email, password}) {
        auth
            .login(email, password)
            .then((res) => {
                setIsLoggedIn(true);
                setEmail(email);
                console.log("Here")
                navigate("/");
            })
            .catch((err) => {
                console.log(err)
                setTooltipStatus("fail");
                setIsInfoToolTipOpen(true);
            });
    }

    function onSignOut() {
        // при вызове обработчика onSignOut происходит удаление jwt
        localStorage.removeItem("jwt");
        setIsLoggedIn(false);
        // После успешного вызова обработчика onSignOut происходит редирект на /signin
        navigate("/signin");
    }


    return (
        // В компонент App внедрён контекст через CurrentUserContext.Provider
            <CurrentUserContext.Provider value={currentUser}>
                <div className="page__content">
                    <Header email={email} onSignOut={onSignOut}/>
                    <Routes>
                        <Route path="/" element={<ProtectedRoute component={Main} loggedIn={isLoggedIn}
                                                                 cards={cards}
                                                                 onEditProfile={handleEditProfileClick}
                                                                 onAddPlace={handleAddPlaceClick}
                                                                 onEditAvatar={handleEditAvatarClick}
                                                                 onCardClick={handleCardClick}
                                                                 onCardLike={handleCardLike}
                                                                 onCardDelete={handleCardDelete}/>} />
                        <Route path="/signup" element = {
                            <Suspense fallback={<div>Loading...</div>}>
                                <Register onRegister={onRegister}/>
                            </Suspense>
                        }/>
                        <Route path="/signin" element =  {
                            <Suspense fallback={<div>Loading...</div>}>
                                <Login onLogin={onLogin}/>
                            </Suspense>} />
                    </Routes>
                    <Footer/>
                    <Suspense fallback={<div>Loading...</div>}>
                        <EditProfilePopup
                            isOpen={isEditProfilePopupOpen}
                            onUpdateUser={handleUpdateUser}
                            onClose={closeAllPopups}
                        />
                    </Suspense>
                    <Suspense fallback={<div>Loading...</div>}>
                        <AddPlacePopup
                            isOpen={isAddPlacePopupOpen}
                            onAddPlace={handleAddPlaceSubmit}
                            onClose={closeAllPopups}
                        />
                    </Suspense>
                    <Suspense fallback={<div>Loading...</div>}>
                        <PopupWithForm title="Вы уверены?" name="remove-card" buttonText="Да"/>
                    </Suspense>
                    <Suspense fallback={<div>Loading...</div>}>
                        <EditAvatarPopup
                            isOpen={isEditAvatarPopupOpen}
                            onUpdateAvatar={handleUpdateAvatar}
                            onClose={closeAllPopups}
                        />
                    </Suspense>
                    <Suspense fallback={<div>Loading...</div>}>
                        <ImagePopup card={selectedCard} onClose={closeAllPopups}/>
                    </Suspense>
                    <Suspense fallback={<div>Loading...</div>}>
                        <InfoTooltip
                            isOpen={isInfoToolTipOpen}
                            onClose={closeAllPopups}
                            status={tooltipStatus}
                        />
                    </Suspense>
                </div>
            </CurrentUserContext.Provider>
    )
};


const rootElement = document.getElementById("app")
if (!rootElement) throw new Error("Failed to find the root element")

const root = ReactDOM.createRoot(rootElement)

root.render(
    <BrowserRouter>
        <App/>
    </BrowserRouter>

)