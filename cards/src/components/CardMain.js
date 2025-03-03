import Card from "./Card";
import api from "../utils/api";
import ImagePopup from "./ImagePopup";
import AddPlacePopup from "./AddPlacePopup";


function CardList({ currentUser, setSelectedCard }) {
    const [cards, setCards] = React.useState([]);


    React.useEffect(() => {
        api
            .getCardList()
            .then((cardData) => {
                setCards(cardData);
            })
            .catch((err) => console.log(err));
    }, []);


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

    function handleCardClick(card) {
        setSelectedCard(card);
    }



    return (
          <ul className="places__list">
              {cards.map((card) => (
                  <Card
                      key={card._id}
                      card={card}
                      onCardClick={handleCardClick}
                      onCardLike={handleCardLike}
                      onCardDelete={handleCardDelete}
                  />
              ))}
          </ul>
  );
}