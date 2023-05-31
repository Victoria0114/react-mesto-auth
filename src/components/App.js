import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import ProtectedRoute from "./ProtectedRoute";

import Header from "./Header";
import Main from "./Main";
import PopupWithForm from "./PopupWithForm.js";
import ImagePopup from "./ImagePopup.js";
import Footer from "./Footer";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";

import { CurrentUserContext } from "../contexts/CurrentUserContext";
import { api } from "../utils/Api";

import Login from "./Login";
import Register from "./Register";
import InfoTooltip from "./InfoTooltip";
import { authorization, register, checkToken } from "../utils/auth";

export default function App() {
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);

  const [selectedCard, setSelectedCard] = useState({ name: "", link: "" });
  const [currentUser, setCurrentUser] = useState({
    name: " ",
    about: " ",
    avatar: " ",
    _id: " ",
  });
  const [cards, setCards] = useState([]);
  const [registrated, setRegistrated] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("email@mail.ru");
  const [authorizationData, setAuthorizationData] = useState({
    password: "",
    email: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getUserInfo()
      .then((data) => {
        setCurrentUser(data);
      })
      .catch((error) => {
        console.log(error);
      });

    api
      .getCards()
      .then((cards) => {
        setCards(cards);
      })
      .catch((error) => console.log(error));
  }, []);

  function handleCardLike(card) {
    const isLiked = card.likes.some((item) => item._id === currentUser._id);
    api
      .changeLikeCardStatus(card._id, isLiked)
      .then((newCard) => {
        setCards((state) =>
          state.map((item) => (item._id === card._id ? newCard : item))
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }
  // const handleCardLike = (card) => {
  //   const isLiked = card.likes.some((i) => i._id === currentUser._id);
  //   if (isLiked) {
  //     api
  //     .deleteLike(card.cardId)
  //     .then((data) => {
  //       setCards((state) =>
  //         state.map((c) => (c._id === card.cardId ? data : c))
  //       );
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  //   } else {
  //     api
  //     .putLike(card.cardId)
  //     .then((data) => {
  //       setCards((state) =>
  //         state.map((item) => (item._id === card.cardId ? data : item))
  //       );
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  //   }
  // api
  //   .changeLikeCardStatus(card._id, !isLiked)
  //   .then((newCard) => {
  //     setCards((state) =>
  //       state.map((c) => c._id === card._id ? newCard : c));})
  //   .catch((error) => {
  //     console.log(error);
  // });
  //}

  // const handleCardDelete = (card) => {
  //   api
  //     .deleteCard(card.card_id)
  //     .then(() => {
  //       setCards((cards) => cards.filter((item) => item._id !== card._id));
  //     })
  //     .catch((error) => console.log(error));
  // }
  function handleCardDelete(card) {
    api
      .deleteCard(card._id)
      .then(() => {
        setCards((cards) => cards.filter((item) => item._id !== card._id));
      })
      .catch((err) => {
        console.log(err);
      });
  }
  const handleUpdateUser = (user) => {
    api
      .patchUserInfo(user)
      .then((data) => {
        setCurrentUser(data);
      })
      .then(() => closeAllPopups())
      .catch((error) => console.log(error));
  };

  const handleUpdateAvatar = (avatar) => {
    api
      .patchAvatar(avatar)
      .then((data) => {
        setCurrentUser(data);
      })
      .then(() => closeAllPopups())
      .catch((error) => console.log(error));
  };

  const handleAddPlaceSubmit = (card) => {
    api
      .postCard(card)
      .then((newCard) => {
        setCards([newCard, ...cards]);
      })
      .then(() => closeAllPopups())
      .catch((error) => console.log(error));
  };

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(!isEditAvatarPopupOpen);
  }

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(!isEditProfilePopupOpen);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(!isAddPlacePopupOpen);
  }

  function handleCardClick(card) {
    setSelectedCard({ name: card.name, link: card.link });
  }

  function closeAllPopups() {
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setSelectedCard({ name: "", link: "" });
  }
  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) {
      closeAllPopups();
    }
  }

  const handleRegister = () => {
    setRegistrated(false);
    const { password, email } = authorizationData;
    register(password, email)
      .then((response) => {
        if (response.data.email) {
          setRegistrated(true);
          navigate("/sign-in");
        }
      })
      .then(() => {
        setAuthorizationData({ password: "", email: "" });
      })
      .catch((err) => console.error(err))
      .finally(() => setIsInfoTooltipOpen(true));
  };

  const handleLogin = () => {
    const { password, email } = authorizationData;
    authorization(password, email)
      .then((response) => {
        if (response.token) {
          localStorage.setItem("jwt", response.token);
          setUserEmail(email);
          setLoggedIn(true);
          navigate("/");
        }
      })
      .then(() => {
        setAuthorizationData({ password: "", email: "" });
      })
      .catch((err) => console.error(err));
  };
  
  const handleChangeInput = (event) => {
    const { name, value } = event.target;
    setAuthorizationData((oldData) => ({
      ...oldData,
      [name]: value,
    }));
  };

  const logOut = () => {
    localStorage.removeItem("jwt");
    setLoggedIn(false);
    navigate('/sign-in');
  }

  return (
    <div className="root">
      <div className="page">
        <CurrentUserContext.Provider value={currentUser}>
          <Routes>
            <Route 
              path="/sign-up" 
              element={
                <Register 
                  onRegister={handleRegister}
                  passowrdInput={authorizationData.password}
                  emailInput={authorizationData.email}
                  handleChangeInput={handleChangeInput}
                />
              } 
            />
            <Route 
              path="/sign-in" 
              element={
                <Login 
                  onLogin={handleLogin}
                  passowrdInput={authorizationData.password}
                  emailInput={authorizationData.email}
                  handleChangeInput={handleChangeInput}
                />
              } 
            />
            <Route 
              path="/" 
              element={
                <>
                  <Header
                    link={"/sign-in"}
                    userEmail={userEmail}
                    linkText={"Выход"}
                    onSignOut={logOut}
                  />
                  <Main
                    onEditProfile={handleEditProfileClick}
                    onAddPlace={handleAddPlaceClick}
                    onEditAvatar={handleEditAvatarClick}
                    onCardClick={handleCardClick}
                    onCardLike={handleCardLike}
                    onCardDelete={handleCardDelete}
                    cards={cards}
                  />
                </>
              } 
            />
            {/* <Route path="/" element={<Dashboard />} />
            <Route path="/sign-up" element={<Dashboard />} /> */}
          </Routes>
          <Footer />

          <EditProfilePopup
            isOpen={isEditProfilePopupOpen}
            onClose={closeAllPopups}
            onUpdateUser={handleUpdateUser}
            onClick={handleOverlay}
          />

          <AddPlacePopup
            isOpen={isAddPlacePopupOpen}
            onClose={closeAllPopups}
            onAddPlace={handleAddPlaceSubmit}
            onClick={handleOverlay}
          />

          <EditAvatarPopup
            isOpen={isEditAvatarPopupOpen}
            onClose={closeAllPopups}
            onUpdateAvatar={handleUpdateAvatar}
            onClick={handleOverlay}
          />

          <PopupWithForm
            name="delete-card"
            title="Вы уверены?"
            buttonText="Да"
            onClose={closeAllPopups}
            onClick={handleOverlay}
          ></PopupWithForm>

          <ImagePopup card={selectedCard} onClose={closeAllPopups}></ImagePopup>

          <InfoTooltip
            name="info"
            containerType="infoTooltip"
            isOpen={isInfoTooltipOpen}
            onClose={closeAllPopups}
            onClick={handleOverlay}
            isOk={registrated}
          />

        </CurrentUserContext.Provider>
      </div>
    </div>
  );
}
