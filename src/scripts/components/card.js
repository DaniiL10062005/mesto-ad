const cardTemplate = document.querySelector("#card-template").content;

export function renderLikes(button, count, likes, userId) {
  const liked = likes.some((user) => user._id === userId);
  button.classList.toggle("card__like-button_is-active", liked);
  button.setAttribute("aria-pressed", String(liked));
  count.textContent = likes.length;
}

export function removeCard(element) {
  element.remove();
}

export function createCardElement(card, userId, actions) {
  const element = cardTemplate.querySelector(".card").cloneNode(true);
  const image = element.querySelector(".card__image");
  const like = element.querySelector(".card__like-button");
  const count = element.querySelector(".card__like-count");
  const remove = element.querySelector(".card__control-button_type_delete");
  const info = element.querySelector(".card__control-button_type_info");

  image.src = card.link;
  image.alt = card.name;
  element.querySelector(".card__title").textContent = card.name;
  renderLikes(like, count, card.likes, userId);
  image.addEventListener("click", () => actions.preview(card));
  info.addEventListener("click", () => actions.showInfo(card._id));
  like.addEventListener("click", () => actions.onLike(card._id, like, count));

  if (card.owner._id === userId) {
    remove.addEventListener("click", () => actions.onDelete(card._id, element, remove));
  } else {
    remove.remove();
  }
  return element;
}
